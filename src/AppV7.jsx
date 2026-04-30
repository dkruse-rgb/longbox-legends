import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppV6 from "./AppV6.jsx";

const SAVE_KEY = "longbox-legends-save-v5";
const SHELL_KEY = "longbox-legends-shell-v1";
const SAVE_KEYS = ["longbox-legends-save-v5", "longbox-legends-save-v4", "longbox-legends-save-v3", "longbox-legends-save-v2", "longbox-legends-save-v1"];

const starterStock = {
  new: { id: "new", name: "New Release Comics", icon: "📚", stock: 0, price: 8, tags: ["casual", "collector", "kid"] },
  manga: { id: "manga", name: "Manga Volumes", icon: "🌸", stock: 0, price: 13, tags: ["manga", "kid", "casual"] },
  cards: { id: "cards", name: "Trading Card Packs", icon: "🃏", stock: 0, price: 11, tags: ["card", "kid", "speculator"] },
  back: { id: "back", name: "Back Issue Bundle", icon: "🗃️", stock: 0, price: 9, tags: ["collector", "speculator"] },
  zines: { id: "zines", name: "Local Indie Zines", icon: "✍️", stock: 0, price: 6, tags: ["artist", "casual"] }
};

const missions = [
  {
    id: "first_day",
    title: "Open the Doors",
    desc: "Open the shop for at least one day.",
    reward: "+$75 and +4 New Releases",
    check: save => (save?.day || 1) >= 2,
    apply: save => addReward(save, { cash: 75, rep: 1, stock: { new: 4 } })
  },
  {
    id: "first_stock",
    title: "Fill the Shelves",
    desc: "Reach 20 total stock.",
    reward: "+$100 and +5 Manga",
    check: save => getStock(save) >= 20,
    apply: save => addReward(save, { cash: 100, stock: { manga: 5 } })
  },
  {
    id: "pull_list_one",
    title: "Make a Regular Happy",
    desc: "Fill your first pull-list request.",
    reward: "+$150 and +3 reputation",
    check: save => (save?.fulfilledPulls || 0) >= 1,
    apply: save => addReward(save, { cash: 150, rep: 3 })
  },
  {
    id: "trend_hunter",
    title: "Ride the Trend",
    desc: "Make 5 trend sales.",
    reward: "+$180 and +6 Card Packs",
    check: save => (save?.trendWins || 0) >= 5,
    apply: save => addReward(save, { cash: 180, stock: { cards: 6 } })
  },
  {
    id: "first_upgrade",
    title: "Improve the Shop",
    desc: "Build your first upgrade.",
    reward: "+$125 and +2 reputation",
    check: save => Array.isArray(save?.upgrades) && save.upgrades.length >= 1,
    apply: save => addReward(save, { cash: 125, rep: 2 })
  },
  {
    id: "fan_base",
    title: "Build a Fanbase",
    desc: "Reach 50 total customer loyalty.",
    reward: "+$200 and +4 reputation",
    check: save => getFans(save) >= 50,
    apply: save => addReward(save, { cash: 200, rep: 4 })
  },
  {
    id: "debt_control",
    title: "Clean Up the Books",
    desc: "Get debt below $50 after having any debt.",
    reward: "+$250 and +5 reputation",
    check: save => (save?.debt || 0) < 50 && (save?.day || 1) >= 8,
    apply: save => addReward(save, { cash: 250, rep: 5 })
  },
  {
    id: "neighborhood_shop",
    title: "Neighborhood Name",
    desc: "Reach 25 reputation.",
    reward: "+$300 and +8 Back Issues",
    check: save => (save?.rep || 0) >= 25,
    apply: save => addReward(save, { cash: 300, stock: { back: 8 } })
  }
];

function safeParse(value) {
  try { return value ? JSON.parse(value) : null; } catch { return null; }
}

function getSave() {
  for (const key of SAVE_KEYS) {
    const save = safeParse(localStorage.getItem(key));
    if (save) return save;
  }
  return null;
}

function setSave(save) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

function getStock(save) {
  const inv = Array.isArray(save?.inventory) ? save.inventory : [];
  const rare = Array.isArray(save?.rare) ? save.rare : [];
  return inv.reduce((sum, item) => sum + (Number(item.stock) || 0), 0) + rare.length;
}

function getFans(save) {
  const loyalty = save?.loyalty && typeof save.loyalty === "object" ? save.loyalty : {};
  return Object.values(loyalty).reduce((sum, val) => sum + (Number(val) || 0), 0);
}

function clamp(num, min, max) {
  return Math.min(max, Math.max(min, num));
}

function addInventory(save, stockReward = {}) {
  const inventory = Array.isArray(save.inventory) ? [...save.inventory] : [];
  for (const [id, amount] of Object.entries(stockReward)) {
    const template = starterStock[id];
    if (!template) continue;
    const existing = inventory.find(item => item.id === id);
    if (existing) {
      existing.stock = (Number(existing.stock) || 0) + amount;
    } else {
      inventory.push({ ...template, stock: amount });
    }
  }
  return inventory;
}

