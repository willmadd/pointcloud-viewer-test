"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { loadInBatches } from "@loaders.gl/core";
import { CPTLoader } from "../utils/CptLoader";
import { useUiStore } from "../store/useUiStore";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

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
  const [isPending, startTransition] = useTransition();

  const setLoading = useUiStore((state) => state.setLoading);
  const setSelectedPoint = useUiStore((state) => state.setSelectedPoint);
  const setLoadingPercentage = useUiStore(
    (state) => state.setLoadingPercentage,
  );

  const selectedPoint = useUiStore((state) => state.selectedPoint);

  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const pointsRef = useRef<THREE.Points>(null);

  useEffect(() => {
    let cancelled = false;

    const stream = async () => {
      /**
       * Init variables to receive streamed point pos and cols.
       * Float 32 Array used as will be sending vertex data to GPU
       */
      let positions: Float32Array | null = null;
      let colors: Float32Array | null = null;
      let offset = 0;
      setLoading({ message: "Loading point cloud...", percentage: 0 });

      const batches = await loadInBatches("/api/small_cloud.cpt", CPTLoader);

      for await (const batch of batches as AsyncIterable<CPTBatch>) {
        /**
         * If stream cancelled, break loop
         */
        if (cancelled) break;

        /**
         * allocate memory for all points positions and colours
         * this is cheaper than doing on the fly
         */
        if (!positions || !colors) {
          positions = new Float32Array(batch.totalPointCount * 3);
          colors = new Float32Array(batch.totalPointCount * 3);
        }

        positions.set(batch.positions, offset * 3);
        colors.set(batch.colors, offset * 3);

        /**
         * increase point offset by batch length
         */
        offset += batch.positions.length / 3;

        /**
         * update percentage loader
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
      .finally(() => setLoading(null))
      .catch((e) => {
        throw new Error(`Failed to stream CPT data: ${e.message}`);
      });

    return () => {
      /**
       * cancel stream when component is unmounted
       */
      cancelled = true;
    };
  }, []);

  const handlePointClick = (event: ThreeEvent<MouseEvent>) => {
    /**
     * handle pointer click. I'm not completely happy with this. It kind of works ok, however ideally some kind of chunking would be good
     */
    event.stopPropagation();

    /**
     * Get all points that intersect click
     */
    const intersections = event.intersections.filter((i, index) => {
      return i.object === event.object && i.index !== undefined;
    });

    const closest = intersections[0];

    /**
     * if nothing selected, return;
     */
    if (!closest || closest.index === undefined || !geometryRef.current) return;

    const index = closest.index;

    /**
     * Get cols and pos attributes and send to global state
     */
    const colorAttr = geometryRef.current.getAttribute(
      "color",
    ) as THREE.BufferAttribute;

    const positionAttr = geometryRef.current.getAttribute(
      "position",
    ) as THREE.BufferAttribute;

    const x = positionAttr.getX(index);
    const y = positionAttr.getY(index);
    const z = positionAttr.getZ(index);

    const r = colorAttr.getX(index);
    const g = colorAttr.getY(index);
    const b = colorAttr.getZ(index);

    /**
     * Restore previous point colour
     */
    if (selectedPoint) {
      colorAttr.setXYZ(
        selectedPoint.index,
        selectedPoint.color.x,
        selectedPoint.color.y,
        selectedPoint.color.z,
      );
    }

    setSelectedPoint({
      index,
      position: new THREE.Vector3(x, y, z),
      color: new THREE.Vector3(r, g, b),
    });

    /**
     * Colour selected point red
     */
    colorAttr.setXYZ(index, 1, 0, 0);
    colorAttr.needsUpdate = true;
  };

  if (!data || data.pointCount === 0) return null;

  return (
    <points ref={pointsRef} onPointerDown={handlePointClick}>
      <bufferGeometry ref={geometryRef}>
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
