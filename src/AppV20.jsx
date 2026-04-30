import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppV19 from "./AppV19.jsx";

const SAVE_KEYS = [
  "longbox-legends-save-v5",
  "longbox-legends-save-v4",
  "longbox-legends-save-v3",
  "longbox-legends-save-v2",
  "longbox-legends-save-v1"
];

const zones = [
  { id: "new", title: "New Releases Wall", icon: "📚", itemId: "new", upgradeId: "sign", x: 28, y: 18, w: 42, h: 15, role: "Fresh weekly comics and New Comic Day traffic." },
  { id: "entrance", title: "Entrance", icon: "🚪", itemId: null, upgradeId: "sign", x: 82, y: 18, w: 24, h: 16, role: "Where traffic enters your shop." },
  { id: "manga", title: "Manga Corner", icon: "🌸", itemId: "manga", upgradeId: "manga", x: 24, y: 38, w: 28, h: 18, role: "Manga readers and volume-one addiction live here." },
  { id: "rare", title: "Rare Case", icon: "🔐", itemId: "figures", upgradeId: "case", x: 58, y: 38, w: 28, h: 18, role: "Rare books, slabs, figures, and collector bait." },
  { id: "longboxes", title: "Back Issue Longboxes", icon: "🗃️", itemId: "back", upgradeId: "wall", x: 30, y: 62, w: 42, h: 24, role: "Collectors dig here for back issues and key rumors." },
  { id: "cards", title: "Cards & Events", icon: "🎲", itemId: "cards", upgradeId: "tables", x: 76, y: 62, w: 30, h: 24, role: "Card packs, tournament nights, and table traffic." },
  { id: "register", title: "Register", icon: "💵", itemId: null, upgradeId: null, x: 18, y: 88, w: 26, h: 14, role: "Customers check out here after browsing." },
  { id: "reading", title: "Reading Area", icon: "☕", itemId: null, upgradeId: "cafe", x: 55, y: 88, w: 26, h: 14, role: "A comfort zone that becomes stronger with the café upgrade." },
  { id: "stock", title: "Stock Room", icon: "📦", itemId: "zines", upgradeId: "online", x: 84, y: 88, w: 24, h: 14, role: "Inventory, local zines, and future shipping orders." }
];

const trendCycle = [
  { itemId: "new", name: "New Comic Day Buzz", icon: "📚" },
  { itemId: "manga", name: "Manga Boom", icon: "🌸" },
  { itemId: "cards", name: "Card Meta Shift", icon: "🃏" },
  { itemId: "back", name: "Key Issue Rumors", icon: "🗃️" },
  { itemId: "figures", name: "Collector Shelf Fever", icon: "🧸" },
  { itemId: "zines", name: "Indie Scene Surge", icon: "✍️" }
];

const itemNames = {
  new: "New Release Comics",
  manga: "Manga Volumes",
  cards: "Trading Card Packs",
  back: "Back Issue Bundles",
  figures: "Collectible Figures",
  zines: "Local Indie Zines"
};

const upgradeNames = {
  sign: "Neon Shop Sign",
  wall: "Longbox Wall",
  manga: "Manga Corner",
  case: "Rare Book Display Case",
  tables: "Tournament Tables",
  online: "Online Storefront",
  cafe: "Reader Café",
  studio: "Creator Studio"
};

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

function getTrend(day = 1) {
  const week = Math.floor((day - 1) / 7);
  return trendCycle[week % trendCycle.length];
}

function getStock(save, itemId) {
  if (!itemId) return null;
  const inventory = Array.isArray(save?.inventory) ? save.inventory : [];
  return inventory.find(item => item.id === itemId)?.stock || 0;
}

function pullRequestsFor(save, itemId) {
  if (!itemId) return [];
  const pulls = Array.isArray(save?.pullList) ? save.pullList : [];
  return pulls.filter(req => req.itemId === itemId);
}

function getOwnedUpgrades(save) {
  return Array.isArray(save?.upgrades) ? save.upgrades : [];
}

