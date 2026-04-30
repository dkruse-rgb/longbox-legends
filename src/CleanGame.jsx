import React, { useEffect, useMemo, useState } from "react";
import CollectionModal from "./components/CollectionModal";
import FloorMap from "./components/FloorMap";
import GameShell from "./components/GameShell";
import LiveDay from "./components/LiveDay";
import MissionSystem from "./components/MissionSystem";
import ZoneDetails from "./components/ZoneDetails";
import { getTrend, INVENTORY_CATALOG, isNewComicDay, UPGRADE_NAMES } from "./game/catalog";
import { rollNaturalComicFinds } from "./game/comics";
import { getSave, getUpgrades, setSave, stockFor, totalStock } from "./game/save";

const ECONOMY_VERSION = 5;

const PRICING_TIERS = {
  cheap: {
    label: "Cheap",
    icon: "🏷️",
    price: 0.85,
    demand: 1.22,
    desc: "Moves stock fast. Lower profit, friendlier vibe."
  },
  fair: {
    label: "Fair",
    icon: "⚖️",
    price: 1,
    demand: 1,
    desc: "Normal prices. Reliable sales and no drama."
  },
  premium: {
    label: "Premium",
    icon: "💵",
    price: 1.22,
    demand: 0.78,
    desc: "Better margin. More customers may pass."
  },
  collector: {
    label: "Collector",
    icon: "💎",
    price: 1.48,
    demand: 0.58,
    desc: "Big markup. Best with rep, trends, and collector upgrades."
  }
};

const DEFAULT_PRICING = {
  new: "fair",
  manga: "fair",
  cards: "fair",
  back: "fair",
  figures: "fair",
  zines: "fair"
};

const START_SAVE = {
  economyVersion: ECONOMY_VERSION,
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
  priceStrategy: DEFAULT_PRICING,
  lifetimeSales: 0,
  lifetimeVisitors: 0,
  fulfilledPulls: 0,
  trendWins: 0,
  log: ["CleanGame started: the shop is open for business."],
};

const UPGRADE_COSTS = { sign: 250, wall: 380, manga: 450, case: 600, tables: 750, online: 1100, cafe: 800, studio: 900 };
const UPGRADE_META = {
  sign: { icon: "💡", desc: "More foot traffic and a storefront that does not look legally abandoned." },
  wall: { icon: "🗄️", desc: "Back issue hunters spend longer digging through the good stuff." },
  manga: { icon: "🍥", desc: "A stronger section for reliable manga readers." },
  case: { icon: "🔐", desc: "Raises collector appeal and improves rare comic discovery odds." },
  tables: { icon: "🎲", desc: "A home for card players, events, and suspiciously intense dice rolling." },
  online: { icon: "📮", desc: "Future shipping and online order potential." },
  cafe: { icon: "☕", desc: "Makes the shop feel sticky. People browse longer." },
  studio: { icon: "🎨", desc: "For artists, signings, zines, and local scene energy." }
};

const NAV_ITEMS = [
  ["shop", "Shop", "🏪"],
  ["buy", "Buy", "📦"],
  ["build", "Build", "🛠️"],
  ["goals", "Goals", "🎯"],
  ["books", "Books", "📚"]
];

function addLog(save, line) {
  return { ...save, log: [line, ...(Array.isArray(save.log) ? save.log : [])].slice(0, 10) };
}

function uniqueCatalogItems() {
  return Object.values(INVENTORY_CATALOG).filter((item, index, list) => list.findIndex(candidate => candidate.id === item.id) === index);
}

function getPricing(save) {
  return { ...DEFAULT_PRICING, ...(save?.priceStrategy || {}) };
}

function getPricingTier(save, itemId) {
  const pricing = getPricing(save);
  return PRICING_TIERS[pricing[itemId]] || PRICING_TIERS.fair;
}

function getPricingId(save, itemId) {
  const pricing = getPricing(save);
  return PRICING_TIERS[pricing[itemId]] ? pricing[itemId] : "fair";
}

