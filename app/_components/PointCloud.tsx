"use client";

import { useEffect, useRef, useState } from "react";
import { loadInBatches } from "@loaders.gl/core";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

import { CPTLoader } from "../utils/CptLoader";
import { useUiStore } from "../store/useUiStore";

type CPTBatch = {
  pointCount: number;
  totalPointCount: number;
  positions: Float32Array;
  colors: Float32Array;
};

type Buffers = {
  positions: Float32Array;
  colors: Float32Array;
  totalPointCount: number;
};

/**
 * Mark a section of the buffer as changed so only that range
 * is uploaded to the GPU instead of the entire buffer.
 */

const markAttributeRangeForUpdate = (
  attribute: THREE.BufferAttribute,
  offset: number,
  count: number,
) => {
  attribute.addUpdateRange(offset, count);
  attribute.needsUpdate = true;
};

const PointCloud = () => {
  const [buffers, setBuffers] = useState<Buffers | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const loadedPointCountRef = useRef(0);

  const selectedPointRef = useRef<{
    index: number;
    color: THREE.Vector3;
  } | null>(null);

  const setLoading = useUiStore((state) => state.setLoading);
  const setSelectedPoint = useUiStore((state) => state.setSelectedPoint);
  const setLoadingPercentage = useUiStore(
    (state) => state.setLoadingPercentage,
  );

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

      const batches = await loadInBatches("/api/big_cloud.cpt", CPTLoader);

      for await (const batch of batches as AsyncIterable<CPTBatch>) {
        /**
         * If stream cancelled, break loop
         */
        if (cancelled) break;

        const batchPointCount = batch.positions.length / 3;
        const batchStartPoint = offset;

        /**
         * allocate memory for all points positions and colours
         * this is cheaper than doing on the fly
         */
        if (!positions || !colors) {
          positions = new Float32Array(batch.totalPointCount * 3);
          colors = new Float32Array(batch.totalPointCount * 3);

          /**
           * set buffers into array for first chunk only. in additional chunks we will update the existing buffers, rather than rerendering new buffers
           */

          setBuffers({
            positions,
            colors,
            totalPointCount: batch.totalPointCount,
          });
        }

        positions.set(batch.positions, batchStartPoint * 3);
        colors.set(batch.colors, batchStartPoint * 3);

        /**
         * increase point offset by batch length
         */
        offset += batchPointCount;
        loadedPointCountRef.current = offset;

        const geometry = geometryRef.current;

        if (geometry) {
          geometry.setDrawRange(0, offset);

          const positionAttr = geometry.getAttribute(
            "position",
          ) as THREE.BufferAttribute;

          const colorAttr = geometry.getAttribute(
            "color",
          ) as THREE.BufferAttribute;

          /**
           * Mark latest chunks as changed so Three.js uploads them to the GPU
           */

          markAttributeRangeForUpdate(
            positionAttr,
            batchStartPoint * 3,
            batch.positions.length,
          );

          markAttributeRangeForUpdate(
            colorAttr,
            batchStartPoint * 3,
            batch.colors.length,
          );
        }

        /**
         * update percentage loader
         */
        const percentage = Math.round((offset / batch.totalPointCount) * 100);
        setLoadingPercentage(percentage);
      }
    };

    stream()
      .catch((e) => {
        setError(
          new Error(
            `Failed to stream CPT data: ${
              e instanceof Error ? e.message : String(e)
            }`,
          ),
        );
      })
      .finally(() => {
        setLoading(null);
      });

    return () => {
      /**
       * cancel stream when component is unmounted
       */
      cancelled = true;
    };
  }, [setLoading, setLoadingPercentage]);

  useEffect(() => {
    const geometry = geometryRef.current;

    if (!geometry) return;

    geometry.setDrawRange(0, loadedPointCountRef.current);
    geometry.computeBoundingSphere();
  }, [buffers]);

  const handlePointClick = (event: ThreeEvent<MouseEvent>) => {
    /**
     * handle pointer click. I'm not completely happy with this. It kind of works ok, however ideally some kind of chunking would be good
     * potentially there could be a huge number of points that it would have to iterate through.
     */
    event.stopPropagation();

    /**
     * Get all points that intersect click
     */
    const closest = event.intersections.find(
      (i) => i.object === event.object && i.index !== undefined,
    );

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
    if (selectedPointRef.current) {
      const previousIndex = selectedPointRef.current.index;
      const previousColor = selectedPointRef.current.color;

      colorAttr.setXYZ(
        previousIndex,
        previousColor.x,
        previousColor.y,
        previousColor.z,
      );

      markAttributeRangeForUpdate(colorAttr, previousIndex * 3, 3);
    }

    setSelectedPoint({
      index,
      position: new THREE.Vector3(x, y, z),
      color: new THREE.Vector3(r, g, b),
    });

    selectedPointRef.current = {
      index,
      color: new THREE.Vector3(r, g, b),
    };

    /**
     * Colour selected point red
     */
    colorAttr.setXYZ(index, 1, 0, 0);
    markAttributeRangeForUpdate(colorAttr, index * 3, 3);
  };

  if (error) throw error;
  if (!buffers) return null;

  return (
    <points ref={pointsRef} onPointerDown={handlePointClick}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[buffers.positions, 3]}
          usage={THREE.DynamicDrawUsage}
        />

        <bufferAttribute
          attach="attributes-color"
          args={[buffers.colors, 3]}
          usage={THREE.DynamicDrawUsage}
        />
      </bufferGeometry>

      <pointsMaterial size={0.5} vertexColors sizeAttenuation />
    </points>
  );
};

export default PointCloud;
