import type { Metadata } from "next";

import DebugToggle from "./_components/DebugToggle";
import Scene from "./_components/Scene";

export const metadata: Metadata = {
  title: "Point Cloud Viewer",
  description:
    "Interactive point cloud viewer built with React Three Fiber and Three.js.",
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Scene />
      <DebugToggle />
    </div>
  );
}
