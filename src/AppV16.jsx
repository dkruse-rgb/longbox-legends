import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppV8 from "./AppV8.jsx";

const SAVE_KEYS = ["longbox-legends-save-v5", "longbox-legends-save-v4", "longbox-legends-save-v3", "longbox-legends-save-v2", "longbox-legends-save-v1"];

const zones = [
  { id: "new", label: "New Releases Wall", icon: "📚", x: 28, y: 16, w: 48, h: 14, kind: "wall", desc: "Fresh weekly books" },
  { id: "entrance", label: "Entrance", icon: "🚪", x: 82, y: 16, w: 22, h: 14, kind: "door", desc: "Customers enter" },
  { id: "manga", label: "Manga Corner", icon: "🌸", x: 24, y: 35, w: 28, h: 17, kind: "zone", desc: "Series shelves" },
  { id: "rare", label: "Rare Case", icon: "🔐", x: 57, y: 35, w: 28, h: 17, kind: "zone", desc: "Slabs and keys" },
  { id: "longboxes", label: "Back Issue Longboxes", icon: "🗃️", x: 28, y: 58, w: 42, h: 25, kind: "longbox", desc: "Collector digging rows" },
  { id: "cards", label: "Cards & Events", icon: "🎲", x: 76, y: 58, w: 28, h: 25, kind: "zone", desc: "Tables and packs" },
  { id: "register", label: "Register", icon: "💵", x: 18, y: 88, w: 26, h: 13, kind: "register", desc: "Checkout" },
  { id: "reading", label: "Reading Area", icon: "☕", x: 55, y: 88, w: 25, h: 13, kind: "zone", desc: "Coffee and browsing" },
  { id: "stock", label: "Stock Room", icon: "📦", x: 84, y: 88, w: 21, h: 13, kind: "zone", desc: "Distributor boxes" },
];

const trends = [
  { itemId: "new", name: "New Comic Day Buzz", icon: "📚" },
  { itemId: "manga", name: "Manga Boom", icon: "🌸" },
  { itemId: "cards", name: "Card Meta Shift", icon: "🃏" },
  { itemId: "back", name: "Key Issue Rumors", icon: "🗃️" },
  { itemId: "figures", name: "Collector Shelf Fever", icon: "🧸" },
  { itemId: "zines", name: "Indie Scene Surge", icon: "✍️" },
];

const catalog = {
  new: { name: "New Release Comics", icon: "📚", zone: "new", customer: "Tim", customerIcon: "🦸" },
  manga: { name: "Manga Volumes", icon: "🌸", zone: "manga", customer: "Mikey", customerIcon: "🎒" },
  cards: { name: "Trading Card Packs", icon: "🃏", zone: "cards", customer: "Carl", customerIcon: "🧢" },
  back: { name: "Back Issue Bundle", icon: "🗃️", zone: "longboxes", customer: "Sandra", customerIcon: "🧐" },
  figures: { name: "Collectible Figures", icon: "🧸", zone: "rare", customer: "Nina", customerIcon: "🧵" },
  zines: { name: "Local Indie Zines", icon: "✍️", zone: "stock", customer: "Ava", customerIcon: "🎨" },
};

const fallbackBrowsers = [
  { icon: "☕", name: "Kim", target: "reading", action: "Browses the reading area" },
  { icon: "📈", name: "Derek", target: "rare", action: "Checks the rumor shelf" },
  { icon: "🦸", name: "Tim", target: "new", action: "Looks for maximum punching" },
];

