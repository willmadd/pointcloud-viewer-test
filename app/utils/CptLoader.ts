const HEADER_SIZE = 80;
const POINT_SIZE = 28;

const parseCPT = (arrayBuffer: ArrayBuffer) => {
  const view = new DataView(arrayBuffer);
  const littleEndian = true;

  const magic = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3),
  );
  if (magic !== "CPT ") throw new Error(`Invalid CPT magic: ${magic}`);

  const pointCount = Number(view.getBigUint64(24, littleEndian));
  const xScale = view.getFloat64(32, littleEndian);
  const yScale = view.getFloat64(40, littleEndian);
  const zScale = view.getFloat64(48, littleEndian);
  const xOffset = view.getFloat64(56, littleEndian);
  const yOffset = view.getFloat64(64, littleEndian);
  const zOffset = view.getFloat64(72, littleEndian);

  const positions = new Float32Array(pointCount * 3);
  const colors = new Float32Array(pointCount * 3);

  for (let i = 0; i < pointCount; i++) {
    const base = HEADER_SIZE + i * POINT_SIZE;
    positions[i * 3 + 0] =
      view.getUint32(base + 0, littleEndian) * xScale + xOffset;
    positions[i * 3 + 1] =
      view.getUint32(base + 4, littleEndian) * yScale + yOffset;
    positions[i * 3 + 2] =
      view.getUint32(base + 8, littleEndian) * zScale + zOffset;
    colors[i * 3 + 0] = view.getUint8(base + 12) / 255;
    colors[i * 3 + 1] = view.getUint8(base + 13) / 255;
    colors[i * 3 + 2] = view.getUint8(base + 14) / 255;
  }

  return { pointCount, positions, colors };
};

export const CPTLoader = {
  name: "CPT",
  id: "cpt",
  module: "cpt",
  version: "1.0.0",
  mimeTypes: ["application/octet-stream"],
  extensions: ["cpt"],
  parse: parseCPT,
  parseSync: parseCPT,
  options: {},
};
