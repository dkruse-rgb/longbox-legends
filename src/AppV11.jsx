import React, { useEffect } from "react";
import AppV10 from "./AppV10.jsx";

function buildFloorMap() {
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-longbox-floor-map", "true");
  wrapper.style.cssText = "display:grid;gap:10px;border-radius:28px;background:#f1f5f9;padding:14px;box-shadow:inset 0 0 0 1px rgba(15,23,42,.06);";
  wrapper.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:2px;">
      <div>
        <div style="font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#b45309;">Shop Floor Map</div>
        <div style="font-size:13px;font-weight:800;color:#475569;">This is your store layout, not individual items.</div>
      </div>
      <div style="border-radius:999px;background:#0f172a;color:white;padding:6px 10px;font-size:12px;font-weight:900;white-space:nowrap;">Map View</div>
    </div>

    <div style="display:grid;grid-template-columns:1.1fr 1.1fr .8fr;gap:10px;">
      <div style="grid-column:1 / 3;border-radius:22px;background:white;padding:14px;min-height:86px;box-shadow:0 2px 8px rgba(15,23,42,.08);border:1px solid rgba(15,23,42,.06);">
        <div style="font-size:28px;line-height:1;">📚</div>
        <div style="font-size:15px;font-weight:950;color:#020617;margin-top:8px;">New Releases Wall</div>
        <div style="font-size:12px;font-weight:700;color:#64748b;margin-top:2px;">Fresh weekly books customers see first.</div>
      </div>
      <div style="border-radius:22px;background:white;padding:14px;min-height:86px;box-shadow:0 2px 8px rgba(15,23,42,.08);border:1px solid rgba(15,23,42,.06);">
        <div style="font-size:28px;line-height:1;">🚪</div>
        <div style="font-size:15px;font-weight:950;color:#020617;margin-top:8px;">Entrance</div>
        <div style="font-size:12px;font-weight:700;color:#64748b;margin-top:2px;">Traffic comes in here.</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <div style="border-radius:22px;background:white;padding:14px;min-height:92px;box-shadow:0 2px 8px rgba(15,23,42,.08);border:1px solid rgba(15,23,42,.06);">
        <div style="font-size:28px;line-height:1;">🗃️</div>
        <div style="font-size:15px;font-weight:950;color:#020617;margin-top:8px;">Back Issue Longboxes</div>
        <div style="font-size:12px;font-weight:700;color:#64748b;margin-top:2px;">Collectors dig through these for keys.</div>
      </div>
      <div style="border-radius:22px;background:white;padding:14px;min-height:92px;box-shadow:0 2px 8px rgba(15,23,42,.08);border:1px solid rgba(15,23,42,.06);">
        <div style="font-size:28px;line-height:1;">🌸</div>
        <div style="font-size:15px;font-weight:950;color:#020617;margin-top:8px;">Manga Corner</div>
        <div style="font-size:12px;font-weight:700;color:#64748b;margin-top:2px;">A cozy section for volume-one addiction.</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      <div style="border-radius:22px;background:white;padding:14px;min-height:92px;box-shadow:0 2px 8px rgba(15,23,42,.08);border:1px solid rgba(15,23,42,.06);">
        <div style="font-size:28px;line-height:1;">🔐</div>
        <div style="font-size:15px;font-weight:950;color:#020617;margin-top:8px;">Rare Display Case</div>
        <div style="font-size:12px;font-weight:700;color:#64748b;margin-top:2px;">Slabs, variants, and wallet danger.</div>
      </div>
      <div style="border-radius:22px;background:white;padding:14px;min-height:92px;box-shadow:0 2px 8px rgba(15,23,42,.08);border:1px solid rgba(15,23,42,.06);">
        <div style="font-size:28px;line-height:1;">🎲</div>
        <div style="font-size:15px;font-weight:950;color:#020617;margin-top:8px;">Cards & Events</div>
        <div style="font-size:12px;font-weight:700;color:#64748b;margin-top:2px;">Tournaments, packs, and community nights.</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
      <div style="border-radius:22px;background:#0f172a;color:white;padding:14px;min-height:74px;box-shadow:0 2px 8px rgba(15,23,42,.16);">
        <div style="font-size:26px;line-height:1;">💵</div>
        <div style="font-size:14px;font-weight:950;margin-top:7px;">Register</div>
      </div>
      <div style="border-radius:22px;background:white;padding:14px;min-height:74px;box-shadow:0 2px 8px rgba(15,23,42,.08);border:1px solid rgba(15,23,42,.06);">
        <div style="font-size:26px;line-height:1;">☕</div>
        <div style="font-size:14px;font-weight:950;color:#020617;margin-top:7px;">Reading Area</div>
      </div>
      <div style="border-radius:22px;background:white;padding:14px;min-height:74px;box-shadow:0 2px 8px rgba(15,23,42,.08);border:1px solid rgba(15,23,42,.06);">
        <div style="font-size:26px;line-height:1;">📦</div>
        <div style="font-size:14px;font-weight:950;color:#020617;margin-top:7px;">Stock Room</div>
      </div>
    </div>
  `;
  return wrapper;
}

function enhanceShopFloor() {
  const headings = Array.from(document.querySelectorAll("h2"));
  const shopHeading = headings.find(h => h.textContent?.trim() === "Shop Floor");
  if (!shopHeading) return;

  const section = shopHeading.closest("section");
  if (!section || section.querySelector("[data-longbox-floor-map='true']")) return;

  const grids = Array.from(section.querySelectorAll("div"));
  const oldGrid = grids.find(div => {
    const cells = Array.from(div.children || []);
    return cells.length === 35 && cells.every(child => child.textContent !== undefined);
  });

  if (!oldGrid) return;
  oldGrid.style.display = "none";
  oldGrid.setAttribute("data-old-floor-grid", "hidden");
  oldGrid.parentNode.insertBefore(buildFloorMap(), oldGrid);
}

export default function AppV11() {
  useEffect(() => {
    enhanceShopFloor();
    const observer = new MutationObserver(() => enhanceShopFloor());
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = setInterval(enhanceShopFloor, 1200);
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return <AppV10 />;
}
