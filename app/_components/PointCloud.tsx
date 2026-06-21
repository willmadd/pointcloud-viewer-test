"use client";

import { useEffect, useState } from "react";
import { loadInBatches } from "@loaders.gl/core";
import { CPTLoader } from "../utils/CptLoader";
import { useUiStore } from "../store/useUiStore";

type CPTBatch = {
  pointCount: number;
  totalPointCount: number;
  positions: Float32Array;
  colors: Float32Array;
};

type CPTData = {
  pointCount: number;
  positions: Float32Array;
  colors: Float32Array;
};

const PointCloud = () => {
  const [data, setData] = useState<CPTData | null>(null);
  const setIsLoading = useUiStore((state) => state.setLoading);
  useEffect(() => {
    let cancelled = false;

    const stream = async () => {
      let positions: Float32Array | null = null;
      let colors: Float32Array | null = null;
      let offset = 0;
      setIsLoading("Loading point cloud...");

      const batches = await loadInBatches("/api/big_cloud.cpt", CPTLoader);

      for await (const batch of batches as AsyncIterable<CPTBatch>) {
        if (cancelled) break;

        if (!positions || !colors) {
          positions = new Float32Array(batch.totalPointCount * 3);
          colors = new Float32Array(batch.totalPointCount * 3);
        }

        const batchPointCount = batch.positions.length / 3;

        positions.set(batch.positions, offset * 3);
        colors.set(batch.colors, offset * 3);

        offset += batchPointCount;

        setData({
          pointCount: offset,
          positions: positions.subarray(0, offset * 3),
          colors: colors.subarray(0, offset * 3),
        });
      }
    };

    stream()
      .finally(() => {
        setIsLoading(null);
      })
      .catch((e) => {
        throw new Error(`Failed to stream CPT data: ${e.message}`);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!data || data.pointCount === 0) return null;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[data.positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
      </bufferGeometry>

      <pointsMaterial size={0.5} vertexColors />
    </points>
  );
};

export default PointCloud;
