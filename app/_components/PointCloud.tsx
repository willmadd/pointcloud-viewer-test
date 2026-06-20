// components/CptPointsDemo.tsx
"use client";

import { useEffect, useState } from "react";
import { load } from "@loaders.gl/core";
import { CPTLoader } from "../utils/CptLoader";
import { navigation } from "../constants/navigation";
import { useUiStore } from "../store/useUiStore";

type CPTData = {
  pointCount: number;
  positions: Float32Array;
  colors: Float32Array;
};

const CptPointsDemo = () => {
  const [data, setData] = useState<CPTData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debugMode = useUiStore((state) => state.debugMode);

  useEffect(() => {
    load(
      //if debugging get small cloud, else get large cloud
      navigation.api.getFile(navigation.files.smallCloud),
      CPTLoader,
    )
      .then((result) => setData(result as CPTData))
      .catch((e) => {
        throw new Error(`Failed to load CPT data: ${e.message}`);
      });
  }, [debugMode]);
  console.log(error);
  if (error) throw new Error(`Failed to load CPT data: ${error}`);
  if (!data) return null;
  console.log(data);

  if (!data) return null;

  return (
    <points position={[0, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[data.positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={1} vertexColors />
    </points>
  );
};

export default CptPointsDemo;
