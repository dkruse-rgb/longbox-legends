import React, { useEffect, useMemo, useState } from "react";
import CollectionModal, { findComicForCollection } from "./components/CollectionModal";
import FloorMap from "./components/FloorMap";
import GameShell from "./components/GameShell";
import LiveDay from "./components/LiveDay";
import MissionSystem from "./components/MissionSystem";
import ZoneDetails from "./components/ZoneDetails";
import { INVENTORY_CATALOG } from "./game/catalog";
import { getSave, getUpgrades, setSave, stockFor, totalStock } from "./game/save";

const START_SAVE = {
  day: 1,
  cash: 650,
  rep: 12,
  inventory: [
    { ...INVENTORY_CATALOG.new, stock: 8, tags: ["casual", "collector", "kid"] },
    { ...INVENTORY_CATALOG.manga, stock: 5, tags: ["manga", "kid", "casual"] },
    { ...INVENTORY_CATALOG.back, stock: 6, tags: ["collector", "speculator"] }
  ],
  upgrades: [],
  pullList: [],
  comicCollection: [],
  lifetimeSales: 0,
  lifetimeVisitors: 0,
  fulfilledPulls: 0,
  trendWins: 0,
  log: ["CleanGame started: the shop is open for business."],
};

function ensureSave() {
  const existing = getSave();
  if (existing) return existing;
  setSave(START_SAVE);
  return START_SAVE;
}

function addLog(save, line) {
  return { ...save, log: [line, ...(Array.isArray(save.log) ? save.log : [])].slice(0, 10) };
}

function estimateTraffic(save) {
  const upgrades = getUpgrades(save);
  return 4 + Math.floor((Number(save.rep) || 0) / 10) + upgrades.length * 2;
}

function runSimpleDay(save) {
  const inventory = Array.isArray(save.inventory) ? save.inventory.map(item => ({ ...item })) : [];
  const traffic = estimateTraffic(save);
  let gross = 0;
  let sales = 0;

  for (let i = 0; i < traffic; i += 1) {
    const available = inventory.filter(item => (Number(item.stock) || 0) > 0);
    if (!available.length) break;
    const item = available[Math.floor(Math.random() * available.length)];
    item.stock -= 1;
    gross += Math.round((item.price || 8) * (1 + Math.min(Number(save.rep) || 0, 80) / 250));
    sales += 1;
  }

  const rent = 35 + getUpgrades(save).length * 8;
  const net = gross - rent;
  const next = addLog({
    ...save,
    day: (Number(save.day) || 1) + 1,
    cash: Math.max(0, (Number(save.cash) || 0) + net),
    rep: Math.min(100, Math.max(0, (Number(save.rep) || 0) + (sales >= Math.ceil(traffic / 2) ? 1 : 0))),
    inventory,
    lifetimeSales: (Number(save.lifetimeSales) || 0) + gross,
    lifetimeVisitors: (Number(save.lifetimeVisitors) || 0) + traffic
  }, `Day ${save.day || 1}: ${traffic} visitors, ${sales} sales, $${gross.toLocaleString()} gross, $${net.toLocaleString()} net.`);

  setSave(next);
  return next;
}

function restock(save, itemId, amount = 8) {
  const item = INVENTORY_CATALOG[itemId];
  if (!item) return save;
  const cost = amount * Math.max(3, Math.floor((item.price || 8) * 0.55));
  if ((Number(save.cash) || 0) < cost) return save;

  const inventory = Array.isArray(save.inventory) ? [...save.inventory] : [];
  const existing = inventory.find(inv => inv.id === itemId);
  if (existing) existing.stock = (Number(existing.stock) || 0) + amount;
  else inventory.push({ ...item, stock: amount, tags: item.tags || [] });

  const next = addLog({ ...save, cash: (Number(save.cash) || 0) - cost, inventory }, `Restocked ${amount}x ${item.name} for $${cost}.`);
  setSave(next);
  return next;
}

function buildUpgrade(save, id) {
  const upgradeCosts = { sign: 250, wall: 380, manga: 450, case: 600, tables: 750, online: 1100, cafe: 800, studio: 900 };
  const cost = upgradeCosts[id] || 500;
  if ((Number(save.cash) || 0) < cost || getUpgrades(save).includes(id)) return save;
  const next = addLog({
    ...save,
    cash: (Number(save.cash) || 0) - cost,
    rep: Math.min(100, (Number(save.rep) || 0) + 4),
    upgrades: [...getUpgrades(save), id]
  }, `Built upgrade: ${id}.`);
  setSave(next);
  return next;
}

