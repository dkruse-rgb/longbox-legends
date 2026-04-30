import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppV16 from "./AppV16.jsx";

const SAVE_KEYS = ["longbox-legends-save-v5", "longbox-legends-save-v4", "longbox-legends-save-v3", "longbox-legends-save-v2", "longbox-legends-save-v1"];

const zones = [
  { id: "new", label: "New Releases", icon: "📚", x: 28, y: 18 },
  { id: "entrance", label: "Entrance", icon: "🚪", x: 82, y: 18 },
  { id: "manga", label: "Manga", icon: "🌸", x: 25, y: 38 },
  { id: "rare", label: "Rare Case", icon: "🔐", x: 58, y: 38 },
  { id: "longboxes", label: "Longboxes", icon: "🗃️", x: 30, y: 62 },
  { id: "cards", label: "Cards", icon: "🎲", x: 76, y: 62 },
  { id: "register", label: "Register", icon: "💵", x: 18, y: 88 },
  { id: "reading", label: "Reading", icon: "☕", x: 55, y: 88 },
  { id: "stock", label: "Stock", icon: "📦", x: 84, y: 88 },
];

const catalog = {
  new: { zone: "new", name: "New Releases", icon: "📚", person: "Tim", personIcon: "🦸" },
  manga: { zone: "manga", name: "Manga", icon: "🌸", person: "Mikey", personIcon: "🎒" },
  cards: { zone: "cards", name: "Cards", icon: "🃏", person: "Carl", personIcon: "🧢" },
  back: { zone: "longboxes", name: "Back Issues", icon: "🗃️", person: "Sandra", personIcon: "🧐" },
  figures: { zone: "rare", name: "Figures", icon: "🧸", person: "Nina", personIcon: "🧵" },
  zines: { zone: "stock", name: "Zines", icon: "✍️", person: "Ava", personIcon: "🎨" },
};

const trends = ["new", "manga", "cards", "back", "figures", "zines"];

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

function zone(id) {
  return zones.find(z => z.id === id) || zones[0];
}

function recognizesOpenButton(button) {
  const text = button?.textContent?.replace(/\s+/g, " ").trim() || "";
  return text.includes("Open Shop") || text.includes("Open Shop Live") || text.includes("Open Shop for the Day");
}

function getOpenButton() {
  return Array.from(document.querySelectorAll("button")).find(recognizesOpenButton);
}

function weekTrend(day = 1) {
  const week = Math.floor((day - 1) / 7);
  return trends[week % trends.length];
}

function inventoryItems(save) {
  const inventory = Array.isArray(save?.inventory) ? save.inventory : [];
  return inventory.filter(item => (Number(item.stock) || 0) > 0);
}

function buildCustomers(save) {
  const day = save?.day || 1;
  const max = window.innerWidth < 640 ? 5 : 7;
  const customers = [];
  const pullList = Array.isArray(save?.pullList) ? save.pullList : [];
  const trendId = weekTrend(day);

  pullList.slice(0, 2).forEach(req => {
    const meta = catalog[req.itemId] || catalog.new;
    customers.push({
      name: (req.customerName || meta.person).split(" ")[0],
      icon: req.customerIcon || meta.personIcon,
      target: zone(meta.zone),
      action: `Pull list: ${req.itemName || meta.name}`,
      type: "pull",
    });
  });

  if (inventoryItems(save).some(item => item.id === trendId) && customers.length < max) {
    const meta = catalog[trendId] || catalog.new;
    customers.push({ name: meta.person, icon: meta.personIcon, target: zone(meta.zone), action: `Trend sale: ${meta.name}`, type: "trend" });
  }

  inventoryItems(save).forEach(item => {
    if (customers.length >= max) return;
    const meta = catalog[item.id] || catalog.new;
    if (customers.some(c => c.target.id === meta.zone)) return;
    customers.push({ name: meta.person, icon: meta.personIcon, target: zone(meta.zone), action: `Buys ${meta.name}`, type: "sale" });
  });

  const fallback = [
    { name: "Kim", icon: "☕", target: zone("reading"), action: "Browses the reading area", type: "browse" },
    { name: "Derek", icon: "📈", target: zone("rare"), action: "Checks the rumor shelf", type: "browse" },
    { name: "Tim", icon: "🦸", target: zone("new"), action: "Looks for maximum punching", type: "browse" },
  ];
  fallback.forEach(c => { if (customers.length < max) customers.push(c); });

  return customers.slice(0, max).map((c, index) => ({
    ...c,
    id: `${c.name}-${Date.now()}-${index}`,
    delay: index * 0.24,
    entrance: zone("entrance"),
    register: zone("register"),
  }));
}

function finishByClickingRealButton() {
  const button = getOpenButton();
  if (!button) return;
  window.__longboxV17AllowOpen = true;
  window.__longboxAllowInstantOpen = true;
  button.click();
}