function weightedPick(items, getWeight) {
  const total = items.reduce((sum, item) => sum + Math.max(0, getWeight(item)), 0);
  if (total <= 0) return items[0];
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= Math.max(0, getWeight(item));
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function repCapFor(save) {
  const day = Number(save?.day) || 1;
  const upgrades = getUpgrades(save).length;
  return Math.min(100, 18 + Math.floor(day * 2.2) + upgrades * 4);
}

function cashCapFor(save) {
  const day = Number(save?.day) || 1;
  const upgrades = getUpgrades(save).length;
  const stock = totalStock(save);
  return Math.round(900 + day * 210 + upgrades * 250 + stock * 4);
}

function normalizeSave(raw) {
  if (!raw) return START_SAVE;
  if (raw.economyVersion === ECONOMY_VERSION && raw.priceStrategy) return raw;

  const sortedComics = Array.isArray(raw.comicCollection)
    ? [...raw.comicCollection].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
    : [];
  const keptComics = sortedComics.slice(0, 18);
  const archivedCount = Math.max(0, sortedComics.length - keptComics.length);
  const archivedValue = sortedComics.slice(18).reduce((sum, comic) => sum + (Number(comic.value) || 0), 0);
  const cappedCash = Math.min(Number(raw.cash) || 0, cashCapFor(raw));
  const cappedRep = Math.min(Number(raw.rep) || 0, repCapFor(raw));

  const next = addLog({
    ...raw,
    economyVersion: ECONOMY_VERSION,
    cash: cappedCash,
    rep: cappedRep,
    comicCollection: keptComics,
    archivedComicCount: (Number(raw.archivedComicCount) || 0) + archivedCount,
    archivedComicValue: (Number(raw.archivedComicValue) || 0) + archivedValue,
    comicScoutsUsed: 0,
    priceStrategy: getPricing(raw)
  }, archivedCount > 0
    ? `Economy balanced: archived ${archivedCount} extra comics and added pricing controls.`
    : "Pricing controls added. Stock now reacts to cheap, fair, premium, and collector pricing."
  );
  setSave(next);
  return next;
}

function ensureSave() {
  const existing = getSave();
  if (existing) return normalizeSave(existing);
  setSave(START_SAVE);
  return START_SAVE;
}

function estimateTraffic(save) {
  const day = Number(save?.day) || 1;
  const upgrades = getUpgrades(save).length;
  const rep = Number(save?.rep) || 0;
  return Math.min(26, 4 + Math.floor(rep / 18) + upgrades + Math.floor(day / 7));
}

function operatingExpense(save, traffic) {
  const upgrades = getUpgrades(save).length;
  const stock = totalStock(save);
  return Math.round(42 + upgrades * 18 + Math.floor(stock / 14) * 4 + Math.floor(traffic / 6) * 6);
}

function demandForItem(save, item, trend) {
  const tier = getPricingTier(save, item.id);
  const tierId = getPricingId(save, item.id);
  const upgrades = getUpgrades(save);
  const rep = Number(save.rep) || 0;
  let demand = tier.demand;

  if (item.id === trend.itemId) demand += 0.18;
  if (tierId === "collector" && (upgrades.includes("case") || rep >= 55)) demand += 0.16;
  if (tierId === "collector" && item.id === "back" && upgrades.includes("wall")) demand += 0.1;
  if (tierId === "premium" && rep >= 45) demand += 0.06;
  if (tierId === "cheap") demand += 0.04;

  return Math.max(0.22, Math.min(1.45, demand));
}

function runSimpleDay(save) {
  const inventory = Array.isArray(save.inventory) ? save.inventory.map(item => ({ ...item })) : [];
  const traffic = estimateTraffic(save);
  const trend = getTrend(save.day || 1);
  const foundComics = rollNaturalComicFinds(save, traffic);
  let gross = 0;
  let sales = 0;
  let skipped = 0;
  let cheapSales = 0;
  let priceySkips = 0;
  let trendSales = 0;
  const lines = [];

  for (let i = 0; i < traffic; i += 1) {
    const available = inventory.filter(item => (Number(item.stock) || 0) > 0);
    if (!available.length) {
      if (lines.length < 4) lines.push("A customer found empty shelves and left quietly. Rude, but fair.");
      break;
    }

    const item = weightedPick(available, candidate => {
      const stockWeight = Math.min(3, Math.max(0.6, (Number(candidate.stock) || 0) / 10));
      return stockWeight * demandForItem(save, candidate, trend);
    });

    const tier = getPricingTier(save, item.id);
    const tierId = getPricingId(save, item.id);
    const buyChance = Math.max(0.25, Math.min(0.96, 0.78 * demandForItem(save, item, trend) + Math.min(0.08, (Number(save.rep) || 0) / 900)));

    if (Math.random() > buyChance) {
      skipped += 1;
      if (["premium", "collector"].includes(tierId)) priceySkips += 1;
      if (lines.length < 4) lines.push(`${item.icon || "📦"} A customer passed on ${item.name} at ${tier.label} pricing.`);
      continue;
    }

    item.stock -= 1;
    const isTrendSale = item.id === trend.itemId;
    const trendBonus = isTrendSale ? 1.35 : 1;
    const price = Math.max(1, Math.round((item.price || 8) * tier.price * trendBonus * (1 + Math.min(Number(save.rep) || 0, 80) / 380)));
    gross += price;
    sales += 1;
    if (tierId === "cheap") cheapSales += 1;
    if (isTrendSale) trendSales += 1;
    if (lines.length < 4) lines.push(`${item.icon || "📦"} Sold ${item.name} for $${price}${isTrendSale ? " — trend boosted" : ""}${tierId !== "fair" ? ` (${tier.label})` : ""}.`);
  }

  foundComics.forEach(comic => {
    lines.unshift(`💥 Collectible found: ${comic.title} (${comic.rarity}) in ${comic.discoverySourceLabel || comic.foundSource}.`);
  });

  const expenses = operatingExpense(save, traffic);
  const net = gross - expenses;
  const repChange = sales >= Math.ceil(traffic * 0.72) ? 1 : 0;
  const findRepBonus = foundComics.length ? 1 : 0;
  const priceRepBonus = cheapSales >= 4 ? 1 : 0;
  const priceRepPenalty = priceySkips >= 4 ? 1 : 0;
  const totalRepChange = repChange + findRepBonus + priceRepBonus - priceRepPenalty;
  const day = Number(save.day) || 1;
  const next = addLog({
    ...save,
    economyVersion: ECONOMY_VERSION,
    day: day + 1,
    cash: Math.max(0, (Number(save.cash) || 0) + net),
    rep: Math.min(repCapFor(save), Math.max(0, (Number(save.rep) || 0) + totalRepChange)),
    inventory,
    priceStrategy: getPricing(save),
    comicCollection: [...foundComics, ...(Array.isArray(save.comicCollection) ? save.comicCollection : [])].slice(0, 100),
    naturalFinds: (Number(save.naturalFinds) || 0) + foundComics.length,
    trendWins: (Number(save.trendWins) || 0) + trendSales,
    lifetimeSales: (Number(save.lifetimeSales) || 0) + gross,
    lifetimeVisitors: (Number(save.lifetimeVisitors) || 0) + traffic,
    lifetimeSkipped: (Number(save.lifetimeSkipped) || 0) + skipped
  }, `Day ${day}: ${traffic} visitors, ${sales} sales, ${skipped} skipped, ${trendSales} trend, ${foundComics.length} finds, $${gross.toLocaleString()} gross, $${net.toLocaleString()} net.`);

  setSave(next);
  if (foundComics.length) {
    window.dispatchEvent(new CustomEvent("longbox-collection-changed", { detail: { found: foundComics[0], foundAll: foundComics } }));
  }

  return {
    next,
    report: {
      day,
      headline: foundComics.length ? "Collector magic hit the floor" : net >= 0 ? "Solid day behind the counter" : "Good traffic, thin wallet",
      visitors: traffic,
      sales,
      skipped,
      priceySkips,
      trendSales,
      trend,
      gross,
      rent: expenses,
      expenses,
      net,
      repChange: totalRepChange,
      foundComics,
      lines
    }
  };
}

function restock(save, itemId, amount = 8) {
  const item = INVENTORY_CATALOG[itemId];
  if (!item) return save;
  const cost = amount * Math.max(4, Math.ceil((item.price || 8) * 0.72));
  if ((Number(save.cash) || 0) < cost) return addLog(save, `Not enough cash to restock ${item.name}.`);

  const inventory = Array.isArray(save.inventory) ? save.inventory.map(inv => ({ ...inv })) : [];
  const existing = inventory.find(inv => inv.id === itemId);
  if (existing) existing.stock = (Number(existing.stock) || 0) + amount;
  else inventory.push({ ...item, stock: amount, tags: item.tags || [] });

  const next = addLog({ ...save, cash: (Number(save.cash) || 0) - cost, inventory }, `Restocked ${amount}x ${item.name} for $${cost}.`);
  setSave(next);
  return next;
}

function setItemPricing(save, itemId, tierId) {
  const item = INVENTORY_CATALOG[itemId];
  const tier = PRICING_TIERS[tierId] || PRICING_TIERS.fair;
  const next = addLog({
    ...save,
    priceStrategy: { ...getPricing(save), [itemId]: tierId }
  }, `${item?.name || itemId} pricing set to ${tier.label}.`);
  setSave(next);
  return next;
}

function buildUpgrade(save, id) {
  const cost = UPGRADE_COSTS[id] || 500;
  if (getUpgrades(save).includes(id)) return save;
  if ((Number(save.cash) || 0) < cost) return addLog(save, `Not enough cash to build ${UPGRADE_NAMES[id] || id}.`);
  const next = addLog({
    ...save,
    cash: (Number(save.cash) || 0) - cost,
    rep: Math.min(repCapFor(save), (Number(save.rep) || 0) + 1),
    upgrades: [...getUpgrades(save), id]
  }, `Built upgrade: ${UPGRADE_NAMES[id] || id}.`);
  setSave(next);
  return next;
}

function SectionCard({ eyebrow, title, children }) {
  return <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
    {eyebrow && <div className="text-xs font-black uppercase tracking-widest text-amber-600">{eyebrow}</div>}
    {title && <h2 className="mt-1 text-2xl font-black">{title}</h2>}
    <div className="mt-4">{children}</div>
  </section>;
}

function TrendCard({ save }) {
  const day = Number(save.day) || 1;
  const trend = getTrend(day);
  const item = INVENTORY_CATALOG[trend.itemId];
  const stock = stockFor(save, trend.itemId);
  const week = Math.floor((day - 1) / 7) + 1;
  const isWednesdayMagic = isNewComicDay(day);

  return <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-sm ring-1 ring-black/5">
    <div className="relative p-5">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #fbbf24, transparent 24%), radial-gradient(circle at 12% 80%, #38bdf8, transparent 25%)" }} />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-amber-300">Week {week} Trend</div>
            <h2 className="mt-1 text-2xl font-black">{trend.icon} {trend.name}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-300">{item?.name || "Trending items"} sell for a bonus this week.</p>
          </div>
          <div className="shrink-0 rounded-2xl bg-amber-400 px-3 py-2 text-sm font-black text-slate-950">135% sale value</div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <MiniDark label="Trend Stock" value={stock} />
          <MiniDark label="Trend Sales" value={Number(save.trendWins) || 0} />
          <MiniDark label="New Comic Day" value={isWednesdayMagic ? "Today" : `${7 - (day % 7)}d`} />
        </div>
      </div>
    </div>
  </section>;
}

function MiniDark({ label, value }) {
  return <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
    <div className="text-[10px] font-black uppercase tracking-wide text-slate-300">{label}</div>
    <div className="mt-1 truncate text-lg font-black text-white">{value}</div>
  </div>;
}

function PricingPanel({ save, onPrice }) {
  const items = uniqueCatalogItems();
  return <SectionCard eyebrow="Pricing Strategy" title="Set Prices">
    <p className="mb-4 text-sm font-semibold text-slate-500">Choose a simple pricing stance per section. Premium and Collector can earn more, but customers may walk if the shop feels greedy.</p>
    <div className="grid gap-3">
      {items.map(item => {
        const active = getPricingId(save, item.id);
        const activeTier = PRICING_TIERS[active];
        return <div key={item.id} className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-black/5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-black">{item.icon} {item.name}</div>
              <div className="text-xs font-bold text-slate-500">Current: {activeTier.icon} {activeTier.label} · Stock: {stockFor(save, item.id)}</div>
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-black/5">Base ${item.price}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Object.entries(PRICING_TIERS).map(([tierId, tier]) => <button
              key={tierId}
              onClick={() => onPrice(item.id, tierId)}
              className={`rounded-2xl px-2 py-2 text-xs font-black ring-1 active:scale-95 ${active === tierId ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-700 ring-black/5"}`}
            >
              <div>{tier.icon} {tier.label}</div>
              <div className={`mt-0.5 text-[10px] ${active === tierId ? "text-slate-300" : "text-slate-400"}`}>{Math.round(tier.price * 100)}% price</div>
            </button>)}
          </div>
          <div className="mt-3 rounded-2xl bg-white p-3 text-xs font-bold text-slate-500 ring-1 ring-black/5">{activeTier.desc}</div>
        </div>;
      })}
    </div>
  </SectionCard>;
}

