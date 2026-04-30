import React from "react";

export default function GameShell({
  title = "Longbox Legends",
  subtitle = "Build the neighborhood comic shop into a local legend.",
  badge = "Comic Shop Tycoon",
  day = 1,
  cash = 0,
  rep = 0,
  stock = 0,
  traffic = 0,
  onOpenShop,
  onMissions,
  onCollection,
  children
}) {
  const cashValue = `$${Math.round(cash).toLocaleString()}`;

  return <>
    <div className="min-h-screen bg-[#f6efe3] pb-28 text-slate-950 lg:pb-8">
      <div className="mx-auto max-w-7xl p-3 sm:p-4 lg:p-6">
        <div className="overflow-hidden rounded-[2rem] bg-[#fffaf0] shadow-2xl ring-1 ring-black/5">
          <header className="border-b border-white/10 bg-slate-950 text-white">
            <div className="relative overflow-hidden px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 15% 20%, #f59e0b, transparent 26%), radial-gradient(circle at 85% 0%, #06b6d4, transparent 25%), linear-gradient(135deg, transparent, rgba(255,255,255,.08))" }} />
              <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-950">{badge}</span>
                    <span className="text-xs font-bold text-slate-300">Day {day}</span>
                  </div>
                  <h1 className="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
                  <p className="mt-2 max-w-2xl text-sm font-semibold text-slate-300">{subtitle}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0">
                  <button onClick={onOpenShop} className="rounded-2xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 active:scale-[.98]">▶ Open</button>
                  <button onClick={onMissions} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white ring-1 ring-white/15 active:scale-[.98]">🎯 Goals</button>
                  <button onClick={onCollection} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white ring-1 ring-white/15 active:scale-[.98]">📚 Books</button>
                </div>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4 lg:p-4">
            <Stat label="Cash" value={cashValue} hot />
            <Stat label="Rep" value={`${rep}/100`} />
            <Stat label="Stock" value={stock} />
            <Stat label="Traffic" value={traffic} />
          </section>

          <main className="p-3 lg:p-4">
            {children}
          </main>
        </div>
      </div>
    </div>

    <MobileResourceDock day={day} cash={cashValue} rep={rep} stock={stock} />
  </>;
}

function Stat({ label, value, hot }) {
  return <div className={`${hot ? "bg-slate-950 text-white" : "bg-white text-slate-950"} rounded-2xl p-3 shadow-sm ring-1 ring-black/5`}>
    <div className={`text-[10px] font-black uppercase tracking-widest ${hot ? "text-amber-300" : "text-slate-500"}`}>{label}</div>
    <div className="mt-1 truncate text-xl font-black">{value}</div>
  </div>;
}

function MobileResourceDock({ day, cash, rep, stock }) {
  return <div className="fixed inset-x-3 bottom-[5.7rem] z-40 rounded-2xl bg-slate-950/95 p-2 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur lg:hidden">
    <div className="grid grid-cols-4 gap-1 text-center">
      <DockStat label="Cash" value={cash} hot />
      <DockStat label="Rep" value={`${rep}/100`} />
      <DockStat label="Stock" value={stock} />
      <DockStat label="Day" value={day} />
    </div>
  </div>;
}

function DockStat({ label, value, hot }) {
  return <div className={`${hot ? "bg-amber-400 text-slate-950" : "bg-white/10 text-white"} rounded-xl px-2 py-1.5`}>
    <div className={`text-[8px] font-black uppercase tracking-widest ${hot ? "text-slate-800" : "text-slate-300"}`}>{label}</div>
    <div className="mt-0.5 truncate text-sm font-black">{value}</div>
  </div>;
}
