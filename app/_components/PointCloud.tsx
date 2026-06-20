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

  const debugMode = useUiStore((state) => state.debugMode);
  const setIsLoading = useUiStore((state) => state.setLoading);

  useEffect(() => {
    setIsLoading("Loading point cloud data...");
    load(
      //if debugging get small cloud, else get large cloud
      navigation.api.getFile(navigation.files.smallCloud),
      CPTLoader,
    )
      .then((result) => setData(result as CPTData))
      .catch((e) => {
        throw new Error(`Failed to load CPT data: ${e.message}`);
      })
      .finally(() => setIsLoading(null));
  }, [debugMode]);

  if (!data) return null;

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
