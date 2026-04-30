import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "longbox-legends-save-v3";
const OLD_KEYS = ["longbox-legends-save-v2", "longbox-legends-save-v1"];

const catalog = [
  { id: "new", name: "New Release Comics", icon: "📚", cost: 60, units: 12, price: 8, tags: ["casual", "collector", "kid"], desc: "Fresh weekly books for Wednesday warriors.", color: "from-sky-50 to-blue-100" },
  { id: "back", name: "Back Issue Bundle", icon: "🗃️", cost: 95, units: 18, price: 9, tags: ["collector", "speculator"], desc: "Longbox treasure. Mostly filler, sometimes fire.", color: "from-orange-50 to-amber-100" },
  { id: "manga", name: "Manga Volumes", icon: "🌸", cost: 80, units: 10, price: 13, tags: ["manga", "kid", "casual"], desc: "Reliable movers with loyal readers.", color: "from-pink-50 to-rose-100" },
  { id: "cards", name: "Trading Card Packs", icon: "🃏", cost: 120, units: 16, price: 11, tags: ["card", "kid", "speculator"], desc: "Tiny cardboard lottery tickets. Legal magic.", color: "from-violet-50 to-purple-100" },
  { id: "figures", name: "Collectible Figures", icon: "🧸", cost: 140, units: 8, price: 24, tags: ["collector", "casual", "cosplay"], desc: "High-margin shelf candy.", color: "from-emerald-50 to-green-100" },
  { id: "zines", name: "Local Indie Zines", icon: "✍️", cost: 45, units: 15, price: 6, tags: ["artist", "casual"], desc: "Support the scene. Build street cred.", color: "from-yellow-50 to-amber-100" }
];

const rares = [
  { id: "possum", name: "Possum Knight #1", icon: "🦝", grade: "VF", cost: 180, value: 360, prestige: 5, desc: "First appearance of a hero who plays dead until issue six." },
  { id: "liability", name: "Captain Liability: Alpha Variant", icon: "🛡️", grade: "NM", cost: 260, value: 620, prestige: 8, desc: "A lawsuit in tights. Collectors love it for some reason." },
  { id: "janitor", name: "Galaxy Janitor #7", icon: "🧹", grade: "Fine", cost: 90, value: 220, prestige: 4, desc: "The mop variant. Absurdly rare. Nobody knows why." },
  { id: "tax", name: "Tax Man: Audit War", icon: "💼", grade: "9.2 Slab", cost: 420, value: 980, prestige: 12, desc: "The scariest villain is itemized deductions." }
];

const upgrades = [
  { id: "sign", name: "Neon Shop Sign", icon: "💡", cost: 250, rep: 5, traffic: 2, desc: "Makes the shop look alive instead of legally abandoned." },
  { id: "wall", name: "Longbox Wall", icon: "🗄️", cost: 380, rep: 4, traffic: 1, desc: "Collectors can dig until their knees file complaints." },
  { id: "manga", name: "Manga Corner", icon: "🍥", cost: 450, rep: 6, traffic: 2, desc: "Cozy shelves and dangerous volume-one addiction." },
  { id: "case", name: "Rare Book Display Case", icon: "🔐", cost: 600, rep: 8, traffic: 1, desc: "Turns key issues into museum pieces with price tags." },
  { id: "tables", name: "Tournament Tables", icon: "🎲", cost: 750, rep: 8, traffic: 3, desc: "A cardboard colosseum. Smells like sleeves and destiny." },
  { id: "online", name: "Online Storefront", icon: "🌐", cost: 1100, rep: 10, traffic: 4, desc: "Sell beyond the city. Ship bubble mailers like a champion." }
];

const staff = [
  { id: "riley", name: "Riley the Organizer", icon: "🧢", role: "Restocker", cost: 35, rep: 0, traffic: 1, desc: "Adds traffic and keeps stockouts from becoming a tragedy." },
  { id: "mo", name: "Mo the Comic Expert", icon: "🤓", role: "Recommender", cost: 55, rep: 3, traffic: 0, desc: "Customers buy more often and pull-list customers get handled better." },
  { id: "ava", name: "Ava the Event Host", icon: "🎤", role: "Community Builder", cost: 75, rep: 4, traffic: 1, desc: "Events gain extra reputation and better vibes." }
];

const events = [
  { id: "free", name: "Free Comic Day", icon: "🎁", cost: 120, rep: 7, visitors: 7, desc: "Give away books, gain lifelong readers." },
  { id: "card", name: "Friday Card Night", icon: "🃏", cost: 160, rep: 6, visitors: 10, need: "tables", desc: "Tournament tables turn this into a money printer." },
  { id: "artist", name: "Local Artist Signing", icon: "🖊️", cost: 220, rep: 12, visitors: 8, desc: "Your shop becomes part of the local comics scene." }
];