function BuyMarket({ save, onBuy }) {
  const uniqueItems = uniqueCatalogItems();
  return <SectionCard eyebrow="Distributor Market" title="Buy Stock">
    <p className="mb-4 text-sm font-semibold text-slate-500">Stock what your regulars want. Empty shelves are where reputation goes to die.</p>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {uniqueItems.map(item => {
        const amount = item.id === "figures" ? 4 : item.id === "cards" ? 12 : 8;
        const cost = amount * Math.max(4, Math.ceil((item.price || 8) * 0.72));
        return <button key={item.id} onClick={() => onBuy(item.id, amount)} className="rounded-[1.5rem] bg-slate-50 p-4 text-left shadow-sm ring-1 ring-black/5 active:scale-[.99]">
          <div className="flex items-start justify-between gap-3">
            <div className="text-3xl">{item.icon}</div>
            <div className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-600 ring-1 ring-black/5">Stock: {stockFor(save, item.id)}</div>
          </div>
          <div className="mt-3 text-lg font-black">{item.name}</div>
          <div className="mt-1 text-sm font-semibold text-slate-500">Buy {amount} for ${cost}. Base sale ${item.price}; pricing strategy changes final sale price.</div>
          <div className="mt-3 rounded-xl bg-slate-950 px-3 py-2 text-center text-xs font-black text-white">Buy Stock</div>
        </button>;
      })}
    </div>
  </SectionCard>;
}

