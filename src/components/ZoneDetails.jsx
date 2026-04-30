import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getTrend, isNewComicDay, UPGRADE_NAMES } from "../game/catalog";
import { getPullList, getSave, getUpgrades, stockFor } from "../game/save";

const ITEM_NAMES = {
  new: "New Release Comics",
  manga: "Manga Volumes",
  cards: "Trading Card Packs",
  back: "Back Issue Bundles",
  figures: "Collectible Figures",
  zines: "Local Indie Zines"
};

function demandFor({ zone, stock, pullCount, trendActive, day }) {
  if (zone.id === "entrance") return isNewComicDay(day) ? "Very High" : "Normal";
  if (zone.id === "register") return "Traffic-based";
  if (pullCount > 0 && trendActive) return "Very High";
  if (pullCount > 0) return "High";
  if (trendActive) return "High";
  if (stock !== null && stock <= 3) return "Underserved";
  return "Normal";
}

function adviceFor({ zone, stock, pullCount, trendActive, upgraded }) {
  if (zone.id === "entrance") return upgraded ? "The sign is helping traffic. Keep reputation climbing." : "A Neon Shop Sign would make the storefront feel alive.";
  if (zone.id === "register") return "Every live-day path ends here. More stock and higher loyalty make this busier.";
  if (zone.id === "reading") return upgraded ? "The café makes browsing feel sticky. Events will benefit from this vibe." : "Unlocking the Reader Café would make this zone matter more.";
  if (zone.id === "stock") return upgraded ? "Online orders can become a future source of passive sales." : "Keep stock healthy. Low shelves hurt reputation fast.";
  if (pullCount > 0) return `Stock this section soon: ${pullCount} pull-list request${pullCount === 1 ? "" : "s"} depends on it.`;
  if (trendActive) return "This section is trending right now. Stock it before opening the shop.";
  if (stock !== null && stock < 5) return "Stock is thin here. Buy more before a rush hits.";
  if (!upgraded && zone.upgradeId) return `${UPGRADE_NAMES[zone.upgradeId]} would make this section stronger.`;
  return "This section is stable. Watch trends and pull-list requests for the next move.";
}

export function buildZoneDetail(zone, save = getSave()) {
  const safeSave = save || {};
  const day = safeSave.day || 1;
  const trend = getTrend(day);
  const stock = zone.itemId ? stockFor(safeSave, zone.itemId) : null;
  const pulls = zone.itemId ? getPullList(safeSave).filter(req => req.itemId === zone.itemId) : [];
  const upgrades = getUpgrades(safeSave);
  const upgraded = zone.upgradeId ? upgrades.includes(zone.upgradeId) : true;
  const trendActive = !!zone.itemId && trend.itemId === zone.itemId;
  const demand = demandFor({ zone, stock, pullCount: pulls.length, trendActive, day });

  return {
    ...zone,
    day,
    stock,
    itemName: zone.itemId ? ITEM_NAMES[zone.itemId] : null,
    pullCount: pulls.length,
    pullNames: pulls.map(p => p.customerName).filter(Boolean).slice(0, 3),
    trend,
    trendActive,
    newComicDay: isNewComicDay(day),
    upgraded,
    upgradeName: zone.upgradeId ? UPGRADE_NAMES[zone.upgradeId] : null,
    demand,
    advice: adviceFor({ zone, stock, pullCount: pulls.length, trendActive, upgraded })
  };
}

function InfoCard({ icon, title, value }) {
  return <div className="flex gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5">
    <div className="text-2xl">{icon}</div>
    <div className="min-w-0">
      <div className="text-xs font-black uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-0.5 text-sm font-bold text-slate-800">{value}</div>
    </div>
  </div>;
}

function Stat({ label, value }) {
  return <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5">
    <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</div>
    <div className="mt-1 truncate text-lg font-black">{value}</div>
  </div>;
}

export default function ZoneDetails({ zone, save, open = true, onClose }) {
  const detail = zone ? buildZoneDetail(zone, save) : null;

  return <AnimatePresence>
    {open && detail && <motion.div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center"
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
        className="max-h-[calc(100vh-96px)] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-white p-5 text-slate-950 shadow-2xl sm:max-h-[82vh]"
      >
        <div className="sticky -top-5 z-10 -mx-5 -mt-5 mb-4 flex items-start justify-between gap-3 rounded-t-[2rem] border-b border-black/5 bg-white/95 p-5 backdrop-blur">
          <div className="min-w-0">
            <div className="text-xs font-black uppercase tracking-widest text-amber-600">Shop Zone</div>
            <h2 className="mt-1 text-3xl font-black leading-none sm:text-4xl">{detail.icon} {detail.title}</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">{detail.role}</p>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 shadow-sm active:scale-95">Close</button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Stock" value={detail.stock === null ? "—" : detail.stock} />
          <Stat label="Demand" value={detail.demand} />
          <Stat label="Trend" value={detail.trendActive ? "Active" : "No"} />
          <Stat label="Upgrade" value={detail.upgraded ? "Built" : "Missing"} />
        </div>

        <div className="mt-4 grid gap-3">
          {detail.itemName && <InfoCard title="Item Section" value={detail.itemName} icon="📦" />}
          <InfoCard title="Weekly Trend" value={`${detail.trend.icon} ${detail.trend.name}${detail.trendActive ? " — boosted here" : ""}`} icon="📈" />
          {detail.pullCount > 0 && <InfoCard title="Pull-List Pressure" value={`${detail.pullCount} request${detail.pullCount === 1 ? "" : "s"}${detail.pullNames.length ? `: ${detail.pullNames.join(", ")}` : ""}`} icon="📝" />}
          {detail.upgradeName && <InfoCard title="Upgrade" value={`${detail.upgradeName}: ${detail.upgraded ? "built" : "not built yet"}`} icon={detail.upgraded ? "✅" : "🛠️"} />}
          {detail.newComicDay && detail.id === "new" && <InfoCard title="New Comic Day" value="Today gives New Releases extra attention." icon="🎉" />}
        </div>

        <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-950 ring-1 ring-amber-100">
          <div className="mb-1 text-xs font-black uppercase tracking-widest text-amber-700">Suggested Move</div>
          {detail.advice}
        </div>
      </motion.div>
    </motion.div>}
  </AnimatePresence>;
}