const customers = [
  { name: "Mikey the Manga Kid", type: "manga", icon: "🎒", quote: "Do you have volume one? I must begin correctly." },
  { name: "Sandra the Serious Collector", type: "collector", icon: "🧐", quote: "Condition matters. Spine ticks are crimes." },
  { name: "Derek the Speculator", type: "speculator", icon: "📈", quote: "This character is definitely in the next movie. Trust me." },
  { name: "Card Table Carl", type: "card", icon: "🧢", quote: "I only need one pack. Probably." },
  { name: "Ava the Local Artist", type: "artist", icon: "🎨", quote: "Could you carry my ashcan preview?" },
  { name: "Casual Browser Kim", type: "casual", icon: "☕", quote: "I just came in to look. Famous last words." },
  { name: "Cosplay Nina", type: "cosplay", icon: "🧵", quote: "Anything with dramatic capes? Research purposes." },
  { name: "Tiny Titan Tim", type: "kid", icon: "🦸", quote: "Which one has the most punching?" }
];

const tabs = [
  ["shop", "Shop", "🏪"],
  ["buy", "Buy", "📦"],
  ["rare", "Rare", "💎"],
  ["build", "Build", "🛠️"],
  ["events", "Events", "🎟️"],
  ["staff", "Staff", "👥"]
];

const start = {
  day: 1,
  cash: 650,
  rep: 12,
  hype: 0,
  xp: 0,
  inventory: [],
  rare: [],
  upgrades: [],
  staff: [],
  regulars: [],
  pullList: [],
  fulfilledPulls: 0,
  lifetimeSales: 0,
  lifetimeVisitors: 0,
  log: ["You unlocked a tiny comic shop with big main-character energy."]
};

const money = n => `$${Math.round(n).toLocaleString()}`;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

function normalizeSave(raw) {
  return {
    ...start,
    ...raw,
    inventory: Array.isArray(raw?.inventory) ? raw.inventory : [],
    rare: Array.isArray(raw?.rare) ? raw.rare : [],
    upgrades: Array.isArray(raw?.upgrades) ? raw.upgrades : [],
    staff: Array.isArray(raw?.staff) ? raw.staff : [],
    regulars: Array.isArray(raw?.regulars) ? raw.regulars : [],
    pullList: Array.isArray(raw?.pullList) ? raw.pullList : [],
    fulfilledPulls: raw?.fulfilledPulls || 0,
    log: Array.isArray(raw?.log) ? raw.log : start.log
  };
}

function loadGame() {
  try {
    const v3 = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (v3) return normalizeSave(v3);
    for (const key of OLD_KEYS) {
      const oldSave = JSON.parse(localStorage.getItem(key));
      if (oldSave) return normalizeSave(oldSave);
    }
  } catch {
    return start;
  }
  return start;
}

function addStock(inv, item) {
  const found = inv.find(x => x.id === item.id);
  if (found) return inv.map(x => x.id === item.id ? { ...x, stock: x.stock + item.units } : x);
  return [...inv, { id: item.id, name: item.name, icon: item.icon, stock: item.units, price: item.price, tags: item.tags }];
}

function makePullRequest(regularNames = [], day = 1) {
  const regularCustomers = regularNames.map(n => customers.find(c => c.name === n)).filter(Boolean);
  const customer = regularCustomers.length ? pick(regularCustomers) : pick(customers);
  const options = catalog.filter(item => item.tags.includes(customer.type));
  const item = options.length ? pick(options) : pick(catalog);
  const reward = Math.round(item.price * (3.5 + Math.random() * 3.5) + 8);
  return {
    id: `${customer.name}-${item.id}-${day}-${Date.now()}-${Math.random()}`,
    customerName: customer.name,
    customerIcon: customer.icon,
    itemId: item.id,
    itemName: item.name,
    itemIcon: item.icon,
    reward,
    due: 3,
    quote: customer.quote
  };
}

