import { addLog, getCollection, getInventory, getPullList, getSave, getUpgrades, setSave, totalLoyalty, totalStock } from "./save";

const STOCK_TEMPLATES = {
  new: { id: "new", name: "New Release Comics", icon: "📚", stock: 0, price: 8, tags: ["casual", "collector", "kid"] },
  manga: { id: "manga", name: "Manga Volumes", icon: "🌸", stock: 0, price: 13, tags: ["manga", "kid", "casual"] },
  cards: { id: "cards", name: "Trading Card Packs", icon: "🃏", stock: 0, price: 11, tags: ["card", "kid", "speculator"] },
  back: { id: "back", name: "Back Issue Bundle", icon: "🗃️", stock: 0, price: 9, tags: ["collector", "speculator"] },
  figures: { id: "figures", name: "Collectible Figures", icon: "🧸", stock: 0, price: 24, tags: ["collector", "casual", "cosplay"] },
  zines: { id: "zines", name: "Local Indie Zines", icon: "✍️", stock: 0, price: 6, tags: ["artist", "casual"] }
};

export const MISSION_STATE_KEY = "longbox-mission-state-v1";

export const TUTORIAL_MISSIONS = [
  {
    id: "first_day",
    group: "Shop Basics",
    title: "Open the Doors",
    desc: "Open the shop for at least one day.",
    reward: "+$75 and +4 New Releases",
    check: save => (save?.day || 1) >= 2,
    prize: { cash: 75, rep: 1, stock: { new: 4 } }
  },
  {
    id: "first_stock",
    group: "Shop Basics",
    title: "Fill the Shelves",
    desc: "Reach 20 total stock.",
    reward: "+$100 and +5 Manga",
    check: save => totalStock(save) >= 20,
    prize: { cash: 100, stock: { manga: 5 } }
  },
  {
    id: "pull_list_one",
    group: "Regulars",
    title: "Make a Regular Happy",
    desc: "Fill your first pull-list request.",
    reward: "+$150 and +3 reputation",
    check: save => (save?.fulfilledPulls || 0) >= 1,
    prize: { cash: 150, rep: 3 }
  },
  {
    id: "trend_hunter",
    group: "Sales",
    title: "Ride the Trend",
    desc: "Make 5 trend sales.",
    reward: "+$180 and +6 Card Packs",
    check: save => (save?.trendWins || 0) >= 5,
    prize: { cash: 180, stock: { cards: 6 } }
  },
  {
    id: "first_upgrade",
    group: "Build",
    title: "Improve the Shop",
    desc: "Build your first upgrade.",
    reward: "+$125 and +2 reputation",
    check: save => getUpgrades(save).length >= 1,
    prize: { cash: 125, rep: 2 }
  },
  {
    id: "fan_base",
    group: "Regulars",
    title: "Build a Fanbase",
    desc: "Reach 50 total customer loyalty.",
    reward: "+$200 and +4 reputation",
    check: save => totalLoyalty(save) >= 50,
    prize: { cash: 200, rep: 4 }
  },
  {
    id: "debt_control",
    group: "Money",
    title: "Clean Up the Books",
    desc: "Get debt below $50 after day 8.",
    reward: "+$250 and +5 reputation",
    check: save => (save?.debt || 0) < 50 && (save?.day || 1) >= 8,
    prize: { cash: 250, rep: 5 }
  },
  {
    id: "neighborhood_shop",
    group: "Reputation",
    title: "Neighborhood Name",
    desc: "Reach 25 reputation.",
    reward: "+$300 and +8 Back Issues",
    check: save => (save?.rep || 0) >= 25,
    prize: { cash: 300, stock: { back: 8 } }
  }
];

