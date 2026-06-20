import DebugToggle from "./_components/DebugToggle";
import Scene from "./_components/Scene";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Scene />
      <DebugToggle />
    </div>
  );
}
