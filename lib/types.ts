export type Sensor = { brand: string; model: string; dpi?: number | null };
export type Switch = { brand: string; model: string; type: string };
export type Encoder = { brand: string; type: string };

export type Mouse = {
  id: string;
  brand: string;
  model: string;
  sensor: Sensor | null;
  switches: Switch[];
  encoder: Encoder | null;
};

export type Shape = {
  length: number; // mm
  width: number; // mm
  height: number; // mm
  hump: number; // 0 = back of the mouse, 1 = front
  approx?: boolean;
};
