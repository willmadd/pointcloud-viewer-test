// components/CptPointsDemo.tsx
"use client";

import { useEffect, useState } from "react";
import { load } from "@loaders.gl/core";
import { CPTLoader } from "../utils/CptLoader";

type CPTData = {
  pointCount: number;
  positions: Float32Array;
  colors: Float32Array;
};

const CptPointsDemo = () => {
  const [data, setData] = useState<CPTData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load("/api/small_cloud.cpt", CPTLoader)
      .then((result) => setData(result as CPTData))
      .catch((e) => setError(e.message));
  }, []);
  console.log(error);
  if (error) throw new Error(`Failed to load CPT data: ${error}`);
  if (!data) return null;
  console.log(data);
  return (
    <points position={[0, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[data.positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={4} vertexColors sizeAttenuation />
    </points>
  );
};

export default CptPointsDemo;
