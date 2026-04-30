import React, { useEffect, useMemo, useState } from "react";
import CollectionModal, { findComicForCollection } from "./CollectionModal";
import { getCollection, getSave } from "../game/save";
import { collectionStats } from "../game/comics";

export default function CollectionDemo() {
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const [lastFind, setLastFind] = useState(null);

  useEffect(() => {
    const onChange = event => {
      setTick(value => value + 1);
      if (event.detail?.found) setLastFind(event.detail.found);
    };
    window.addEventListener("longbox-collection-changed", onChange);
    window.addEventListener("longbox-save-changed", onChange);
    return () => {
      window.removeEventListener("longbox-collection-changed", onChange);
      window.removeEventListener("longbox-save-changed", onChange);
    };
  }, []);

  const save = useMemo(() => getSave() || {}, [tick]);
  const owned = useMemo(() => getCollection(save), [save]);
  const stats = useMemo(() => collectionStats(owned), [owned]);

  function findComic() {
    const comic = findComicForCollection("Collection Demo Find");
    setLastFind(comic);
    setTick(value => value + 1);
  }

  return <div className="min-h-screen bg-[#f6efe3] p-4 text-slate-950">
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl">
        <div className="text-xs font-black uppercase tracking-widest text-amber-300">Component Demo</div>
        <h1 className="mt-1 text-3xl font-black">Reusable CollectionModal</h1>
        <p className="mt-2 text-sm font-semibold text-slate-300">This demo uses the extracted collection modal and centralized comic helpers. The playable game still runs through the compatibility stack while we migrate safely.</p>
      </div>

      <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Books" value={owned.length} />
          <Stat label="Value" value={`$${stats.value.toLocaleString()}`} />
          <Stat label="Displayed" value={stats.displayed} />
          <Stat label="Prestige" value={`+${stats.prestige}`} />
        </div>

        {lastFind && <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-950 ring-1 ring-amber-100">
          Last find: {lastFind.icon} {lastFind.title} · {lastFind.rarity} · ${lastFind.value.toLocaleString()}
        </div>}

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button onClick={findComic} className="rounded-2xl bg-amber-400 px-4 py-4 text-base font-black text-slate-950 shadow-lg shadow-amber-500/20 active:scale-[.99]">🔎 Find Comic</button>
          <button onClick={() => setOpen(true)} className="rounded-2xl bg-slate-950 px-4 py-4 text-base font-black text-white shadow-lg active:scale-[.99]">📚 Open Collection</button>
        </div>
      </div>

      <CollectionModal open={open} onClose={() => setOpen(false)} save={save} onChanged={() => setTick(value => value + 1)} />
    </div>
  </div>;
}

function Stat({ label, value }) {
  return <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5">
    <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</div>
    <div className="mt-1 truncate text-xl font-black">{value}</div>
  </div>;
}
