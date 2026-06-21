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

  const setLoading = useUiStore((state) => state.setLoading);

  const setLoadingPercentage = useUiStore(
    (state) => state.setLoadingPercentage,
  );
  useEffect(() => {
    /**
     *  Ref stored here to check if stream is active, or has been cancelled - e.g. broken network connection, or user closed page/component unmounted
     */

    let cancelled = false;

    const stream = async () => {
      /**
       *  Init variables to receive streamed point pos and cols.
       *  Float 32 Array used as will be sending vertex data to GPU
       */
      let positions: Float32Array | null = null;
      let colors: Float32Array | null = null;
      let offset = 0;
      setLoading({ message: "Loading point cloud...", percentage: 0 });

      const batches = await loadInBatches("/api/big_cloud.cpt", CPTLoader);

      for await (const batch of batches as AsyncIterable<CPTBatch>) {
        /**
         * If stream has been cancelled, break the loop.
         */
        if (cancelled) break;

        /**
         * Allocate memory for all point positions and colours.
         * Doing this once is much faster than resizing the arrays every time a new batch of points is received.
         */

        if (!positions || !colors) {
          positions = new Float32Array(batch.totalPointCount * 3);
          colors = new Float32Array(batch.totalPointCount * 3);
        }

        const batchPointCount = batch.positions.length / 3;

        positions.set(batch.positions, offset * 3);
        colors.set(batch.colors, offset * 3);

        offset += batchPointCount;

        /**
         * Calculate and update loading progress for the point cloud.
         */

        const percentage = Math.round((offset / batch.totalPointCount) * 100);
        setLoadingPercentage(percentage);

        /**
         * Update react with state portion of point cloud loaded in so far.
         * subarray sued as it does not create new array, it creates a view into the existing array showing currently loaded points
         */
        setData({
          pointCount: offset,
          positions: positions.subarray(0, offset * 3),
          colors: colors.subarray(0, offset * 3),
        });
      }
    };

    stream()
      .finally(() => {
        setLoading(null);
      })
      .catch((e) => {
        throw new Error(`Failed to stream CPT data: ${e.message}`);
      });

    return () => {
      /**
       * When unmount component, break stream
       */
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
