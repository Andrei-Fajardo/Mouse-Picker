"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Html, Line } from "@react-three/drei";
import type { Mouse, Shape } from "@/lib/types";
import { buildBottom, buildShell, centreLine, crossLine, halfWidth, topHeight, zAt } from "@/lib/shape";

type Props = {
  mouse: Mouse;
  shape: Shape;
  xray: boolean;
  overlay?: boolean; // second mouse in compare mode: wireframe only
};

const SPLIT_T = 0.58; // where the click zone starts
const WHEEL_T = 0.72;

function Tag({ title, value }: { title: string; value: string }) {
  return (
    <Html center distanceFactor={14} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
      <div className="tag">
        <b>{title}</b>
        <span>{value}</span>
      </div>
    </Html>
  );
}

export default function MouseModel({ mouse, shape, xray, overlay = false }: Props) {
  const shell = useMemo(() => buildShell(shape), [shape]);
  const bottom = useMemo(() => buildBottom(shape), [shape]);
  const split = useMemo(() => centreLine(shape, SPLIT_T, 0.97), [shape]);
  const edge = useMemo(() => crossLine(shape, SPLIT_T), [shape]);

  if (overlay) {
    return (
      <mesh geometry={shell}>
        <meshBasicMaterial color="#f5a524" wireframe transparent opacity={0.55} />
      </mesh>
    );
  }

  const wheelY = topHeight(WHEEL_T, shape) - 0.12;
  const wheelZ = zAt(WHEEL_T, shape);
  const switchT = 0.8;
  const switchY = topHeight(switchT, shape) * 0.45;
  const switchX = halfWidth(switchT, shape) * 0.55;
  const switchZ = zAt(switchT, shape);
  const pcbZ = zAt(0.45, shape);
  const pcbLen = shape.length * 0.1 * 0.62;
  const pcbWid = shape.width * 0.1 * 0.62;
  const sw = mouse.switches[0];

  return (
    <group>
      <mesh geometry={shell}>
        <meshPhysicalMaterial
          color="#303644"
          roughness={0.45}
          metalness={0.1}
          clearcoat={0.4}
          side={THREE.DoubleSide}
          transparent
          opacity={xray ? 0.16 : 1}
          depthWrite={!xray}
        />
      </mesh>
      <mesh geometry={bottom}>
        <meshStandardMaterial color="#1b1f29" side={THREE.DoubleSide} transparent opacity={xray ? 0.16 : 1} />
      </mesh>

      <Line points={split} color="#0c0e13" lineWidth={1.5} />
      <Line points={edge} color="#0c0e13" lineWidth={1.5} />

      <mesh position={[0, wheelY, wheelZ]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.42, 0.42, 0.34, 24]} />
        <meshStandardMaterial color="#e6e8ee" roughness={0.6} />
      </mesh>

      {xray && (
        <group>
          <mesh position={[0, 0.3, pcbZ]}>
            <boxGeometry args={[pcbWid, 0.1, pcbLen]} />
            <meshStandardMaterial color="#1f7a4d" />
          </mesh>

          <mesh position={[0, 0.16, pcbZ]}>
            <boxGeometry args={[0.55, 0.22, 0.55]} />
            <meshStandardMaterial color="#35c2ff" emissive="#0a6a99" />
          </mesh>
          <group position={[0, 0.16, pcbZ]}>
            <Tag title="Sensor" value={mouse.sensor ? `${mouse.sensor.brand} ${mouse.sensor.model}` : "Unknown"} />
          </group>

          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * switchX, switchY, switchZ]}>
              <boxGeometry args={[0.65, 0.42, 0.85]} />
              <meshStandardMaterial color="#ff6a5c" />
            </mesh>
          ))}
          <group position={[-switchX, switchY + 0.45, switchZ]}>
            <Tag title="Switch" value={sw ? `${sw.brand} ${sw.model}` : "Unknown"} />
          </group>

          <mesh position={[0.5, wheelY - 0.35, wheelZ]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.5, 18]} />
            <meshStandardMaterial color="#b58cff" />
          </mesh>
          <group position={[0.5, wheelY - 0.35, wheelZ + 0.9]}>
            <Tag title="Encoder" value={mouse.encoder ? `${mouse.encoder.brand} (${mouse.encoder.type})` : "Unknown"} />
          </group>
        </group>
      )}
    </group>
  );
}
