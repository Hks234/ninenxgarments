import { NextRequest } from "next/server";
import { readImage } from "@/lib/storage";

export async function GET(_request: NextRequest, context: { params: Promise<{ key: string[] }> }) {
  const { key } = await context.params;
  const id = decodeURIComponent(key.join("/"));
  const asset = await readImage(id);
  if (!asset) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(new Uint8Array(asset.bytes), {
    headers: {
      "Content-Type": asset.mimeType || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
