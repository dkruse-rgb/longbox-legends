import { addLog, getCollection, getInventory, getSave, getUpgrades, setSave, totalLoyalty, totalStock } from "./save";

const STOCK_TEMPLATES = {
  new: { id: "new", name: "New Release Comics", icon: "📚", stock: 0, price: 8, tags: ["casual", "collector", "kid"] },
  manga: { id: "manga", name: "Manga Volumes", icon: "🌸", stock: 0, price: 13, tags: ["manga", "kid", "casual"] },
  cards: { id: "cards", name: "Trading Card Packs", icon: "🃏", stock: 0, price: 11, tags: ["card", "kid", "speculator"] },
  back: { id: "back", name: "Back Issue Bundle", icon: "🗃️", stock: 0, price: 9, tags: ["collector", "speculator"] },
  figures: { id: "figures", name: "Collectible Figures", icon: "🧸", stock: 0, price: 24, tags: ["collector", "casual", "cosplay"] },
  zines: { id: "zines", name: "Local Indie Zines", icon: "✍️", stock: 0, price: 6, tags: ["artist", "casual"] }
};

export const MISSION_STATE_KEY = "longbox-mission-state-v1";

function repCapFor(save) {
  const day = Number(save?.day) || 1;
  const upgrades = getUpgrades(save).length;
  return Math.min(100, 18 + Math.floor(day * 2.2) + upgrades * 4);
}

function stockForId(save, id) {
  return getInventory(save).filter(item => item.id === id).reduce((sum, item) => sum + (Number(item.stock) || 0), 0);
}

function collectionValue(save) {
  return getCollection(save).reduce((sum, comic) => sum + (Number(comic.value) || 0), 0);
}

export const TUTORIAL_MISSIONS = [
  {
    id: "first_day",
    group: "Shop Basics",
    title: "Open the Doors",
    desc: "Open the shop for at least one day.",
    reward: "+$25 and +4 New Releases",
    check: save => (save?.day || 1) >= 2,
    prize: { cash: 25, stock: { new: 4 } }
  },
  {
    id: "first_stock",
    group: "Shop Basics",
    title: "Fill the Shelves",
    desc: "Reach 20 total stock.",
    reward: "+$40 and +5 Manga",
    check: save => totalStock(save) >= 20,
    prize: { cash: 40, stock: { manga: 5 } }
  },
  {
    id: "pull_list_one",
    group: "Regulars",
    title: "Make a Regular Happy",
    desc: "Fill your first pull-list request.",
    reward: "+$75 and +1 reputation",
    check: save => (save?.fulfilledPulls || 0) >= 1,
    prize: { cash: 75, rep: 1 }
  },
  {
    id: "trend_hunter",
    group: "Sales",
    title: "Ride the Trend",
    desc: "Make 5 trend sales.",
    reward: "+$80 and +6 Card Packs",
    check: save => (save?.trendWins || 0) >= 5,
    prize: { cash: 80, stock: { cards: 6 } }
  },
  {
    id: "first_upgrade",
    group: "Build",
    title: "Improve the Shop",
    desc: "Build your first upgrade.",
    reward: "+$50 and +1 reputation",
    check: save => getUpgrades(save).length >= 1,
    prize: { cash: 50, rep: 1 }
  },
  {
    id: "fan_base",
    group: "Regulars",
    title: "Reach the Regulars",
    desc: "Reach 50 total customer loyalty.",
    reward: "+$100 and +2 reputation",
    check: save => totalLoyalty(save) >= 50,
    prize: { cash: 100, rep: 2 }
  },
  {
    id: "debt_control",
    group: "Money",
    title: "Clean Up the Books",
    desc: "Get debt below $50 after day 8.",
    reward: "+$150 and +2 reputation",
    check: save => (save?.debt || 0) < 50 && (save?.day || 1) >= 8,
    prize: { cash: 150, rep: 2 }
  },
  {
    id: "neighborhood_shop",
    group: "Reputation",
    title: "Neighborhood Name",
    desc: "Reach 25 reputation.",
    reward: "+$120 and +8 Back Issues",
    check: save => (save?.rep || 0) >= 25,
    prize: { cash: 120, stock: { back: 8 } }
  }
];

