import { Vector3 } from "three";

const BATCH_POINTS = 50_000;
const LITTLE_ENDIAN = true;

const HEADER_BYTES = 80;

/**
 * Byte offsets used to locate header and point data within the CPT binary format.
 * Values obtained from sensat github - https://github.com/sensat/pointcloud-viewer-test
 */

const OFFSET_POINT_COUNT = 24;
const OFFSET_SCALE_X = 32;
const OFFSET_SCALE_Y = 40;
const OFFSET_SCALE_Z = 48;
const OFFSET_ORIGIN_X = 56;
const OFFSET_ORIGIN_Y = 64;
const OFFSET_ORIGIN_Z = 72;

const POINT_BYTES = 28;
const OFFSET_X = 0;
const OFFSET_Y = 4;
const OFFSET_Z = 8;
const OFFSET_RED = 12;
const OFFSET_GREEN = 13;
const OFFSET_BLUE = 14;

type CPTHeader = {
  pointCount: number;
  xScale: number;
  yScale: number;
  zScale: number;
  xOffset: number;
  yOffset: number;
  zOffset: number;
};

type CPTBatch = {
  pointCount: number;
  totalPointCount: number;
  positions: Float32Array;
  colors: Float32Array;
  header: CPTHeader;
  origin: Vector3;
};

const parseHeader = (view: DataView): CPTHeader => {
  /**
   * Read and validate the CPT file signature. Stored in the first 4 bytes of the file.
   * Check file format is as expected a .cpt file.
   */
  const magic = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3),
  );

  if (magic !== "CPT ") {
    throw new Error(`Invalid CPT magic: ${magic}`);
  }

  /**
   * Read point count, coordinate scales and coordinate offsets
   * from the .cpt file header.
   */
  return {
    pointCount: Number(view.getBigUint64(OFFSET_POINT_COUNT, LITTLE_ENDIAN)),
    xScale: view.getFloat64(OFFSET_SCALE_X, LITTLE_ENDIAN),
    yScale: view.getFloat64(OFFSET_SCALE_Y, LITTLE_ENDIAN),
    zScale: view.getFloat64(OFFSET_SCALE_Z, LITTLE_ENDIAN),
    xOffset: view.getFloat64(OFFSET_ORIGIN_X, LITTLE_ENDIAN),
    yOffset: view.getFloat64(OFFSET_ORIGIN_Y, LITTLE_ENDIAN),
    zOffset: view.getFloat64(OFFSET_ORIGIN_Z, LITTLE_ENDIAN),
  };
};

/**
 * Fix type error, where a chunk may have been a ArrayBuffer, or a Uint8Array
 */
const toUint8Array = (chunk: ArrayBuffer | Uint8Array) => {
  if (chunk instanceof Uint8Array) return chunk;
  return new Uint8Array(chunk);
};

/**
 * Add a newly streamed chunk onto the existing buffer.
 */
const concat = (a: Uint8Array, b: Uint8Array) => {
  const next = new Uint8Array(a.length + b.length);
  next.set(a);
  next.set(b, a.length);
  return next;
};

/**
 * Generator function that streams and passes .cpt point cloud data
 */
async function* parseCPTInBatches(
  chunks: AsyncIterable<ArrayBuffer | Uint8Array>,
): AsyncGenerator<CPTBatch> {
  let buffer = new Uint8Array(0);
  let header: CPTHeader | null = null;
  let parsedPoints = 0;

  let origin: Vector3 | null = null;

  for await (const chunk of chunks) {
    buffer = concat(buffer, toUint8Array(chunk));

    /**
     * What until header has been received, in this case the 80 bytes, then parse it.
     */
    if (!header && buffer.length >= HEADER_BYTES) {
      header = parseHeader(
        new DataView(buffer.buffer, buffer.byteOffset, HEADER_BYTES),
      );

      origin = new Vector3(header.xOffset, header.yOffset, header.zOffset);

      /**
       *   Remove the header bytes from the buffer so only point data remains to be processed.
       */
      buffer = buffer.slice(HEADER_BYTES);
    }

    if (!header || !origin) continue;

    while (buffer.length >= POINT_BYTES && parsedPoints < header.pointCount) {
      const availablePoints = Math.floor(buffer.length / POINT_BYTES);

      /**
       * Work out how many points we are going to parse, limited by either the points currently available in the buffer (availablePoints), the batch size specified
       * about (BATCH_POINTS) or the the number of points remaining in the file (header.pointCount - parsedPoints,)
       */
      const pointsToParse = Math.min(
        availablePoints,
        BATCH_POINTS,
        header.pointCount - parsedPoints,
      );

      /**
       * End parsing once complete
       */
      if (pointsToParse <= 0) break;

      /**
       * Allocate output buffers for this batch and create a DataView
       * for reading binary values from the streamed CPT data.
       */
      const positions = new Float32Array(pointsToParse * 3);
      const colors = new Float32Array(pointsToParse * 3);
      const view = new DataView(buffer.buffer, buffer.byteOffset);

      for (let i = 0; i < pointsToParse; i++) {
        /**
         * Get byte position of current point from buffer
         */
        const base = i * POINT_BYTES;

        /**
         * Use scale and offset from the header: "final_value = (stored_uint32 * scale) + offset"
         */
        const worldX =
          view.getUint32(base + OFFSET_X, LITTLE_ENDIAN) * header.xScale +
          header.xOffset;

        const worldY =
          view.getUint32(base + OFFSET_Y, LITTLE_ENDIAN) * header.yScale +
          header.yOffset;

        const worldZ =
          view.getUint32(base + OFFSET_Z, LITTLE_ENDIAN) * header.zScale +
          header.zOffset;

        /**
         * converts to local space positions
         */

        const localX = worldX - origin.x;
        const localY = worldY - origin.y;
        const localZ = worldZ - origin.z;

        positions[i * 3 + 0] = localX;
        positions[i * 3 + 1] = localY;
        positions[i * 3 + 2] = localZ;

        /**
         * convert colour values from 0-255 to 0-1 values required by webgl/three
         */
        colors[i * 3 + 0] = view.getUint8(base + OFFSET_RED) / 255;
        colors[i * 3 + 1] = view.getUint8(base + OFFSET_GREEN) / 255;
        colors[i * 3 + 2] = view.getUint8(base + OFFSET_BLUE) / 255;
      }

      parsedPoints += pointsToParse;
      buffer = buffer.slice(pointsToParse * POINT_BYTES);

      yield {
        pointCount: pointsToParse,
        totalPointCount: header.pointCount,
        positions,
        colors,
        header,
        origin,
      };
    }
  }
}

export const CPTLoader = {
  name: "CPT",
  id: "cpt",
  module: "cpt",
  version: "1.0.0",
  mimeTypes: ["application/octet-stream"],
  extensions: ["cpt"],
  parseInBatches: parseCPTInBatches,
  options: {},
};
