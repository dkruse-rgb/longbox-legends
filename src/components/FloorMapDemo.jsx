import React, { useMemo, useState } from "react";
import FloorMap from "./FloorMap";
import { getSave, getUpgrades } from "../game/save";
import { SHOP_ZONES } from "../game/catalog";

export default function FloorMapDemo() {
  const [selected, setSelected] = useState(null);
  const save = getSave() || {};
  const upgrades = getUpgrades(save);
  const customers = useMemo(() => [
    { id: "demo-mikey", name: "Mikey", icon: "🎒", x: 24, y: 38 },
    { id: "demo-sandra", name: "Sandra", icon: "🧐", x: 30, y: 62 },
    { id: "demo-carl", name: "Carl", icon: "🧢", x: 76, y: 62 }
  ], []);

  return <div className="min-h-screen bg-[#f6efe3] p-4 text-slate-950">
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl">
        <div className="text-xs font-black uppercase tracking-widest text-amber-300">Component Demo</div>
        <h1 className="mt-1 text-3xl font-black">Reusable FloorMap</h1>
        <p className="mt-2 text-sm font-semibold text-slate-300">This is the extracted floor-map component. The current playable game still uses the compatibility stack, but new features can now build on this clean component.</p>
      </div>

      <FloorMap
        zones={SHOP_ZONES}
        upgrades={upgrades}
        customers={customers}
        interactive
        selectedZoneId={selected?.id}
        onZoneClick={setSelected}
        title="Extracted Floor Map"
        subtitle="Reusable component for static shop view and Live Day"
      />

      {selected && <div className="mt-4 rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="text-xs font-black uppercase tracking-widest text-amber-600">Selected Zone</div>
        <h2 className="mt-1 text-2xl font-black">{selected.icon} {selected.title}</h2>
        <p className="mt-1 text-sm font-semibold text-slate-600">{selected.role}</p>
      </div>}
    </div>
  </div>;
}
