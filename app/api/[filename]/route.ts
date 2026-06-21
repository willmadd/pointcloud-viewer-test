import { createReadStream, existsSync } from "fs";
import { Readable } from "stream";
import path from "path";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ filename: string }> },
) => {
  const { filename } = await params;

  const filePath = path.join(process.cwd(), "app/data", filename);

  if (!existsSync(filePath)) {
    return Response.json({ error: "File not found" }, { status: 404 });
  }

  const nodeStream = createReadStream(filePath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream;

  return new Response(webStream, {
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });
};
