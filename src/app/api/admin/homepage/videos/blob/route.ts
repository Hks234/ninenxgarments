import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireAdmin } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { hasBlobStorage, MAX_VIDEO_BYTES } from "@/lib/storage";

export async function POST(request: Request) {
  if (!(await requireAdmin().catch(() => null))) return errorResponse("Unauthorized", 401);
  if (!hasBlobStorage()) {
    return errorResponse(
      "Connect a Vercel Blob store to this project, then redeploy. Video files cannot be uploaded through Vercel serverless functions.",
      501,
    );
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!/\.(mp4|webm|mov|m4v)$/i.test(pathname)) {
          throw new Error("Use an MP4, WebM, or MOV video in 9:16 portrait.");
        }
        return {
          allowedContentTypes: [
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "video/x-m4v",
            "application/octet-stream",
          ],
          maximumSizeInBytes: MAX_VIDEO_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ pathname }),
        };
      },
    });
    return json(result);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Could not start video upload");
  }
}
