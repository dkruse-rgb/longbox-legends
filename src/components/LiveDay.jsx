import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FloorMap from "./FloorMap";
import { getTrend, isNewComicDay, SHOP_ZONES } from "../game/catalog";
import { getInventory, getPullList, getSave, totalStock } from "../game/save";

const customerCatalog = {
  new: { zone: "new", name: "Tim", icon: "🦸", action: "Buys New Release Comics" },
  manga: { zone: "manga", name: "Mikey", icon: "🎒", action: "Buys Manga Volumes" },
  cards: { zone: "cards", name: "Carl", icon: "🧢", action: "Buys Trading Card Packs" },
  back: { zone: "longboxes", name: "Sandra", icon: "🧐", action: "Finds Back Issues" },
  figures: { zone: "rare", name: "Nina", icon: "🧵", action: "Checks the Rare Case" },
  zines: { zone: "stock", name: "Ava", icon: "🎨", action: "Drops off Indie Zines" }
};

const fallbackCustomers = [
  { name: "Kim", icon: "☕", zone: "reading", action: "Browses the Reading Area", type: "browse" },
  { name: "Derek", icon: "📈", zone: "rare", action: "Checks the rumor shelf", type: "browse" },
  { name: "Wednesday Warrior", icon: "📚", zone: "new", action: "Looks for the wall book", type: "browse" }
];

const phaseText = {
  opening: "Customers enter through the front door.",
  browsing: "Customers visit sections based on inventory, pull lists, and trends.",
  checkout: "Customers queue at the register.",
  closing: "The register closes and the day report is prepared."
};

function zoneById(id) {
  return SHOP_ZONES.find(zone => zone.id === id) || SHOP_ZONES[0];
}

function isSmallScreen() {
  if (typeof window === "undefined") return true;
  return window.innerWidth < 640;
}

function inventoryWithStock(save) {
  return getInventory(save).filter(item => (Number(item.stock) || 0) > 0);
}

function customerFromPullRequest(request, index) {
  const meta = customerCatalog[request.itemId] || customerCatalog.new;
  return {
    id: `pull-${request.itemId}-${index}`,
    name: (request.customerName || meta.name || "Regular").split(" ")[0],
    icon: request.customerIcon || meta.icon,
    action: `Pull list: ${request.itemName || meta.action.replace("Buys ", "")}`,
    zoneId: meta.zone,
    type: "pull"
  };
}

function customerFromInventory(item, index, reason = "sale") {
  const meta = customerCatalog[item.id] || customerCatalog.new;
  return {
    id: `${reason}-${item.id}-${index}`,
    name: meta.name,
    icon: meta.icon,
    action: reason === "trend" ? `Trend sale: ${item.name || meta.action.replace("Buys ", "")}` : (meta.action || `Buys ${item.name}`),
    zoneId: meta.zone,
    type: reason
  };
}

export function buildLiveDayCustomers(save = getSave()) {
  const safeSave = save || {};
  const max = isSmallScreen() ? 5 : 7;
  const trend = getTrend(safeSave.day || 1);
  const plan = [];
  const pulls = getPullList(safeSave);
  const inventory = inventoryWithStock(safeSave);

  pulls.slice(0, 2).forEach(request => {
    plan.push(customerFromPullRequest(request, plan.length));
  });

  const trendItem = inventory.find(item => item.id === trend.itemId);
  if (trendItem && plan.length < max) {
    plan.push(customerFromInventory(trendItem, plan.length, "trend"));
  }

  if (isNewComicDay(safeSave.day || 1) && inventory.some(item => item.id === "new") && plan.length < max) {
    plan.push({ id: "new-comic-day", name: "Wednesday Warrior", icon: "📚", action: "New Comic Day rush", zoneId: "new", type: "new-comic-day" });
  }

  inventory.slice(0, 6).forEach(item => {
    if (plan.length >= max) return;
    const meta = customerCatalog[item.id] || customerCatalog.new;
    if (plan.some(customer => customer.zoneId === meta.zone && customer.type !== "browse")) return;
    plan.push(customerFromInventory(item, plan.length, "sale"));
  });

  fallbackCustomers.forEach(customer => {
    if (plan.length >= max) return;
    plan.push({ ...customer, id: `fallback-${customer.name}` , zoneId: customer.zone });
  });

  return plan.slice(0, max).map((customer, index) => ({
    ...customer,
    id: `${customer.id}-${Date.now()}-${index}`,
    delay: index * 0.22,
    entrance: zoneById("entrance"),
    target: zoneById(customer.zoneId),
    register: zoneById("register")
  }));
}