function demandFor(stock, pulls, trendActive, day, zoneId) {
  if (zoneId === "entrance") return day % 7 === 0 ? "Very High" : "Normal";
  if (zoneId === "register") return "Depends on daily traffic";
  if (pulls.length > 0 && trendActive) return "Very High";
  if (pulls.length > 0) return "High";
  if (trendActive) return "High";
  if (stock !== null && stock <= 3) return "Underserved";
  return "Normal";
}

function adviceFor(zone, stock, pulls, trendActive, upgraded, save) {
  if (zone.id === "entrance") return upgraded ? "The sign is helping traffic. Keep reputation climbing." : "A Neon Shop Sign would make the storefront feel alive.";
  if (zone.id === "register") return "Every live-day path ends here. More stock and higher loyalty make this busier.";
  if (zone.id === "reading") return upgraded ? "The café makes browsing feel sticky. Events will benefit from this vibe." : "Unlocking the Reader Café would make this zone matter more.";
  if (zone.id === "stock") return upgraded ? "Online orders can become a future source of passive sales." : "Keep stock healthy. Low shelves hurt reputation fast.";
  if (pulls.length > 0) return `Stock this section soon: ${pulls.length} pull-list request${pulls.length === 1 ? "" : "s"} depends on it.`;
  if (trendActive) return "This is trending right now. Stock it before opening the shop.";
  if (stock !== null && stock < 5) return "Stock is thin here. Buy more before a rush hits.";
  if (!upgraded && zone.upgradeId) return `${upgradeNames[zone.upgradeId]} would make this section stronger.`;
  return "This section is stable. Watch trends and pull-list requests for the next move.";
}

function buildZoneDetail(zoneId) {
  const zone = zones.find(z => z.id === zoneId) || zones[0];
  const save = getSave() || {};
  const trend = getTrend(save.day || 1);
  const stock = getStock(save, zone.itemId);
  const pulls = pullRequestsFor(save, zone.itemId);
  const owned = getOwnedUpgrades(save);
  const upgraded = zone.upgradeId ? owned.includes(zone.upgradeId) : true;
  const trendActive = !!zone.itemId && trend.itemId === zone.itemId;
  const day = save.day || 1;
  const newComicDay = day % 7 === 0;

  return {
    ...zone,
    day,
    stock,
    itemName: zone.itemId ? itemNames[zone.itemId] : null,
    pullCount: pulls.length,
    pullNames: pulls.map(p => p.customerName).slice(0, 3),
    trend,
    trendActive,
    newComicDay,
    upgraded,
    upgradeName: zone.upgradeId ? upgradeNames[zone.upgradeId] : null,
    demand: demandFor(stock, pulls, trendActive, day, zone.id),
    advice: adviceFor(zone, stock, pulls, trendActive, upgraded, save)
  };
}

function ensureStyle() {
  if (document.getElementById("longbox-zone-tap-style")) return;
  const style = document.createElement("style");
  style.id = "longbox-zone-tap-style";
  style.textContent = `
    .ll-zone-layer {
      position: absolute;
      inset: 0;
      z-index: 60;
      pointer-events: none;
      border-radius: inherit;
    }
    .ll-zone-button {
      position: absolute;
      transform: translate(-50%, -50%);
      border: 2px solid rgba(251, 191, 36, .0);
      background: rgba(251, 191, 36, .01);
      border-radius: 18px;
      pointer-events: auto;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .ll-zone-button::after {
      content: "Tap";
      position: absolute;
      right: 6px;
      bottom: 5px;
      border-radius: 999px;
      background: rgba(15, 23, 42, .82);
      color: white;
      font-size: 8px;
      font-weight: 950;
      padding: 3px 5px;
      opacity: 0;
      transition: opacity .16s ease;
    }
    .ll-zone-button:hover,
    .ll-zone-button:focus-visible {
      border-color: rgba(251, 191, 36, .8);
      background: rgba(251, 191, 36, .12);
      outline: none;
    }
    .ll-zone-button:hover::after,
    .ll-zone-button:focus-visible::after { opacity: 1; }
    .ll-map-tap-hint {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin: 8px 0 0;
      border-radius: 18px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      padding: 9px 11px;
      color: #92400e;
      font-size: 12px;
      font-weight: 900;
    }
    .ll-map-tap-hint span:last-child {
      border-radius: 999px;
      background: #f59e0b;
      color: #0f172a;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 950;
      white-space: nowrap;
    }
    @media (max-width: 640px) {
      .ll-zone-button::after { display: none; }
      .ll-map-tap-hint { font-size: 11px; padding: 8px 10px; }
    }
  `;
  document.head.appendChild(style);
}

