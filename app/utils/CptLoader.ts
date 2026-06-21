const BATCH_POINTS = 50_000;
const LITTLE_ENDIAN = true;

const HEADER_BYTES = 80;
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
  origin: [number, number, number];
};

const parseHeader = (view: DataView): CPTHeader => {
  const magic = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3),
  );

  if (magic !== "CPT ") {
    throw new Error(`Invalid CPT magic: ${magic}`);
  }

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

const toUint8Array = (chunk: ArrayBuffer | Uint8Array) => {
  if (chunk instanceof Uint8Array) return chunk;
  return new Uint8Array(chunk);
};

const concat = (a: Uint8Array, b: Uint8Array) => {
  const next = new Uint8Array(a.length + b.length);
  next.set(a);
  next.set(b, a.length);
  return next;
};

async function* parseCPTInBatches(
  chunks: AsyncIterable<ArrayBuffer | Uint8Array>,
): AsyncGenerator<CPTBatch> {
  let buffer = new Uint8Array(0);
  let header: CPTHeader | null = null;
  let parsedPoints = 0;

  let origin: [number, number, number] | null = null;

  for await (const chunk of chunks) {
    buffer = concat(buffer, toUint8Array(chunk));

    if (!header && buffer.length >= HEADER_BYTES) {
      header = parseHeader(
        new DataView(buffer.buffer, buffer.byteOffset, HEADER_BYTES),
      );

      origin = [header.xOffset, header.yOffset, header.zOffset];

      buffer = buffer.slice(HEADER_BYTES);
    }

    if (!header || !origin) continue;

    while (buffer.length >= POINT_BYTES && parsedPoints < header.pointCount) {
      const availablePoints = Math.floor(buffer.length / POINT_BYTES);

      const pointsToParse = Math.min(
        availablePoints,
        BATCH_POINTS,
        header.pointCount - parsedPoints,
      );

      if (pointsToParse <= 0) break;

      const positions = new Float32Array(pointsToParse * 3);
      const colors = new Float32Array(pointsToParse * 3);
      const view = new DataView(buffer.buffer, buffer.byteOffset);

      for (let i = 0; i < pointsToParse; i++) {
        const base = i * POINT_BYTES;

        const worldX =
          view.getUint32(base + OFFSET_X, LITTLE_ENDIAN) * header.xScale +
          header.xOffset;

        const worldY =
          view.getUint32(base + OFFSET_Y, LITTLE_ENDIAN) * header.yScale +
          header.yOffset;

        const worldZ =
          view.getUint32(base + OFFSET_Z, LITTLE_ENDIAN) * header.zScale +
          header.zOffset;

        const localX = worldX - origin[0];
        const localY = worldY - origin[1];
        const localZ = worldZ - origin[2];

        positions[i * 3 + 0] = localX;
        positions[i * 3 + 1] = localY;
        positions[i * 3 + 2] = localZ;

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
