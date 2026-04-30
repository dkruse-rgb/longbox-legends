import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const STORAGE_KEY = "longbox-legends-save-v1";

const catalog = [
  { id: "new", name: "New Release Comics", icon: "📚", cost: 60, units: 12, price: 8, tags: ["casual", "collector", "kid"], desc: "Fresh weekly books for Wednesday warriors." },
  { id: "back", name: "Back Issue Bundle", icon: "🗃️", cost: 95, units: 18, price: 9, tags: ["collector", "speculator"], desc: "Longbox treasure. Mostly filler, sometimes fire." },
  { id: "manga", name: "Manga Volumes", icon: "🌸", cost: 80, units: 10, price: 13, tags: ["manga", "kid", "casual"], desc: "Reliable movers with loyal readers." },
  { id: "cards", name: "Trading Card Packs", icon: "🃏", cost: 120, units: 16, price: 11, tags: ["card", "kid", "speculator"], desc: "Tiny cardboard lottery tickets. Legal magic." },
  { id: "figures", name: "Collectible Figures", icon: "🧸", cost: 140, units: 8, price: 24, tags: ["collector", "casual", "cosplay"], desc: "High-margin shelf candy." },
  { id: "zines", name: "Local Indie Zines", icon: "✍️", cost: 45, units: 15, price: 6, tags: ["artist", "casual"], desc: "Support the scene. Build street cred." }
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
  { id: "mo", name: "Mo the Comic Expert", icon: "🤓", role: "Recommender", cost: 55, rep: 3, traffic: 0, desc: "Customers buy more often when Mo starts lore-dumping." },
  { id: "ava", name: "Ava the Event Host", icon: "🎤", role: "Community Builder", cost: 75, rep: 4, traffic: 1, desc: "Events gain extra reputation and better vibes." }
];

const events = [
  { id: "free", name: "Free Comic Day", icon: "🎁", cost: 120, rep: 7, visitors: 7, desc: "Give away books, gain lifelong readers." },
  { id: "card", name: "Friday Card Night", icon: "🃏", cost: 160, rep: 6, visitors: 10, need: "tables", desc: "Tournament tables turn this into a money printer." },
  { id: "artist", name: "Local Artist Signing", icon: "🖊️", cost: 220, rep: 12, visitors: 8, desc: "Your shop becomes part of the local comics scene." }
];

const customers = [
  { name: "Mikey the Manga Kid", type: "manga", icon: "🎒" },
  { name: "Sandra the Serious Collector", type: "collector", icon: "🧐" },
  { name: "Derek the Speculator", type: "speculator", icon: "📈" },
  { name: "Card Table Carl", type: "card", icon: "🧢" },
  { name: "Ava the Local Artist", type: "artist", icon: "🎨" },
  { name: "Casual Browser Kim", type: "casual", icon: "☕" },
  { name: "Cosplay Nina", type: "cosplay", icon: "🧵" },
  { name: "Tiny Titan Tim", type: "kid", icon: "🦸" }
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
  lifetimeSales: 0,
  lifetimeVisitors: 0,
  log: ["You unlocked a tiny comic shop with big main-character energy."]
};

const cash = n => `$${Math.round(n).toLocaleString()}`;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

function Button({ children, onClick, disabled, gold }) {
  return <button onClick={onClick} disabled={disabled} className={`rounded-xl px-4 py-2 text-sm font-black transition active:scale-[.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 ${gold ? "bg-amber-500 text-slate-950 hover:bg-amber-400" : "bg-slate-950 text-white hover:bg-slate-800"}`}>{children}</button>;
}

function Stat({ label, value, sub }) {
  return <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5"><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div><div className="mt-1 text-2xl font-black">{value}</div>{sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}</div>;
}

function Pill({ children }) {
  return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{children}</span>;
}

function addStock(inv, item) {
  const found = inv.find(x => x.id === item.id);
  if (found) return inv.map(x => x.id === item.id ? { ...x, stock: x.stock + item.units } : x);
  return [...inv, { id: item.id, name: item.name, icon: item.icon, stock: item.units, price: item.price, tags: item.tags }];
}

