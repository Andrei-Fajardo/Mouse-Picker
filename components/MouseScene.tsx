"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import MouseModel from "./MouseModel";
import { shapeFor } from "@/lib/shape";
import type { Mouse } from "@/lib/types";

export type View = "iso" | "top" | "side" | "front" | "back";

const POSITIONS: Record<View, [number, number, number]> = {
  iso: [10, 10, 14],
  top: [0, 26, 0.001],
  side: [24, 3, 0],
  front: [0, 4, -24],
  back: [0, 4, 24],
};

type Target = { set: (x: number, y: number, z: number) => void };

function CameraRig({ view, nonce }: { view: View; nonce: number }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as { target: Target; update: () => void } | null;
  useEffect(() => {
    camera.position.set(...POSITIONS[view]);
    camera.lookAt(0, 1.5, 0);
    if (controls) {
      controls.target.set(0, 1.5, 0);
      controls.update();
    }
  }, [camera, controls, view, nonce]);
  return null;
}

type Props = {
  primary: Mouse | null;
  secondary: Mouse | null;
  xray: boolean;
  autoRotate: boolean;
  view: View;
  viewNonce: number;
};

export default function MouseScene({ primary, secondary, xray, autoRotate, view, viewNonce }: Props) {
  const a = primary ? shapeFor(primary.id).shape : null;
  const b = secondary ? shapeFor(secondary.id).shape : null;
  return (
    <Canvas camera={{ position: POSITIONS.iso, fov: 38 }} dpr={[1, 2]}>
      <color attach="background" args={["#10131a"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 14, 6]} intensity={1.6} />
      <directionalLight position={[-8, 6, -6]} intensity={0.5} />
      <gridHelper args={[40, 40, "#2a3040", "#1c2130"]} />
      {primary && a && <MouseModel mouse={primary} shape={a} xray={xray} />}
      {secondary && b && <MouseModel mouse={secondary} shape={b} xray={false} overlay />}
      <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={30} blur={2.5} far={6} />
      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={1.2}
        minDistance={8}
        maxDistance={40}
      />
      <CameraRig view={view} nonce={viewNonce} />
    </Canvas>
  );
}
