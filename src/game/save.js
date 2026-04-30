export const PRIMARY_SAVE_KEY = "longbox-legends-save-v5";

export const SAVE_KEYS = [
  "longbox-legends-save-v5",
  "longbox-legends-save-v4",
  "longbox-legends-save-v3",
  "longbox-legends-save-v2",
  "longbox-legends-save-v1"
];

export function safeParse(value, fallback = null) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function getSave() {
  for (const key of SAVE_KEYS) {
    const save = safeParse(localStorage.getItem(key));
    if (save) return save;
  }
  return null;
}

export function setSave(save) {
  localStorage.setItem(PRIMARY_SAVE_KEY, JSON.stringify(save));
  window.dispatchEvent(new CustomEvent("longbox-save-changed", { detail: { save } }));
}

export function updateSave(updater) {
  const current = getSave() || {};
  const next = typeof updater === "function" ? updater(current) : updater;
  setSave(next);
  return next;
}

export function getInventory(save = getSave()) {
  return Array.isArray(save?.inventory) ? save.inventory : [];
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
  return getInventory(save)
    .filter(item => item.id === itemId)
    .reduce((sum, item) => sum + (Number(item.stock) || 0), 0);
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
