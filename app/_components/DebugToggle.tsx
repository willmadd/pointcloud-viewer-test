"use client";

import React from "react";
import { useUiStore } from "../store/useUiStore";
import Toggle from "./atoms/Toggle";

type Props = {};

const DebugToggle = (props: Props) => {
  const debugMode = useUiStore((state) => state.debugMode);
  const setDebugMode = useUiStore((state) => state.setDebugMode);

  return (
    <div className="absolute top-5 right-5 text-white rounded-full shadow p-1 pr-2 bg-zinc-900  ring-emerald-200 ring-1">
      <Toggle
        label={"Debug Mode"}
        enabled={debugMode}
        setEnabled={() => setDebugMode(!debugMode)}
      />
    </div>
  );
};

export default DebugToggle;
