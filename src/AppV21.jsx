import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppV20 from "./AppV20.jsx";

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
  { id: "quarter-bin", title: "Quarter Bin Oracle #12", icon: "🔮", rarity: "Common", grade: "Reader", value: 45, prestige: 1, tag: "Back Issue", desc: "Predicts the exact book you should have bought yesterday." }
];

const rarityWeights = { Common: 52, Uncommon: 26, Rare: 16, Epic: 6 };
const rarityColors = { Common: "bg-slate-100 text-slate-700", Uncommon: "bg-emerald-100 text-emerald-800", Rare: "bg-sky-100 text-sky-800", Epic: "bg-amber-100 text-amber-900" };

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

function weightedPick() {
  const pool = [];
  COMICS.forEach(comic => {
    const count = rarityWeights[comic.rarity] || 10;
    for (let i = 0; i < count; i++) pool.push(comic);
  });
  return pool[Math.floor(Math.random() * pool.length)];
}

function findComic() {
  const base = weightedPick();
  const gradeBump = Math.random();
  const gradeSuffix = gradeBump > 0.92 ? "+" : gradeBump < 0.12 ? "-" : "";
  const valueMod = gradeBump > 0.92 ? 1.25 : gradeBump < 0.12 ? 0.82 : 1;
  return {
    ...base,
    uid: `${base.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    foundDay: getSave()?.day || 1,
    grade: base.grade.includes("Slab") ? base.grade : `${base.grade}${gradeSuffix}`,
    value: Math.round(base.value * valueMod),
    displayed: false
  };
}

function maybeSeedCollection() {
  const save = getSave();
  if (!save) return;
  if (save.__collectionSeeded) return;
  const starter = findComic();
  const next = {
    ...save,
    __collectionSeeded: true,
    comicCollection: [starter, ...collection(save)],
    log: [`Collection started: found ${starter.title} (${starter.rarity}, ${starter.grade}).`, ...(Array.isArray(save.log) ? save.log : [])].slice(0, 10)
  };
  setSave(next);
}

function addComicToSave() {
  const save = getSave() || {};
  const comic = findComic();
  const next = {
    ...save,
    comicCollection: [comic, ...collection(save)].slice(0, 80),
    rep: Math.min(100, (Number(save.rep) || 0) + Math.max(1, Math.floor(comic.prestige / 3))),
    log: [`Rare find: ${comic.title} (${comic.rarity}, ${comic.grade}) entered the collection.`, ...(Array.isArray(save.log) ? save.log : [])].slice(0, 10)
  };
  setSave(next);
  window.dispatchEvent(new CustomEvent("longbox-collection-changed", { detail: { found: comic } }));
}

function sellComic(uid) {
  const save = getSave() || {};
  const owned = collection(save);
  const comic = owned.find(c => c.uid === uid);
  if (!comic) return;
  const next = {
    ...save,
    cash: Math.max(0, Number(save.cash) || 0) + comic.value,
    comicCollection: owned.filter(c => c.uid !== uid),
    lifetimeSales: (Number(save.lifetimeSales) || 0) + comic.value,
    log: [`Sold ${comic.title} for $${comic.value.toLocaleString()}.`, ...(Array.isArray(save.log) ? save.log : [])].slice(0, 10)
  };
  setSave(next);
  window.dispatchEvent(new CustomEvent("longbox-collection-changed"));
}

function toggleDisplay(uid) {
  const save = getSave() || {};
  const owned = collection(save);
  const nextOwned = owned.map(c => c.uid === uid ? { ...c, displayed: !c.displayed } : c);
  const displayedCount = nextOwned.filter(c => c.displayed).length;
  const repBonus = displayedCount > owned.filter(c => c.displayed).length ? 1 : 0;
  const next = {
    ...save,
    comicCollection: nextOwned,
    rep: Math.min(100, (Number(save.rep) || 0) + repBonus),
    log: [`Updated rare display case. Displayed comics: ${displayedCount}.`, ...(Array.isArray(save.log) ? save.log : [])].slice(0, 10)
  };
  setSave(next);
  window.dispatchEvent(new CustomEvent("longbox-collection-changed"));
}

function collectionStats(owned) {
  const value = owned.reduce((sum, comic) => sum + (Number(comic.value) || 0), 0);
  const prestige = owned.filter(c => c.displayed).reduce((sum, comic) => sum + (Number(comic.prestige) || 0), 0);
  const displayed = owned.filter(c => c.displayed).length;
  const rarePlus = owned.filter(c => ["Rare", "Epic"].includes(c.rarity)).length;
  return { value, prestige, displayed, rarePlus };
}

function ensureStyle() {
  if (document.getElementById("longbox-collection-style")) return;
  const style = document.createElement("style");
  style.id = "longbox-collection-style";
  style.textContent = `
    .ll-collection-button {
      position: fixed;
      right: 14px;
      bottom: 92px;
      z-index: 70;
      border: 0;
      border-radius: 18px;
      background: #0f172a;
      color: white;
      padding: 12px 14px;
      font-size: 13px;
      font-weight: 950;
      box-shadow: 0 12px 28px rgba(15,23,42,.28);
      cursor: pointer;
    }
    .ll-collection-find {
      position: fixed;
      left: 14px;
      bottom: 92px;
      z-index: 70;
      border: 0;
      border-radius: 18px;
      background: #fbbf24;
      color: #0f172a;
      padding: 12px 14px;
      font-size: 13px;
      font-weight: 950;
      box-shadow: 0 12px 28px rgba(251,191,36,.25);
      cursor: pointer;
    }
    @media (min-width: 900px) {
      .ll-collection-button { bottom: 24px; right: 24px; }
      .ll-collection-find { bottom: 24px; left: 24px; }
    }
  `;
  document.head.appendChild(style);
}

export default function AppV21() {
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    ensureStyle();
    maybeSeedCollection();
    const onChange = event => {
      setTick(t => t + 1);
      if (event.detail?.found) setToast(`Found ${event.detail.found.title}!`);
    };
    window.addEventListener("longbox-collection-changed", onChange);
    const interval = setInterval(() => setTick(t => t + 1), 1400);
    return () => {
      window.removeEventListener("longbox-collection-changed", onChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const save = useMemo(() => getSave() || {}, [tick, open]);
  const owned = useMemo(() => collection(save), [save]);

  function findComicNow() {
    addComicToSave();
    setTick(t => t + 1);
  }

  return <div className="relative min-h-screen">
    <AppV20 />
    <button className="ll-collection-find" onClick={findComicNow}>🔎 Find Comic</button>
    <button className="ll-collection-button" onClick={() => setOpen(true)}>📚 Collection {owned.length ? `(${owned.length})` : ""}</button>
    <AnimatePresence>{open && <CollectionModal owned={owned} close={() => setOpen(false)} refresh={() => setTick(t => t + 1)} />}</AnimatePresence>
    <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="fixed left-3 right-3 top-3 z-[140] mx-auto max-w-md rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-2xl">{toast}</motion.div>}</AnimatePresence>
  </div>;
}

function CollectionModal({ owned, close, refresh }) {
  const stats = collectionStats(owned);
  const sorted = [...owned].sort((a, b) => (b.displayed - a.displayed) || (b.value - a.value));

  return <motion.div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
    <motion.div initial={{ y: 70, scale: .98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 70, scale: .98 }} onClick={event => event.stopPropagation()} className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white p-5 text-slate-950 shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-amber-600">Rare Books & Weird Finds</div>
          <h2 className="mt-1 text-3xl font-black">Comic Collection</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">Keep comics for prestige, display them for reputation flavor, or sell them for cash.</p>
        </div>
        <button onClick={close} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 active:scale-95">Close</button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Books" value={owned.length} />
        <Stat label="Value" value={`$${stats.value.toLocaleString()}`} />
        <Stat label="Displayed" value={stats.displayed} />
        <Stat label="Prestige" value={`+${stats.prestige}`} />
      </div>

      {owned.length === 0 ? <div className="rounded-2xl bg-amber-50 p-5 text-sm font-bold text-amber-950 ring-1 ring-amber-100">No comics yet. Use Find Comic or open the shop to build the collection.</div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map(comic => <ComicCard key={comic.uid} comic={comic} refresh={refresh} />)}
      </div>}
    </motion.div>
  </motion.div>;
}

function ComicCard({ comic, refresh }) {
  function onSell() {
    sellComic(comic.uid);
    refresh();
  }
  function onDisplay() {
    toggleDisplay(comic.uid);
    refresh();
  }

  return <div className={`rounded-[1.5rem] p-4 shadow-sm ring-1 ${comic.displayed ? "bg-amber-50 ring-amber-200" : "bg-slate-50 ring-black/5"}`}>
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="text-4xl">{comic.icon}</div>
      <span className={`rounded-full px-2.5 py-1 text-xs font-black ${rarityColors[comic.rarity] || rarityColors.Common}`}>{comic.rarity}</span>
    </div>
    <h3 className="text-lg font-black leading-tight">{comic.title}</h3>
    <div className="mt-1 text-xs font-bold text-slate-500">{comic.grade} · {comic.tag} · Found Day {comic.foundDay}</div>
    <p className="mt-3 min-h-16 text-sm font-semibold text-slate-600">{comic.desc}</p>
    <div className="mt-3 grid grid-cols-2 gap-2">
      <Stat label="Value" value={`$${comic.value.toLocaleString()}`} small />
      <Stat label="Prestige" value={`+${comic.prestige}`} small />
    </div>
    <div className="mt-3 flex gap-2">
      <button onClick={onDisplay} className="flex-1 rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white active:scale-95">{comic.displayed ? "Remove" : "Display"}</button>
      <button onClick={onSell} className="flex-1 rounded-xl bg-amber-400 px-3 py-2 text-xs font-black text-slate-950 active:scale-95">Sell</button>
    </div>
  </div>;
}

function Stat({ label, value, small }) {
  return <div className="rounded-2xl bg-white p-3 ring-1 ring-black/5">
    <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</div>
    <div className={`mt-1 truncate font-black ${small ? "text-base" : "text-xl"}`}>{value}</div>
  </div>;
}
