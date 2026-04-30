import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { addLog, getCollection, getSave, setSave } from "../game/save";
import { collectionStats, RARITY_COLORS } from "../game/comics";

function sellComic(uid) {
  const save = getSave() || {};
  const owned = getCollection(save);
  const comic = owned.find(item => item.uid === uid);
  if (!comic) return null;

  const next = addLog({
    ...save,
    cash: Math.max(0, Number(save.cash) || 0) + (Number(comic.value) || 0),
    lifetimeSales: (Number(save.lifetimeSales) || 0) + (Number(comic.value) || 0),
    comicCollection: owned.filter(item => item.uid !== uid)
  }, `Sold ${comic.title} for $${Number(comic.value || 0).toLocaleString()}.`);

  setSave(next);
  window.dispatchEvent(new CustomEvent("longbox-collection-changed", { detail: { sold: comic } }));
  return comic;
}

function toggleDisplayComic(uid) {
  const save = getSave() || {};
  const owned = getCollection(save);
  const beforeDisplayed = owned.filter(item => item.displayed).length;
  const nextOwned = owned.map(item => item.uid === uid ? { ...item, displayed: !item.displayed } : item);
  const afterDisplayed = nextOwned.filter(item => item.displayed).length;
  const repBonus = afterDisplayed > beforeDisplayed ? 1 : 0;

  const next = addLog({
    ...save,
    comicCollection: nextOwned,
    rep: Math.min(100, (Number(save.rep) || 0) + repBonus)
  }, `Updated rare display case. Displayed comics: ${afterDisplayed}.`);

  setSave(next);
  window.dispatchEvent(new CustomEvent("longbox-collection-changed"));
}

function Stat({ label, value, small = false }) {
  return <div className="rounded-2xl bg-white p-3 ring-1 ring-black/5">
    <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</div>
    <div className={`mt-1 truncate font-black ${small ? "text-base" : "text-xl"}`}>{value}</div>
  </div>;
}

function ComicCard({ comic, onChanged }) {
  function handleSell() {
    sellComic(comic.uid);
    onChanged?.();
  }

  function handleDisplay() {
    toggleDisplayComic(comic.uid);
    onChanged?.();
  }

  return <div className={`rounded-[1.5rem] p-4 shadow-sm ring-1 ${comic.displayed ? "bg-amber-50 ring-amber-200" : "bg-slate-50 ring-black/5"}`}>
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="text-4xl">{comic.icon}</div>
      <span className={`rounded-full px-2.5 py-1 text-xs font-black ${RARITY_COLORS[comic.rarity] || RARITY_COLORS.Common}`}>{comic.rarity}</span>
    </div>

    <h3 className="text-lg font-black leading-tight">{comic.title}</h3>
    <div className="mt-1 text-xs font-bold text-slate-500">{comic.grade} · {comic.tag} · Found Day {comic.foundDay || "?"}</div>
    {comic.foundSource && <div className="mt-1 text-[11px] font-black uppercase tracking-wide text-amber-600">{comic.foundSource}</div>}

    <p className="mt-3 min-h-16 text-sm font-semibold text-slate-600">{comic.desc}</p>

    <div className="mt-3 grid grid-cols-2 gap-2">
      <Stat label="Value" value={`$${Number(comic.value || 0).toLocaleString()}`} small />
      <Stat label="Prestige" value={`+${comic.prestige || 0}`} small />
    </div>

    <div className="mt-3 flex gap-2">
      <button onClick={handleDisplay} className="flex-1 rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white active:scale-95">{comic.displayed ? "Remove" : "Display"}</button>
      <button onClick={handleSell} className="flex-1 rounded-xl bg-amber-400 px-3 py-2 text-xs font-black text-slate-950 active:scale-95">Sell</button>
    </div>
  </div>;
}

export default function CollectionModal({ open, onClose, save = getSave(), onChanged, title = "Comic Collection" }) {
  const owned = useMemo(() => getCollection(save), [save]);
  const stats = useMemo(() => collectionStats(owned), [owned]);
  const sorted = useMemo(() => [...owned].sort((a, b) => Number(b.displayed) - Number(a.displayed) || (Number(b.value) || 0) - (Number(a.value) || 0)), [owned]);

  return <AnimatePresence>
    {open && <motion.div
      className="fixed inset-0 z-[130] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center"
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
        className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white p-5 text-slate-950 shadow-2xl"
      >
        <div className="sticky -top-5 z-10 -mx-5 -mt-5 mb-4 flex items-start justify-between gap-3 border-b border-black/5 bg-white/95 p-5 backdrop-blur">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-amber-600">Rare Books & Weird Finds</div>
            <h2 className="mt-1 text-3xl font-black">{title}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Collectibles are discovered naturally during Live Day. Display them for prestige flavor, keep them as wall books, or sell them for cash.</p>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 active:scale-95">Close</button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Books" value={owned.length} />
          <Stat label="Value" value={`$${stats.value.toLocaleString()}`} />
          <Stat label="Displayed" value={stats.displayed} />
          <Stat label="Prestige" value={`+${stats.prestige}`} />
        </div>

        <div className="mb-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-950 ring-1 ring-amber-100">
          Open the shop to discover collectibles. Longboxes, Rare Case, reputation, traffic, and weekly events improve your odds.
        </div>

        {owned.length === 0 ? <div className="rounded-2xl bg-amber-50 p-5 text-sm font-bold text-amber-950 ring-1 ring-amber-100">No comics yet. Open the shop and let customers, longboxes, and trade-ins surprise you.</div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map(comic => <ComicCard key={comic.uid} comic={comic} onChanged={onChanged} />)}
        </div>}
      </motion.div>
    </motion.div>}
  </AnimatePresence>;
}
