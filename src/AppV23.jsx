import React, { useEffect } from "react";
import AppV22 from "./AppV22.jsx";

function ensureStyle() {
  if (document.getElementById("longbox-live-polish-style")) return;
  const style = document.createElement("style");
  style.id = "longbox-live-polish-style";
  style.textContent = `
    /* Upgrade overlays are great on the normal shop map, but they clutter Live Day. */
    .fixed .ll-upgrade-layer,
    .fixed .ll-upgrade-marker,
    .fixed .ll-upgrade-detail,
    .fixed .ll-upgrade-legend,
    .fixed .ll-upgrade-strip {
      display: none !important;
    }

    .ll-live-card-polished {
      max-height: calc(100vh - 88px) !important;
    }

    .ll-live-card-polished .absolute.bottom-3.left-3.right-3.z-30 {
      max-height: 104px !important;
      padding: 10px !important;
      border-radius: 18px !important;
    }

    .ll-live-card-polished .absolute.bottom-3.left-3.right-3.z-30 .space-y-1\.5 > div:nth-child(n+3) {
      display: none !important;
    }

    .ll-live-card-polished .absolute.bottom-3.left-3.right-3.z-30 .space-y-1\.5 > div {
      padding-top: 7px !important;
      padding-bottom: 7px !important;
      line-height: 1.1 !important;
    }

    .ll-live-card-polished .shrink-0.rounded-2xl.bg-slate-950 {
      position: relative !important;
      z-index: 80 !important;
      box-shadow: 0 8px 20px rgba(15, 23, 42, .18) !important;
    }

    @media (max-width: 640px) {
      .ll-live-card-polished {
        height: 82vh !important;
        padding: 14px !important;
      }
      .ll-live-card-polished h2 {
        font-size: 2rem !important;
        line-height: 1 !important;
      }
      .ll-live-card-polished p {
        font-size: .95rem !important;
        line-height: 1.3 !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function polishLiveOverlay() {
  ensureStyle();
  const titles = Array.from(document.querySelectorAll("h2")).filter(h => (h.textContent || "").includes("Open Shop Day"));
  titles.forEach(title => {
    const card = title.closest("div.relative.flex");
    if (card) card.classList.add("ll-live-card-polished");
  });

  // If upgrade layers were already injected into the live map before CSS loaded, remove them outright.
  const liveCards = Array.from(document.querySelectorAll(".ll-live-card-polished"));
  liveCards.forEach(card => {
    card.querySelectorAll(".ll-upgrade-layer, .ll-upgrade-marker, .ll-upgrade-detail, .ll-upgrade-legend, .ll-upgrade-strip").forEach(el => el.remove());
  });
}

export default function AppV23() {
  useEffect(() => {
    polishLiveOverlay();
    const observer = new MutationObserver(polishLiveOverlay);
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = setInterval(polishLiveOverlay, 400);
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return <AppV22 />;
}
