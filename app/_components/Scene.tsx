"use client";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import PointCloud from "./PointCloud";
import { PerfMonitor } from "r3f-monitor";
import { useUiStore } from "../store/useUiStore";
import LoadingSpinner from "./atoms/Loading";
import Lighting from "./Lighting";
import Camera from "./Camera";
import * as THREE from "three";
import SelectedPointModal from "./SelectedPointModal";
/**
 * React Three Fiber Scene Set up
 */
const Scene = () => {
  const debugMode = useUiStore((state) => state.debugMode);
  const loader = useUiStore((state) => state.loader);

  return (
    <div className="h-screen w-screen bg-zinc-700">
      <SelectedPointModal />
      {loader && <LoadingSpinner />}
      <Canvas
        /**
         * Giving the points a hitslop so they can be raycasted
         */
        raycaster={{
          params: {
            Points: {
              threshold: 0.1,
            },
          } as THREE.RaycasterParameters,
        }}
      >
        {debugMode && <PerfMonitor position="bottom-right" />}
        <PointCloud />
        <Lighting />
        <Camera />
      </Canvas>
    </div>
  );
};

export default Scene;
