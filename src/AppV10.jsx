import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppV8 from "./AppV8.jsx";

const customerSprites = [
  { icon: "🎒", name: "Mikey", action: "picked up manga" },
  { icon: "🧐", name: "Sandra", action: "checked a back issue" },
  { icon: "📈", name: "Derek", action: "bought the rumor" },
  { icon: "🧢", name: "Carl", action: "opened card packs" },
  { icon: "🎨", name: "Ava", action: "dropped off zines" },
  { icon: "☕", name: "Kim", action: "browsed and bought anyway" },
  { icon: "🧵", name: "Nina", action: "found cosplay fuel" },
  { icon: "🦸", name: "Tim", action: "found maximum punching" },
];

const activityLines = [
  "+$8 New Release Comic",
  "+$13 Manga Volume",
  "+$11 Card Pack",
  "+$24 Collectible Figure",
  "Pull list checked",
  "Trend sale spotted",
  "Customer loyalty +2",
  "Back issue found",
  "Someone asked if issue #7 counts as a key",
  "Register bell did the happy sound",
];

const lanes = [
  { x1: 12, y1: 18, x2: 74, y2: 18 },
  { x1: 18, y1: 39, x2: 82, y2: 44 },
  { x1: 14, y1: 64, x2: 68, y2: 70 },
  { x1: 78, y1: 20, x2: 28, y2: 58 },
  { x1: 40, y1: 75, x2: 58, y2: 28 },
];

function isSmallScreen() {
  if (typeof window === "undefined") return true;
  return window.innerWidth < 640;
}

function makeWalkers() {
  const count = isSmallScreen() ? 5 : 8;
  return customerSprites.slice(0, count).map((customer, index) => ({
    ...customer,
    id: `${customer.name}-${Date.now()}-${index}`,
    ...lanes[index % lanes.length],
    delay: index * 0.25,
    duration: 3.2 + index * 0.12,
  }));
}

function clickRealOpenShopButton() {
  const buttons = Array.from(document.querySelectorAll("button"));
  const openButton = buttons.find(button => {
    const text = button.textContent?.trim() || "";
    return text === "Open Shop" || text === "Open Shop for the Day";
  });
  if (openButton) {
    openButton.click();
    return true;
  }
  return false;
}

export default function AppV10() {
  const [live, setLive] = useState(false);
  const [walkers, setWalkers] = useState([]);
  const [phase, setPhase] = useState("ready");
  const [activityIndex, setActivityIndex] = useState(0);

  function startLiveDay() {
    if (live) return;
    setWalkers(makeWalkers());
    setActivityIndex(0);
    setPhase("opening");
    setLive(true);
  }

  useEffect(() => {
    if (!live) return;

    const activityTimer = setInterval(() => {
      setActivityIndex(index => Math.min(index + 1, activityLines.length - 1));
    }, 520);

    const phaseOne = setTimeout(() => setPhase("selling"), 900);
    const phaseTwo = setTimeout(() => setPhase("closing"), 3600);
    const finish = setTimeout(() => {
      setLive(false);
      setPhase("ready");
      setWalkers([]);
      setActivityIndex(0);
      clickRealOpenShopButton();
    }, 4700);

    return () => {
      clearInterval(activityTimer);
      clearTimeout(phaseOne);
      clearTimeout(phaseTwo);
      clearTimeout(finish);
    };
  }, [live]);

  const phaseText = useMemo(() => {
    if (phase === "opening") return "Doors open. Regulars drift in and pretend they are just looking.";
    if (phase === "selling") return "Customers browse shelves, check pull lists, and make questionable purchases.";
    if (phase === "closing") return "Closing the register and writing the day report.";
    return "Live Day";
  }, [phase]);

  return <div className="relative min-h-screen">
    <AppV8 />

    <button
      onClick={startLiveDay}
      disabled={live}
      className="fixed left-1/2 top-[3.35rem] z-[65] -translate-x-1/2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white shadow-2xl ring-1 ring-white/20 active:scale-95 disabled:bg-slate-500 lg:top-4"
    >
      {live ? "Live Day Running..." : "▶ Live Day"}
    </button>

    <AnimatePresence>
      {live && <LiveDayOverlay walkers={walkers} phaseText={phaseText} phase={phase} activityIndex={activityIndex} />}
    </AnimatePresence>
  </div>;
}