export default function App() {
  const [game, setGame] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || start; } catch { return start; }
  });
  const [tab, setTab] = useState("shop");

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(game)), [game]);

  const payroll = useMemo(() => game.staff.reduce((s, id) => s + (staff.find(x => x.id === id)?.cost || 0), 0), [game.staff]);
  const traffic = useMemo(() => {
    const up = game.upgrades.reduce((s, id) => s + (upgrades.find(x => x.id === id)?.traffic || 0), 0);
    const st = game.staff.reduce((s, id) => s + (staff.find(x => x.id === id)?.traffic || 0), 0);
    const rarePrestige = game.rare.reduce((s, x) => s + x.prestige, 0);
    return 4 + up + st + Math.floor(game.rep / 10) + Math.floor(rarePrestige / 8);
  }, [game]);
  const stock = game.inventory.reduce((s, x) => s + x.stock, 0) + game.rare.length;
  const level = Math.floor(game.xp / 150) + 1;

  function buyItem(item) {
    if (game.cash < item.cost) return;
    setGame(g => ({ ...g, cash: g.cash - item.cost, inventory: addStock(g.inventory, item), log: [`Bought ${item.units}x ${item.name} for ${cash(item.cost)}.`, ...g.log].slice(0, 8) }));
  }

  function buyUpgrade(up) {
    if (game.cash < up.cost || game.upgrades.includes(up.id)) return;
    setGame(g => ({ ...g, cash: g.cash - up.cost, rep: g.rep + up.rep, upgrades: [...g.upgrades, up.id], log: [`Built ${up.name}. Reputation +${up.rep}.`, ...g.log].slice(0, 8) }));
  }

  function hire(person) {
    if (game.cash < person.cost || game.staff.includes(person.id)) return;
    setGame(g => ({ ...g, cash: g.cash - person.cost, rep: g.rep + person.rep, staff: [...g.staff, person.id], log: [`Hired ${person.name} for ${cash(person.cost)}/day.`, ...g.log].slice(0, 8) }));
  }

  function buyRare(item) {
    if (game.cash < item.cost) return;
    setGame(g => ({ ...g, cash: g.cash - item.cost, rep: g.rep + Math.ceil(item.prestige / 2), rare: [...g.rare, { ...item, uid: `${item.id}-${Date.now()}` }], log: [`Rare pickup: ${item.name} ${item.grade}. The display case just got louder.`, ...g.log].slice(0, 8) }));
  }

  function sellRare(uid) {
    const item = game.rare.find(x => x.uid === uid);
    if (!item) return;
    setGame(g => ({ ...g, cash: g.cash + item.value, xp: g.xp + Math.floor(item.value / 5), rare: g.rare.filter(x => x.uid !== uid), lifetimeSales: g.lifetimeSales + item.value, log: [`Sold ${item.name} for ${cash(item.value)}. Painful goodbye, beautiful margin.`, ...g.log].slice(0, 8) }));
  }

  function host(ev) {
    const locked = ev.need && !game.upgrades.includes(ev.need);
    if (locked || game.cash < ev.cost) return;
    const bonus = game.staff.includes("ava") ? 4 : 0;
    const sales = ev.visitors * (7 + Math.floor(game.rep / 12));
    setGame(g => ({ ...g, cash: g.cash - ev.cost + sales, rep: g.rep + ev.rep + bonus, hype: clamp(g.hype + ev.visitors, 0, 40), xp: g.xp + ev.visitors * 8, lifetimeVisitors: g.lifetimeVisitors + ev.visitors, lifetimeSales: g.lifetimeSales + sales, log: [`${ev.name} brought ${ev.visitors} extra visitors and earned ${cash(sales)} in buzz sales.`, ...g.log].slice(0, 8) }));
  }

  function nextDay() {
    let inv = [...game.inventory];
    let rare = [...game.rare];
    let sales = 0;
    let gross = 0;
    let repDelta = 0;
    const regulars = new Set(game.regulars);
    const visitors = clamp(traffic + Math.floor(game.hype / 5) + Math.floor(Math.random() * 5), 2, 35);
    const lines = [];

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
        inv = inv.map(x => x.id === item.id ? { ...x, stock: x.stock - 1 } : x);
        if (lines.length < 3) lines.push(`${c.icon} ${c.name} bought ${item.name} for ${cash(price)}.`);
      } else if (!choices.length) {
        repDelta--;
        if (lines.length < 3) lines.push(`${c.icon} ${c.name} found empty shelves. The aura took damage.`);
      }
    }

    if (Math.random() < 0.13 + (game.upgrades.includes("case") ? 0.05 : 0)) {
      const item = pick(rares);
      if (game.cash + gross >= item.cost && Math.random() < 0.55) {
        gross -= item.cost;
        rare = [...rare, { ...item, uid: `${item.id}-${Date.now()}` }];
        repDelta += 2;
        lines.unshift(`A customer traded in ${item.name}. You pounced before they checked the internet.`);
      } else {
        lines.unshift("A rare collection walked in, but you did not have enough loose cash to pounce.");
      }
    }

    const rent = 25 + game.upgrades.length * 8;
    const net = gross - payroll - rent;
    setGame(g => ({
      ...g,
      day: g.day + 1,
      cash: g.cash + net,
      rep: clamp(g.rep + repDelta + (sales >= Math.floor(visitors / 2) ? 1 : 0) + (stock < 8 ? -2 : 0), 0, 100),
      hype: clamp(g.hype - 3, 0, 40),
      xp: g.xp + visitors * 3 + sales * 5,
      inventory: inv,
      rare,
      regulars: Array.from(regulars),
      lifetimeSales: g.lifetimeSales + Math.max(0, gross),
      lifetimeVisitors: g.lifetimeVisitors + visitors,
      log: [`Day ${g.day}: ${visitors} visitors, ${sales} sales, ${cash(gross)} gross. Rent/payroll: ${cash(payroll + rent)}. Net: ${cash(net)}.`, ...lines, ...g.log].slice(0, 8)
    }));
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setGame(start);
    setTab("shop");
  }

  const tabs = [["shop", "Shop"], ["buy", "Buy"], ["rare", "Rare"], ["build", "Build"], ["events", "Events"], ["staff", "Staff"]];

  return <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-slate-100 p-3 text-slate-900 sm:p-6">
    <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-white/75 shadow-2xl ring-1 ring-black/5 backdrop-blur">
      <header className="relative border-b border-black/5 bg-slate-950 p-6 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #f59e0b, transparent 28%), radial-gradient(circle at 80% 0%, #38bdf8, transparent 25%)" }} />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div><div className="mb-2 inline-flex rounded-full bg-amber-400 px-3 py-1 text-xs font-black uppercase tracking-widest text-slate-950">Comic Shop Tycoon Prototype</div><h1 className="text-4xl font-black tracking-tight sm:text-6xl">Longbox Legends</h1><p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">Build a dusty little longbox cave into the city’s favorite comics, cards, manga, and collectibles kingdom.</p></div>
          <div className="flex flex-wrap gap-2"><Button gold onClick={nextDay}>Open Shop: Next Day</Button><button onClick={reset} className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-900 ring-1 ring-black/10">Reset</button></div>
        </div>
      </header>

      <section className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6"><Stat label="Cash" value={cash(game.cash)} sub="Saved automatically" /><Stat label="Day" value={game.day} /><Stat label="Reputation" value={`${game.rep}/100`} /><Stat label="Hype" value={game.hype} /><Stat label="Level" value={level} sub={`${game.xp} XP`} /><Stat label="Stock" value={stock} /></section>

      <nav className="border-y border-black/5 bg-white/70 px-4 py-3"><div className="flex gap-2 overflow-x-auto pb-1">{tabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`rounded-full px-4 py-2 text-sm font-black transition ${tab === id ? "bg-slate-950 text-white" : "bg-white text-slate-600 ring-1 ring-black/10"}`}>{label}</button>)}</div></nav>

      <main className="grid gap-4 p-4 lg:grid-cols-[1.4fr_.8fr]">
        <section className="min-h-[520px]">
          {tab === "shop" && <div className="grid gap-4 xl:grid-cols-[1fr_.85fr]"><Panel title="Shop Floor" sub={`Traffic score ${traffic}`}><div className="grid grid-cols-5 gap-2 rounded-3xl bg-slate-100 p-3 sm:grid-cols-7">{Array.from({ length: 35 }).map((_, i) => { const owned = upgrades.filter(u => game.upgrades.includes(u.id)); const up = owned[i % Math.max(owned.length, 1)]; const item = game.inventory[i % Math.max(game.inventory.length, 1)]; const icon = i === 30 ? "💵" : i === 34 ? "🚪" : up?.icon || item?.icon || "▫️"; return <motion.div key={i} initial={{ scale: .94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * .01 }} className="flex aspect-square items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-black/5">{icon}</motion.div>; })}</div></Panel><Panel title="Inventory" sub="Keep shelves full or customers get tragic.">{game.inventory.length === 0 && <Notice>No regular inventory yet. Buy stock before opening too many days.</Notice>}{game.inventory.map(x => <Row key={x.id} icon={x.icon} title={x.name} detail={`Sells around ${cash(x.price)}`} right={`${x.stock} left`} />)}</Panel></div>}
          {tab === "buy" && <Grid title="Distributor Market" sub="Buy inventory. The shelves do not fill themselves, sadly." items={catalog} action={buyItem} cash={game.cash} />}
          {tab === "build" && <Grid title="Build the Legend" sub="Upgrade from dusty box cave to cultural landmark." items={upgrades} action={buyUpgrade} cash={game.cash} owned={game.upgrades} />}
          {tab === "staff" && <Grid title="Hire Staff" sub="Staff cost money every day, but they make the shop feel alive." items={staff} action={hire} cash={game.cash} owned={game.staff} daily />}
          {tab === "events" && <Panel title="Events Calendar" sub="The best shop is a clubhouse with receipts."><div className="grid gap-3 md:grid-cols-3">{events.map(ev => { const locked = ev.need && !game.upgrades.includes(ev.need); return <Card key={ev.id} item={ev} disabled={locked || game.cash < ev.cost} onClick={() => host(ev)} button="Host Event" note={locked ? "Requires Tournament Tables." : null} />; })}</div></Panel>}
          {tab === "rare" && <Panel title="Rare Finds & Display Case" sub="Buy low, sell high, or hoard like a dragon with acid-free sleeves."><div className="mb-6 grid gap-3 md:grid-cols-2">{rares.map(r => <Card key={r.id} item={r} disabled={game.cash < r.cost} onClick={() => buyRare(r)} button="Acquire" rare />)}</div><h3 className="mb-3 text-xl font-black">Owned Rare Books</h3><div className="grid gap-3 md:grid-cols-2">{game.rare.length === 0 && <Notice>No rare books yet. The display case hungers.</Notice>}{game.rare.map(r => <div key={r.uid} className="rounded-3xl bg-slate-950 p-4 text-white"><div className="flex items-start gap-3"><div className="text-4xl">{r.icon}</div><div><div className="font-black">{r.name}</div><div className="text-xs text-slate-300">{r.grade} · Bought {cash(r.cost)} · Value {cash(r.value)}</div></div></div><div className="mt-4"><Button gold onClick={() => sellRare(r.uid)}>Sell for {cash(r.value)}</Button></div></div>)}</div></Panel>}
        </section>

        <aside className="space-y-4"><Panel title="City Around You" sub="A little neighborhood map for the app feel."><div className="grid grid-cols-4 gap-2 rounded-3xl bg-slate-100 p-3">{["🏪", "📚", "☕", "🛣️", "🏠", "🎮", "🍕", "📦", "🎭", "🏫", "🌳", "🚌"].map((x, i) => <div key={i} className={`flex aspect-square items-center justify-center rounded-2xl text-2xl shadow-sm ring-1 ring-black/5 ${i === 1 ? "bg-amber-200" : "bg-white"}`}>{x}</div>)}</div></Panel><Panel title="Regulars Book" sub="Customers become part of the story."><div className="flex flex-wrap gap-2">{game.regulars.length === 0 ? <span className="text-sm text-slate-500">Open the shop to meet your first regulars.</span> : game.regulars.map(n => { const c = customers.find(x => x.name === n); return <Pill key={n}>{c?.icon} {n}</Pill>; })}</div></Panel><section className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm"><h2 className="text-xl font-black">Shop Feed</h2><p className="mb-3 text-sm text-slate-400">What happened lately.</p><div className="space-y-3">{game.log.map((line, i) => <div key={i} className="rounded-2xl bg-white/10 p-3 text-sm text-slate-100 ring-1 ring-white/10">{line}</div>)}</div></section><Panel title="Lifetime"><div className="grid grid-cols-2 gap-3"><Mini label="Sales" value={cash(game.lifetimeSales)} /><Mini label="Visitors" value={game.lifetimeVisitors} /></div></Panel></aside>
      </main>
    </div>
  </div>;
}

