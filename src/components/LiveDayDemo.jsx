import React, { useState } from "react";
import LiveDay from "./LiveDay";
import { getSave, getUpgrades } from "../game/save";

export default function LiveDayDemo() {
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState(0);
  const save = getSave() || { day: 1, inventory: [], pullList: [] };
  const upgrades = getUpgrades(save);

  return <div className="min-h-screen bg-[#f6efe3] p-4 text-slate-950">
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl">
        <div className="text-xs font-black uppercase tracking-widest text-amber-300">Component Demo</div>
        <h1 className="mt-1 text-3xl font-black">Reusable LiveDay</h1>
        <p className="mt-2 text-sm font-semibold text-slate-300">This extracted component uses FloorMap internally and creates customer routes from the current save: inventory, pull lists, weekly trends, and stock.</p>
      </div>

      <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5"><div className="text-[10px] font-black uppercase tracking-wide text-slate-500">Day</div><div className="mt-1 text-xl font-black">{save.day || 1}</div></div>
          <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5"><div className="text-[10px] font-black uppercase tracking-wide text-slate-500">Upgrades</div><div className="mt-1 text-xl font-black">{upgrades.length}</div></div>
          <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5"><div className="text-[10px] font-black uppercase tracking-wide text-slate-500">Runs</div><div className="mt-1 text-xl font-black">{completed}</div></div>
        </div>

        <button onClick={() => setOpen(true)} className="mt-4 w-full rounded-2xl bg-amber-400 px-4 py-4 text-base font-black text-slate-950 shadow-lg shadow-amber-500/20 active:scale-[.99]">▶ Run LiveDay Demo</button>
      </div>

      <LiveDay
        open={open}
        save={save}
        upgrades={upgrades}
        onClose={() => setOpen(false)}
        onComplete={() => {
          setCompleted(count => count + 1);
          setOpen(false);
        }}
      />
    </div>
  </div>;
}