const phaseLabels = {
  opening: "Customers enter through the front door.",
  browsing: "They move to sections based on your inventory, pull lists, and trends.",
  checkout: "Customers queue at the register.",
  closing: "The day wraps up and the report is written.",
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

function zoneById(id) {
  return zones.find(z => z.id === id) || zones[0];
}

function weekOf(day) {
  return Math.floor((day - 1) / 7) + 1;
}

function getTrend(day = 1) {
  return trends[(weekOf(day) - 1) % trends.length];
}

function isNewComicDay(day = 1) {
  return day % 7 === 0;
}

function isSmallScreen() {
  if (typeof window === "undefined") return true;
  return window.innerWidth < 640;
}

function stockFor(save, itemId) {
  const inventory = Array.isArray(save?.inventory) ? save.inventory : [];
  return inventory.find(item => item.id === itemId)?.stock || 0;
}

function inventoryItems(save) {
  const inventory = Array.isArray(save?.inventory) ? save.inventory : [];
  return inventory.filter(item => (Number(item.stock) || 0) > 0);
}

function customerFromPullRequest(req, index) {
  const meta = catalog[req.itemId] || catalog.new;
  return {
    icon: req.customerIcon || meta.customerIcon,
    name: (req.customerName || meta.customer || "Regular").replace(" the ", " ").split(" ")[0],
    target: meta.zone,
    action: `Pull list: ${req.itemName || meta.name}`,
    type: "pull",
    delay: index * 0.24,
  };
}

function customerFromInventoryItem(item, index, reason = "sale") {
  const meta = catalog[item.id] || catalog.new;
  return {
    icon: meta.customerIcon,
    name: meta.customer,
    target: meta.zone,
    action: reason === "trend" ? `Trend sale: ${meta.name}` : `Buys ${meta.name}`,
    type: reason,
    delay: index * 0.24,
  };
}

function buildCustomerPlan(save) {
  const day = save?.day || 1;
  const trend = getTrend(day);
  const plan = [];
  const max = isSmallScreen() ? 5 : 7;
  const pullList = Array.isArray(save?.pullList) ? save.pullList : [];

  pullList.slice(0, 2).forEach(req => plan.push(customerFromPullRequest(req, plan.length)));

  if (stockFor(save, trend.itemId) > 0 && plan.length < max) {
    const item = inventoryItems(save).find(i => i.id === trend.itemId) || { id: trend.itemId };
    plan.push(customerFromInventoryItem(item, plan.length, "trend"));
  }

  if (isNewComicDay(day) && stockFor(save, "new") > 0 && plan.length < max) {
    plan.push({ icon: "📚", name: "Wednesday Warrior", target: "new", action: "New Comic Day rush", type: "new-comic-day", delay: plan.length * 0.24 });
  }

  inventoryItems(save).slice(0, 6).forEach(item => {
    if (plan.length >= max) return;
    const target = catalog[item.id]?.zone || "new";
    if (plan.some(p => p.target === target && p.type !== "browse")) return;
    plan.push(customerFromInventoryItem(item, plan.length, "sale"));
  });

  fallbackBrowsers.forEach(browser => {
    if (plan.length >= max) return;
    plan.push({ ...browser, type: "browse", delay: plan.length * 0.24 });
  });

  return plan.slice(0, max).map((customer, index) => {
    const entrance = zoneById("entrance");
    const target = zoneById(customer.target);
    const register = zoneById("register");
    return { ...customer, id: `${customer.name}-${Date.now()}-${index}`, delay: index * 0.24, entrance, target, register };
  });
}

function isOpenShopButton(button) {
  const text = button?.textContent?.trim() || "";
  return text === "Open Shop" || text === "Open Shop for the Day";
}

function clickRealOpenShopButton() {
  const buttons = Array.from(document.querySelectorAll("button"));
  const openButton = buttons.find(isOpenShopButton);
  if (openButton) {
    window.__longboxAllowInstantOpen = true;
    openButton.click();
    return true;
  }
  return false;
}

function staticZoneMarkup(zone) {
  const base = `position:absolute;left:${zone.x - zone.w / 2}%;top:${zone.y - zone.h / 2}%;width:${zone.w}%;height:${zone.h}%;border-radius:18px;border:1px solid rgba(15,23,42,.09);box-shadow:0 3px 10px rgba(15,23,42,.08);padding:9px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;`;
  const bg = zone.kind === "register" ? "background:#0f172a;color:white;" : zone.kind === "door" ? "background:linear-gradient(145deg,#dcfce7,#fff);" : zone.kind === "longbox" ? "background:linear-gradient(145deg,#f8fafc,#fff);" : zone.kind === "wall" ? "background:linear-gradient(145deg,#dbeafe,#fff);" : "background:white;color:#020617;";
  return `<div style="${base}${bg}"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px;"><div style="font-size:12px;font-weight:950;line-height:1.05;max-width:120px;">${zone.label}</div><div style="font-size:24px;line-height:1;">${zone.icon}</div></div><div style="font-size:10px;font-weight:800;line-height:1.05;opacity:.72;">${zone.desc}</div>${zone.kind === "longbox" ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:4px;"><span style="height:13px;background:#334155;border-radius:5px;"></span><span style="height:13px;background:#334155;border-radius:5px;"></span><span style="height:13px;background:#334155;border-radius:5px;"></span></div>` : ""}</div>`;
}

function buildUnifiedFloorMap() {
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-longbox-floor-map", "true");
  wrapper.style.cssText = "display:grid;gap:12px;border-radius:30px;background:linear-gradient(180deg,#e2e8f0,#f8fafc);padding:14px;box-shadow:inset 0 0 0 1px rgba(15,23,42,.06);";
  wrapper.innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">
      <div><div style="font-size:11px;font-weight:950;letter-spacing:.14em;text-transform:uppercase;color:#b45309;">Smart Live Floor Plan</div><div style="font-size:13px;font-weight:850;color:#475569;line-height:1.2;">Tap Open Shop to run the live day on this map.</div></div>
      <div style="border-radius:999px;background:#0f172a;color:white;padding:7px 11px;font-size:12px;font-weight:950;white-space:nowrap;box-shadow:0 2px 8px rgba(15,23,42,.2);">Live Map</div>
    </div>
    <div style="position:relative;height:460px;border-radius:28px;background:#fff7ed;border:5px solid #7c2d12;box-shadow:0 8px 24px rgba(15,23,42,.16);overflow:hidden;">
      <div style="position:absolute;inset:0;background-image:linear-gradient(90deg,rgba(124,45,18,.05) 1px,transparent 1px),linear-gradient(rgba(124,45,18,.05) 1px,transparent 1px);background-size:26px 26px;"></div>
      <div style="position:absolute;left:6%;top:72%;right:6%;height:16%;border-radius:999px;border:3px dashed rgba(234,88,12,.35);"></div>
      <div style="position:absolute;left:10%;top:18%;right:12%;height:62%;border-radius:999px;border:3px dashed rgba(15,23,42,.12);"></div>
      ${zones.map(staticZoneMarkup).join("")}
    </div>
    <div style="border-radius:18px;background:#fed7aa;border:2px dashed #ea580c;padding:10px;text-align:center;font-size:12px;font-weight:950;color:#7c2d12;">Open Shop now plays the live day here, then shows the day report.</div>
  `;
  return wrapper;
}