function getPoint(customer, phase) {
  if (!customer) return { x: 82, y: 18 };
  if (phase === "opening") return customer.entrance;
  if (phase === "browsing") return customer.target;
  if (phase === "checkout") return customer.register;
  if (phase === "closing") return customer.entrance;
  return customer.entrance;
}

function customersForPhase(customers, phase) {
  return customers.map(customer => {
    const point = getPoint(customer, phase);
    return { ...customer, x: point.x, y: point.y };
  });
}

function Mini({ label, value }) {
  return <div className="rounded-2xl bg-white p-2 ring-1 ring-black/5">
    <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</div>
    <div className="mt-1 truncate text-xs font-black text-slate-950 sm:text-sm">{value}</div>
  </div>;
}

function ActivityFeed({ customers, phase, activityIndex }) {
  const activities = customers
    .slice(0, Math.max(1, activityIndex + 1))
    .map(customer => `${customer.icon} ${customer.name}: ${customer.action}`)
    .slice(-3)
    .reverse();

  return <div className="rounded-2xl bg-slate-950/95 p-3 text-white shadow-xl ring-1 ring-white/10 backdrop-blur">
    <div className="mb-2 flex items-center justify-between gap-3">
      <div className="text-xs font-black uppercase tracking-widest text-amber-300">Live Activity</div>
      <div className="text-xs font-black capitalize text-slate-300">{phase}</div>
    </div>
    <div className="space-y-1.5">
      {activities.map((activity, index) => <motion.div
        key={`${activity}-${index}`}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className={`truncate rounded-xl px-3 py-2 font-bold ${index === 0 ? "bg-white text-sm text-slate-950" : "bg-white/10 text-xs text-slate-100"}`}
      >
        {activity}
      </motion.div>)}
    </div>
  </div>;
}

export default function LiveDay({
  open,
  save = getSave(),
  upgrades = [],
  onClose,
  onComplete,
  durationMs = 5400,
  autoStart = true
}) {
  const safeSave = save || {};
  const [phase, setPhase] = useState("opening");
  const [activityIndex, setActivityIndex] = useState(0);
  const [running, setRunning] = useState(autoStart);

  const customers = useMemo(() => buildLiveDayCustomers(safeSave), [safeSave?.day, safeSave?.pullList, safeSave?.inventory]);
  const trend = getTrend(safeSave.day || 1);
  const visibleCustomers = customersForPhase(customers, phase);

  useEffect(() => {
    if (!open) {
      setPhase("opening");
      setActivityIndex(0);
      setRunning(autoStart);
      return;
    }
    if (autoStart) setRunning(true);
  }, [open, autoStart]);

  useEffect(() => {
    if (!open || !running) return;

    const activityTimer = setInterval(() => setActivityIndex(index => Math.min(index + 1, Math.max(customers.length - 1, 0))), 650);
    const browsing = setTimeout(() => setPhase("browsing"), 900);
    const checkout = setTimeout(() => setPhase("checkout"), Math.round(durationMs * 0.57));
    const closing = setTimeout(() => setPhase("closing"), Math.round(durationMs * 0.8));
    const finish = setTimeout(() => {
      setRunning(false);
      onComplete?.();
    }, durationMs);

    return () => {
      clearInterval(activityTimer);
      clearTimeout(browsing);
      clearTimeout(checkout);
      clearTimeout(closing);
      clearTimeout(finish);
    };
  }, [open, running, customers.length, durationMs, onComplete]);

  return <AnimatePresence>
    {open && <motion.div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-3 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: .96, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: .96, y: 20 }}
        onClick={event => event.stopPropagation()}
        className="relative flex h-[84vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] bg-[#fffaf0] p-4 shadow-2xl ring-1 ring-black/10"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-black uppercase tracking-widest text-amber-600">Reusable Live Day</div>
            <h2 className="text-2xl font-black leading-tight text-slate-950">Open Shop Day {safeSave.day || 1}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500 sm:text-base">{phaseText[phase]}</p>
          </div>
          <div className="shrink-0 rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black capitalize text-white shadow-lg">{phase}</div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          <Mini label="Trend" value={`${trend.icon} ${trend.name}`} />
          <Mini label="Pulls" value={getPullList(safeSave).length} />
          <Mini label="Stock" value={totalStock(safeSave)} />
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-[1.5rem] bg-slate-100 p-3 ring-1 ring-black/5">
          <FloorMap
            upgrades={upgrades}
            customers={visibleCustomers}
            showUpgrades={false}
            showUpgradeStrip={false}
            interactive={false}
            title="Live Floor Map"
            subtitle="Customers move through real shop zones"
            footer={null}
          />
        </div>

        <div className="mt-3">
          <ActivityFeed customers={customers} phase={phase} activityIndex={activityIndex} />
        </div>
      </motion.div>
    </motion.div>}
  </AnimatePresence>;
}