export default function CleanGame() {
  const [save, setLocalSave] = useState(() => ensureSave());
  const [selectedZone, setSelectedZone] = useState(null);
  const [liveOpen, setLiveOpen] = useState(false);
  const [missionsOpen, setMissionsOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setLocalSave(getSave() || START_SAVE);
      setTick(t => t + 1);
    };
    window.addEventListener("longbox-save-changed", refresh);
    window.addEventListener("longbox-collection-changed", refresh);
    window.addEventListener("longbox-missions-changed", refresh);
    return () => {
      window.removeEventListener("longbox-save-changed", refresh);
      window.removeEventListener("longbox-collection-changed", refresh);
      window.removeEventListener("longbox-missions-changed", refresh);
    };
  }, []);

  const upgrades = useMemo(() => getUpgrades(save), [save, tick]);
  const traffic = useMemo(() => estimateTraffic(save), [save]);

  function finishLiveDay() {
    const next = runSimpleDay(getSave() || save);
    setLocalSave(next);
    setLiveOpen(false);
  }

  function handleFindComic() {
    findComicForCollection("CleanGame Search");
    setLocalSave(getSave() || save);
  }

  return <GameShell
    day={save.day || 1}
    cash={Number(save.cash) || 0}
    rep={Number(save.rep) || 0}
    stock={totalStock(save)}
    traffic={traffic}
    onOpenShop={() => setLiveOpen(true)}
    onMissions={() => setMissionsOpen(true)}
    onCollection={() => setCollectionOpen(true)}
  >
    <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
      <div className="space-y-4">
        <FloorMap
          upgrades={upgrades}
          interactive
          selectedZoneId={selectedZone?.id}
          onZoneClick={setSelectedZone}
          title="Clean Floor Map"
          subtitle="Reusable FloorMap, ZoneDetails, LiveDay, Missions, and Collection components"
        />

        <div className="grid gap-2 sm:grid-cols-3">
          <button onClick={() => setLocalSave(restock(save, "new"))} className="rounded-2xl bg-white p-4 text-left font-black shadow-sm ring-1 ring-black/5 active:scale-[.99]">📚 Restock New<br /><span className="text-xs text-slate-500">Stock: {stockFor(save, "new")}</span></button>
          <button onClick={() => setLocalSave(restock(save, "manga"))} className="rounded-2xl bg-white p-4 text-left font-black shadow-sm ring-1 ring-black/5 active:scale-[.99]">🌸 Restock Manga<br /><span className="text-xs text-slate-500">Stock: {stockFor(save, "manga")}</span></button>
          <button onClick={() => setLocalSave(restock(save, "cards"))} className="rounded-2xl bg-white p-4 text-left font-black shadow-sm ring-1 ring-black/5 active:scale-[.99]">🃏 Restock Cards<br /><span className="text-xs text-slate-500">Stock: {stockFor(save, "cards")}</span></button>
        </div>
      </div>

      <aside className="space-y-4">
        <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="text-xs font-black uppercase tracking-widest text-amber-600">Clean Build</div>
          <h2 className="mt-1 text-2xl font-black">Shop Actions</h2>
          <div className="mt-4 grid gap-2">
            <button onClick={() => setLiveOpen(true)} className="rounded-2xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-950 active:scale-[.99]">▶ Open Shop Live</button>
            <button onClick={handleFindComic} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white active:scale-[.99]">🔎 Find Comic</button>
            <button onClick={() => setCollectionOpen(true)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 active:scale-[.99]">📚 Collection</button>
            <button onClick={() => setMissionsOpen(true)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 active:scale-[.99]">🎯 Missions</button>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="text-xs font-black uppercase tracking-widest text-amber-600">Build Upgrades</div>
          <div className="mt-3 grid gap-2">
            {[["sign", "💡 Neon Sign"], ["wall", "🗄️ Longbox Wall"], ["case", "🔐 Rare Case"], ["tables", "🎲 Tables"]].map(([id, label]) => <button key={id} onClick={() => setLocalSave(buildUpgrade(save, id))} disabled={upgrades.includes(id)} className="rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-black text-slate-800 ring-1 ring-black/5 disabled:opacity-50">{upgrades.includes(id) ? "✅" : "🛠️"} {label}</button>)}
          </div>
        </section>

        <section className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-sm">
          <h2 className="text-xl font-black">Shop Feed</h2>
          <div className="mt-3 space-y-2">
            {(Array.isArray(save.log) ? save.log : []).slice(0, 6).map((line, index) => <div key={`${line}-${index}`} className="rounded-2xl bg-white/10 p-3 text-sm font-semibold text-slate-100 ring-1 ring-white/10">{line}</div>)}
          </div>
        </section>
      </aside>
    </div>

    <ZoneDetails zone={selectedZone} save={save} open={!!selectedZone} onClose={() => setSelectedZone(null)} />
    <LiveDay open={liveOpen} save={save} upgrades={upgrades} onClose={() => setLiveOpen(false)} onComplete={finishLiveDay} />
    <MissionSystem open={missionsOpen} onClose={() => setMissionsOpen(false)} save={save} onChanged={() => setLocalSave(getSave() || START_SAVE)} />
    <CollectionModal open={collectionOpen} onClose={() => setCollectionOpen(false)} save={save} onChanged={() => setLocalSave(getSave() || START_SAVE)} />
  </GameShell>;
}