export default function App() {
  const [game, setGame] = useState(loadGame);
  const [tab, setTab] = useState("shop");
  const [report, setReport] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(game)), [game]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const payroll = useMemo(() => game.staff.reduce((s, id) => s + (staff.find(x => x.id === id)?.cost || 0), 0), [game.staff]);
  const stock = game.inventory.reduce((s, x) => s + x.stock, 0) + game.rare.length;
  const level = Math.floor(game.xp / 150) + 1;
  const xpToNext = 150 - (game.xp % 150);

  const traffic = useMemo(() => {
    const up = game.upgrades.reduce((s, id) => s + (upgrades.find(x => x.id === id)?.traffic || 0), 0);
    const st = game.staff.reduce((s, id) => s + (staff.find(x => x.id === id)?.traffic || 0), 0);
    const rarePrestige = game.rare.reduce((s, x) => s + x.prestige, 0);
    return 4 + up + st + Math.floor(game.rep / 10) + Math.floor(rarePrestige / 8);
  }, [game.upgrades, game.staff, game.rare, game.rep]);

  const title = useMemo(() => {
    if (game.rep >= 80) return "City Icon";
    if (game.rep >= 55) return "Local Legend";
    if (game.rep >= 35) return "Neighborhood Favorite";
    if (game.rep >= 18) return "Rising Shop";
    return "Tiny Longbox Cave";
  }, [game.rep]);

  const goal = useMemo(() => {
    const goals = [
      { label: "Stock 30 items", done: stock >= 30, progress: stock, target: 30 },
      { label: "Fill 3 pull-list requests", done: game.fulfilledPulls >= 3, progress: game.fulfilledPulls, target: 3 },
      { label: "Reach 25 reputation", done: game.rep >= 25, progress: game.rep, target: 25 },
      { label: "Build 3 upgrades", done: game.upgrades.length >= 3, progress: game.upgrades.length, target: 3 },
      { label: "Meet all 8 regulars", done: game.regulars.length >= 8, progress: game.regulars.length, target: 8 },
      { label: "Earn $2,500 lifetime", done: game.lifetimeSales >= 2500, progress: game.lifetimeSales, target: 2500 }
    ];
    return goals.find(g => !g.done) || { label: "Become the ultimate comic shop", done: false, progress: game.rep, target: 100 };
  }, [game, stock]);

  function notify(message) {
    setToast(message);
  }

  function buyItem(item) {
    if (game.cash < item.cost) return;
    setGame(g => ({ ...g, cash: g.cash - item.cost, inventory: addStock(g.inventory, item), log: [`Bought ${item.units}x ${item.name} for ${money(item.cost)}.`, ...g.log].slice(0, 10) }));
    notify(`${item.icon} Stocked ${item.name}`);
  }

  function buyUpgrade(up) {
    if (game.cash < up.cost || game.upgrades.includes(up.id)) return;
    setGame(g => ({ ...g, cash: g.cash - up.cost, rep: clamp(g.rep + up.rep, 0, 100), upgrades: [...g.upgrades, up.id], log: [`Built ${up.name}. Reputation +${up.rep}.`, ...g.log].slice(0, 10) }));
    notify(`${up.icon} Built ${up.name}`);
  }

  function hire(person) {
    if (game.cash < person.cost || game.staff.includes(person.id)) return;
    setGame(g => ({ ...g, cash: g.cash - person.cost, rep: clamp(g.rep + person.rep, 0, 100), staff: [...g.staff, person.id], log: [`Hired ${person.name} for ${money(person.cost)}/day.`, ...g.log].slice(0, 10) }));
    notify(`${person.icon} Hired ${person.name}`);
  }

  function buyRare(item) {
    if (game.cash < item.cost) return;
    setGame(g => ({ ...g, cash: g.cash - item.cost, rep: clamp(g.rep + Math.ceil(item.prestige / 2), 0, 100), rare: [...g.rare, { ...item, uid: `${item.id}-${Date.now()}-${Math.random()}` }], log: [`Rare pickup: ${item.name} ${item.grade}. The display case just got louder.`, ...g.log].slice(0, 10) }));
    notify(`${item.icon} Rare acquired`);
  }

  function sellRare(uid) {
    const item = game.rare.find(x => x.uid === uid);
    if (!item) return;
    setGame(g => ({ ...g, cash: g.cash + item.value, xp: g.xp + Math.floor(item.value / 5), rare: g.rare.filter(x => x.uid !== uid), lifetimeSales: g.lifetimeSales + item.value, log: [`Sold ${item.name} for ${money(item.value)}. Painful goodbye, beautiful margin.`, ...g.log].slice(0, 10) }));
    notify(`Sold ${item.name} for ${money(item.value)}`);
  }

  function host(ev) {
    const locked = ev.need && !game.upgrades.includes(ev.need);
    if (locked || game.cash < ev.cost) return;
    const bonus = game.staff.includes("ava") ? 4 : 0;
    const sales = ev.visitors * (7 + Math.floor(game.rep / 12));
    setGame(g => ({ ...g, cash: g.cash - ev.cost + sales, rep: clamp(g.rep + ev.rep + bonus, 0, 100), hype: clamp(g.hype + ev.visitors, 0, 40), xp: g.xp + ev.visitors * 8, lifetimeVisitors: g.lifetimeVisitors + ev.visitors, lifetimeSales: g.lifetimeSales + sales, log: [`${ev.name} brought ${ev.visitors} extra visitors and earned ${money(sales)} in buzz sales.`, ...g.log].slice(0, 10) }));
    notify(`${ev.icon} Event hosted`);
  }

  function nextDay() {
    let inv = [...game.inventory];
    let rare = [...game.rare];
    let pullList = [...(game.pullList || [])];
    let sales = 0;
    let gross = 0;
    let repDelta = 0;
    let fulfilled = 0;
    const regulars = new Set(game.regulars);
    const visitors = clamp(traffic + Math.floor(game.hype / 5) + Math.floor(Math.random() * 5), 2, 35);
    const lines = [];
    const buyers = [];

    const remainingPulls = [];
    for (const req of pullList) {
      const stocked = inv.find(x => x.id === req.itemId && x.stock > 0);
      if (stocked) {
        inv = inv.map(x => x.id === req.itemId ? { ...x, stock: x.stock - 1 } : x);
        gross += req.reward;
        sales += 1;
        fulfilled += 1;
        repDelta += 2;
        lines.push(`${req.customerIcon} Filled ${req.customerName}'s pull-list request for ${req.itemName}. +${money(req.reward)} and +2 rep.`);
      } else {
        const due = req.due - 1;
        if (due <= 0) {
          repDelta -= 1;
          lines.push(`${req.customerIcon} Missed ${req.customerName}'s pull-list request for ${req.itemName}. Reputation -1.`);
        } else {
          remainingPulls.push({ ...req, due });
        }
      }
    }
    pullList = remainingPulls;

    for (let i = 0; i < visitors; i++) {
      const c = pick(customers);
      regulars.add(c.name);
      const options = inv.filter(x => x.stock > 0 && x.tags.includes(c.type));
      const fallback = inv.filter(x => x.stock > 0);
      const choices = options.length ? options : fallback;
      const chance = game.staff.includes("mo") ? 0.72 : 0.62;
      if (choices.length && Math.random() < chance) {
        const item = pick(choices);
        const price = Math.round(item.price * (1 + Math.min(game.rep, 80) / 250) * (game.hype > 12 ? 1.15 : 1));
        gross += price;
        sales++;
        buyers.push(c);
        inv = inv.map(x => x.id === item.id ? { ...x, stock: x.stock - 1 } : x);
        if (lines.length < 6) lines.push(`${c.icon} ${c.name} bought ${item.name} for ${money(price)}.`);
      } else if (!choices.length) {
        repDelta--;
        if (lines.length < 6) lines.push(`${c.icon} ${c.name} found empty shelves. The aura took damage.`);
      }
    }

    if (Math.random() < 0.13 + (game.upgrades.includes("case") ? 0.05 : 0)) {
      const item = pick(rares);
      if (game.cash + gross >= item.cost && Math.random() < 0.55) {
        gross -= item.cost;
        rare = [...rare, { ...item, uid: `${item.id}-${Date.now()}-${Math.random()}` }];
        repDelta += 2;
        lines.unshift(`A customer traded in ${item.name}. You pounced before they checked the internet.`);
      } else {
        lines.unshift("A rare collection walked in, but you did not have enough loose cash to pounce.");
      }
    }

    const maxPulls = clamp(1 + Math.floor(game.rep / 28) + (game.staff.includes("mo") ? 1 : 0), 1, 4);
    const shouldAddRequest = pullList.length < maxPulls && (regulars.size >= 2 || Math.random() < 0.45);
    if (shouldAddRequest) {
      const request = makePullRequest(Array.from(regulars), game.day + 1);
      pullList = [request, ...pullList].slice(0, maxPulls);
      lines.unshift(`${request.customerIcon} New pull-list request: ${request.customerName} wants ${request.itemName} within 3 days.`);
    }

    const rent = 25 + game.upgrades.length * 8;
    const net = gross - payroll - rent;
    const repGain = sales >= Math.floor(visitors / 2) ? 1 : 0;
    const stockPenalty = stock < 8 ? -2 : 0;
    const headline = fulfilled > 0 ? "Pull-list customers are happy" : sales === 0 ? "Rough day at the longboxes" : net >= 0 ? "Solid day behind the counter" : "Good traffic, thin wallet";

    setGame(g => ({
      ...g,
      day: g.day + 1,
      cash: g.cash + net,
      rep: clamp(g.rep + repDelta + repGain + stockPenalty, 0, 100),
      hype: clamp(g.hype - 3, 0, 40),
      xp: g.xp + visitors * 3 + sales * 5 + fulfilled * 12,
      inventory: inv,
      rare,
      pullList,
      fulfilledPulls: (g.fulfilledPulls || 0) + fulfilled,
      regulars: Array.from(regulars),
      lifetimeSales: g.lifetimeSales + Math.max(0, gross),
      lifetimeVisitors: g.lifetimeVisitors + visitors,
      log: [`Day ${g.day}: ${visitors} visitors, ${sales} sales, ${money(gross)} gross. Rent/payroll: ${money(payroll + rent)}. Net: ${money(net)}. Pulls filled: ${fulfilled}.`, ...lines, ...g.log].slice(0, 10)
    }));

    setReport({
      headline,
      day: game.day,
      visitors,
      sales,
      gross,
      rent: rent + payroll,
      net,
      fulfilled,
      lines,
      featured: buyers[0] || pick(customers)
    });
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    OLD_KEYS.forEach(key => localStorage.removeItem(key));
    setGame(start);
    setTab("shop");
    setReport(null);
    notify("New shop started");
  }

  return <div className="min-h-screen bg-[#f6efe3] text-slate-950 pb-24 lg:pb-8">
    <div className="mx-auto max-w-7xl lg:p-6">
      <div className="overflow-hidden bg-[#fffaf0] shadow-2xl ring-1 ring-black/5 lg:rounded-[2rem]">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950 text-white lg:relative">
          <div className="relative overflow-hidden px-4 py-4 sm:px-6 lg:px-8 lg:py-7">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 15% 20%, #f59e0b, transparent 26%), radial-gradient(circle at 85% 0%, #06b6d4, transparent 25%), linear-gradient(135deg, transparent, rgba(255,255,255,.08))" }} />
            <div className="relative flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-amber-400 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-950">{title}</span>
                  <span className="text-xs font-bold text-slate-300">Day {game.day}</span>
                </div>
                <h1 className="truncate text-2xl font-black tracking-tight sm:text-4xl lg:text-6xl">Longbox Legends</h1>
                <p className="hidden max-w-2xl text-sm text-slate-300 sm:mt-2 sm:block">A cozy comic shop tycoon about comics, cards, manga, rare finds, pull lists, and regulars who slowly become your people.</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <button onClick={nextDay} className="rounded-2xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 active:scale-[.98]">Open Shop</button>
                <button onClick={reset} className="hidden rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white ring-1 ring-white/15 active:scale-[.98] sm:block">Reset</button>
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-6 lg:p-4">
          <Stat label="Cash" value={money(game.cash)} hot />
          <Stat label="Rep" value={`${game.rep}/100`} />
          <Stat label="Stock" value={stock} />
          <Stat label="Pulls" value={`${game.fulfilledPulls || 0}`} />
          <Stat label="Level" value={level} sub={`${xpToNext} XP to next`} />
          <Stat label="Traffic" value={traffic} />
        </section>

        <section className="px-3 pb-3 lg:px-4">
          <div className="rounded-[1.75rem] bg-slate-950 p-4 text-white shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div><div className="text-xs font-bold uppercase tracking-widest text-amber-300">Next Goal</div><div className="mt-1 text-lg font-black">{goal.label}</div></div>
              <div className="text-right text-sm font-black text-amber-300">{Math.min(goal.progress, goal.target).toLocaleString()} / {goal.target.toLocaleString()}</div>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${clamp((goal.progress / goal.target) * 100, 0, 100)}%` }} /></div>
          </div>
        </section>

        <nav className="hidden border-y border-black/5 bg-white/70 px-4 py-3 lg:block"><div className="flex gap-2 overflow-x-auto pb-1">{tabs.map(([id, label, icon]) => <TabButton key={id} active={tab === id} onClick={() => setTab(id)} icon={icon} label={label} />)}</div></nav>

        <main className="grid gap-4 p-3 lg:grid-cols-[1.35fr_.85fr] lg:p-4">
          <section className="min-h-[520px]">
            <AnimatePresence mode="wait"><motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .18 }}>
              {tab === "shop" && <ShopView game={game} traffic={traffic} stock={stock} nextDay={nextDay} />}
              {tab === "buy" && <Grid title="Distributor Market" sub="Stock what regulars are asking for. Pull-list requests pay better and build reputation." items={catalog} action={buyItem} cash={game.cash} requests={game.pullList} />}
              {tab === "build" && <Grid title="Build the Legend" sub="Upgrade from dusty box cave to cultural landmark." items={upgrades} action={buyUpgrade} cash={game.cash} owned={game.upgrades} />}
              {tab === "staff" && <Grid title="Hire Staff" sub={`Payroll right now: ${money(payroll)}/day. Good staff hurts the wallet and heals the shop.`} items={staff} action={hire} cash={game.cash} owned={game.staff} daily />}
              {tab === "events" && <Panel title="Events Calendar" sub="The best shop is not just a store. It is a clubhouse with receipts."><div className="grid gap-3 md:grid-cols-3">{events.map(ev => { const locked = ev.need && !game.upgrades.includes(ev.need); return <Card key={ev.id} item={ev} disabled={locked || game.cash < ev.cost} onClick={() => host(ev)} button="Host" note={locked ? "Requires Tournament Tables." : null} />; })}</div></Panel>}
              {tab === "rare" && <RareView game={game} buyRare={buyRare} sellRare={sellRare} />}
            </motion.div></AnimatePresence>
          </section>

          <aside className="space-y-4">
            <Panel title="City Around You" sub="Your little shop has to pull the whole neighborhood into orbit."><div className="grid grid-cols-4 gap-2 rounded-[1.5rem] bg-slate-100 p-2">{["🏪", "📚", "☕", "🛣️", "🏠", "🎮", "🍕", "📦", "🎭", "🏫", "🌳", "🚌"].map((x, i) => <div key={i} className={`flex aspect-square items-center justify-center rounded-2xl text-2xl shadow-sm ring-1 ring-black/5 ${i === 1 ? "bg-amber-200" : "bg-white"}`}>{x}</div>)}</div></Panel>
            <Panel title="Regulars Book" sub="Customers become part of the story."><div className="flex flex-wrap gap-2">{game.regulars.length === 0 ? <span className="text-sm text-slate-500">Open the shop to meet your first regulars.</span> : game.regulars.map(n => { const c = customers.find(x => x.name === n); return <Pill key={n}>{c?.icon} {n}</Pill>; })}</div></Panel>
            <section className="rounded-[1.75rem] bg-slate-950 p-5 text-white shadow-sm"><h2 className="text-xl font-black">Shop Feed</h2><p className="mb-3 text-sm text-slate-400">The latest counter gossip.</p><div className="space-y-3">{game.log.map((line, i) => <div key={`${line}-${i}`} className="rounded-2xl bg-white/10 p-3 text-sm text-slate-100 ring-1 ring-white/10">{line}</div>)}</div></section>
            <Panel title="Lifetime"><div className="grid grid-cols-2 gap-3"><Mini label="Sales" value={money(game.lifetimeSales)} /><Mini label="Visitors" value={game.lifetimeVisitors} /></div></Panel>
          </aside>
        </main>
      </div>
    </div>

    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+.45rem)] pt-2 shadow-2xl backdrop-blur lg:hidden"><div className="mx-auto grid max-w-lg grid-cols-6 gap-1">{tabs.map(([id, label, icon]) => <button key={id} onClick={() => setTab(id)} className={`rounded-2xl px-1 py-2 text-center transition active:scale-95 ${tab === id ? "bg-slate-950 text-white" : "text-slate-500"}`}><div className="text-lg leading-none">{icon}</div><div className="mt-1 text-[10px] font-black">{label}</div></button>)}</div></nav>

    <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="fixed left-3 right-3 top-3 z-50 mx-auto max-w-md rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-2xl ring-1 ring-white/10">{toast}</motion.div>}</AnimatePresence>
    <DayReport report={report} onClose={() => setReport(null)} />
  </div>;
}

function ShopView({ game, traffic, stock, nextDay }) {
  return <div className="grid gap-4 xl:grid-cols-[1fr_.85fr]">
    <Panel title="Shop Floor" sub={`Expected traffic: ${traffic} customers/day`}>
      <div className="mb-4 grid grid-cols-3 gap-2"><Mini label="Shelves" value={stock} /><Mini label="Upgrades" value={game.upgrades.length} /><Mini label="Staff" value={game.staff.length} /></div>
      <div className="grid grid-cols-5 gap-2 rounded-[1.75rem] bg-slate-100 p-3 sm:grid-cols-7">{Array.from({ length: 35 }).map((_, i) => { const owned = upgrades.filter(u => game.upgrades.includes(u.id)); const up = owned[i % Math.max(owned.length, 1)]; const item = game.inventory[i % Math.max(game.inventory.length, 1)]; const icon = i === 30 ? "💵" : i === 34 ? "🚪" : up?.icon || item?.icon || "▫️"; return <motion.div key={i} initial={{ scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * .008 }} className="flex aspect-square items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-black/5">{icon}</motion.div>; })}</div>
      <button onClick={nextDay} className="mt-4 w-full rounded-2xl bg-amber-400 px-4 py-4 text-base font-black text-slate-950 shadow-lg shadow-amber-500/20 active:scale-[.99] lg:hidden">Open Shop for the Day</button>
    </Panel>
    <div className="space-y-4">
      <PullListPanel pullList={game.pullList || []} />
      <Panel title="Inventory" sub="Keep shelves full or customers get tragic.">{game.inventory.length === 0 && <Notice>No regular inventory yet. Hit Buy and stock the shelves before opening too many days.</Notice>}<div className="space-y-3">{game.inventory.map(x => <Row key={x.id} icon={x.icon} title={x.name} detail={`Sells around ${money(x.price)}`} right={`${x.stock} left`} />)}</div></Panel>
    </div>
  </div>;
}

function PullListPanel({ pullList }) {
  return <Panel title="Pull List" sub="Regulars now ask you to hold specific items. Stock them before the timer runs out.">
    {pullList.length === 0 && <Notice>No active requests yet. Keep opening the shop and regulars will start asking for specific stuff.</Notice>}
    <div className="space-y-3">{pullList.map(req => <div key={req.id} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><div className="text-3xl">{req.customerIcon}</div><div><div className="font-black">{req.customerName}</div><div className="text-sm text-slate-600">wants {req.itemIcon} {req.itemName}</div><div className="mt-1 text-xs text-slate-500">“{req.quote}”</div></div></div><div className="text-right"><Pill>{req.due} days</Pill><div className="mt-2 text-sm font-black text-emerald-700">+{money(req.reward)}</div></div></div></div>)}</div>
  </Panel>;
}

function RareView({ game, buyRare, sellRare }) {
  return <Panel title="Rare Finds & Display Case" sub="Buy low, sell high, or hoard like a dragon with acid-free sleeves.">
    <div className="mb-6 grid gap-3 md:grid-cols-2">{rares.map(r => <Card key={r.id} item={r} disabled={game.cash < r.cost} onClick={() => buyRare(r)} button="Acquire" rare />)}</div>
    <h3 className="mb-3 text-xl font-black">Owned Rare Books</h3>
    <div className="grid gap-3 md:grid-cols-2">{game.rare.length === 0 && <Notice>No rare books yet. The display case hungers.</Notice>}{game.rare.map(r => <div key={r.uid} className="rounded-[1.75rem] bg-slate-950 p-4 text-white"><div className="flex items-start gap-3"><div className="text-4xl">{r.icon}</div><div><div className="font-black">{r.name}</div><div className="text-xs text-slate-300">{r.grade} · Bought {money(r.cost)} · Value {money(r.value)}</div></div></div><div className="mt-4"><Button gold onClick={() => sellRare(r.uid)}>Sell for {money(r.value)}</Button></div></div>)}</div>
  </Panel>;
}

function DayReport({ report, onClose }) {
  return <AnimatePresence>{report && <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <motion.div initial={{ y: 60, scale: .98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 60, scale: .98 }} onClick={e => e.stopPropagation()} className="w-full max-w-lg rounded-[2rem] bg-white p-5 shadow-2xl">
      <div className="mb-3 flex items-start justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-widest text-amber-600">Day {report.day} Report</div><h2 className="text-2xl font-black text-slate-950">{report.headline}</h2></div><div className="rounded-2xl bg-slate-100 p-3 text-3xl">{report.featured.icon}</div></div>
      <div className="mb-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600"><span className="font-black text-slate-950">{report.featured.name}:</span> “{report.featured.quote}”</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5"><Mini label="Visitors" value={report.visitors} /><Mini label="Sales" value={report.sales} /><Mini label="Gross" value={money(report.gross)} /><Mini label="Net" value={money(report.net)} /><Mini label="Pulls" value={report.fulfilled || 0} /></div>
      <div className="mt-4 space-y-2">{report.lines.length ? report.lines.slice(0, 7).map((line, i) => <div key={i} className="rounded-2xl bg-slate-950 p-3 text-sm font-semibold text-white">{line}</div>) : <Notice>Nobody bought anything today. The longboxes were quiet. Too quiet.</Notice>}</div>
      <button onClick={onClose} className="mt-4 w-full rounded-2xl bg-slate-950 px-4 py-4 text-sm font-black text-white active:scale-[.99]">Back to the Shop</button>
    </motion.div>
  </motion.div>}</AnimatePresence>;
}

function Button({ children, onClick, disabled, gold }) {
  return <button onClick={onClick} disabled={disabled} className={`rounded-xl px-4 py-2 text-sm font-black transition active:scale-[.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 ${gold ? "bg-amber-400 text-slate-950 hover:bg-amber-300" : "bg-slate-950 text-white hover:bg-slate-800"}`}>{children}</button>;
}

function TabButton({ active, onClick, icon, label }) {
  return <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-black transition ${active ? "bg-slate-950 text-white" : "bg-white text-slate-600 ring-1 ring-black/10 hover:bg-slate-50"}`}>{icon} {label}</button>;
}

