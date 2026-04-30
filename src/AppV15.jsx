import React, { useEffect } from "react";
import AppV14 from "./AppV14.jsx";

function compactLiveHud() {
  const labels = Array.from(document.querySelectorAll("div"));
  const activityLabel = labels.find(el => el.textContent?.trim() === "Live Activity");
  if (!activityLabel) return;

  const feed = activityLabel.closest("div.absolute");
  if (!feed || feed.getAttribute("data-compact-hud") === "true") return;

  feed.setAttribute("data-compact-hud", "true");
  feed.style.left = "12px";
  feed.style.right = "12px";
  feed.style.bottom = "12px";
  feed.style.padding = "10px";
  feed.style.borderRadius = "18px";
  feed.style.maxHeight = "118px";
  feed.style.overflow = "hidden";
  feed.style.background = "rgba(2, 6, 23, 0.92)";
  feed.style.backdropFilter = "blur(8px)";

  const rows = Array.from(feed.querySelectorAll("div.rounded-xl"));
  rows.forEach((row, index) => {
    row.style.padding = index === 0 ? "8px 10px" : "6px 10px";
    row.style.fontSize = index === 0 ? "13px" : "11px";
    row.style.lineHeight = "1.15";
    row.style.whiteSpace = "nowrap";
    row.style.overflow = "hidden";
    row.style.textOverflow = "ellipsis";
    if (index > 2) row.style.display = "none";
  });

  const header = feed.firstElementChild;
  if (header) {
    header.style.marginBottom = "6px";
  }
}

function tuneLiveModal() {
  const title = Array.from(document.querySelectorAll("h2")).find(el => el.textContent?.includes("Open Shop Day"));
  if (!title) return;

  const card = title.closest("div.relative.flex");
  if (card && card.getAttribute("data-live-card-tuned") !== "true") {
    card.setAttribute("data-live-card-tuned", "true");
    card.style.height = "84vh";
    card.style.padding = "14px";
  }

  const map = Array.from(document.querySelectorAll("div.relative.min-h-0.flex-1")).find(el => el.textContent?.includes("New Releases Wall"));
  if (map && map.getAttribute("data-map-tuned") !== "true") {
    map.setAttribute("data-map-tuned", "true");
    map.style.minHeight = "0";
  }
}

function runEnhancements() {
  compactLiveHud();
  tuneLiveModal();
}

export default function AppV15() {
  useEffect(() => {
    runEnhancements();
    const observer = new MutationObserver(runEnhancements);
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = setInterval(runEnhancements, 300);
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return <AppV14 />;
}
