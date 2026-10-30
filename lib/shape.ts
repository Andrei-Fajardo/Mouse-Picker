import * as THREE from "three";
import shapesJson from "@/data/shapes.json";
import type { Shape } from "./types";

// Scene units are centimetres, so 1 mm = 0.1 units.
export const MM = 0.1;

export const GENERIC: Shape = { length: 122, width: 64, height: 39, hump: 0.4 };

const shapes: Record<string, Shape> = Object.fromEntries(
  Object.entries(shapesJson as Record<string, unknown>).filter(([k]) => !k.startsWith("_")),
) as Record<string, Shape>;

export function shapeFor(id: string): { shape: Shape; measured: boolean } {
  const s = shapes[id];
  return s ? { shape: s, measured: true } : { shape: GENERIC, measured: false };
}

// t runs 0 (back of the mouse) to 1 (front, where the buttons are).
export function halfWidth(t: number, d: Shape) {
  const round = Math.pow(Math.max(0, 1 - Math.pow(2 * t - 1, 6)), 0.45);
  return (d.width / 2) * MM * round * (1 - 0.2 * t);
}

export function topHeight(t: number, d: Shape) {
  const bump = Math.exp(-Math.pow((t - d.hump) / 0.26, 2));
  const base = 0.62 + 0.38 * bump;
  const end = Math.pow(Math.max(0, 1 - Math.pow(2 * t - 1, 8)), 0.4);
  return d.height * MM * base * end;
}

export function zAt(t: number, d: Shape) {
  return (0.5 - t) * d.length * MM;
}

const NT = 64;
const NA = 32;

export function buildShell(d: Shape) {
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= NT; i++) {
    const t = i / NT;
    const w = halfWidth(t, d);
    const h = topHeight(t, d);
    const z = zAt(t, d);
    for (let j = 0; j <= NA; j++) {
      const th = (j / NA) * Math.PI;
      pos.push(w * Math.cos(th), h * Math.pow(Math.sin(th), 0.7), z);
    }
  }
  for (let i = 0; i < NT; i++) {
    for (let j = 0; j < NA; j++) {
      const a = i * (NA + 1) + j;
      const b = a + 1;
      const c = a + NA + 1;
      const e = c + 1;
      idx.push(a, c, b, b, c, e);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function buildBottom(d: Shape) {
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= NT; i++) {
    const t = i / NT;
    const w = halfWidth(t, d);
    const z = zAt(t, d);
    pos.push(-w, 0, z, w, 0, z);
  }
  for (let i = 0; i < NT; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Centre line along the top surface, used for the button split.
export function centreLine(d: Shape, from: number, to: number, steps = 24) {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = from + ((to - from) * i) / steps;
    pts.push([0, topHeight(t, d) + 0.01, zAt(t, d)]);
  }
  return pts;
}

// Cross-section line across the top at station t, used for the click-zone edge.
export function crossLine(d: Shape, t: number, steps = 24) {
  const pts: [number, number, number][] = [];
  const w = halfWidth(t, d);
  const h = topHeight(t, d);
  const z = zAt(t, d);
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * Math.PI;
    pts.push([w * Math.cos(th), h * Math.pow(Math.sin(th), 0.7) + 0.01, z]);
  }
  return pts;
}
