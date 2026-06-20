// import { createReadStream } from "fs";
// import { Readable } from "stream";
// import path from "path";

// export const GET = async ({
//   params,
// }: {
//   params: Promise<{ filename: string }>;
// }) => {
//   //TODO: Add validation to ensure the filename is safe and does not allow access to unintended files.
//   const { filename } = await params;

//   const filePath = path.join(process.cwd(), "app/data", filename);

//   const nodeStream = createReadStream(filePath);
//   const webStream = Readable.toWeb(nodeStream) as ReadableStream;
//   //TODO: Add error handling for cases where the file does not exist, can't be read or is interrupted.

//   return new Response(webStream, {
//     headers: {
//       "Content-Type": "application/octet-stream",
//     },
//   });
// };

import { createReadStream } from "fs";
import { Readable } from "stream";
import path from "path";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ filename: string }> },
) => {
  const { filename } = await params;

  const filePath = path.join(process.cwd(), "app/data", filename);

  const nodeStream = createReadStream(filePath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream;

  return new Response(webStream, {
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });
};