export default function AppV17() {
  const [live, setLive] = useState(false);
  const [phase, setPhase] = useState("opening");
  const [customers, setCustomers] = useState([]);
  const [activityIndex, setActivityIndex] = useState(0);
  const [day, setDay] = useState(1);

  function startLive() {
    if (live) return;
    const save = getSave() || {};
    setDay(save.day || 1);
    setCustomers(buildCustomers(save));
    setActivityIndex(0);
    setPhase("opening");
    setLive(true);
  }

  useEffect(() => {
    const capture = event => {
      const button = event.target?.closest?.("button");
      if (!button || !recognizesOpenButton(button)) return;

      if (window.__longboxV17AllowOpen) {
        window.__longboxV17AllowOpen = false;
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      startLive();
    };

    document.addEventListener("click", capture, true);
    return () => document.removeEventListener("click", capture, true);
  }, [live]);

  useEffect(() => {
    if (!live) return;
    const activityTimer = setInterval(() => setActivityIndex(i => Math.min(i + 1, Math.max(0, customers.length - 1))), 650);
    const browsing = setTimeout(() => setPhase("browsing"), 900);
    const checkout = setTimeout(() => setPhase("checkout"), 3100);
    const closing = setTimeout(() => setPhase("closing"), 4300);
    const finish = setTimeout(() => {
      setLive(false);
      setCustomers([]);
      setActivityIndex(0);
      finishByClickingRealButton();
    }, 5450);

    return () => {
      clearInterval(activityTimer);
      clearTimeout(browsing);
      clearTimeout(checkout);
      clearTimeout(closing);
      clearTimeout(finish);
    };
  }, [live, customers.length]);

  return <div className="relative min-h-screen">
    <AppV16 />
    <AnimatePresence>{live && <LiveOverlay day={day} phase={phase} customers={customers} activityIndex={activityIndex} />}</AnimatePresence>
  </div>;
}

function LiveOverlay({ day, phase, customers, activityIndex }) {
  const activities = customers.slice(0, Math.max(1, activityIndex + 1)).map(c => `${c.icon} ${c.name}: ${c.action}`).slice(-3).reverse();
  const phaseText = phase === "opening" ? "Customers enter through the front door." : phase === "browsing" ? "Customers visit real sections of the shop." : phase === "checkout" ? "Customers queue at the register." : "Writing the day report.";

  return <motion.div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-3 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }} className="relative flex h-[84vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] bg-[#fffaf0] p-4 shadow-2xl ring-1 ring-black/10">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-widest text-amber-600">Live Floor Map</div>
          <h2 className="text-2xl font-black leading-tight text-slate-950">Open Shop Day {day}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500 sm:text-base">{phaseText}</p>
        </div>
        <div className="shrink-0 rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black text-white capitalize">{phase}</div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.5rem] bg-slate-100 p-3 ring-1 ring-black/5">
        <FloorMap />
        {customers.map(customer => <Customer key={customer.id} customer={customer} />)}
        <div className="absolute bottom-3 left-3 right-3 z-30 max-h-[118px] overflow-hidden rounded-2xl bg-slate-950/95 p-3 text-white shadow-xl ring-1 ring-white/10 backdrop-blur">
          <div className="mb-2 flex items-center justify-between gap-3"><div className="text-xs font-black uppercase tracking-widest text-amber-300">Live Activity</div><div className="text-xs font-black text-slate-300 capitalize">{phase}</div></div>
          <div className="space-y-1.5">{activities.map((activity, index) => <motion.div key={`${activity}-${index}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={`truncate rounded-xl px-3 py-2 font-bold ${index === 0 ? "bg-white text-sm text-slate-950" : "bg-white/10 text-xs text-slate-100"}`}>{activity}</motion.div>)}</div>
        </div>
      </div>
    </motion.div>
  </motion.div>;
}

function FloorMap() {
  return <div className="absolute inset-3 overflow-hidden rounded-[1.35rem] border-[5px] border-orange-900 bg-orange-50 shadow-inner">
    <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "linear-gradient(90deg,rgba(124,45,18,.06) 1px,transparent 1px),linear-gradient(rgba(124,45,18,.06) 1px,transparent 1px)", backgroundSize: "26px 26px" }} />
    <div className="absolute left-[6%] right-[6%] top-[72%] h-[16%] rounded-full border-4 border-dashed border-orange-500/30" />
    <div className="absolute left-[10%] right-[12%] top-[18%] h-[62%] rounded-full border-4 border-dashed border-slate-700/10" />
    {zones.map(z => <Zone key={z.id} z={z} />)}
  </div>;
}

function Zone({ z }) {
  const left = z.x - 13;
  const top = z.y - 7;
  const isRegister = z.id === "register";
  const isEntrance = z.id === "entrance";
  const wide = z.id === "new" || z.id === "longboxes";
  return <div className={`absolute rounded-2xl border border-black/10 p-2 shadow-md ${isRegister ? "bg-slate-950 text-white" : isEntrance ? "bg-gradient-to-br from-emerald-100 to-white" : "bg-white"}`} style={{ left: `${left}%`, top: `${top}%`, width: wide ? "34%" : "25%", height: wide ? "15%" : "15%" }}>
    <div className="flex items-start justify-between gap-1"><div className="text-[10px] font-black leading-none sm:text-xs">{z.label}</div><div className="text-xl leading-none">{z.icon}</div></div>
  </div>;
}

function Customer({ customer }) {
  const points = [customer.entrance, customer.target, customer.register, customer.entrance];
  return <motion.div className="absolute z-20" initial={{ left: `${points[0].x}%`, top: `${points[0].y}%`, opacity: 0, scale: 0.8 }} animate={{ left: points.map(p => `${p.x}%`), top: points.map(p => `${p.y}%`), opacity: [0, 1, 1, 1, 0], scale: [0.8, 1, 1.05, 1, 0.85] }} transition={{ duration: 4.6, delay: customer.delay, times: [0, 0.2, 0.58, 0.82, 1], ease: "easeInOut" }}>
    <div className="relative -translate-x-1/2 -translate-y-1/2">
      <motion.div className={`flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-xl ring-2 ${customer.type === "pull" ? "ring-emerald-400" : customer.type === "trend" ? "ring-amber-400" : "ring-sky-300"}`} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: customer.delay }}>{customer.icon}</motion.div>
      <div className="mt-1 rounded-full bg-white/95 px-2 py-0.5 text-center text-[10px] font-black text-slate-600 shadow-sm ring-1 ring-black/5">{customer.name}</div>
    </div>
  </motion.div>;
}
