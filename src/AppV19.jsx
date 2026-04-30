import React, { useEffect } from "react";
import AppV18 from "./AppV18.jsx";

const SAVE_KEYS = [
  "longbox-legends-save-v5",
  "longbox-legends-save-v4",
  "longbox-legends-save-v3",
  "longbox-legends-save-v2",
  "longbox-legends-save-v1"
];

const upgradeNames = {
  sign: ["💡", "Neon Sign"],
  wall: ["🗄️", "Longbox Wall"],
  manga: ["🍥", "Manga Corner"],
  case: ["🔐", "Rare Case"],
  tables: ["🎲", "Tables"],
  online: ["📮", "Online"],
  cafe: ["☕", "Café"],
  studio: ["🎨", "Studio"]
};

function parse(value) {
  try { return value ? JSON.parse(value) : null; } catch { return null; }
}

function getSave() {
  for (const key of SAVE_KEYS) {
    const save = parse(localStorage.getItem(key));
    if (save) return save;
  }
  return null;
}

function getOwnedUpgrades() {
  const save = getSave();
  return Array.isArray(save?.upgrades) ? save.upgrades : [];
}

function ensureStyle() {
  if (document.getElementById("longbox-map-polish-style")) return;
  const style = document.createElement("style");
  style.id = "longbox-map-polish-style";
  style.textContent = `
    .ll-upgrade-legend { display: none !important; }
    .ll-upgrade-badge {
      min-width: 28px !important;
      width: 28px !important;
      height: 28px !important;
      font-size: 15px !important;
      border-width: 2px !important;
    }
    .ll-upgrade-label { display: none !important; }
    .ll-upgrade-detail {
      opacity: .75 !important;
      transform: scale(.72) !important;
      transform-origin: center !important;
    }
    .ll-upgrade-marker { gap: 0 !important; }
    .ll-upgrade-strip {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      padding: 8px;
      border-radius: 20px;
      background: #0f172a;
      color: white;
      box-shadow: 0 8px 18px rgba(15, 23, 42, .16);
      margin: 8px 0 10px;
    }
    .ll-upgrade-strip-title {
      flex: 0 0 auto;
      font-size: 10px;
      font-weight: 950;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: #fbbf24;
      margin-right: 2px;
    }
    .ll-upgrade-strip-chip {
      flex: 0 0 auto;
      border-radius: 999px;
      background: rgba(255,255,255,.12);
      padding: 6px 9px;
      font-size: 11px;
      font-weight: 900;
      line-height: 1;
      white-space: nowrap;
    }
    .ll-upgrade-strip-empty {
      flex: 1 1 auto;
      font-size: 11px;
      font-weight: 800;
      color: #cbd5e1;
      line-height: 1.25;
    }
    [data-longbox-floor-map="true"] > div:last-child {
      margin-bottom: 58px !important;
    }
    @media (min-width: 700px) {
      .ll-upgrade-badge {
        min-width: 34px !important;
        width: 34px !important;
        height: 34px !important;
        font-size: 18px !important;
      }
      .ll-upgrade-label { display: block !important; font-size: 8px !important; max-width: 72px !important; }
      [data-longbox-floor-map="true"] > div:last-child { margin-bottom: 0 !important; }
    }
  `;
  document.head.appendChild(style);
}

function findFloorMaps() {
  return Array.from(document.querySelectorAll('[data-longbox-floor-map="true"]'));
}

function addUpgradeStrip(map) {
  const owned = getOwnedUpgrades();
  const signature = owned.join("|");
  const existing = map.querySelector(".ll-upgrade-strip");
  if (existing && existing.getAttribute("data-upgrades") === signature) return;
  if (existing) existing.remove();

  const strip = document.createElement("div");
  strip.className = "ll-upgrade-strip";
  strip.setAttribute("data-upgrades", signature);

  if (owned.length === 0) {
    strip.innerHTML = `
      <div class="ll-upgrade-strip-title">Upgrade Map</div>
      <div class="ll-upgrade-strip-empty">Buy upgrades and they will appear on the shop floor.</div>
    `;
  } else {
    strip.innerHTML = `
      <div class="ll-upgrade-strip-title">Upgrades</div>
      ${owned.map(id => {
        const [icon, label] = upgradeNames[id] || ["✨", id];
        return `<div class="ll-upgrade-strip-chip">${icon} ${label}</div>`;
      }).join("")}
    `;
  }

  const mapSurface = Array.from(map.children).find(child => {
    const text = child.textContent || "";
    return text.includes("New Releases") && text.includes("Register") && text.includes("Entrance");
  });

  if (mapSurface) map.insertBefore(strip, mapSurface);
  else map.appendChild(strip);
}

function repositionBadges() {
  const markers = Array.from(document.querySelectorAll(".ll-upgrade-marker"));
  markers.forEach(marker => {
    const text = marker.textContent || "";
    if (text.includes("Longbox")) {
      marker.style.left = "43%";
      marker.style.top = "70%";
    }
    if (text.includes("Neon")) {
      marker.style.left = "78%";
      marker.style.top = "8%";
    }
    if (text.includes("Manga")) {
      marker.style.left = "15%";
      marker.style.top = "31%";
    }
    if (text.includes("Rare")) {
      marker.style.left = "63%";
      marker.style.top = "31%";
    }
  });
}

function polishMap() {
  ensureStyle();
  findFloorMaps().forEach(addUpgradeStrip);
  repositionBadges();
}

export default function AppV19() {
  useEffect(() => {
    polishMap();
    const observer = new MutationObserver(polishMap);
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = setInterval(polishMap, 800);
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return <AppV18 />;
}
