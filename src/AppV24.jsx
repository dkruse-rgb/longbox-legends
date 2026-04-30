import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppV23 from "./AppV23.jsx";

const SAVE_KEY = "longbox-legends-save-v5";
const SAVE_KEYS = [
  "longbox-legends-save-v5",
  "longbox-legends-save-v4",
  "longbox-legends-save-v3",
  "longbox-legends-save-v2",
  "longbox-legends-save-v1"
];

const COMICS = [
  { id: "possum-1", title: "Possum Knight #1", icon: "🦝", rarity: "Rare", grade: "VF", value: 360, prestige: 5, tag: "Back Issue", desc: "First appearance of a hero who plays dead until issue six." },
  { id: "janitor-7", title: "Galaxy Janitor #7", icon: "🧹", rarity: "Uncommon", grade: "Fine", value: 220, prestige: 3, tag: "Sci-Fi", desc: "The mop variant. Absurdly rare for reasons nobody can explain." },
  { id: "liability-alpha", title: "Captain Liability: Alpha Variant", icon: "🛡️", rarity: "Epic", grade: "NM", value: 620, prestige: 8, tag: "Variant", desc: "A lawsuit in tights. Collectors love it against their better judgment." },
  { id: "tax-audit", title: "Tax Man: Audit War", icon: "💼", rarity: "Epic", grade: "9.2 Slab", value: 980, prestige: 12, tag: "Slab", desc: "The scariest villain is itemized deductions." },
  { id: "bulk-order", title: "The Incredible Bulk Order #3", icon: "📦", rarity: "Common", grade: "VG", value: 95, prestige: 1, tag: "Comedy", desc: "He gets stronger every time a distributor shorts the shipment." },
  { id: "moth-lawyer", title: "Moth Lawyer #3", icon: "🦋", rarity: "Rare", grade: "FN+", value: 410, prestige: 6, tag: "Indie", desc: "Drawn to justice. Also porch lights." },
  { id: "vampire-1", title: "Emotional Support Vampire #1", icon: "🧛", rarity: "Uncommon", grade: "VF-", value: 180, prestige: 3, tag: "Horror", desc: "He drains your anxiety, then asks for permission to enter group therapy." },
  { id: "refund-squad", title: "Refund Squad Annual", icon: "🧾", rarity: "Common", grade: "Good", value: 70, prestige: 1, tag: "Comedy", desc: "A team of heroes returns defective superpowers within thirty days." },
  { id: "printer-goblin", title: "Printer Goblin #0", icon: "🖨️", rarity: "Rare", grade: "VF/NM", value: 330, prestige: 5, tag: "Indie", desc: "Every page is slightly misaligned. Somehow that made it collectible." },
  { id: "quarter-bin", title: "Quarter Bin Oracle #12", icon: "🔮", rarity: "Common", grade: "Reader", value: 45, prestige: 1, tag: "Back Issue", desc: "Predicts the exact book you should have bought yesterday." },
  { id: "doom-coupon", title: "Doctor Doom Coupon Special", icon: "🎟️", rarity: "Uncommon", grade: "VF", value: 155, prestige: 2, tag: "Promo", desc: "One free world domination with purchase of two trades." },
  { id: "bag-board", title: "Bag & Board Barbarian #1", icon: "⚔️", rarity: "Rare", grade: "NM-", value: 390, prestige: 5, tag: "Fantasy", desc: "He protects mint condition with a broadsword and acid-free backing boards." }
];

const rarityWeights = { Common: 54, Uncommon: 26, Rare: 15, Epic: 5 };
const GOAL_KEY = "longbox-collection-goals-v1";

const collectionGoals = [
  { id: "collect3", title: "Start a Wall of Weird", desc: "Own 3 collectible comics.", reward: "+$125 and +2 reputation", check: owned => owned.length >= 3, prize: { cash: 125, rep: 2 } },
  { id: "display1", title: "Showpiece", desc: "Display your first collectible comic.", reward: "+$150 and +3 reputation", check: owned => owned.some(c => c.displayed), prize: { cash: 150, rep: 3 } },
  { id: "rare2", title: "Collector Bait", desc: "Own 2 Rare or Epic comics.", reward: "+$225 and +4 reputation", check: owned => owned.filter(c => ["Rare", "Epic"].includes(c.rarity)).length >= 2, prize: { cash: 225, rep: 4 } },
  { id: "value1000", title: "Glass Case Energy", desc: "Reach $1,000 total collection value.", reward: "+$300 and +5 reputation", check: owned => owned.reduce((sum, c) => sum + (Number(c.value) || 0), 0) >= 1000, prize: { cash: 300, rep: 5 } },
  { id: "epic1", title: "Wall Book Found", desc: "Own your first Epic comic.", reward: "+$500 and +7 reputation", check: owned => owned.some(c => c.rarity === "Epic"), prize: { cash: 500, rep: 7 } }
];

