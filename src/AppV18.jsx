import React, { useEffect } from "react";
import AppV17 from "./AppV17.jsx";

const SAVE_KEYS = [
  "longbox-legends-save-v5",
  "longbox-legends-save-v4",
  "longbox-legends-save-v3",
  "longbox-legends-save-v2",
  "longbox-legends-save-v1"
];

const upgradeVisuals = [
  { id: "sign", icon: "💡", label: "Neon Sign", x: 82, y: 6, color: "#22d3ee", effect: "glow", desc: "Front window glows" },
  { id: "wall", icon: "🗄️", label: "Longbox Wall", x: 29, y: 72, color: "#334155", effect: "longboxes", desc: "More back issue rows" },
  { id: "manga", icon: "🍥", label: "Manga Expansion", x: 22, y: 27, color: "#f472b6", effect: "shelves", desc: "Bigger manga corner" },
  { id: "case", icon: "✨", label: "Rare Case Glow", x: 59, y: 28, color: "#f59e0b", effect: "sparkle", desc: "Rare books shine" },
  { id: "tables", icon: "🎲", label: "Tournament Tables", x: 77, y: 48, color: "#8b5cf6", effect: "tables", desc: "Card tables appear" },
  { id: "online", icon: "📮", label: "Shipping Station", x: 84, y: 78, color: "#0ea5e9", effect: "shipping", desc: "Online orders ship" },
  { id: "cafe", icon: "☕", label: "Reader Café", x: 55, y: 76, color: "#10b981", effect: "cafe", desc: "Coffee corner opens" },
  { id: "studio", icon: "🎨", label: "Creator Studio", x: 40, y: 88, color: "#ef4444", effect: "studio", desc: "Creator table added" }
];

function parse(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
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
  if (document.getElementById("longbox-upgrade-visual-style")) return;
  const style = document.createElement("style");
  style.id = "longbox-upgrade-visual-style";
  style.textContent = `
    @keyframes longboxGlow {
      0%, 100% { transform: translate(-50%, -50%) scale(1); filter: drop-shadow(0 0 4px rgba(250, 204, 21, .65)); }
      50% { transform: translate(-50%, -50%) scale(1.08); filter: drop-shadow(0 0 16px rgba(250, 204, 21, .95)); }
    }
    @keyframes longboxSparkle {
      0%, 100% { opacity: .75; transform: translate(-50%, -50%) rotate(-8deg) scale(1); }
      50% { opacity: 1; transform: translate(-50%, -50%) rotate(8deg) scale(1.18); }
    }
    .ll-upgrade-marker {
      position: absolute;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 35;
      display: grid;
      gap: 4px;
      justify-items: center;
    }
    .ll-upgrade-badge {
      min-width: 38px;
      height: 38px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      color: white;
      font-size: 21px;
      font-weight: 950;
      border: 2px solid rgba(255,255,255,.9);
      box-shadow: 0 8px 20px rgba(15,23,42,.24);
    }
    .ll-upgrade-label {
      max-width: 95px;
      border-radius: 999px;
      background: rgba(15, 23, 42, .92);
      color: white;
      padding: 3px 7px;
      font-size: 9px;
      font-weight: 950;
      line-height: 1.05;
      text-align: center;
      white-space: normal;
      box-shadow: 0 5px 14px rgba(15,23,42,.22);
    }
    .ll-effect-glow .ll-upgrade-badge,
    .ll-effect-sparkle .ll-upgrade-badge { animation: longboxGlow 1.35s infinite ease-in-out; }
    .ll-effect-sparkle .ll-upgrade-badge { animation-name: longboxSparkle; }
    .ll-upgrade-detail {
      position: absolute;
      border-radius: 12px;
      background: rgba(255,255,255,.88);
      border: 1px solid rgba(15,23,42,.08);
      box-shadow: 0 4px 12px rgba(15,23,42,.10);
      pointer-events: none;
      z-index: 28;
    }
    .ll-upgrade-legend {
      position: absolute;
      left: 10px;
      top: 10px;
      z-index: 40;
      max-width: min(250px, calc(100% - 20px));
      border-radius: 18px;
      background: rgba(2, 6, 23, .86);
      color: white;
      padding: 10px;
      box-shadow: 0 10px 24px rgba(15,23,42,.25);
      backdrop-filter: blur(8px);
      pointer-events: none;
    }
    .ll-upgrade-legend-title {
      font-size: 10px;
      font-weight: 950;
      color: #fbbf24;
      letter-spacing: .12em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .ll-upgrade-legend-list {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .ll-upgrade-chip {
      border-radius: 999px;
      background: rgba(255,255,255,.12);
      padding: 4px 7px;
      font-size: 10px;
      font-weight: 850;
      line-height: 1;
    }
    @media (max-width: 640px) {
      .ll-upgrade-label { display: none; }
      .ll-upgrade-badge { min-width: 31px; height: 31px; font-size: 17px; }
      .ll-upgrade-legend { max-width: 190px; padding: 8px; }
      .ll-upgrade-chip { font-size: 9px; padding: 3px 6px; }
    }
  `;
  document.head.appendChild(style);
}

function findMapSurfaces() {
  const all = Array.from(document.querySelectorAll("div"));
  return all.filter(el => {
    if (el.closest(".ll-upgrade-layer")) return false;
    const text = el.textContent || "";
    if (!text.includes("New Releases") && !text.includes("New Releases Wall")) return false;
    if (!text.includes("Register")) return false;
    if (!text.includes("Entrance")) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width < 260 || rect.height < 240) return false;
    if (rect.height > 720) return false;
    const style = window.getComputedStyle(el);
    return style.position === "relative" || style.position === "absolute";
  });
}