function Panel({ title, sub, children }) { return <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5"><div className="mb-4"><h2 className="text-2xl font-black">{title}</h2>{sub && <p className="text-sm text-slate-500">{sub}</p>}</div>{children}</section>; }
function Notice({ children }) { return <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">{children}</div>; }
function Mini({ label, value }) { return <div className="rounded-2xl bg-slate-50 p-3"><div className="text-xs font-bold text-slate-500">{label}</div><div className="text-lg font-black">{value}</div></div>; }
function Row({ icon, title, detail, right }) { return <div className="mb-3 flex items-center justify-between rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5"><div className="flex items-center gap-3"><div className="text-2xl">{icon}</div><div><div className="font-black">{title}</div><div className="text-xs text-slate-500">{detail}</div></div></div><Pill>{right}</Pill></div>; }
function Card({ item, disabled, onClick, button = "Buy", note, rare }) { return <div className={`rounded-3xl p-4 ring-1 ${rare ? "bg-amber-50 ring-amber-200" : "bg-slate-50 ring-black/5"}`}><div className="mb-2 flex items-start justify-between"><div className="text-4xl">{item.icon}</div>{item.grade && <Pill>{item.grade}</Pill>}</div><h3 className="text-lg font-black">{item.name}</h3>{item.role && <div className="text-sm font-bold text-slate-500">{item.role}</div>}<p className="mt-1 min-h-12 text-sm text-slate-500">{item.desc}</p><div className="my-4 flex flex-wrap gap-2"><Pill>{item.cost ? cash(item.cost) : ""}{item.cost && item.role ? "/day" : ""}</Pill>{item.units && <Pill>{item.units} units</Pill>}{item.price && <Pill>Base {cash(item.price)}</Pill>}{item.value && <Pill>Value {cash(item.value)}</Pill>}{item.rep !== undefined && <Pill>Rep +{item.rep}</Pill>}{item.traffic !== undefined && <Pill>Traffic +{item.traffic}</Pill>}{item.visitors && <Pill>{item.visitors} visitors</Pill>}</div>{note && <p className="mb-3 text-xs font-bold text-rose-500">{note}</p>}<Button gold={rare || button.includes("Host")} disabled={disabled} onClick={onClick}>{button}</Button></div>; }
function Grid({ title, sub, items, action, cash: moneyNow, owned = [], daily }) { return <Panel title={title} sub={sub}><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{items.map(item => <Card key={item.id} item={item} disabled={moneyNow < item.cost || owned.includes(item.id)} onClick={() => action(item)} button={owned.includes(item.id) ? (daily ? "Hired" : "Owned") : (daily ? "Hire" : "Buy")} />)}</div></Panel>; }