function parse(value) {
  try { return value ? JSON.parse(value) : null; } catch { return null; }
}

function getSave() {
  for (const key of SAVE_KEYS) {
    const save = parse(localStorage.getItem(key));
    if (save) return save;
  }
  return null;
}

function setSave(save) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

function collection(save) {
  return Array.isArray(save?.comicCollection) ? save.comicCollection : [];
}

function ownedUpgrades(save) {
  return Array.isArray(save?.upgrades) ? save.upgrades : [];
}

function weightedPick() {
  const pool = [];
  COMICS.forEach(comic => {
    const weight = rarityWeights[comic.rarity] || 10;
    for (let i = 0; i < weight; i++) pool.push(comic);
  });
  return pool[Math.floor(Math.random() * pool.length)];
}

function makeComic(day = 1, source = "Live Day Find") {
  const base = weightedPick();
  const gradeRoll = Math.random();
  const gradeSuffix = base.grade.includes("Slab") ? "" : gradeRoll > 0.9 ? "+" : gradeRoll < 0.12 ? "-" : "";
  const valueMod = gradeRoll > 0.9 ? 1.25 : gradeRoll < 0.12 ? 0.82 : 1;
  return {
    ...base,
    uid: `${base.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    foundDay: day,
    foundSource: source,
    grade: base.grade.includes("Slab") ? base.grade : `${base.grade}${gradeSuffix}`,
    value: Math.round(base.value * valueMod),
    displayed: false
  };
}

function findChance(save) {
  const upgrades = ownedUpgrades(save);
  let chance = 0.18;
  if (upgrades.includes("wall")) chance += 0.1;
  if (upgrades.includes("case")) chance += 0.08;
  if (upgrades.includes("sign")) chance += 0.03;
  if ((save?.day || 1) % 7 === 0) chance += 0.06;
  if ((save?.rep || 0) >= 25) chance += 0.04;
  return Math.min(0.5, chance);
}

function maybeNaturalFind(previousDayRef) {
  const save = getSave();
  if (!save) return null;
  const currentDay = Number(save.day) || 1;
  if (!previousDayRef.current) {
    previousDayRef.current = currentDay;
    return null;
  }
  if (currentDay <= previousDayRef.current) return null;
  previousDayRef.current = currentDay;

  const alreadyFoundToday = save.__lastNaturalComicFindDay === currentDay;
  if (alreadyFoundToday) return null;

  if (Math.random() > findChance(save)) {
    const checked = { ...save, __lastNaturalComicFindCheckDay: currentDay };
    setSave(checked);
    return null;
  }

  const comic = makeComic(currentDay, "Live Day Find");
  const next = {
    ...save,
    __lastNaturalComicFindDay: currentDay,
    comicCollection: [comic, ...collection(save)].slice(0, 100),
    rep: Math.min(100, (Number(save.rep) || 0) + Math.max(1, Math.floor(comic.prestige / 4))),
    log: [`Live day find: ${comic.title} (${comic.rarity}, ${comic.grade}) was discovered in the shop.`, ...(Array.isArray(save.log) ? save.log : [])].slice(0, 10)
  };
  setSave(next);
  window.dispatchEvent(new CustomEvent("longbox-collection-changed", { detail: { found: comic } }));
  return comic;
}

function getGoalState() {
  const stored = parse(localStorage.getItem(GOAL_KEY));
  return { claimed: Array.isArray(stored?.claimed) ? stored.claimed : [] };
}

function setGoalState(state) {
  localStorage.setItem(GOAL_KEY, JSON.stringify(state));
}

function claimGoal(goal) {
  const save = getSave() || {};
  const state = getGoalState();
  if (state.claimed.includes(goal.id)) return;
  const owned = collection(save);
  if (!goal.check(owned)) return;

  const nextSave = {
    ...save,
    cash: Math.max(0, Number(save.cash) || 0) + (goal.prize.cash || 0),
    rep: Math.min(100, (Number(save.rep) || 0) + (goal.prize.rep || 0)),
    log: [`Collection goal claimed: ${goal.title}.`, ...(Array.isArray(save.log) ? save.log : [])].slice(0, 10)
  };
  setSave(nextSave);
  setGoalState({ claimed: [...state.claimed, goal.id] });
  window.dispatchEvent(new CustomEvent("longbox-collection-changed"));
}

function ensureStyle() {
  if (document.getElementById("longbox-natural-finds-style")) return;
  const style = document.createElement("style");
  style.id = "longbox-natural-finds-style";
  style.textContent = `
    .ll-collection-goals-button {
      position: fixed;
      right: 14px;
      bottom: 146px;
      z-index: 70;
      border: 0;
      border-radius: 18px;
      background: #7c3aed;
      color: white;
      padding: 11px 13px;
      font-size: 12px;
      font-weight: 950;
      box-shadow: 0 12px 28px rgba(124, 58, 237, .25);
      cursor: pointer;
    }
    @media (min-width: 900px) {
      .ll-collection-goals-button { right: 24px; bottom: 76px; }
    }
  `;
  document.head.appendChild(style);
}

export default function AppV24() {
  const [foundComic, setFoundComic] = useState(null);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const previousDayRef = React.useRef(null);

  useEffect(() => {
    ensureStyle();
    const interval = setInterval(() => {
      const found = maybeNaturalFind(previousDayRef);
      if (found) setFoundComic(found);
      setTick(t => t + 1);
    }, 900);
    const onChange = () => setTick(t => t + 1);
    window.addEventListener("longbox-collection-changed", onChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener("longbox-collection-changed", onChange);
    };
  }, []);

  const save = useMemo(() => getSave() || {}, [tick, goalsOpen]);
  const owned = useMemo(() => collection(save), [save]);
  const goalState = useMemo(() => getGoalState(), [tick, goalsOpen]);
  const claimable = collectionGoals.filter(goal => goal.check(owned) && !goalState.claimed.includes(goal.id)).length;

  return <div className="relative min-h-screen">
    <AppV23 />
    <button className="ll-collection-goals-button" onClick={() => setGoalsOpen(true)}>🏆 Goals {claimable > 0 ? `(${claimable})` : ""}</button>

    <AnimatePresence>{foundComic && <FindModal comic={foundComic} close={() => setFoundComic(null)} />}</AnimatePresence>
    <AnimatePresence>{goalsOpen && <GoalsModal owned={owned} goalState={goalState} close={() => setGoalsOpen(false)} refresh={() => setTick(t => t + 1)} />}</AnimatePresence>
  </div>;
}

function FindModal({ comic, close }) {
  return <motion.div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
    <motion.div initial={{ y: 70, scale: .98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 70, scale: .98 }} onClick={event => event.stopPropagation()} className="w-full max-w-md rounded-[2rem] bg-white p-5 text-slate-950 shadow-2xl">
      <div className="mb-3 text-xs font-black uppercase tracking-widest text-amber-600">Live Day Find</div>
      <div className="flex items-start gap-4">
        <div className="text-5xl">{comic.icon}</div>
        <div>
          <h2 className="text-2xl font-black leading-tight">{comic.title}</h2>
          <div className="mt-1 text-sm font-bold text-slate-500">{comic.rarity} · {comic.grade} · ${comic.value.toLocaleString()}</div>
        </div>
      </div>
      <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600 ring-1 ring-black/5">{comic.desc}</p>
      <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-950 ring-1 ring-amber-100">Added to your collection. Display it for prestige or sell it for cash.</div>
      <button onClick={close} className="mt-4 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white active:scale-95">Add to Collection</button>
    </motion.div>
  </motion.div>;
}

function GoalsModal({ owned, goalState, close, refresh }) {
  const completed = collectionGoals.filter(goal => goalState.claimed.includes(goal.id)).length;
  return <motion.div className="fixed inset-0 z-[145] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
    <motion.div initial={{ y: 70, scale: .98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 70, scale: .98 }} onClick={event => event.stopPropagation()} className="max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-5 text-slate-950 shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-purple-600">Collection Missions</div>
          <h2 className="text-3xl font-black">Collector Goals</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">Turn weird comic finds into cash, reputation, and bragging rights.</p>
        </div>
        <button onClick={close} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 active:scale-95">Close</button>
      </div>

      <div className="mb-4 rounded-2xl bg-slate-950 p-4 text-white">
        <div className="flex items-center justify-between"><span className="text-sm font-black text-purple-300">Progress</span><span className="text-sm font-black">{completed}/{collectionGoals.length}</span></div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-purple-400" style={{ width: `${(completed / collectionGoals.length) * 100}%` }} /></div>
      </div>

      <div className="grid gap-3">
        {collectionGoals.map(goal => {
          const isClaimed = goalState.claimed.includes(goal.id);
          const complete = goal.check(owned);
          return <div key={goal.id} className={`rounded-2xl p-4 ring-1 ${isClaimed ? "bg-emerald-50 ring-emerald-200" : complete ? "bg-purple-50 ring-purple-200" : "bg-slate-50 ring-black/5"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-black">{isClaimed ? "✅" : complete ? "🎁" : "🏆"} {goal.title}</div>
                <p className="mt-1 text-sm font-semibold text-slate-600">{goal.desc}</p>
                <div className="mt-2 text-sm font-black text-emerald-700">Reward: {goal.reward}</div>
              </div>
              <button onClick={() => { claimGoal(goal); refresh(); }} disabled={!complete || isClaimed} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white disabled:bg-slate-300 disabled:text-slate-500">{isClaimed ? "Claimed" : complete ? "Claim" : "Locked"}</button>
            </div>
          </div>;
        })}
      </div>
    </motion.div>
  </motion.div>;
}
