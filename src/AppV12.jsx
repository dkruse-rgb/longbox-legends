import React, { useEffect } from "react";
import AppV10 from "./AppV10.jsx";

function zone(label, sub, icon, style = "") {
  return `
    <div style="position:relative;border-radius:20px;background:white;border:1px solid rgba(15,23,42,.08);box-shadow:0 3px 10px rgba(15,23,42,.08);padding:12px;overflow:hidden;${style}">
      <div style="position:absolute;right:10px;top:8px;font-size:28px;opacity:.9;">${icon}</div>
      <div style="position:relative;z-index:1;font-size:13px;font-weight:950;color:#020617;max-width:120px;line-height:1.05;">${label}</div>
      <div style="position:relative;z-index:1;margin-top:4px;font-size:10px;font-weight:800;color:#64748b;max-width:140px;line-height:1.15;">${sub}</div>
    </div>
  `;
}

function longboxRow(label = "LONGBOXES") {
  return `
    <div style="border-radius:18px;background:#fff;border:1px solid rgba(15,23,42,.08);box-shadow:0 2px 7px rgba(15,23,42,.07);padding:8px;display:grid;gap:5px;">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;">
        <div style="height:18px;border-radius:7px;background:#334155;"></div>
        <div style="height:18px;border-radius:7px;background:#334155;"></div>
        <div style="height:18px;border-radius:7px;background:#334155;"></div>
        <div style="height:18px;border-radius:7px;background:#334155;"></div>
      </div>
      <div style="font-size:9px;font-weight:950;letter-spacing:.12em;text-align:center;color:#64748b;">${label}</div>
    </div>
  `;
}

function shelfWall(label, icon) {
  return `
    <div style="border-radius:18px;background:#f8fafc;border:1px solid rgba(15,23,42,.08);padding:8px;display:flex;align-items:center;justify-content:space-between;gap:8px;box-shadow:inset 0 -8px 0 rgba(15,23,42,.03);">
      <div style="font-size:24px;">${icon}</div>
      <div style="font-size:10px;font-weight:950;color:#475569;line-height:1.1;text-align:right;">${label}</div>
    </div>
  `;
}