function enhanceShopFloor() {
  const headings = Array.from(document.querySelectorAll("h2"));
  const shopHeading = headings.find(h => h.textContent?.trim() === "Shop Floor");
  if (!shopHeading) return;
  const section = shopHeading.closest("section");
  if (!section || section.querySelector("[data-longbox-floor-map='true']")) return;
  const oldGrid = Array.from(section.querySelectorAll("div")).find(div => {
    const cells = Array.from(div.children || []);
    return cells.length === 35 && cells.every(child => child.textContent !== undefined);
  });
  if (!oldGrid) return;
  oldGrid.style.display = "none";
  oldGrid.setAttribute("data-old-floor-grid", "hidden");
  oldGrid.parentNode.insertBefore(buildUnifiedFloorMap(), oldGrid);
}

function relabelOpenButtons() {
  Array.from(document.querySelectorAll("button")).forEach(button => {
    if (isOpenShopButton(button)) button.textContent = "▶ Open Shop Live";
  });
}

export default function AppV16() {
  const [live, setLive] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [phase, setPhase] = useState("ready");
  const [activityIndex, setActivityIndex] = useState(0);
  const [liveContext, setLiveContext] = useState({ trend: null, day: 1, stock: 0, pulls: 0 });

  function startLiveDay() {
    if (live) return;
    const save = getSave() || {};
    const trend = getTrend(save.day || 1);
    const plan = buildCustomerPlan(save);
    setLiveContext({
      trend,
      day: save.day || 1,
      stock: inventoryItems(save).reduce((sum, item) => sum + (Number(item.stock) || 0), 0),
      pulls: Array.isArray(save.pullList) ? save.pullList.length : 0,
    });
    setCustomers(plan);
    setActivityIndex(0);
    setPhase("opening");
    setLive(true);
  }

  useEffect(() => {
    const onClickCapture = event => {
      const button = event.target?.closest?.("button");
      if (!button || !isOpenShopButton(button)) return;

      if (window.__longboxAllowInstantOpen) {
        window.__longboxAllowInstantOpen = false;
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      startLiveDay();
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [live]);

  useEffect(() => {
    enhanceShopFloor();
    relabelOpenButtons();
    const observer = new MutationObserver(() => {
      enhanceShopFloor();
      relabelOpenButtons();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = setInterval(() => {
      enhanceShopFloor();
      relabelOpenButtons();
    }, 900);
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!live) return;
    const activityTimer = setInterval(() => setActivityIndex(i => Math.min(i + 1, Math.max(customers.length - 1, 0))), 650);
    const browsing = setTimeout(() => setPhase("browsing"), 900);
    const checkout = setTimeout(() => setPhase("checkout"), 3100);
    const closing = setTimeout(() => setPhase("closing"), 4300);
    const finish = setTimeout(() => {
      setLive(false);
      setPhase("ready");
      setCustomers([]);
      setActivityIndex(0);
      clickRealOpenShopButton();
    }, 5400);
    return () => {
      clearInterval(activityTimer);
      clearTimeout(browsing);
      clearTimeout(checkout);
      clearTimeout(closing);
      clearTimeout(finish);
    };
  }, [live, customers.length]);

  return <div className="relative min-h-screen">
    <AppV8 />
    <AnimatePresence>{live && <LiveMapOverlay customers={customers} phase={phase} activityIndex={activityIndex} context={liveContext} />}</AnimatePresence>
  </div>;
}

function LiveMapOverlay({ customers, phase, activityIndex, context }) {
  const activities = customers.slice(0, Math.max(1, activityIndex + 1)).map(c => `${c.icon} ${c.name}: ${c.action}`).slice(-3).reverse();
  return <motion.div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/45 p-3 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }} className="relative flex h-[84vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] bg-[#fffaf0] p-4 shadow-2xl ring-1 ring-black/10">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0"><div className="text-xs font-black uppercase tracking-widest text-amber-600">Smart Live Floor Map</div><h2 className="text-2xl font-black leading-tight text-slate-950">Open Shop Day {context.day}</h2><p className="mt-1 text-sm font-semibold text-slate-500 sm:text-base">{phaseLabels[phase] || "The shop is active."}</p></div>
        <div className="shrink-0 rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black text-white capitalize">{phase}</div>
      </div>
      <div className="mb-3 grid grid-cols-3 gap-2"><Mini label="Trend" value={`${context.trend?.icon || "📈"} ${context.trend?.name || "Weekly"}`} /><Mini label="Pulls" value={context.pulls} /><Mini label="Stock" value={context.stock} /></div>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.5rem] bg-slate-100 p-3 ring-1 ring-black/5">
        <ReactFloorMap />
        {customers.map(customer => <PathingCustomer key={customer.id} customer={customer} />)}
        <ActivityFeed activities={activities} phase={phase} />
      </div>
    </motion.div>
  </motion.div>;
}

function ReactFloorMap() {
  return <div className="absolute inset-3 overflow-hidden rounded-[1.35rem] border-[5px] border-orange-900 bg-orange-50 shadow-inner">
    <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "linear-gradient(90deg,rgba(124,45,18,.06) 1px,transparent 1px),linear-gradient(rgba(124,45,18,.06) 1px,transparent 1px)", backgroundSize: "26px 26px" }} />
    <div className="absolute left-[6%] right-[6%] top-[72%] h-[16%] rounded-full border-4 border-dashed border-orange-500/30" />
    <div className="absolute left-[10%] right-[12%] top-[18%] h-[62%] rounded-full border-4 border-dashed border-slate-700/10" />
    {zones.map(zone => <FloorZone key={zone.id} zone={zone} />)}
  </div>;
}