function BuildMarket({ save, upgrades, onBuild }) {
  return <SectionCard eyebrow="Build Upgrades" title="Improve the Shop">
    <p className="mb-4 text-sm font-semibold text-slate-500">Every upgrade should make the shop feel more like a place people want to visit.</p>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Object.entries(UPGRADE_META).map(([id, meta]) => {
        const owned = upgrades.includes(id);
        const cost = UPGRADE_COSTS[id] || 500;
        return <button key={id} onClick={() => onBuild(id)} disabled={owned} className="rounded-[1.5rem] bg-slate-50 p-4 text-left shadow-sm ring-1 ring-black/5 active:scale-[.99] disabled:opacity-60">
          <div className="flex items-start justify-between gap-3">
            <div className="text-3xl">{meta.icon}</div>
            <div className={`rounded-full px-2.5 py-1 text-xs font-black ${owned ? "bg-emerald-100 text-emerald-800" : "bg-white text-slate-600 ring-1 ring-black/5"}`}>{owned ? "Built" : `$${cost}`}</div>
          </div>
          <div className="mt-3 text-lg font-black">{UPGRADE_NAMES[id]}</div>
          <div className="mt-1 text-sm font-semibold text-slate-500">{meta.desc}</div>
          <div className="mt-3 rounded-xl bg-slate-950 px-3 py-2 text-center text-xs font-black text-white">{owned ? "Installed" : "Build"}</div>
        </button>;
      })}
    </div>
  </SectionCard>;
}

