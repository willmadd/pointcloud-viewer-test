import { useUiStore } from "@/app/store/useUiStore";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type SelectedPointRef = {
  index: number;
  color: THREE.Vector3;
} | null;

type UsePointCloudClickHandlerArgs = {
  camera: THREE.Camera;
  gl: THREE.WebGLRenderer;
  geometryRef: React.RefObject<THREE.BufferGeometry | null>;
  pointsRef: React.RefObject<THREE.Points | null>;
};

const markAttributeRangeForUpdate = (
  attribute: THREE.BufferAttribute,
  offset: number,
  count: number,
) => {
  attribute.addUpdateRange(offset, count);
  attribute.needsUpdate = true;
};

/**
 * R3F's built-in raycasting runs on every pointermove event causing camera jank.
 * work around was adding our own pointerdown listener directly to the canvas
 */

export const usePointCloudClickHandler = ({
  camera,
  gl,
  geometryRef,
  pointsRef,
}: UsePointCloudClickHandlerArgs) => {
  const clickRaycaster = useRef(new THREE.Raycaster());
  const selectedPointRef = useRef<SelectedPointRef>(null);

  const setSelectedPoint = useUiStore((state) => state.setSelectedPoint);

  useEffect(() => {
    clickRaycaster.current.params.Points = { threshold: 0.1 };

    const canvas = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      const points = pointsRef.current;
      const geometry = geometryRef.current;
      if (!points || !geometry) return;

      /**
       * Get the canvas position relative to the viewport
       */

      const rect = canvas.getBoundingClientRect();

      /**
       * Convert pixel coords to three.js clip space
       */

      const normalizedMouseX =
        ((e.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
      const normalizedMouseY =
        -((e.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

      /**
       * Aim the raycaster through the clicked point in the scene
       */

      clickRaycaster.current.setFromCamera(
        new THREE.Vector2(normalizedMouseX, normalizedMouseY),
        camera,
      );

      const intersects: THREE.Intersection[] = [];
      THREE.Points.prototype.raycast.call(
        points,
        clickRaycaster.current,
        intersects,
      );
      const closest = intersects.find((i) => i.index !== undefined);

      if (!closest || closest.index === undefined) return;

      const index = closest.index;

      const colorAttr = geometry.getAttribute("color") as THREE.BufferAttribute;
      const positionAttr = geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;

      const px = positionAttr.getX(index);
      const py = positionAttr.getY(index);
      const pz = positionAttr.getZ(index);

      const r = colorAttr.getX(index);
      const g = colorAttr.getY(index);
      const b = colorAttr.getZ(index);

      /**
       * Restore previous point colour
       */

      if (selectedPointRef.current) {
        const prevIndex = selectedPointRef.current.index;
        const prevColor = selectedPointRef.current.color;
        colorAttr.setXYZ(prevIndex, prevColor.x, prevColor.y, prevColor.z);
        markAttributeRangeForUpdate(colorAttr, prevIndex * 3, 3);
      }

      setSelectedPoint({
        index,
        position: new THREE.Vector3(px, py, pz),
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

    canvas.addEventListener("pointerdown", handlePointerDown);
    return () => canvas.removeEventListener("pointerdown", handlePointerDown);
  }, [camera, gl, geometryRef, pointsRef, setSelectedPoint]);
};
