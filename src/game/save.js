export const PRIMARY_SAVE_KEY = "longbox-legends-save-v5";

export const SAVE_KEYS = [
  "longbox-legends-save-v5",
  "longbox-legends-save-v4",
  "longbox-legends-save-v3",
  "longbox-legends-save-v2",
  "longbox-legends-save-v1"
];

const INVENTORY_ALIASES = {
  newReleases: "new",
  new_release: "new",
  comics: "new",
  card: "cards",
  packs: "cards",
  backIssues: "back",
  backissues: "back",
  figure: "figures",
  figurines: "figures",
  toys: "figures",
  local: "zines",
  indie: "zines"
};

const INVENTORY_META = {
  new: { id: "new", name: "New Release Comics", icon: "📚", price: 8 },
  manga: { id: "manga", name: "Manga Volumes", icon: "🌸", price: 13 },
  cards: { id: "cards", name: "Trading Card Packs", icon: "🃏", price: 11 },
  back: { id: "back", name: "Back Issue Bundles", icon: "🗃️", price: 9 },
  figures: { id: "figures", name: "Collectible Figures", icon: "🧸", price: 24 },
  zines: { id: "zines", name: "Local Indie Zines", icon: "✍️", price: 6 }
};

export function safeParse(value, fallback = null) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function canonicalInventoryId(id) {
  if (!id) return null;
  return INVENTORY_ALIASES[id] || id;
}

function inventoryCapFor(save, id) {
  const day = Number(save?.day) || 1;
  const upgrades = Array.isArray(save?.upgrades) ? save.upgrades.length : 0;
  const base = id === "figures" ? 12 : id === "cards" ? 34 : 24;
  const growth = Math.floor(day * (id === "figures" ? 1.1 : 1.45)) + upgrades * 3;
  return Math.min(id === "figures" ? 42 : 70, base + growth);
}

export function normalizeInventory(save = {}) {
  const buckets = new Map();
  const source = Array.isArray(save?.inventory) ? save.inventory : [];

  source.forEach(item => {
    const id = canonicalInventoryId(item?.id);
    if (!id) return;
    const meta = INVENTORY_META[id] || { id, name: item.name || id, icon: item.icon || "📦", price: item.price || 8 };
    const existing = buckets.get(id) || { ...meta, ...item, id, name: meta.name, icon: meta.icon, price: meta.price, stock: 0 };
    existing.stock += Number(item.stock) || 0;
    buckets.set(id, existing);
  });

  return Array.from(buckets.values()).map(item => ({
    ...item,
    stock: Math.max(0, Math.min(Math.round(Number(item.stock) || 0), inventoryCapFor(save, item.id)))
  }));
}

function normalizeSaveShape(save) {
  if (!save || typeof save !== "object") return save;
  return {
    ...save,
    inventory: normalizeInventory(save)
  };
}

export function getSave() {
  for (const key of SAVE_KEYS) {
    const save = safeParse(localStorage.getItem(key));
    if (save) return normalizeSaveShape(save);
  }
  return null;
}

export function setSave(save) {
  const normalized = normalizeSaveShape(save);
  localStorage.setItem(PRIMARY_SAVE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent("longbox-save-changed", { detail: { save: normalized } }));
}

export function updateSave(updater) {
  const current = getSave() || {};
  const next = typeof updater === "function" ? updater(current) : updater;
  setSave(next);
  return normalizeSaveShape(next);
}

export function getInventory(save = getSave()) {
  return normalizeInventory(save || {});
}

export function getCollection(save = getSave()) {
  return Array.isArray(save?.comicCollection) ? save.comicCollection : [];
}

export function getUpgrades(save = getSave()) {
  return Array.isArray(save?.upgrades) ? save.upgrades : [];
}

export function getPullList(save = getSave()) {
  return Array.isArray(save?.pullList) ? save.pullList : [];
}

export function stockFor(save, itemId) {
  if (!itemId) return null;
  return getInventory(save).filter(item => item.id === itemId).reduce((sum, item) => sum + (Number(item.stock) || 0), 0);
}

export function totalStock(save = getSave()) {
  const inventoryStock = getInventory(save).reduce((sum, item) => sum + (Number(item.stock) || 0), 0);
  const rareStock = Array.isArray(save?.rare) ? save.rare.length : 0;
  return inventoryStock + rareStock;
}

export function totalLoyalty(save = getSave()) {
  const loyalty = save?.loyalty && typeof save.loyalty === "object" ? save.loyalty : {};
  return Object.values(loyalty).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

export function addLog(save, line, limit = 10) {
  return {
    ...save,
    log: [line, ...(Array.isArray(save?.log) ? save.log : [])].slice(0, limit)
  };
}