function buildIllustratedFloorMap() {
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-longbox-floor-map", "true");
  wrapper.style.cssText = "display:grid;gap:12px;border-radius:30px;background:linear-gradient(180deg,#e2e8f0,#f8fafc);padding:14px;box-shadow:inset 0 0 0 1px rgba(15,23,42,.06);";
  wrapper.innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">
      <div>
        <div style="font-size:11px;font-weight:950;letter-spacing:.14em;text-transform:uppercase;color:#b45309;">Top-Down Shop Map</div>
        <div style="font-size:13px;font-weight:850;color:#475569;line-height:1.2;">A visual layout of your comic shop sections.</div>
      </div>
      <div style="border-radius:999px;background:#0f172a;color:white;padding:7px 11px;font-size:12px;font-weight:950;white-space:nowrap;box-shadow:0 2px 8px rgba(15,23,42,.2);">Floor Plan</div>
    </div>

    <div style="position:relative;border-radius:28px;background:#fff7ed;border:5px solid #7c2d12;box-shadow:0 8px 24px rgba(15,23,42,.16);padding:12px;overflow:hidden;">
      <div style="position:absolute;inset:0;background-image:linear-gradient(90deg,rgba(124,45,18,.05) 1px,transparent 1px),linear-gradient(rgba(124,45,18,.05) 1px,transparent 1px);background-size:26px 26px;pointer-events:none;"></div>

      <div style="position:relative;display:grid;grid-template-columns:1.1fr 1fr .9fr;gap:10px;">
        <div style="grid-column:1 / 3;display:grid;gap:8px;">
          ${shelfWall("NEW RELEASE WALL", "📚")}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            ${zone("Manga Corner", "Series shelves and cozy browsing", "🌸", "min-height:88px;background:linear-gradient(145deg,#fff,#fce7f3);")}
            ${zone("Rare Case", "Slabs, variants, keys", "🔐", "min-height:88px;background:linear-gradient(145deg,#fff,#fef3c7);")}
          </div>
        </div>

        <div style="display:grid;gap:8px;">
          ${zone("Front Window", "Posters and weekly hype", "🪧", "min-height:64px;background:linear-gradient(145deg,#ecfeff,#fff);")}
          ${zone("Entrance", "Customers enter here", "🚪", "min-height:64px;background:linear-gradient(145deg,#dcfce7,#fff);")}
        </div>
      </div>

      <div style="position:relative;display:grid;grid-template-columns:1.2fr .8fr;gap:10px;margin-top:10px;">
        <div style="display:grid;gap:8px;">
          ${longboxRow("BACK ISSUE ROW A")}
          ${longboxRow("BACK ISSUE ROW B")}
          ${longboxRow("BACK ISSUE ROW C")}
        </div>
        <div style="display:grid;gap:8px;">
          ${zone("Cards & Events", "Tables, packs, tournaments", "🎲", "min-height:110px;background:linear-gradient(145deg,#f5f3ff,#fff);")}
          ${zone("Reading Area", "Coffee, couches, browsing", "☕", "min-height:90px;background:linear-gradient(145deg,#ecfdf5,#fff);")}
        </div>
      </div>

      <div style="position:relative;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:10px;">
        <div style="border-radius:20px;background:#0f172a;color:white;padding:12px;box-shadow:0 4px 12px rgba(15,23,42,.25);">
          <div style="font-size:28px;line-height:1;">💵</div>
          <div style="font-size:13px;font-weight:950;margin-top:6px;">Register</div>
          <div style="font-size:10px;font-weight:750;color:#cbd5e1;margin-top:2px;">Sales end here</div>
        </div>
        ${zone("Stock Room", "Distributor boxes", "📦", "min-height:78px;")}
        ${zone("Indie Rack", "Local zines", "✍️", "min-height:78px;background:linear-gradient(145deg,#fffbeb,#fff);")}
      </div>

      <div style="position:relative;margin-top:12px;border-radius:18px;background:#fed7aa;border:2px dashed #ea580c;padding:10px;text-align:center;font-size:12px;font-weight:950;color:#7c2d12;">
        Customer path: Entrance → New Releases → Longboxes / Manga / Cards → Register
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;">
      <div style="border-radius:18px;background:white;padding:10px;border:1px solid rgba(15,23,42,.08);font-size:11px;font-weight:850;color:#475569;"><b style="color:#020617;">Why this matters:</b> upgrades will eventually appear as visible changes in this map.</div>
      <div style="border-radius:18px;background:white;padding:10px;border:1px solid rgba(15,23,42,.08);font-size:11px;font-weight:850;color:#475569;"><b style="color:#020617;">Next:</b> customers will path to real sections instead of random movement.</div>
    </div>
  `;
  return wrapper;
}

function enhanceShopFloor() {
  const headings = Array.from(document.querySelectorAll("h2"));
  const shopHeading = headings.find(h => h.textContent?.trim() === "Shop Floor");
  if (!shopHeading) return;

  const section = shopHeading.closest("section");
  if (!section) return;

  const existing = section.querySelector("[data-longbox-floor-map='true']");
  if (existing) return;

  const grids = Array.from(section.querySelectorAll("div"));
  const oldGrid = grids.find(div => {
    const cells = Array.from(div.children || []);
    return cells.length === 35 && cells.every(child => child.textContent !== undefined);
  });

  if (!oldGrid) return;
  oldGrid.style.display = "none";
  oldGrid.setAttribute("data-old-floor-grid", "hidden");
  oldGrid.parentNode.insertBefore(buildIllustratedFloorMap(), oldGrid);
}

export default function AppV12() {
  useEffect(() => {
    enhanceShopFloor();
    const observer = new MutationObserver(() => enhanceShopFloor());
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = setInterval(enhanceShopFloor, 900);
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return <AppV10 />;
}
