import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import React from "react";
import { useUiStore } from "../store/useUiStore";

type Props = {};

const Camera = (props: Props) => {
  const loader = useUiStore((state) => state.loader);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 500]} />
      <OrbitControls
        /**
         * Disable camera until model has loaded - this is a bit of a work around as camera jank was a problem while loading in data.
         * Need to implement a more robust solution
         */
        enabled={!loader}
        target={[0, 0, 0]}
        enableDamping
        makeDefault
      />
    </>
  );
};

export default Camera;
