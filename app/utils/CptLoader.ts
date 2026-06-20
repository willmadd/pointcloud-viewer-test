// lib/CPTLoader.ts
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

function parseCPT(arrayBuffer: ArrayBuffer) {
  const view = new DataView(arrayBuffer);
  const le = true;

  const magic = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3),
  );
  if (magic !== "CPT ") throw new Error(`Invalid CPT magic: ${magic}`);

  const pointCount = Number(view.getBigUint64(24, le));
  const xScale = view.getFloat64(32, le);
  const yScale = view.getFloat64(40, le);
  const zScale = view.getFloat64(48, le);
  const xOffset = view.getFloat64(56, le);
  const yOffset = view.getFloat64(64, le);
  const zOffset = view.getFloat64(72, le);

  console.log({
    pointCount,
    xScale,
    yScale,
    zScale,
    xOffset,
    yOffset,
    zOffset,
  });

  const positions = new Float32Array(pointCount * 3);
  const colors = new Float32Array(pointCount * 3);

  for (let i = 0; i < pointCount; i++) {
    const base = 80 + i * 28;
    positions[i * 3 + 0] = view.getUint32(base + 0, le) * xScale + xOffset;
    positions[i * 3 + 1] = view.getUint32(base + 4, le) * yScale + yOffset;
    positions[i * 3 + 2] = view.getUint32(base + 8, le) * zScale + zOffset;
    colors[i * 3 + 0] = view.getUint8(base + 12) / 255;
    colors[i * 3 + 1] = view.getUint8(base + 13) / 255;
    colors[i * 3 + 2] = view.getUint8(base + 14) / 255;
  }

  return { pointCount, positions, colors };
}
