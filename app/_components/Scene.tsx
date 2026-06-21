"use client";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React from "react";
import PointCloud from "./PointCloud";
import { PerfMonitor } from "r3f-monitor";
import { useUiStore } from "../store/useUiStore";
import LoadingSpinner from "./atoms/Loading";

const Scene = () => {
  const debugMode = useUiStore((state) => state.debugMode);
  const loader = useUiStore((state) => state.loader);

  return (
    <div className="h-screen w-screen bg-zinc-700">
      {loader && <LoadingSpinner />}
      <Canvas>
        {debugMode && <PerfMonitor position="bottom-right" />}
        <PointCloud />
        <ambientLight intensity={0.6} />
        <pointLight intensity={120} position={[10, 10, 10]} />
        <spotLight intensity={270} position={[-10, 10, -10]} />
        <PerspectiveCamera makeDefault position={[0, 0, 500]} />

        <OrbitControls
          enabled={!loader}
          target={[0, 0, 0]}
          enableDamping
          makeDefault
        />
      </Canvas>
    </div>
  );
};

export default Scene;