export const COLLECTION_MISSIONS = [
  {
    id: "collect3",
    group: "Collection",
    title: "Start a Wall of Weird",
    desc: "Own 3 collectible comics.",
    reward: "+$125 and +2 reputation",
    check: save => getCollection(save).length >= 3,
    prize: { cash: 125, rep: 2 }
  },
  {
    id: "display1",
    group: "Collection",
    title: "Showpiece",
    desc: "Display your first collectible comic.",
    reward: "+$150 and +3 reputation",
    check: save => getCollection(save).some(comic => comic.displayed),
    prize: { cash: 150, rep: 3 }
  },
  {
    id: "rare2",
    group: "Collection",
    title: "Collector Bait",
    desc: "Own 2 Rare or Epic comics.",
    reward: "+$225 and +4 reputation",
    check: save => getCollection(save).filter(comic => ["Rare", "Epic"].includes(comic.rarity)).length >= 2,
    prize: { cash: 225, rep: 4 }
  },
  {
    id: "value1000",
    group: "Collection",
    title: "Glass Case Energy",
    desc: "Reach $1,000 total collection value.",
    reward: "+$300 and +5 reputation",
    check: save => getCollection(save).reduce((sum, comic) => sum + (Number(comic.value) || 0), 0) >= 1000,
    prize: { cash: 300, rep: 5 }
  },
  {
    id: "epic1",
    group: "Collection",
    title: "Wall Book Found",
    desc: "Own your first Epic comic.",
    reward: "+$500 and +7 reputation",
    check: save => getCollection(save).some(comic => comic.rarity === "Epic"),
    prize: { cash: 500, rep: 7 }
  }
];

export const ALL_MISSIONS = [...TUTORIAL_MISSIONS, ...COLLECTION_MISSIONS];

export function getMissionState() {
  try {
    const stored = JSON.parse(localStorage.getItem(MISSION_STATE_KEY));
    return { claimed: Array.isArray(stored?.claimed) ? stored.claimed : [] };
  } catch {
    return { claimed: [] };
  }
}

export function setMissionState(state) {
  localStorage.setItem(MISSION_STATE_KEY, JSON.stringify({ claimed: Array.isArray(state?.claimed) ? state.claimed : [] }));
  window.dispatchEvent(new CustomEvent("longbox-missions-changed", { detail: { state } }));
}

export function addStockReward(inventory, stockReward = {}) {
  let next = Array.isArray(inventory) ? [...inventory] : [];
  Object.entries(stockReward).forEach(([id, amount]) => {
    const template = STOCK_TEMPLATES[id];
    if (!template) return;
    const existing = next.find(item => item.id === id);
    if (existing) {
      next = next.map(item => item.id === id ? { ...item, stock: (Number(item.stock) || 0) + amount } : item);
    } else {
      next.push({ ...template, stock: amount });
    }
  });
  return next;
}

export function applyMissionPrize(save, prize = {}) {
  return addLog({
    ...save,
    cash: Math.max(0, Number(save?.cash) || 0) + (prize.cash || 0),
    rep: Math.min(100, Math.max(0, (Number(save?.rep) || 0) + (prize.rep || 0))),
    debt: Math.max(0, (Number(save?.debt) || 0) - (prize.debtPaydown || 0)),
    inventory: addStockReward(getInventory(save), prize.stock)
  }, `Mission reward claimed${prize.cash ? `: +$${prize.cash}` : ""}${prize.rep ? `, +${prize.rep} rep` : ""}${prize.stock ? ", +inventory" : ""}.`);
}

export function getMissionProgress(save = getSave(), missions = ALL_MISSIONS, state = getMissionState()) {
  const safeSave = save || {};
  const claimed = new Set(state.claimed || []);
  return missions.map(mission => ({
    ...mission,
    complete: !!mission.check(safeSave),
    claimed: claimed.has(mission.id)
  }));
}

export function claimMission(missionId, missions = ALL_MISSIONS) {
  const save = getSave() || {};
  const state = getMissionState();
  const mission = missions.find(item => item.id === missionId);
  if (!mission || state.claimed.includes(missionId) || !mission.check(save)) return { ok: false, save, state };

  const nextSave = applyMissionPrize(save, mission.prize);
  const nextState = { claimed: [...state.claimed, missionId] };
  setSave(nextSave);
  setMissionState(nextState);
  return { ok: true, mission, save: nextSave, state: nextState };
}
