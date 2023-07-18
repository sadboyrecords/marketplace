/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react/no-unknown-property */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as THREE from "three";
import { useState, useRef, Suspense, useMemo } from "react";
import { Canvas, useThree, useFrame, useLoader } from "@react-three/fiber";
import { CameraShake, OrbitControls } from "@react-three/drei";
import { KernelSize } from "postprocessing";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

function Triangle({ color, ...props }) {
  const ref = useRef();
  const [r] = useState(() => Math.random() * 10000);
  useFrame(
    (_) =>
      (ref.current.position.y = -1.75 + Math.sin(_.clock.elapsedTime + r) / 10)
  );
  const { paths: [path] } = useLoader(SVGLoader, '/triangle.svg') // prettier-ignore
  const geom = useMemo(
    () =>
      SVGLoader.pointsToStroke(
        path.subPaths[0].getPoints(),
        path.userData.style
      ),
    []
  );
  return (
    <group ref={ref}>
      <mesh geometry={geom} {...props}>
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Rig({ children }) {
  const ref = useRef();
  const vec = new THREE.Vector3();
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.lerp(vec.set(mouse.x * 2, 0, 3.5), 0.05);
    ref.current.position.lerp(vec.set(mouse.x * 1, mouse.y * 0.1, 0), 0.1);
    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y,
      (-mouse.x * Math.PI) / 20,
      0.1
    );
  });
  return <group ref={ref}>{children}</group>;
}

const Background = () => {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 15] }}
      style={{
        // position: "fixed",
        position: "absolute",
        height: "100vh",
        width: "100vw",
        display: "block",
        top: 0,
        zIndex: -1,
        filter: "blur(60px) drop-shadow(4px 4px 100px black)",
      }}
    >
      {/* <color attach="background" args={["black"]} /> */}
      <ambientLight />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
      <Suspense fallback={null}>
        <Rig>
          <Triangle
            color="#ff2060"
            scale={0.009}
            rotation={[0, 0, Math.PI / 3]}
          />
          <Triangle
            color="cyan"
            scale={0.009}
            position={[2, 0, -2]}
            rotation={[0, 0, Math.PI / 3]}
          />
          <Triangle
            color="orange"
            scale={0.009}
            position={[-2, 0, -2]}
            rotation={[0, 0, Math.PI / 3]}
          />
          <Triangle
            color="white"
            scale={0.009}
            position={[0, 2, -14]}
            rotation={[0, 0, Math.PI / 3]}
          />
          <Triangle
            color="#ff2060"
            scale={0.009}
            rotation={[0, 0, Math.PI / 3]}
            position={[10, -6, -14]}
          />
          <Triangle
            color="cyan"
            scale={0.009}
            position={[-4, 2, -2]}
            rotation={[0, 0, Math.PI / 3]}
          />
          <Triangle
            color="orange"
            scale={0.009}
            position={[4, 2, -2]}
            rotation={[0, 0, Math.PI / 3]}
          />
          <Triangle
            color="white"
            scale={0.009}
            position={[0, 2, -10]}
            rotation={[0, 0, Math.PI / 3]}
          />
          {/* <Ground
						mirror={1}
						blur={[500, 100]}
						mixBlur={12}
						mixStrength={1.5}
						rotation={[-Math.PI / 2, 0, Math.PI / 2]}
						position-y={-0.8}
					/> */}
        </Rig>
        <EffectComposer multisampling={2}>
          <Bloom
            kernelSize={3}
            luminanceThreshold={0}
            luminanceSmoothing={0.4}
            intensity={0.6}
          />
          <Bloom
            kernelSize={KernelSize.HUGE}
            luminanceThreshold={0}
            luminanceSmoothing={0}
            intensity={2}
          />
        </EffectComposer>
      </Suspense>
      <CameraShake
        yawFrequency={0.2}
        pitchFrequency={0.2}
        rollFrequency={0.3}
      />
    </Canvas>
  );
};

export default Background;
