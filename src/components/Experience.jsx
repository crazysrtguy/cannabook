import { Environment, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Book } from "./Book";

// Pulls the camera back and widens the FOV on narrow (mostly mobile/portrait)
// viewports so the book stays fully framed instead of being cropped - R3F's
// `size` from useThree tracks the canvas's actual rendered size, so this
// reacts to orientation changes and window resizes too.
const ResponsiveCamera = () => {
  const { camera, size } = useThree();

  useEffect(() => {
    const isNarrow = size.width < 700;
    camera.position.set(isNarrow ? -0.3 : -0.5, 1, isNarrow ? 5.5 : 4);
    if (camera.isPerspectiveCamera) {
      camera.fov = isNarrow ? 55 : 45;
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width]);

  return null;
};

export const Experience = () => {
  return (
    <>
      <ResponsiveCamera />
      <group rotation-x={-Math.PI / 4}>
        <Book />
      </group>
      <OrbitControls
        enablePan={false}
        enableRotate={false}
        minDistance={2.5}
        maxDistance={7}
      />
      <Environment preset="studio"></Environment>
      <directionalLight
        position={[2, 5, 2]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