function addReward(save, reward) {
  const next = {
    ...save,
    cash: Math.max(0, Number(save.cash) || 0) + (reward.cash || 0),
    rep: clamp((Number(save.rep) || 0) + (reward.rep || 0), 0, 100),
    debt: Math.max(0, (Number(save.debt) || 0) - (reward.debtPaydown || 0)),
    inventory: addInventory(save, reward.stock),
    log: [
      `Mission reward claimed: ${reward.cash ? `+${formatMoney(reward.cash)} ` : ""}${reward.rep ? `+${reward.rep} rep ` : ""}${reward.stock ? "+inventory " : ""}`.trim(),
      ...(Array.isArray(save.log) ? save.log : [])
    ].slice(0, 10)
  };
  return next;
}

function formatMoney(n) {
  return `$${Math.round(n).toLocaleString()}`;
}

function getShell() {
  const saved = safeParse(localStorage.getItem(SHELL_KEY));
  return {
    seenTitle: saved?.seenTitle || false,
    claimed: Array.isArray(saved?.claimed) ? saved.claimed : []
  };
}

function setShell(shell) {
  localStorage.setItem(SHELL_KEY, JSON.stringify(shell));
}

function clearAllSaves() {
  SAVE_KEYS.forEach(key => localStorage.removeItem(key));
  localStorage.removeItem(SHELL_KEY);
}

export default function AppV7() {
  const [shell, setShellState] = useState(getShell);
  const [screen, setScreen] = useState(() => shell.seenTitle ? "game" : "title");
  const [missionOpen, setMissionOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [appKey, setAppKey] = useState(0);
  const [saveTick, setSaveTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSaveTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const save = useMemo(() => getSave(), [saveTick, appKey, missionOpen, screen]);
  const missionState = useMemo(() => {
    const claimed = new Set(shell.claimed || []);
    return missions.map(mission => ({
      ...mission,
      complete: mission.check(save || {}),
      claimed: claimed.has(mission.id)
    }));
  }, [save, shell]);
  const claimableCount = missionState.filter(m => m.complete && !m.claimed).length;

  function updateShell(nextShell) {
    setShell(nextShell);
    setShellState(nextShell);
  }

  function startGame() {
    const next = { ...shell, seenTitle: true };
    updateShell(next);
    setScreen("game");
  }

  function newGame() {
    clearAllSaves();
    const next = { seenTitle: true, claimed: [] };
    updateShell(next);
    setMissionOpen(false);
    setHowOpen(false);
    setScreen("game");
    setAppKey(v => v + 1);
    setSaveTick(v => v + 1);
  }

  function claimMission(mission) {
    const currentSave = getSave() || {};
    if (!mission.check(currentSave)) return;
    if ((shell.claimed || []).includes(mission.id)) return;
    const rewarded = mission.apply(currentSave);
    setSave(rewarded);
    const nextShell = { ...shell, claimed: [...(shell.claimed || []), mission.id] };
    updateShell(nextShell);
    setAppKey(v => v + 1);
    setSaveTick(v => v + 1);
  }

  if (screen === "title") {
    return <TitleScreen onContinue={startGame} onNewGame={newGame} onHow={() => setHowOpen(true)} hasSave={!!save} howOpen={howOpen} closeHow={() => setHowOpen(false)} />;
  }

  return <div className="relative">
    <AppV6 key={appKey} />
    <button onClick={() => setMissionOpen(true)} className="fixed bottom-24 right-4 z-50 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-950 shadow-2xl ring-1 ring-black/10 active:scale-95 lg:bottom-6">
      🎯 Missions {claimableCount > 0 && <span className="ml-1 rounded-full bg-slate-950 px-2 py-0.5 text-xs text-white">{claimableCount}</span>}
    </button>
    <button onClick={() => setScreen("title")} className="fixed bottom-24 left-4 z-50 rounded-2xl bg-white/95 px-3 py-3 text-xs font-black text-slate-700 shadow-2xl ring-1 ring-black/10 active:scale-95 lg:bottom-6">
      Menu
    </button>
    <MissionModal open={missionOpen} close={() => setMissionOpen(false)} missions={missionState} claimMission={claimMission} save={save} />
  </div>;
}

function TitleScreen({ onContinue, onNewGame, onHow, hasSave, howOpen, closeHow }) {
  return <div className="min-h-screen bg-slate-950 text-white">
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-5">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 10%, #f59e0b, transparent 28%), radial-gradient(circle at 85% 20%, #06b6d4, transparent 26%), radial-gradient(circle at 50% 100%, #a855f7, transparent 28%)" }} />
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-xl rounded-[2.25rem] bg-white/10 p-6 shadow-2xl ring-1 ring-white/15 backdrop-blur">
        <div className="mb-4 inline-flex rounded-full bg-amber-400 px-3 py-1 text-xs font-black uppercase tracking-widest text-slate-950">Comic Shop Tycoon</div>
        <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Longbox Legends</h1>
        <p className="mt-4 text-lg font-semibold text-slate-200">Build a tiny comic shop into the neighborhood’s favorite place for comics, cards, manga, rare finds, pull lists, and loyal regulars.</p>
        <div className="mt-7 grid gap-3">
          <button onClick={onContinue} className="rounded-2xl bg-amber-400 px-5 py-4 text-lg font-black text-slate-950 shadow-lg shadow-amber-400/20 active:scale-[.99]">{hasSave ? "Continue Shop" : "Start Shop"}</button>
          <button onClick={onNewGame} className="rounded-2xl bg-white px-5 py-4 text-lg font-black text-slate-950 active:scale-[.99]">New Game</button>
          <button onClick={onHow} className="rounded-2xl bg-white/10 px-5 py-4 text-lg font-black text-white ring-1 ring-white/15 active:scale-[.99]">How to Play</button>
        </div>
        <div className="mt-5 rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-300 ring-1 ring-white/10">
          Version 0.7: missions, tutorial rewards, title screen, weekly trends, loyalty, debt protection, and pull-list gameplay.
        </div>
      </motion.div>
    </div>
    <HowToModal open={howOpen} close={closeHow} />
  </div>;
}

