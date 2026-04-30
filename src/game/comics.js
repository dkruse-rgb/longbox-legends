import { addLog, getCollection, getSave, getUpgrades, setSave } from "./save";

export const COMICS = [
  { id: "possum-1", title: "Possum Knight #1", icon: "🦝", rarity: "Rare", grade: "VF", value: 360, prestige: 5, tag: "Back Issue", desc: "First appearance of a hero who plays dead until issue six." },
  { id: "janitor-7", title: "Galaxy Janitor #7", icon: "🧹", rarity: "Uncommon", grade: "Fine", value: 220, prestige: 3, tag: "Sci-Fi", desc: "The mop variant. Absurdly rare for reasons nobody can explain." },
  { id: "liability-alpha", title: "Captain Liability: Alpha Variant", icon: "🛡️", rarity: "Epic", grade: "NM", value: 620, prestige: 8, tag: "Variant", desc: "A lawsuit in tights. Collectors love it against their better judgment." },
  { id: "tax-audit", title: "Tax Man: Audit War", icon: "💼", rarity: "Epic", grade: "9.2 Slab", value: 980, prestige: 12, tag: "Slab", desc: "The scariest villain is itemized deductions." },
  { id: "bulk-order", title: "The Incredible Bulk Order #3", icon: "📦", rarity: "Common", grade: "VG", value: 95, prestige: 1, tag: "Comedy", desc: "He gets stronger every time a distributor shorts the shipment." },
  { id: "moth-lawyer", title: "Moth Lawyer #3", icon: "🦋", rarity: "Rare", grade: "FN+", value: 410, prestige: 6, tag: "Indie", desc: "Drawn to justice. Also porch lights." },
  { id: "vampire-1", title: "Emotional Support Vampire #1", icon: "🧛", rarity: "Uncommon", grade: "VF-", value: 180, prestige: 3, tag: "Horror", desc: "He drains your anxiety, then asks for permission to enter group therapy." },
  { id: "refund-squad", title: "Refund Squad Annual", icon: "🧾", rarity: "Common", grade: "Good", value: 70, prestige: 1, tag: "Comedy", desc: "A team of heroes returns defective superpowers within thirty days." },
  { id: "printer-goblin", title: "Printer Goblin #0", icon: "🖨️", rarity: "Rare", grade: "VF/NM", value: 330, prestige: 5, tag: "Indie", desc: "Every page is slightly misaligned. Somehow that made it collectible." },
  { id: "quarter-bin", title: "Quarter Bin Oracle #12", icon: "🔮", rarity: "Common", grade: "Reader", value: 45, prestige: 1, tag: "Back Issue", desc: "Predicts the exact book you should have bought yesterday." },
  { id: "doom-coupon", title: "Doctor Doom Coupon Special", icon: "🎟️", rarity: "Uncommon", grade: "VF", value: 155, prestige: 2, tag: "Promo", desc: "One free world domination with purchase of two trades." },
  { id: "bag-board", title: "Bag & Board Barbarian #1", icon: "⚔️", rarity: "Rare", grade: "NM-", value: 390, prestige: 5, tag: "Fantasy", desc: "He protects mint condition with a broadsword and acid-free backing boards." }
];

export const RARITY_WEIGHTS = { Common: 54, Uncommon: 26, Rare: 15, Epic: 5 };
export const SCOUT_RARITY_WEIGHTS = { Common: 72, Uncommon: 22, Rare: 5, Epic: 1 };

export const RARITY_COLORS = {
  Common: "bg-slate-100 text-slate-700",
  Uncommon: "bg-emerald-100 text-emerald-800",
  Rare: "bg-sky-100 text-sky-800",
  Epic: "bg-amber-100 text-amber-900"
};

export function weightedComicPick(weights = RARITY_WEIGHTS) {
  const pool = [];
  COMICS.forEach(comic => {
    const weight = weights[comic.rarity] || 1;
    for (let i = 0; i < weight; i += 1) pool.push(comic);
  });
  return pool[Math.floor(Math.random() * pool.length)];
}

export function makeComic(day = 1, source = "Shop Find", weights = RARITY_WEIGHTS) {
  const base = weightedComicPick(weights);
  const gradeRoll = Math.random();
  const gradeSuffix = base.grade.includes("Slab") ? "" : gradeRoll > 0.9 ? "+" : gradeRoll < 0.12 ? "-" : "";
  const valueMod = gradeRoll > 0.9 ? 1.25 : gradeRoll < 0.12 ? 0.82 : 1;
  return {
    ...base,
    uid: `${base.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    foundDay: day,
    foundSource: source,
    grade: base.grade.includes("Slab") ? base.grade : `${base.grade}${gradeSuffix}`,
    value: Math.round(base.value * valueMod),
    displayed: false
  };
}

export function collectionStats(owned = getCollection()) {
  return {
    value: owned.reduce((sum, comic) => sum + (Number(comic.value) || 0), 0),
    prestige: owned.filter(c => c.displayed).reduce((sum, comic) => sum + (Number(comic.prestige) || 0), 0),
    displayed: owned.filter(c => c.displayed).length,
    rarePlus: owned.filter(c => ["Rare", "Epic"].includes(c.rarity)).length
  };
}

export function naturalFindChance(save = getSave()) {
  const upgrades = getUpgrades(save);
  let chance = 0.18;
  if (upgrades.includes("wall")) chance += 0.1;
  if (upgrades.includes("case")) chance += 0.08;
  if (upgrades.includes("sign")) chance += 0.03;
  if ((save?.day || 1) % 7 === 0) chance += 0.06;
  if ((save?.rep || 0) >= 25) chance += 0.04;
  return Math.min(0.5, chance);
}

export function addComicToCollection(comic) {
  const save = getSave() || {};
  const next = addLog({
    ...save,
    comicCollection: [comic, ...getCollection(save)].slice(0, 100),
    rep: Math.min(100, (Number(save.rep) || 0) + Math.max(1, Math.floor((comic.prestige || 1) / 4)))
  }, `Comic find: ${comic.title} (${comic.rarity}, ${comic.grade}).`);
  setSave(next);
  window.dispatchEvent(new CustomEvent("longbox-collection-changed", { detail: { found: comic } }));
  return comic;
}