function LiveDayOverlay({ walkers, phaseText, phase, activityIndex }) {
  const visibleActivities = activityLines.slice(Math.max(0, activityIndex - 3), activityIndex + 1).reverse();

  return <motion.div
    className="fixed inset-0 z-[75] flex items-center justify-center bg-black/45 p-3 backdrop-blur-[2px]"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      initial={{ scale: 0.96, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.96, y: 20 }}
      className="relative flex h-[76vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] bg-[#fffaf0] p-4 shadow-2xl ring-1 ring-black/10"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-widest text-amber-600">Live Comic Shop</div>
          <h2 className="text-2xl font-black leading-tight text-slate-950">Open Shop Day</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500 sm:text-base">{phaseText}</p>
        </div>
        <div className="shrink-0 rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black text-white">
          {phase === "opening" ? "Opening" : phase === "selling" ? "Selling" : "Closing"}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.5rem] bg-slate-100 p-3 ring-1 ring-black/5">
        <ShopBackdrop />
        {walkers.map((walker) => <Walker key={walker.id} walker={walker} />)}
        <ActivityFeed activities={visibleActivities} phase={phase} />
      </div>
    </motion.div>
  </motion.div>;
}

function ShopBackdrop() {
  const tiles = [
    "📚", "📚", "🌸", "🗃️", "🧸",
    "📚", "🃏", "🧾", "🔐", "🧸",
    "🗃️", "🌸", "☕", "🎲", "🃏",
    "📚", "✍️", "🎨", "🛋️", "🧸",
    "🚪", "📦", "💵", "📚", "🚪",
  ];
  return <div className="absolute inset-3 grid grid-cols-5 gap-2 opacity-95">
    {tiles.map((tile, index) => <div key={index} className="flex items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-black/5">{tile}</div>)}
  </div>;
}

function Walker({ walker }) {
  return <motion.div
    className="absolute z-10"
    style={{ left: `${walker.x1}%`, top: `${walker.y1}%` }}
    animate={{ left: `${walker.x2}%`, top: `${walker.y2}%` }}
    transition={{ duration: walker.duration, delay: walker.delay, repeat: 1, repeatType: "reverse", ease: "easeInOut" }}
  >
    <div className="relative flex flex-col items-center">
      <motion.div
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-xl ring-2 ring-amber-300 sm:h-12 sm:w-12"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: walker.delay }}
      >
        {walker.icon}
      </motion.div>
      <div className="mt-1 rounded-full bg-white/95 px-2 py-0.5 text-center text-[10px] font-black text-slate-600 shadow-sm ring-1 ring-black/5">
        {walker.name}
      </div>
    </div>
  </motion.div>;
}

function ActivityFeed({ activities, phase }) {
  return <div className="absolute bottom-3 left-3 right-3 z-20 rounded-2xl bg-slate-950/95 p-3 text-white shadow-xl ring-1 ring-white/10">
    <div className="mb-2 flex items-center justify-between gap-3">
      <div className="text-xs font-black uppercase tracking-widest text-amber-300">Activity Feed</div>
      <div className="text-xs font-black text-slate-300">{phase === "opening" ? "Doors" : phase === "selling" ? "Live" : "Report"}</div>
    </div>
    <div className="space-y-1.5">
      {activities.map((activity, index) => <motion.div
        key={`${activity}-${index}`}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className={`rounded-xl px-3 py-2 text-sm font-bold ${index === 0 ? "bg-white text-slate-950" : "bg-white/10 text-slate-100"}`}
      >
        {activity}
      </motion.div>)}
    </div>
  </div>;
}
