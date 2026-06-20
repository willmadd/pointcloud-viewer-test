"use client";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React from "react";

type Props = {};

const Scene = (props: Props) => {
  return (
    <div className="h-screen w-screen bg-zinc-700">
      <Canvas>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>

        <ambientLight intensity={0.6} />
        <pointLight intensity={120} position={[10, 10, 10]} />
        <spotLight intensity={70} position={[-10, -10, -10]} />
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default Scene;
