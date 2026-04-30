export const INVENTORY_CATALOG = {
  new: { id: "new", name: "New Release Comics", icon: "📚", zone: "new", price: 8 },
  manga: { id: "manga", name: "Manga Volumes", icon: "🌸", zone: "manga", price: 13 },
  cards: { id: "cards", name: "Trading Card Packs", icon: "🃏", zone: "cards", price: 11 },
  back: { id: "back", name: "Back Issue Bundles", icon: "🗃️", zone: "longboxes", price: 9 },
  figures: { id: "figures", name: "Collectible Figures", icon: "🧸", zone: "rare", price: 24 },
  zines: { id: "zines", name: "Local Indie Zines", icon: "✍️", zone: "stock", price: 6 }
};

export const SHOP_ZONES = [
  { id: "new", title: "New Releases Wall", icon: "📚", itemId: "new", upgradeId: "sign", x: 28, y: 18, w: 42, h: 15, role: "Fresh weekly comics and New Comic Day traffic." },
  { id: "entrance", title: "Entrance", icon: "🚪", itemId: null, upgradeId: "sign", x: 82, y: 18, w: 24, h: 16, role: "Where traffic enters your shop." },
  { id: "manga", title: "Manga Corner", icon: "🌸", itemId: "manga", upgradeId: "manga", x: 24, y: 38, w: 28, h: 18, role: "Manga readers and volume-one addiction live here." },
  { id: "rare", title: "Rare Case", icon: "🔐", itemId: "figures", upgradeId: "case", x: 58, y: 38, w: 28, h: 18, role: "Rare books, slabs, figures, and collector bait." },
  { id: "longboxes", title: "Back Issue Longboxes", icon: "🗃️", itemId: "back", upgradeId: "wall", x: 30, y: 62, w: 42, h: 24, role: "Collectors dig here for back issues and key rumors." },
  { id: "cards", title: "Cards & Events", icon: "🎲", itemId: "cards", upgradeId: "tables", x: 76, y: 62, w: 30, h: 24, role: "Card packs, tournament nights, and table traffic." },
  { id: "register", title: "Register", icon: "💵", itemId: null, upgradeId: null, x: 18, y: 88, w: 26, h: 14, role: "Customers check out here after browsing." },
  { id: "reading", title: "Reading Area", icon: "☕", itemId: null, upgradeId: "cafe", x: 55, y: 88, w: 26, h: 14, role: "A comfort zone that becomes stronger with the café upgrade." },
  { id: "stock", title: "Stock Room", icon: "📦", itemId: "zines", upgradeId: "online", x: 84, y: 88, w: 24, h: 14, role: "Inventory, local zines, and future shipping orders." }
];

export const UPGRADE_NAMES = {
  sign: "Neon Shop Sign",
  wall: "Longbox Wall",
  manga: "Manga Corner",
  case: "Rare Book Display Case",
  tables: "Tournament Tables",
  online: "Online Storefront",
  cafe: "Reader Café",
  studio: "Creator Studio"
};

export const TREND_CYCLE = [
  { itemId: "new", name: "New Comic Day Buzz", icon: "📚" },
  { itemId: "manga", name: "Manga Boom", icon: "🌸" },
  { itemId: "cards", name: "Card Meta Shift", icon: "🃏" },
  { itemId: "back", name: "Key Issue Rumors", icon: "🗃️" },
  { itemId: "figures", name: "Collector Shelf Fever", icon: "🧸" },
  { itemId: "zines", name: "Indie Scene Surge", icon: "✍️" }
];

export function weekOf(day = 1) {
  return Math.floor((day - 1) / 7) + 1;
}

export function getTrend(day = 1) {
  return TREND_CYCLE[(weekOf(day) - 1) % TREND_CYCLE.length];
}

export function isNewComicDay(day = 1) {
  return day % 7 === 0;
}
