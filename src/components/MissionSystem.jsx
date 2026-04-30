import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ALL_MISSIONS, claimMission, getMissionProgress, getMissionState } from "../game/missions";
import { getSave } from "../game/save";

function groupMissions(missions) {
  return missions.reduce((groups, mission) => {
    const group = mission.group || "Missions";
    if (!groups[group]) groups[group] = [];
    groups[group].push(mission);
    return groups;
  }, {});
}

function ProgressBar({ completed, total }) {
  const width = total ? Math.round((completed / total) * 100) : 0;
  return <div className="rounded-2xl bg-slate-950 p-4 text-white">
    <div className="flex items-center justify-between">
      <span className="text-sm font-black text-amber-300">Progress</span>
      <span className="text-sm font-black">{completed}/{total}</span>
    </div>
    <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${width}%` }} />
    </div>
  </div>;
}

function MissionCard({ mission, onClaim }) {
  const stateClass = mission.claimed
    ? "bg-emerald-50 ring-emerald-200"
    : mission.complete
      ? "bg-amber-50 ring-amber-200"
      : "bg-slate-50 ring-black/5";

  return <div className={`rounded-2xl p-4 ring-1 ${stateClass}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="font-black text-slate-950">{mission.claimed ? "✅" : mission.complete ? "🎁" : "🎯"} {mission.title}</div>
        <p className="mt-1 text-sm font-semibold text-slate-600">{mission.desc}</p>
        <div className="mt-2 text-sm font-black text-emerald-700">Reward: {mission.reward}</div>
      </div>
      <button
        onClick={() => onClaim?.(mission)}
        disabled={!mission.complete || mission.claimed}
        className="shrink-0 rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white disabled:bg-slate-300 disabled:text-slate-500"
      >
        {mission.claimed ? "Claimed" : mission.complete ? "Claim" : "Locked"}
      </button>
    </div>
  </div>;
}

export default function MissionSystem({
  open,
  onClose,
  save = getSave(),
  missions = ALL_MISSIONS,
  onChanged,
  title = "Missions",
  subtitle = "Complete goals, claim rewards, and keep the shop moving."
}) {
  const state = useMemo(() => getMissionState(), [open, save]);
  const progress = useMemo(() => getMissionProgress(save, missions, state), [save, missions, state]);
  const completed = progress.filter(mission => mission.claimed).length;
  const claimable = progress.filter(mission => mission.complete && !mission.claimed).length;
  const grouped = groupMissions(progress);

  function handleClaim(mission) {
    const result = claimMission(mission.id, missions);
    if (result.ok) onChanged?.(result);
  }

  return <AnimatePresence>
    {open && <motion.div
      className="fixed inset-0 z-[125] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 70, scale: .98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 70, scale: .98 }}
        onClick={event => event.stopPropagation()}
        className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-5 text-slate-950 shadow-2xl"
      >
        <div className="sticky -top-5 z-10 -mx-5 -mt-5 mb-4 flex items-start justify-between gap-3 border-b border-black/5 bg-white/95 p-5 backdrop-blur">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-amber-600">Game Goals</div>
            <h2 className="mt-1 text-3xl font-black">{title}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 active:scale-95">Close</button>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <ProgressBar completed={completed} total={progress.length} />
          <div className="rounded-2xl bg-amber-50 p-4 text-center ring-1 ring-amber-100">
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-700">Claimable</div>
            <div className="mt-1 text-3xl font-black text-amber-950">{claimable}</div>
          </div>
        </div>

        <div className="grid gap-5">
          {Object.entries(grouped).map(([group, groupMissions]) => <section key={group}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-black">{group}</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{groupMissions.filter(m => m.claimed).length}/{groupMissions.length}</span>
            </div>
            <div className="grid gap-3">
              {groupMissions.map(mission => <MissionCard key={mission.id} mission={mission} onClaim={handleClaim} />)}
            </div>
          </section>)}
        </div>
      </motion.div>
    </motion.div>}
  </AnimatePresence>;
}
