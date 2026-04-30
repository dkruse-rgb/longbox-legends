import React from "react";
import { SHOP_ZONES, UPGRADE_NAMES } from "../game/catalog";

const upgradeVisuals = {
  sign: { icon: "💡", label: "Neon Sign", x: 78, y: 8, color: "bg-cyan-400", pulse: true },
  wall: { icon: "🗄️", label: "Longbox Wall", x: 43, y: 70, color: "bg-slate-700" },
  manga: { icon: "🍥", label: "Manga Expansion", x: 15, y: 31, color: "bg-pink-400" },
  case: { icon: "✨", label: "Rare Case", x: 63, y: 31, color: "bg-amber-400", pulse: true },
  tables: { icon: "🎲", label: "Tournament Tables", x: 77, y: 48, color: "bg-violet-500" },
  online: { icon: "📮", label: "Shipping Station", x: 84, y: 78, color: "bg-sky-500" },
  cafe: { icon: "☕", label: "Reader Café", x: 55, y: 76, color: "bg-emerald-500" },
  studio: { icon: "🎨", label: "Creator Studio", x: 40, y: 88, color: "bg-red-500" }
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function zoneStyle(zone) {
  return {
    left: `${zone.x}%`,
    top: `${zone.y}%`,
    width: `${zone.w}%`,
    height: `${zone.h}%`,
    transform: "translate(-50%, -50%)"
  };
}

function getZoneTheme(zone) {
  if (zone.id === "register") return "bg-slate-950 text-white border-slate-900";
  if (zone.id === "entrance") return "bg-gradient-to-br from-emerald-100 to-white text-slate-950 border-emerald-200";
  if (zone.id === "new") return "bg-gradient-to-br from-blue-100 to-white text-slate-950 border-blue-200";
  if (zone.id === "manga") return "bg-gradient-to-br from-pink-100 to-white text-slate-950 border-pink-200";
  if (zone.id === "rare") return "bg-gradient-to-br from-amber-100 to-white text-slate-950 border-amber-200";
  if (zone.id === "cards") return "bg-gradient-to-br from-violet-100 to-white text-slate-950 border-violet-200";
  if (zone.id === "longboxes") return "bg-gradient-to-br from-slate-100 to-white text-slate-950 border-slate-200";
  return "bg-white text-slate-950 border-black/10";
}

function FloorZone({ zone, interactive, selected, onZoneClick }) {
  const clickable = interactive && typeof onZoneClick === "function";

  return <button
    type="button"
    disabled={!clickable}
    onClick={() => clickable && onZoneClick(zone)}
    className={cx(
      "absolute overflow-hidden rounded-2xl border p-2 text-left shadow-md transition",
      getZoneTheme(zone),
      clickable && "cursor-pointer active:scale-[.98] hover:ring-2 hover:ring-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400",
      selected === zone.id && "ring-4 ring-amber-400"
    )}
    style={zoneStyle(zone)}
    aria-label={`${zone.title} zone`}
  >
    <div className="flex items-start justify-between gap-1">
      <div className="max-w-[7rem] text-[10px] font-black leading-none sm:text-xs">{zone.title}</div>
      <div className="text-xl leading-none sm:text-2xl">{zone.icon}</div>
    </div>
    <div className="mt-1 hidden text-[9px] font-bold leading-none opacity-60 sm:block">{zone.role}</div>
    {zone.id === "longboxes" && <div className="mt-1 grid grid-cols-3 gap-1">
      <span className="h-2 rounded bg-slate-700" />
      <span className="h-2 rounded bg-slate-700" />
      <span className="h-2 rounded bg-slate-700" />
    </div>}
    {clickable && <span className="absolute bottom-1 right-1 rounded-full bg-slate-950/85 px-1.5 py-0.5 text-[8px] font-black text-white sm:hidden">Tap</span>}
  </button>;
}

function UpgradeMarker({ upgradeId }) {
  const visual = upgradeVisuals[upgradeId];
  if (!visual) return null;

  return <div
    className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2"
    style={{ left: `${visual.x}%`, top: `${visual.y}%` }}
    title={UPGRADE_NAMES[upgradeId] || visual.label}
  >
    <div className={cx(
      "grid h-8 w-8 place-items-center rounded-full border-2 border-white text-base font-black text-white shadow-xl sm:h-9 sm:w-9 sm:text-lg",
      visual.color,
      visual.pulse && "animate-pulse"
    )}>{visual.icon}</div>
    <div className="mt-1 hidden max-w-[72px] rounded-full bg-slate-950/90 px-2 py-1 text-center text-[8px] font-black leading-none text-white sm:block">{visual.label}</div>
  </div>;
}

function UpgradeStrip({ upgrades = [] }) {
  const owned = upgrades.filter(id => upgradeVisuals[id]);
  return <div className="mb-3 flex items-center gap-2 overflow-x-auto rounded-2xl bg-slate-950 p-2 text-white shadow-sm">
    <div className="shrink-0 text-[10px] font-black uppercase tracking-widest text-amber-300">Upgrades</div>
    {owned.length === 0 ? <div className="text-xs font-bold text-slate-300">Buy upgrades and they will appear on the floor map.</div> : owned.map(id => <div key={id} className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black">
      {upgradeVisuals[id].icon} {UPGRADE_NAMES[id] || upgradeVisuals[id].label}
    </div>)}
  </div>;
}

function CustomerToken({ customer }) {
  if (!customer) return null;
  const x = customer.x ?? customer.zone?.x ?? 82;
  const y = customer.y ?? customer.zone?.y ?? 18;
  return <div
    className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2"
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-2xl shadow-xl ring-2 ring-amber-300">{customer.icon || "🙂"}</div>
    {customer.name && <div className="mt-1 rounded-full bg-white/95 px-2 py-0.5 text-center text-[10px] font-black text-slate-600 shadow-sm ring-1 ring-black/5">{customer.name}</div>}
  </div>;
}

export default function FloorMap({
  zones = SHOP_ZONES,
  upgrades = [],
  customers = [],
  interactive = false,
  selectedZoneId = null,
  onZoneClick,
  showUpgrades = true,
  showUpgradeStrip = true,
  title = "Smart Live Floor Plan",
  subtitle = "Entrance → sections → register → day report",
  footer = "Tap a section to inspect stock, demand, trends, and upgrades."
}) {
  return <section className="grid gap-3 rounded-[1.875rem] bg-gradient-to-b from-slate-200 to-slate-50 p-3 shadow-inner ring-1 ring-black/5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-[11px] font-black uppercase tracking-[.14em] text-amber-700">{title}</div>
        <div className="text-sm font-extrabold leading-tight text-slate-600">{subtitle}</div>
      </div>
      <div className="shrink-0 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white shadow-sm">Floor Map</div>
    </div>

    {showUpgradeStrip && <UpgradeStrip upgrades={upgrades} />}

    <div className="relative h-[460px] overflow-hidden rounded-[1.75rem] border-[5px] border-orange-900 bg-orange-50 shadow-xl">
      <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "linear-gradient(90deg,rgba(124,45,18,.06) 1px,transparent 1px),linear-gradient(rgba(124,45,18,.06) 1px,transparent 1px)", backgroundSize: "26px 26px" }} />
      <div className="absolute left-[6%] right-[6%] top-[72%] h-[16%] rounded-full border-4 border-dashed border-orange-500/30" />
      <div className="absolute left-[10%] right-[12%] top-[18%] h-[62%] rounded-full border-4 border-dashed border-slate-700/10" />

      {zones.map(zone => <FloorZone key={zone.id} zone={zone} interactive={interactive} selected={selectedZoneId} onZoneClick={onZoneClick} />)}
      {showUpgrades && upgrades.map(id => <UpgradeMarker key={id} upgradeId={id} />)}
      {customers.map(customer => <CustomerToken key={customer.id || `${customer.name}-${customer.x}-${customer.y}`} customer={customer} />)}
    </div>

    {footer && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-center text-xs font-black text-amber-900">{footer}</div>}
  </section>;
}
