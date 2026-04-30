import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppV8 from "./AppV8.jsx";

const customerSprites = [
  { icon: "🎒", name: "Mikey", action: "grabs manga" },
  { icon: "🧐", name: "Sandra", action: "checks condition" },
  { icon: "📈", name: "Derek", action: "hunts rumors" },
  { icon: "🧢", name: "Carl", action: "opens packs" },
  { icon: "🎨", name: "Ava", action: "drops off zines" },
  { icon: "☕", name: "Kim", action: "just browses" },
  { icon: "🧵", name: "Nina", action: "finds capes" },
  { icon: "🦸", name: "Tim", action: "wants punching" },
];

const saleBubbles = [
  "+$8 New Comic",
  "+$13 Manga",
  "+$11 Cards",
  "+$24 Figure",
  "Pull list checked",
  "Trend sale!",
  "Customer loyalty +2",
  "Back issue found",
];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function makeWalkers() {
  return customerSprites.map((customer, index) => ({
    ...customer,
    id: `${customer.name}-${Date.now()}-${index}`,
    startX: rand(8, 85),
    startY: rand(18, 76),
    endX: rand(8, 85),
    endY: rand(18, 76),
    delay: index * 0.18,
    duration: rand(2.4, 3.8),
    bubble: saleBubbles[index % saleBubbles.length],
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

export default function AppV9() {
  const [live, setLive] = useState(false);
  const [walkers, setWalkers] = useState([]);
  const [phase, setPhase] = useState("ready");

  function startLiveDay() {
    if (live) return;
    setWalkers(makeWalkers());
    setPhase("opening");
    setLive(true);
  }

  useEffect(() => {
    if (!live) return;

    const phaseOne = setTimeout(() => setPhase("selling"), 900);
    const phaseTwo = setTimeout(() => setPhase("closing"), 3300);
    const finish = setTimeout(() => {
      setLive(false);
      setPhase("ready");
      setWalkers([]);
      clickRealOpenShopButton();
    }, 4300);

    return () => {
      clearTimeout(phaseOne);
      clearTimeout(phaseTwo);
      clearTimeout(finish);
    };
  }, [live]);

  const phaseText = useMemo(() => {
    if (phase === "opening") return "Doors open. The regulars are drifting in.";
    if (phase === "selling") return "Customers are browsing, buying, and asking dangerous questions.";
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
      {live && <LiveDayOverlay walkers={walkers} phaseText={phaseText} phase={phase} />}
    </AnimatePresence>
  </div>;
}

function LiveDayOverlay({ walkers, phaseText, phase }) {
  return <motion.div
    className="fixed inset-0 z-[75] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      initial={{ scale: 0.96, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.96, y: 20 }}
      className="relative h-[72vh] w-full max-w-3xl overflow-hidden rounded-[2rem] bg-[#fffaf0] p-4 shadow-2xl ring-1 ring-black/10"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-amber-600">Live Comic Shop</div>
          <h2 className="text-2xl font-black text-slate-950">Open Shop Day</h2>
          <p className="text-sm font-semibold text-slate-500">{phaseText}</p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black text-white">
          {phase === "opening" ? "Opening" : phase === "selling" ? "Selling" : "Closing"}
        </div>
      </div>

      <div className="relative h-[calc(100%-5.5rem)] overflow-hidden rounded-[1.5rem] bg-slate-100 p-3 ring-1 ring-black/5">
        <ShopBackdrop />
        {walkers.map((walker) => <Walker key={walker.id} walker={walker} />)}
        <motion.div
          className="absolute bottom-3 left-3 right-3 rounded-2xl bg-slate-950/95 px-4 py-3 text-sm font-bold text-white shadow-xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {phase === "opening" && "🔔 Bell rings. Customers enter the shop."}
          {phase === "selling" && "💵 Sales are happening live. Pull lists, trends, and loyalty are being checked."}
          {phase === "closing" && "🧾 Day complete. The real report is coming next."}
        </motion.div>
      </div>
    </motion.div>
  </motion.div>;
}

function ShopBackdrop() {
  const tiles = [
    "📚", "📚", "🌸", "🗃️", "🧸",
    "📚", "🃏", "🃏", "🔐", "🧸",
    "🗃️", "🌸", "☕", "🎲", "🃏",
    "📚", "✍️", "🎨", "🛋️", "🧸",
    "🚪", "🧾", "💵", "📦", "📚",
  ];
  return <div className="absolute inset-3 grid grid-cols-5 gap-2 opacity-95">
    {tiles.map((tile, index) => <div key={index} className="flex items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-black/5">{tile}</div>)}
  </div>;
}

function Walker({ walker }) {
  return <motion.div
    className="absolute"
    style={{ left: `${walker.startX}%`, top: `${walker.startY}%` }}
    animate={{ left: `${walker.endX}%`, top: `${walker.endY}%` }}
    transition={{ duration: walker.duration, delay: walker.delay, repeat: 1, repeatType: "reverse", ease: "easeInOut" }}
  >
    <div className="relative">
      <motion.div
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-xl ring-2 ring-amber-300"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: walker.delay }}
      >
        {walker.icon}
      </motion.div>
      <motion.div
        className="absolute -top-10 left-1/2 min-w-max -translate-x-1/2 rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white shadow-lg"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -8] }}
        transition={{ duration: 2.2, delay: walker.delay + 0.7 }}
      >
        {walker.bubble}
      </motion.div>
      <div className="mt-1 rounded-full bg-white/90 px-2 py-0.5 text-center text-[10px] font-black text-slate-600 shadow-sm">
        {walker.name}
      </div>
    </div>
  </motion.div>;
}
