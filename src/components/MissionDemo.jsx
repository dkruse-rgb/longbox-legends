import React, { useEffect, useMemo, useState } from "react";
import MissionSystem from "./MissionSystem";
import { ALL_MISSIONS, getMissionProgress, getMissionState } from "../game/missions";
import { getSave } from "../game/save";

export default function MissionDemo() {
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick(value => value + 1);
    window.addEventListener("longbox-missions-changed", refresh);
    window.addEventListener("longbox-save-changed", refresh);
    window.addEventListener("longbox-collection-changed", refresh);
    return () => {
      window.removeEventListener("longbox-missions-changed", refresh);
      window.removeEventListener("longbox-save-changed", refresh);
      window.removeEventListener("longbox-collection-changed", refresh);
    };
  }, []);

  const save = useMemo(() => getSave() || {}, [tick]);
  const state = useMemo(() => getMissionState(), [tick]);
  const progress = useMemo(() => getMissionProgress(save, ALL_MISSIONS, state), [save, state]);
  const claimed = progress.filter(mission => mission.claimed).length;
  const claimable = progress.filter(mission => mission.complete && !mission.claimed).length;

  return <div className="min-h-screen bg-[#f6efe3] p-4 text-slate-950">
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl">
        <div className="text-xs font-black uppercase tracking-widest text-amber-300">Component Demo</div>
        <h1 className="mt-1 text-3xl font-black">Reusable MissionSystem</h1>
        <p className="mt-2 text-sm font-semibold text-slate-300">This demo uses centralized mission definitions and claim logic. The playable game still runs through the compatibility stack while we migrate safely.</p>
      </div>

      <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Missions" value={progress.length} />
          <Stat label="Claimed" value={claimed} />
          <Stat label="Ready" value={claimable} />
        </div>
        <button onClick={() => setOpen(true)} className="mt-4 w-full rounded-2xl bg-amber-400 px-4 py-4 text-base font-black text-slate-950 shadow-lg shadow-amber-500/20 active:scale-[.99]">🎯 Open Missions</button>
      </div>

      <MissionSystem open={open} onClose={() => setOpen(false)} save={save} onChanged={() => setTick(value => value + 1)} />
    </div>
  </div>;
}

function Stat({ label, value }) {
  return <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5">
    <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</div>
    <div className="mt-1 truncate text-xl font-black">{value}</div>
  </div>;
}
