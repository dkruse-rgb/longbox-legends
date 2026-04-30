import React, { useEffect } from "react";
import AppV21 from "./AppV21.jsx";

function ensureStyle() {
  if (document.getElementById("longbox-zone-modal-polish-style")) return;
  const style = document.createElement("style");
  style.id = "longbox-zone-modal-polish-style";
  style.textContent = `
    .ll-zone-modal-card {
      max-height: min(82vh, 760px) !important;
      overflow-y: auto !important;
      overscroll-behavior: contain !important;
      padding-top: 16px !important;
      padding-bottom: 20px !important;
      scrollbar-width: thin;
    }
    .ll-zone-modal-header {
      position: sticky !important;
      top: -16px !important;
      z-index: 5 !important;
      margin: -16px -20px 16px !important;
      padding: 16px 20px 12px !important;
      background: rgba(255,255,255,.96) !important;
      border-bottom: 1px solid rgba(15,23,42,.08) !important;
      backdrop-filter: blur(10px) !important;
      border-radius: 28px 28px 0 0 !important;
    }
    .ll-zone-modal-card h2 {
      font-size: clamp(2rem, 8vw, 3rem) !important;
      line-height: .95 !important;
      word-break: normal !important;
    }
    .ll-zone-modal-card [data-zone-close="true"] {
      flex: 0 0 auto !important;
      box-shadow: 0 6px 14px rgba(15,23,42,.08) !important;
    }
    @media (max-width: 640px) {
      .ll-zone-modal-card {
        max-height: calc(100vh - 96px) !important;
        border-radius: 28px !important;
      }
      .ll-zone-modal-header {
        top: -16px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function findZoneModalCards() {
  const candidates = Array.from(document.querySelectorAll("div"));
  return candidates.filter(el => {
    const text = el.textContent || "";
    if (!text.includes("Shop Zone")) return false;
    if (!text.includes("Suggested Move")) return false;
    if (!text.includes("Demand")) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width < 280 || rect.height < 320) return false;
    const style = window.getComputedStyle(el);
    return style.backgroundColor.includes("255") || el.className?.toString().includes("bg-white");
  }).sort((a, b) => a.getBoundingClientRect().height - b.getBoundingClientRect().height);
}

function polishZoneModal() {
  ensureStyle();
  const cards = findZoneModalCards();
  const card = cards[cards.length - 1];
  if (!card || card.getAttribute("data-zone-modal-polished") === "true") return;

  card.setAttribute("data-zone-modal-polished", "true");
  card.classList.add("ll-zone-modal-card");

  const header = Array.from(card.children).find(child => {
    const text = child.textContent || "";
    return text.includes("Shop Zone") && text.includes("Close");
  });
  if (header) header.classList.add("ll-zone-modal-header");

  const closeButton = Array.from(card.querySelectorAll("button")).find(button => (button.textContent || "").trim() === "Close");
  if (closeButton) closeButton.setAttribute("data-zone-close", "true");

  const title = Array.from(card.querySelectorAll("h2")).find(h => h.textContent && h.textContent.trim().length > 0);
  if (title) title.scrollIntoView({ block: "nearest" });
}

export default function AppV22() {
  useEffect(() => {
    polishZoneModal();
    const observer = new MutationObserver(polishZoneModal);
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = setInterval(polishZoneModal, 500);
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return <AppV21 />;
}
