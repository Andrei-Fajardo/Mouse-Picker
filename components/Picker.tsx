"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Mouse } from "@/lib/types";
import { shapeFor } from "@/lib/shape";
import type { View } from "./MouseScene";

const MouseScene = dynamic(() => import("./MouseScene"), {
  ssr: false,
  loading: () => <div className="loading">Loading 3D view…</div>,
});

const VIEWS: { id: View; label: string }[] = [
  { id: "iso", label: "3D" },
  { id: "top", label: "Top" },
  { id: "side", label: "Side" },
  { id: "front", label: "Front" },
  { id: "back", label: "Back" },
];

const ALL = "All";

function sensorLabel(m: Mouse) {
  return m.sensor ? `${m.sensor.brand} ${m.sensor.model}` : "Unknown";
}

function Spec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="spec">
      <h4>{title}</h4>
      <div>{children}</div>
    </div>
  );
}

function Details({ mouse, tone }: { mouse: Mouse; tone: "primary" | "compare" }) {
  const { shape, measured } = shapeFor(mouse.id);
  return (
    <div className={`details ${tone}`}>
      <h3>
        {mouse.brand} <span>{mouse.model}</span>
      </h3>
      <Spec title="Sensor">
        {sensorLabel(mouse)}
        {mouse.sensor?.dpi ? ` · ${mouse.sensor.dpi.toLocaleString()} DPI` : ""}
      </Spec>
      <Spec title="Main switches">
        {mouse.switches.length === 0
          ? "Unknown"
          : mouse.switches.map((s, i) => (
              <div key={i}>
                {s.brand} {s.model} <em>{s.type}</em>
              </div>
            ))}
      </Spec>
      <Spec title="Scroll encoder">
        {mouse.encoder ? (
          <>
            {mouse.encoder.brand} <em>{mouse.encoder.type}</em>
          </>
        ) : (
          "Unknown"
        )}
      </Spec>
      <Spec title="Shape">
        {measured
          ? `${shape.length} × ${shape.width} × ${shape.height} mm${shape.approx ? " (approximate)" : ""}`
          : "Generic shape, no measurements yet"}
      </Spec>
    </div>
  );
}

export default function Picker({ mice }: { mice: Mouse[] }) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState(ALL);
  const [sensor, setSensor] = useState(ALL);
  const [switchBrand, setSwitchBrand] = useState(ALL);
  const [primaryId, setPrimaryId] = useState<string | null>("logitech-gpro-x-superlight-2");
  const [secondaryId, setSecondaryId] = useState<string | null>(null);
  const [compare, setCompare] = useState(false);
  const [xray, setXray] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [view, setView] = useState<View>("iso");
  const [nonce, setNonce] = useState(0);

  const brands = useMemo(() => [ALL, ...Array.from(new Set(mice.map((m) => m.brand))).sort()], [mice]);
  const sensors = useMemo(
    () => [ALL, ...Array.from(new Set(mice.map(sensorLabel))).sort()],
    [mice],
  );
  const switchBrands = useMemo(
    () => [ALL, ...Array.from(new Set(mice.flatMap((m) => m.switches.map((s) => s.brand)))).sort()],
    [mice],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mice.filter((m) => {
      if (brand !== ALL && m.brand !== brand) return false;
      if (sensor !== ALL && sensorLabel(m) !== sensor) return false;
      if (switchBrand !== ALL && !m.switches.some((s) => s.brand === switchBrand)) return false;
      if (!q) return true;
      return `${m.brand} ${m.model} ${sensorLabel(m)}`.toLowerCase().includes(q);
    });
  }, [mice, query, brand, sensor, switchBrand]);

  const byId = useMemo(() => new Map(mice.map((m) => [m.id, m])), [mice]);
  const primary = primaryId ? byId.get(primaryId) ?? null : null;
  const secondary = compare && secondaryId ? byId.get(secondaryId) ?? null : null;

  function pick(id: string) {
    if (compare && primaryId && id !== primaryId) setSecondaryId(id);
    else setPrimaryId(id);
  }

  function setViewTo(v: View) {
    setView(v);
    setNonce((n) => n + 1);
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <h1>Mouse Picker</h1>
        <p className="sub">{mice.length} mice · brands, sensors and internals</p>
        <input
          className="search"
          placeholder="Search brand, model or sensor"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="filters">
          <select value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Brand">
            {brands.map((b) => (
              <option key={b}>{b === ALL ? "Brand: all" : b}</option>
            ))}
          </select>
          <select value={sensor} onChange={(e) => setSensor(e.target.value)} aria-label="Sensor">
            {sensors.map((s) => (
              <option key={s} value={s}>
                {s === ALL ? "Sensor: all" : s}
              </option>
            ))}
          </select>
          <select value={switchBrand} onChange={(e) => setSwitchBrand(e.target.value)} aria-label="Switch brand">
            {switchBrands.map((s) => (
              <option key={s} value={s}>
                {s === ALL ? "Switch brand: all" : s}
              </option>
            ))}
          </select>
        </div>
        <div className="count">{filtered.length} shown</div>
        <ul className="list">
          {filtered.map((m) => (
            <li key={m.id}>
              <button
                className={m.id === primaryId ? "on" : m.id === secondaryId && compare ? "on2" : ""}
                onClick={() => pick(m.id)}
              >
                <b>{m.brand}</b> {m.model}
                <small>{sensorLabel(m)}</small>
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="empty">No mice match these filters.</li>}
        </ul>
      </aside>

      <main className="stage">
        <div className="toolbar">
          <div className="group">
            {VIEWS.map((v) => (
              <button key={v.id} className={view === v.id ? "on" : ""} onClick={() => setViewTo(v.id)}>
                {v.label}
              </button>
            ))}
          </div>
          <div className="group">
            <button className={xray ? "on" : ""} onClick={() => setXray((x) => !x)}>
              X-ray internals
            </button>
            <button className={autoRotate ? "on" : ""} onClick={() => setAutoRotate((x) => !x)}>
              Auto-rotate
            </button>
            <button
              className={compare ? "on" : ""}
              onClick={() => {
                setCompare((c) => !c);
                setSecondaryId(null);
              }}
            >
              Compare shapes
            </button>
          </div>
        </div>

        <div className="canvas">
          <MouseScene
            primary={primary}
            secondary={secondary}
            xray={xray}
            autoRotate={autoRotate}
            view={view}
            viewNonce={nonce}
          />
          {compare && !secondary && <div className="hint">Pick a second mouse from the list to overlay its shape.</div>}
        </div>

        <div className="panels">
          {primary && <Details mouse={primary} tone="primary" />}
          {secondary && <Details mouse={secondary} tone="compare" />}
          {!primary && <div className="hint static">Pick a mouse from the list.</div>}
        </div>
      </main>
    </div>
  );
}