export const COLLECTION_MISSIONS = [
  {
    id: "collect3",
    group: "Collection",
    title: "Start a Wall of Weird",
    desc: "Own 3 collectible comics.",
    reward: "+$50 and +1 reputation",
    check: save => getCollection(save).length >= 3,
    prize: { cash: 50, rep: 1 }
  },
  {
    id: "display1",
    group: "Collection",
    title: "Showpiece",
    desc: "Display your first collectible comic.",
    reward: "+$75 and +1 reputation",
    check: save => getCollection(save).some(comic => comic.displayed),
    prize: { cash: 75, rep: 1 }
  },
  {
    id: "rare2",
    group: "Collection",
    title: "Collector Bait",
    desc: "Own 2 Rare or Epic comics.",
    reward: "+$100 and +2 reputation",
    check: save => getCollection(save).filter(comic => ["Rare", "Epic"].includes(comic.rarity)).length >= 2,
    prize: { cash: 100, rep: 2 }
  },
  {
    id: "value1000",
    group: "Collection",
    title: "Glass Case Energy",
    desc: "Reach $1,000 total collection value.",
    reward: "+$150 and +2 reputation",
    check: save => collectionValue(save) >= 1000,
    prize: { cash: 150, rep: 2 }
  },
  {
    id: "epic1",
    group: "Collection",
    title: "Wall Book Found",
    desc: "Own your first Epic comic.",
    reward: "+$250 and +3 reputation",
    check: save => getCollection(save).some(comic => comic.rarity === "Epic"),
    prize: { cash: 250, rep: 3 }
  }
];

export const GROWTH_MISSIONS = [
  {
    id: "week_two_survivor",
    group: "Growth",
    title: "Survive Week Two",
    desc: "Reach day 14.",
    reward: "+$175 and +6 New Releases",
    check: save => (save?.day || 1) >= 14,
    prize: { cash: 175, stock: { new: 6 } }
  },
  {
    id: "month_one_shop",
    group: "Growth",
    title: "First Month Open",
    desc: "Reach day 30.",
    reward: "+$350 and +2 reputation",
    check: save => (save?.day || 1) >= 30,
    prize: { cash: 350, rep: 2 }
  },
  {
    id: "hundred_visitors",
    group: "Growth",
    title: "100 Customers Through the Door",
    desc: "Serve 100 lifetime visitors.",
    reward: "+$150 and +1 reputation",
    check: save => (save?.lifetimeVisitors || 0) >= 100,
    prize: { cash: 150, rep: 1 }
  },
  {
    id: "five_hundred_visitors",
    group: "Growth",
    title: "Neighborhood Foot Traffic",
    desc: "Serve 500 lifetime visitors.",
    reward: "+$450 and +3 reputation",
    check: save => (save?.lifetimeVisitors || 0) >= 500,
    prize: { cash: 450, rep: 3 }
  },
  {
    id: "two_thousand_sales",
    group: "Money",
    title: "Two Grand Register",
    desc: "Reach $2,000 lifetime sales.",
    reward: "+$200 and +4 Card Packs",
    check: save => (save?.lifetimeSales || 0) >= 2000,
    prize: { cash: 200, stock: { cards: 4 } }
  },
  {
    id: "ten_thousand_sales",
    group: "Money",
    title: "Register Legend",
    desc: "Reach $10,000 lifetime sales.",
    reward: "+$600 and +4 reputation",
    check: save => (save?.lifetimeSales || 0) >= 10000,
    prize: { cash: 600, rep: 4 }
  }
];

export const BUILDOUT_MISSIONS = [
  {
    id: "three_upgrades",
    group: "Buildout",
    title: "Not Just Folding Tables",
    desc: "Build 3 upgrades.",
    reward: "+$225 and +2 reputation",
    check: save => getUpgrades(save).length >= 3,
    prize: { cash: 225, rep: 2 }
  },
  {
    id: "six_upgrades",
    group: "Buildout",
    title: "Real Shop Energy",
    desc: "Build 6 upgrades.",
    reward: "+$500 and +4 reputation",
    check: save => getUpgrades(save).length >= 6,
    prize: { cash: 500, rep: 4 }
  },
  {
    id: "collector_core",
    group: "Buildout",
    title: "Collector Core",
    desc: "Build the Longbox Wall and Rare Case.",
    reward: "+$275 and +5 Back Issues",
    check: save => getUpgrades(save).includes("wall") && getUpgrades(save).includes("case"),
    prize: { cash: 275, stock: { back: 5 } }
  },
  {
    id: "all_sections_stocked",
    group: "Inventory",
    title: "Every Shelf Has a Reason",
    desc: "Have at least 8 stock in each major section.",
    reward: "+$250 and +2 reputation",
    check: save => ["new", "manga", "cards", "back", "figures", "zines"].every(id => stockForId(save, id) >= 8),
    prize: { cash: 250, rep: 2 }
  },
  {
    id: "deep_longboxes",
    group: "Inventory",
    title: "Deep Longboxes",
    desc: "Have 40 Back Issue Bundles in stock.",
    reward: "+$200 and +1 reputation",
    check: save => stockForId(save, "back") >= 40,
    prize: { cash: 200, rep: 1 }
  }
];