function FloorZone({ zone }) {
  const left = zone.x - zone.w / 2;
  const top = zone.y - zone.h / 2;
  const classes = zone.kind === "register" ? "bg-slate-950 text-white" : zone.kind === "door" ? "bg-gradient-to-br from-emerald-100 to-white text-slate-950" : zone.kind === "wall" ? "bg-gradient-to-br from-blue-100 to-white text-slate-950" : zone.kind === "longbox" ? "bg-gradient-to-br from-slate-50 to-white text-slate-950" : "bg-white text-slate-950";
  return <div className={`absolute overflow-hidden rounded-2xl border border-black/10 p-2 shadow-md ${classes}`} style={{ left: `${left}%`, top: `${top}%`, width: `${zone.w}%`, height: `${zone.h}%` }}>
    <div className="flex items-start justify-between gap-1"><div className="max-w-[7rem] text-[10px] font-black leading-none sm:text-xs">{zone.label}</div><div className="text-xl leading-none sm:text-2xl">{zone.icon}</div></div>
    <div className="mt-1 hidden text-[9px] font-bold leading-none opacity-60 sm:block">{zone.desc}</div>
    {zone.kind === "longbox" && <div className="mt-1 grid grid-cols-3 gap-1"><span className="h-2 rounded bg-slate-700" /><span className="h-2 rounded bg-slate-700" /><span className="h-2 rounded bg-slate-700" /></div>}
  </div>;
}