function ShopFeed({ save }) {
  return <section className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-sm">
    <h2 className="text-xl font-black">Shop Feed</h2>
    <div className="mt-3 space-y-2">
      {(Array.isArray(save.log) ? save.log : []).slice(0, 6).map((line, index) => <div key={`${line}-${index}`} className="rounded-2xl bg-white/10 p-3 text-sm font-semibold text-slate-100 ring-1 ring-white/10">{line}</div>)}
    </div>
  </section>;
}

function DayReport({ report, onClose }) {
  if (!report) return null;
  return <div className="fixed inset-0 z-[160] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center" onClick={onClose}>
    <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-white p-5 text-slate-950 shadow-2xl" onClick={event => event.stopPropagation()}>
      <div className="text-xs font-black uppercase tracking-widest text-amber-600">Day Report</div>
      <h2 className="mt-1 text-3xl font-black">{report.headline}</h2>
      <p className="mt-1 text-sm font-semibold text-slate-500">Day {report.day} results are in. Weekly trend: {report.trend.icon} {report.trend.name}.</p>
      {report.foundComics?.length > 0 && <div className="mt-4 space-y-3">
        {report.foundComics.map(comic => <div key={comic.uid} className="rounded-[1.5rem] bg-amber-50 p-4 ring-1 ring-amber-200">
          <div className="text-xs font-black uppercase tracking-widest text-amber-700">Collectible Found!</div>
          <div className="mt-2 flex items-start gap-3">
            <div className="text-4xl">{comic.icon}</div>
            <div className="min-w-0">
              <h3 className="text-xl font-black leading-tight">{comic.title}</h3>
              <p className="mt-1 text-sm font-bold text-slate-600">{comic.rarity} · {comic.grade} · {comic.discoverySourceLabel || comic.foundSource}</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">{comic.desc}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Mini label="Value" value={`$${comic.value}`} />
            <Mini label="Prestige" value={`+${comic.prestige}`} />
          </div>
        </div>)}
      </div>}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-6">
        <Mini label="Visitors" value={report.visitors} />
        <Mini label="Sales" value={report.sales} />
        <Mini label="Skipped" value={report.skipped || 0} />
        <Mini label="Trend" value={report.trendSales} />
        <Mini label="Gross" value={`$${report.gross}`} />
        <Mini label="Net" value={`$${report.net}`} hot={report.net >= 0} />
      </div>
      {report.priceySkips >= 4 && <div className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-800 ring-1 ring-rose-100">Pricing note: customers pushed back on premium/collector pricing today.</div>}
      <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700 ring-1 ring-black/5">Operating expenses: ${report.expenses ?? report.rent}</div>
      <div className="mt-4 space-y-2">
        {report.lines.length ? report.lines.map((line, index) => <div key={`${line}-${index}`} className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700 ring-1 ring-black/5">{line}</div>) : <div className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700 ring-1 ring-black/5">No standout notes today. The register survived.</div>}
      </div>
      <button onClick={onClose} className="mt-4 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white active:scale-95">Close Report</button>
    </div>
  </div>;
}

function Mini({ label, value, hot }) {
  return <div className={`${hot ? "bg-emerald-50" : "bg-slate-50"} rounded-2xl p-3 ring-1 ring-black/5`}>
    <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</div>
    <div className="mt-1 truncate text-lg font-black">{value}</div>
  </div>;
}

function BottomNav({ active, onSelect }) {
  return <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+.45rem)] pt-2 shadow-2xl backdrop-blur lg:hidden">
    <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
      {NAV_ITEMS.map(([id, label, icon]) => <button key={id} onClick={() => onSelect(id)} className={`rounded-2xl px-1 py-2 text-center transition active:scale-95 ${active === id ? "bg-slate-950 text-white" : "text-slate-500"}`}>
        <div className="text-lg leading-none">{icon}</div>
        <div className="mt-1 text-[10px] font-black">{label}</div>
      </button>)}
    </div>
  </nav>;
}