function findMapSurface(map) {
  return Array.from(map.children).find(child => {
    const text = child.textContent || "";
    return text.includes("New Releases") && text.includes("Register") && text.includes("Entrance");
  });
}

function addTapHint(map) {
  if (map.querySelector(".ll-map-tap-hint")) return;
  const surface = findMapSurface(map);
  if (!surface) return;
  const hint = document.createElement("div");
  hint.className = "ll-map-tap-hint";
  hint.innerHTML = `<span>Tap any shop section for stock, demand, trend, and upgrade advice.</span><span>Interactive Map</span>`;
  map.insertBefore(hint, surface.nextSibling);
}

function addZoneLayer(map) {
  const surface = findMapSurface(map);
  if (!surface || surface.querySelector(".ll-zone-layer")) return;

  const computed = window.getComputedStyle(surface);
  if (computed.position === "static") surface.style.position = "relative";

  const layer = document.createElement("div");
  layer.className = "ll-zone-layer";

  zones.forEach(zone => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ll-zone-button";
    button.setAttribute("aria-label", `Open ${zone.title} details`);
    button.style.left = `${zone.x}%`;
    button.style.top = `${zone.y}%`;
    button.style.width = `${zone.w}%`;
    button.style.height = `${zone.h}%`;
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      window.dispatchEvent(new CustomEvent("longbox-zone-detail", { detail: { zoneId: zone.id } }));
    });
    layer.appendChild(button);
  });

  surface.appendChild(layer);
}

function enhanceZoneTapping() {
  ensureStyle();
  const maps = Array.from(document.querySelectorAll('[data-longbox-floor-map="true"]'));
  maps.forEach(map => {
    addTapHint(map);
    addZoneLayer(map);
  });
}

export default function AppV20() {
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    enhanceZoneTapping();
    const observer = new MutationObserver(enhanceZoneTapping);
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = setInterval(enhanceZoneTapping, 900);
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handler = event => setSelectedZone(buildZoneDetail(event.detail.zoneId));
    window.addEventListener("longbox-zone-detail", handler);
    return () => window.removeEventListener("longbox-zone-detail", handler);
  }, []);

  const detail = useMemo(() => selectedZone, [selectedZone]);

  return <div className="relative min-h-screen">
    <AppV19 />
    <AnimatePresence>
      {detail && <ZoneModal detail={detail} close={() => setSelectedZone(null)} />}
    </AnimatePresence>
  </div>;
}

function ZoneModal({ detail, close }) {
  const stats = [
    ["Stock", detail.stock === null ? "—" : detail.stock],
    ["Demand", detail.demand],
    ["Trend", detail.trendActive ? "Active" : "No"],
    ["Upgrade", detail.upgraded ? "Built" : "Missing"]
  ];

  return <motion.div
    className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={close}
  >
    <motion.div
      initial={{ y: 70, scale: .98 }}
      animate={{ y: 0, scale: 1 }}
      exit={{ y: 70, scale: .98 }}
      onClick={event => event.stopPropagation()}
      className="w-full max-w-lg rounded-[2rem] bg-white p-5 text-slate-950 shadow-2xl"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-widest text-amber-600">Shop Zone</div>
          <h2 className="mt-1 text-3xl font-black leading-tight">{detail.icon} {detail.title}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{detail.role}</p>
        </div>
        <button onClick={close} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 active:scale-95">Close</button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map(([label, value]) => <div key={label} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5">
          <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</div>
          <div className="mt-1 truncate text-lg font-black">{value}</div>
        </div>)}
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
  </motion.div>;
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