function PathingCustomer({ customer }) {
  const points = [customer.entrance, customer.target, customer.register, customer.entrance];
  return <motion.div className="absolute z-20" initial={{ left: `${points[0].x}%`, top: `${points[0].y}%`, opacity: 0, scale: 0.8 }} animate={{ left: points.map(p => `${p.x}%`), top: points.map(p => `${p.y}%`), opacity: [0, 1, 1, 1, 0], scale: [0.8, 1, 1.05, 1, 0.85] }} transition={{ duration: 4.6, delay: customer.delay, times: [0, 0.2, 0.58, 0.82, 1], ease: "easeInOut" }}>
    <div className="relative -translate-x-1/2 -translate-y-1/2"><motion.div className={`flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-xl ring-2 ${customer.type === "pull" ? "ring-emerald-400" : customer.type === "trend" ? "ring-amber-400" : "ring-sky-300"}`} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: customer.delay }}>{customer.icon}</motion.div><div className="mt-1 rounded-full bg-white/95 px-2 py-0.5 text-center text-[10px] font-black text-slate-600 shadow-sm ring-1 ring-black/5">{customer.name}</div><motion.div className="absolute -top-8 left-1/2 min-w-max -translate-x-1/2 rounded-full bg-slate-950 px-2 py-1 text-[10px] font-black text-white shadow-lg" initial={{ opacity: 0, y: 6 }} animate={{ opacity: [0, 0, 1, 1, 0], y: [6, 6, 0, 0, -6] }} transition={{ duration: 4.6, delay: customer.delay, times: [0, 0.35, 0.48, 0.72, 1] }}>{customer.target.label}</motion.div></div>
  </motion.div>;
}

function ActivityFeed({ activities, phase }) {
  return <div className="absolute bottom-3 left-3 right-3 z-30 max-h-[118px] overflow-hidden rounded-2xl bg-slate-950/95 p-3 text-white shadow-xl ring-1 ring-white/10 backdrop-blur">
    <div className="mb-2 flex items-center justify-between gap-3"><div className="text-xs font-black uppercase tracking-widest text-amber-300">Live Activity</div><div className="text-xs font-black text-slate-300 capitalize">{phase}</div></div>
    <div className="space-y-1.5">{activities.map((activity, index) => <motion.div key={`${activity}-${index}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={`truncate rounded-xl px-3 py-2 font-bold ${index === 0 ? "bg-white text-sm text-slate-950" : "bg-white/10 text-xs text-slate-100"}`}>{activity}</motion.div>)}</div>
  </div>;
}

function Mini({ label, value }) {
  return <div className="rounded-2xl bg-white p-2 ring-1 ring-black/5"><div className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</div><div className="mt-1 truncate text-xs font-black text-slate-950 sm:text-sm">{value}</div></div>;
}