function Stat({ label, value, sub, hot }) {
  return <div className={`rounded-2xl p-3 shadow-sm ring-1 ring-black/5 ${hot ? "bg-slate-950 text-white" : "bg-white/90 text-slate-950"}`}><div className={`text-[10px] font-black uppercase tracking-wide ${hot ? "text-amber-300" : "text-slate-500"}`}>{label}</div><div className="mt-1 truncate text-lg font-black sm:text-2xl">{value}</div>{sub && <div className={`mt-1 truncate text-[10px] ${hot ? "text-slate-300" : "text-slate-500"}`}>{sub}</div>}</div>;
}

function Panel({ title, sub, children }) {
  return <section className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5"><div className="mb-4"><h2 className="text-xl font-black sm:text-2xl">{title}</h2>{sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}</div>{children}</section>;
}

function Notice({ children }) {
  return <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900 ring-1 ring-amber-100">{children}</div>;
}

function Mini({ label, value }) {
  return <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5"><div className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</div><div className="mt-1 truncate text-lg font-black">{value}</div></div>;
}

function Pill({ children }) {
  return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-black/5">{children}</span>;
}

function Row({ icon, title, detail, right }) {
  return <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5"><div className="flex min-w-0 items-center gap-3"><div className="text-2xl">{icon}</div><div className="min-w-0"><div className="truncate font-black">{title}</div><div className="truncate text-xs text-slate-500">{detail}</div></div></div><Pill>{right}</Pill></div>;
}

