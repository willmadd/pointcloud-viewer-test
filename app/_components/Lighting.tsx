import React from "react";

type Props = {};

const Lighting = (props: Props) => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight intensity={120} position={[10, 10, 10]} />
      <spotLight intensity={270} position={[-10, 10, -10]} />
    </>
  );
};

export default Lighting;