export const LATE_COLLECTION_MISSIONS = [
  {
    id: "natural_finds_5",
    group: "Collection II",
    title: "The Bins Are Talking",
    desc: "Find 5 collectibles naturally through Live Day.",
    reward: "+$250 and +2 reputation",
    check: save => (save?.naturalFinds || 0) >= 5,
    prize: { cash: 250, rep: 2 }
  },
  {
    id: "natural_finds_15",
    group: "Collection II",
    title: "Back Issue Whisperer",
    desc: "Find 15 collectibles naturally through Live Day.",
    reward: "+$650 and +5 reputation",
    check: save => (save?.naturalFinds || 0) >= 15,
    prize: { cash: 650, rep: 5 }
  },
  {
    id: "collection_value_5000",
    group: "Collection II",
    title: "Wall Book Museum",
    desc: "Reach $5,000 total collection value.",
    reward: "+$400 and +4 reputation",
    check: save => collectionValue(save) >= 5000,
    prize: { cash: 400, rep: 4 }
  },
  {
    id: "display_5",
    group: "Collection II",
    title: "Prestige Wall",
    desc: "Display 5 collectible comics.",
    reward: "+$300 and +4 reputation",
    check: save => getCollection(save).filter(comic => comic.displayed).length >= 5,
    prize: { cash: 300, rep: 4 }
  },
  {
    id: "epic_3",
    group: "Collection II",
    title: "Three Epic Flex",
    desc: "Own 3 Epic comics.",
    reward: "+$700 and +6 reputation",
    check: save => getCollection(save).filter(comic => comic.rarity === "Epic").length >= 3,
    prize: { cash: 700, rep: 6 }
  }
];

export const LOCAL_LEGEND_MISSIONS = [
  {
    id: "trend_sales_25",
    group: "Local Legend",
    title: "Trend Reader",
    desc: "Make 25 trend sales.",
    reward: "+$350 and +8 Card Packs",
    check: save => (save?.trendWins || 0) >= 25,
    prize: { cash: 350, stock: { cards: 8 } }
  },
  {
    id: "rep_60",
    group: "Local Legend",
    title: "Local Favorite",
    desc: "Reach 60 reputation.",
    reward: "+$500 and +4 reputation",
    check: save => (save?.rep || 0) >= 60,
    prize: { cash: 500, rep: 4 }
  },
  {
    id: "rep_90",
    group: "Local Legend",
    title: "Destination Shop",
    desc: "Reach 90 reputation.",
    reward: "+$900 and +6 reputation",
    check: save => (save?.rep || 0) >= 90,
    prize: { cash: 900, rep: 6 }
  },
  {
    id: "day_60",
    group: "Local Legend",
    title: "Two Months of Pull Lists",
    desc: "Reach day 60.",
    reward: "+$1,000 and +10 mixed stock",
    check: save => (save?.day || 1) >= 60,
    prize: { cash: 1000, stock: { new: 4, manga: 3, back: 3 } }
  },
  {
    id: "legend_status",
    group: "Local Legend",
    title: "Longbox Legend",
    desc: "Reach day 90, 90 reputation, and 10 collectibles.",
    reward: "+$2,000 and +10 reputation",
    check: save => (save?.day || 1) >= 90 && (save?.rep || 0) >= 90 && getCollection(save).length >= 10,
    prize: { cash: 2000, rep: 10 }
  }
];

export const ALL_MISSIONS = [
  ...TUTORIAL_MISSIONS,
  ...COLLECTION_MISSIONS,
  ...GROWTH_MISSIONS,
  ...BUILDOUT_MISSIONS,
  ...LATE_COLLECTION_MISSIONS,
  ...LOCAL_LEGEND_MISSIONS
];

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
  const currentRep = Number(save?.rep) || 0;
  const nextRep = Math.min(repCapFor(save), Math.max(0, currentRep + (prize.rep || 0)));
  return addLog({
    ...save,
    cash: Math.max(0, Number(save?.cash) || 0) + (prize.cash || 0),
    rep: nextRep,
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
