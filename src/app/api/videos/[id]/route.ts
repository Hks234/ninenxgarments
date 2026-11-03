import { createReadStream, existsSync } from "fs";
import { stat } from "fs/promises";
import { NextRequest } from "next/server";
import { Readable } from "stream";
import { prisma } from "@/lib/prisma";
import { videoFilePath } from "@/lib/storage";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const video = await prisma.homepageVideo.findUnique({ where: { id } });
  if (!video) return new Response("Not found", { status: 404 });

  if (/^https?:\/\//i.test(video.videoKey)) {
    return Response.redirect(video.videoKey, 302);
  }

  const filePath = videoFilePath(video.videoKey);
  if (!existsSync(filePath)) return new Response("Not found", { status: 404 });

  const { size } = await stat(filePath);
  const mime = video.mimeType || "video/mp4";
  const range = request.headers.get("range");

  if (!range) {
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return new Response(stream, {
      headers: {
        "Content-Type": mime,
        "Content-Length": String(size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const match = /bytes=(\d*)-(\d*)/.exec(range);
  if (!match) return new Response("Invalid range", { status: 416 });

  const start = match[1] ? Number(match[1]) : 0;
  const end = match[2] ? Number(match[2]) : size - 1;
  if (start >= size || end >= size || start > end) {
    return new Response("Requested range not satisfiable", {
      status: 416,
      headers: { "Content-Range": `bytes */${size}` },
    });
  }

  const stream = Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream;
  return new Response(stream, {
    status: 206,
    headers: {
      "Content-Type": mime,
      "Content-Length": String(end - start + 1),
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