export default function CleanGame() {
  const [save, setLocalSave] = useState(() => ensureSave());
  const [activeTab, setActiveTab] = useState("shop");
  const [selectedZone, setSelectedZone] = useState(null);
  const [liveOpen, setLiveOpen] = useState(false);
  const [missionsOpen, setMissionsOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [dayReport, setDayReport] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setLocalSave(normalizeSave(getSave() || START_SAVE));
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
    const result = runSimpleDay(getSave() || save);
    setLocalSave(result.next);
    setDayReport(result.report);
    setLiveOpen(false);
  }

  function handleNav(id) {
    if (id === "goals") {
      setMissionsOpen(true);
      return;
    }
    if (id === "books") {
      setCollectionOpen(true);
      return;
    }
    setActiveTab(id);
  }

  function handleRestock(itemId, amount) {
    setLocalSave(restock(getSave() || save, itemId, amount));
  }

  function handlePrice(itemId, tierId) {
    setLocalSave(setItemPricing(getSave() || save, itemId, tierId));
  }

  function handleBuild(id) {
    setLocalSave(buildUpgrade(getSave() || save, id));
  }

  return <>
    <GameShell day={save.day || 1} cash={Number(save.cash) || 0} rep={Number(save.rep) || 0} stock={totalStock(save)} traffic={traffic} onOpenShop={() => setLiveOpen(true)} onMissions={() => setMissionsOpen(true)} onCollection={() => setCollectionOpen(true)}>
      <div className="pb-20 lg:pb-0">
        {activeTab === "shop" && <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
          <div className="space-y-4">
            <TrendCard save={save} />
            <FloorMap upgrades={upgrades} interactive selectedZoneId={selectedZone?.id} onZoneClick={setSelectedZone} title="Clean Floor Map" subtitle="Open Live Day to sell stock and naturally discover collectible comics" />
            <div className="grid gap-2 sm:grid-cols-3">
              <button onClick={() => handleRestock("new", 8)} className="rounded-2xl bg-white p-4 text-left font-black shadow-sm ring-1 ring-black/5 active:scale-[.99]">📚 Restock New<br /><span className="text-xs text-slate-500">Stock: {stockFor(save, "new")}</span></button>
              <button onClick={() => handleRestock("manga", 8)} className="rounded-2xl bg-white p-4 text-left font-black shadow-sm ring-1 ring-black/5 active:scale-[.99]">🌸 Restock Manga<br /><span className="text-xs text-slate-500">Stock: {stockFor(save, "manga")}</span></button>
              <button onClick={() => handleRestock("cards", 12)} className="rounded-2xl bg-white p-4 text-left font-black shadow-sm ring-1 ring-black/5 active:scale-[.99]">🃏 Restock Cards<br /><span className="text-xs text-slate-500">Stock: {stockFor(save, "cards")}</span></button>
            </div>
          </div>

          <aside className="space-y-4">
            <ShopFeed save={save} />
          </aside>
        </div>}

        {activeTab === "buy" && <div className="space-y-4"><PricingPanel save={save} onPrice={handlePrice} /><BuyMarket save={save} onBuy={handleRestock} /></div>}
        {activeTab === "build" && <BuildMarket save={save} upgrades={upgrades} onBuild={handleBuild} />}
      </div>

      <ZoneDetails zone={selectedZone} save={save} open={!!selectedZone} onClose={() => setSelectedZone(null)} />
      <LiveDay open={liveOpen} save={save} upgrades={upgrades} onClose={() => setLiveOpen(false)} onComplete={finishLiveDay} />
      <MissionSystem open={missionsOpen} onClose={() => setMissionsOpen(false)} save={save} onChanged={() => setLocalSave(normalizeSave(getSave() || START_SAVE))} />
      <CollectionModal open={collectionOpen} onClose={() => setCollectionOpen(false)} save={save} onChanged={() => setLocalSave(normalizeSave(getSave() || START_SAVE))} />
      <DayReport report={dayReport} onClose={() => setDayReport(null)} />
    </GameShell>
    <BottomNav active={activeTab} onSelect={handleNav} />
  </>;
}