function MissionModal({ open, close, missions, claimMission, save }) {
  const completed = missions.filter(m => m.claimed).length;
  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
    <motion.div initial={{ y: 80, scale: .98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 80, scale: .98 }} onClick={e => e.stopPropagation()} className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-amber-600">Tutorial Track</div>
          <h2 className="text-3xl font-black text-slate-950">Missions</h2>
          <p className="text-sm font-semibold text-slate-500">Complete goals, claim rewards, and keep the shop moving forward.</p>
        </div>
        <button onClick={close} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">Close</button>
      </div>
      <div className="mb-4 rounded-2xl bg-slate-950 p-4 text-white">
        <div className="flex items-center justify-between"><span className="text-sm font-black text-amber-300">Progress</span><span className="text-sm font-black">{completed}/{missions.length}</span></div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-400" style={{ width: `${(completed / missions.length) * 100}%` }} /></div>
      </div>
      <div className="grid gap-3">
        {missions.map(mission => <div key={mission.id} className={`rounded-2xl p-4 ring-1 ${mission.claimed ? "bg-emerald-50 ring-emerald-200" : mission.complete ? "bg-amber-50 ring-amber-200" : "bg-slate-50 ring-black/5"}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-black text-slate-950">{mission.claimed ? "✅" : mission.complete ? "🎁" : "🎯"} {mission.title}</div>
              <p className="mt-1 text-sm text-slate-600">{mission.desc}</p>
              <div className="mt-2 text-sm font-black text-emerald-700">Reward: {mission.reward}</div>
            </div>
            <button onClick={() => claimMission(mission)} disabled={!mission.complete || mission.claimed} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white disabled:bg-slate-300 disabled:text-slate-500">
              {mission.claimed ? "Claimed" : mission.complete ? "Claim" : "Locked"}
            </button>
          </div>
        </div>)}
      </div>
      {!save && <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900 ring-1 ring-amber-100">Start a shop first, then missions will track your progress.</div>}
    </motion.div>
  </motion.div>}</AnimatePresence>;
}

function HowToModal({ open, close }) {
  const steps = [
    ["📦", "Buy inventory", "Stock comics, manga, cards, figures, and zines. Trending items sell for more."],
    ["🏪", "Open the shop", "Each day brings customers, sales, pull-list requests, rent, and surprises."],
    ["📝", "Watch pull lists", "Regulars ask for specific items. Fill requests before they expire for cash, rep, and loyalty."],
    ["📈", "Ride trends", "Weekly trends boost certain inventory. New Comic Day hits every seventh day."],
    ["🛠️", "Build upgrades", "Reputation unlocks better upgrades, bigger events, and more traffic."],
    ["🎯", "Claim missions", "Missions guide the early game and give rewards so the shop does not stall out."]
  ];
  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
    <motion.div initial={{ y: 80, scale: .98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 80, scale: .98 }} onClick={e => e.stopPropagation()} className="w-full max-w-xl rounded-[2rem] bg-white p-5 text-slate-950 shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-widest text-amber-600">Quick Start</div><h2 className="text-3xl font-black">How to Play</h2></div><button onClick={close} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">Close</button></div>
      <div className="grid gap-3">{steps.map(([icon, title, text]) => <div key={title} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5"><div className="flex gap-3"><div className="text-3xl">{icon}</div><div><div className="font-black">{title}</div><p className="text-sm text-slate-600">{text}</p></div></div></div>)}</div>
    </motion.div>
  </motion.div>}</AnimatePresence>;
}
