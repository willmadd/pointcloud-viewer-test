"use client";

import React from "react";
import { useUiStore } from "../store/useUiStore";
import Toggle from "./atoms/Toggle";

type Props = {};

const DebugToggle = (props: Props) => {
  const debugMode = useUiStore((state) => state.debugMode);
  const setDebugMode = useUiStore((state) => state.setDebugMode);

  return (
    <div className="absolute top-5 right-5 z-50">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur">
        <Toggle
          label={"Debug Mode"}
          enabled={debugMode}
          setEnabled={() => setDebugMode(!debugMode)}
        />
      </div>
    </div>
  );
};

export default DebugToggle;
