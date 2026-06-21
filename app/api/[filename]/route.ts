import { createReadStream, existsSync } from "fs";
import { Readable } from "stream";
import path from "path";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ filename: string }> },
) => {
  /**
   * Receive file name
   */
  const { filename } = await params;

  /**
   * Make file path
   */
  const filePath = path.join(process.cwd(), "app/data", filename);

  if (!existsSync(filePath)) {
    return Response.json({ error: "File not found" }, { status: 404 });
  }

  /**
   * Create Stream from file
   */
  const nodeStream = createReadStream(filePath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream;

  return new Response(webStream, {
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });
};

/**
 * TODO: Better error handing if invalid file etc
 */