function makeDetail(visual) {
  const detail = document.createElement("div");
  detail.className = "ll-upgrade-detail";
  detail.style.left = `${visual.x - 9}%`;
  detail.style.top = `${visual.y - 7}%`;
  detail.style.width = "18%";
  detail.style.height = "8%";

  if (visual.effect === "longboxes") {
    detail.style.display = "grid";
    detail.style.gridTemplateColumns = "repeat(3, 1fr)";
    detail.style.gap = "4px";
    detail.style.padding = "5px";
    detail.innerHTML = `<span style="border-radius:5px;background:#334155;"></span><span style="border-radius:5px;background:#334155;"></span><span style="border-radius:5px;background:#334155;"></span>`;
  } else if (visual.effect === "tables") {
    detail.style.display = "grid";
    detail.style.gridTemplateColumns = "repeat(2, 1fr)";
    detail.style.gap = "5px";
    detail.style.padding = "5px";
    detail.innerHTML = `<span style="border-radius:999px;background:#8b5cf6;"></span><span style="border-radius:999px;background:#8b5cf6;"></span>`;
  } else if (visual.effect === "shelves") {
    detail.style.display = "grid";
    detail.style.gap = "4px";
    detail.style.padding = "5px";
    detail.innerHTML = `<span style="border-radius:5px;background:#f472b6;"></span><span style="border-radius:5px;background:#f472b6;"></span><span style="border-radius:5px;background:#f472b6;"></span>`;
  } else if (visual.effect === "shipping") {
    detail.style.display = "grid";
    detail.style.gridTemplateColumns = "repeat(2, 1fr)";
    detail.style.gap = "4px";
    detail.style.padding = "5px";
    detail.innerHTML = `<span style="border-radius:5px;background:#38bdf8;"></span><span style="border-radius:5px;background:#38bdf8;"></span><span style="grid-column:1/3;border-radius:5px;background:#0284c7;"></span>`;
  } else if (visual.effect === "cafe") {
    detail.style.borderRadius = "999px";
    detail.style.background = "rgba(16,185,129,.2)";
  } else if (visual.effect === "studio") {
    detail.style.background = "repeating-linear-gradient(45deg, rgba(239,68,68,.25) 0 8px, rgba(255,255,255,.8) 8px 16px)";
  } else {
    detail.style.display = "none";
  }

  return detail;
}

function makeMarker(visual) {
  const marker = document.createElement("div");
  marker.className = `ll-upgrade-marker ll-effect-${visual.effect}`;
  marker.style.left = `${visual.x}%`;
  marker.style.top = `${visual.y}%`;
  marker.innerHTML = `
    <div class="ll-upgrade-badge" style="background:${visual.color};">${visual.icon}</div>
    <div class="ll-upgrade-label">${visual.label}</div>
  `;
  return marker;
}

function makeLegend(active) {
  const legend = document.createElement("div");
  legend.className = "ll-upgrade-legend";
  if (active.length === 0) {
    legend.innerHTML = `
      <div class="ll-upgrade-legend-title">Upgrade Map</div>
      <div style="font-size:11px;font-weight:800;line-height:1.25;color:#e2e8f0;">Buy upgrades to physically change the shop floor.</div>
    `;
    return legend;
  }

  legend.innerHTML = `
    <div class="ll-upgrade-legend-title">Visible Upgrades</div>
    <div class="ll-upgrade-legend-list">
      ${active.slice(0, 5).map(v => `<span class="ll-upgrade-chip">${v.icon} ${v.label}</span>`).join("")}
      ${active.length > 5 ? `<span class="ll-upgrade-chip">+${active.length - 5} more</span>` : ""}
    </div>
  `;
  return legend;
}

function applyUpgradeVisuals() {
  ensureStyle();
  const owned = getOwnedUpgrades();
  const active = upgradeVisuals.filter(v => owned.includes(v.id));
  const surfaces = findMapSurfaces();

  surfaces.forEach(surface => {
    const existingSignature = surface.getAttribute("data-upgrade-signature") || "";
    const signature = active.map(v => v.id).join("|");
    if (existingSignature === signature && surface.querySelector(".ll-upgrade-layer")) return;

    surface.querySelectorAll(".ll-upgrade-layer").forEach(layer => layer.remove());
    surface.setAttribute("data-upgrade-signature", signature);

    const style = window.getComputedStyle(surface);
    if (style.position === "static") surface.style.position = "relative";

    const layer = document.createElement("div");
    layer.className = "ll-upgrade-layer";
    layer.style.cssText = "position:absolute;inset:0;pointer-events:none;z-index:45;overflow:hidden;border-radius:inherit;";

    active.forEach(visual => {
      layer.appendChild(makeDetail(visual));
      layer.appendChild(makeMarker(visual));
    });
    layer.appendChild(makeLegend(active));
    surface.appendChild(layer);
  });
}

export default function AppV18() {
  useEffect(() => {
    applyUpgradeVisuals();
    const observer = new MutationObserver(applyUpgradeVisuals);
    observer.observe(document.body, { childList: true, subtree: true, attributes: false });
    const interval = setInterval(applyUpgradeVisuals, 1000);
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return <AppV17 />;
}