function Card({ item, disabled, onClick, button = "Buy", note, rare, requested }) {
  const gradient = rare ? "from-amber-50 to-yellow-100 ring-amber-200" : item.color ? `${item.color} ring-black/5` : "from-slate-50 to-slate-100 ring-black/5";
  return <div className={`rounded-[1.75rem] bg-gradient-to-br ${gradient} p-4 ring-1`}><div className="mb-2 flex items-start justify-between"><div className="text-4xl">{item.icon}</div><div className="flex flex-col items-end gap-2">{requested && <span className="rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-black text-white">REQUESTED</span>}{item.grade && <Pill>{item.grade}</Pill>}</div></div><h3 className="text-lg font-black">{item.name}</h3>{item.role && <div className="text-sm font-bold text-slate-500">{item.role}</div>}<p className="mt-1 min-h-12 text-sm text-slate-600">{item.desc}</p><div className="my-4 flex flex-wrap gap-2"><Pill>{item.cost ? money(item.cost) : ""}{item.cost && item.role ? "/day" : ""}</Pill>{item.units && <Pill>{item.units} units</Pill>}{item.price && <Pill>Base {money(item.price)}</Pill>}{item.value && <Pill>Value {money(item.value)}</Pill>}{item.rep !== undefined && <Pill>Rep +{item.rep}</Pill>}{item.traffic !== undefined && <Pill>Traffic +{item.traffic}</Pill>}{item.visitors && <Pill>{item.visitors} visitors</Pill>}</div>{note && <p className="mb-3 text-xs font-black text-rose-600">{note}</p>}<Button gold={rare || button.includes("Host") || button.includes("Acquire")} disabled={disabled} onClick={onClick}>{button}</Button></div>;
}

function Grid({ title, sub, items, action, cash, owned = [], daily, requests = [] }) {
  return <Panel title={title} sub={sub}><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{items.map(item => <Card key={item.id} item={item} requested={requests.some(req => req.itemId === item.id)} disabled={cash < item.cost || owned.includes(item.id)} onClick={() => action(item)} button={owned.includes(item.id) ? (daily ? "Hired" : "Owned") : (daily ? "Hire" : "Buy")} />)}</div></Panel>;
}
