import { useEffect } from "react";
import CleanGame from "./CleanGame.jsx";

// Longbox Legends clean entry point.
//
// The deployed game now runs through the rebuilt component architecture:
// GameShell, FloorMap, ZoneDetails, LiveDay, MissionSystem, and CollectionModal.
// The older AppV prototype files remain in the repo as fallback/reference while
// new work moves into reusable components under src/components and logic modules
// under src/game.

const INVENTORY_NAMES = [
  "New Release Comics",
  "Manga Volumes",
  "Trading Card Packs",
  "Back Issue Bundle",
  "Collectible Figures",
  "Local Indie Zines"
];

function textOf(node) {
  return node?.textContent?.replace(/\s+/g, " ").trim() || "";
}

function findSectionContaining(...phrases) {
  return Array.from(document.querySelectorAll("section")).find(section => {
    const text = textOf(section);
    return phrases.every(phrase => text.includes(phrase));
  });
}

function makeRestockButton(name, sourceButton) {
  const text = textOf(sourceButton);
  const match = text.match(/Buy\s+(\d+)\s+for\s+\$(\d+)/i);
  const label = match ? `Buy ${match[1]} for $${match[2]}` : "Buy Stock";
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.longboxMergedBuy = "true";
  button.dataset.longboxMergedBuyName = name;
  button.className = "mt-3 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white active:scale-[.99]";
  button.textContent = label;
  button.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    sourceButton.click();
  });
  return button;
}

function mergeBuyTabControls() {
  const pricingSection = findSectionContaining("Pricing Strategy", "Set Prices");
  const buySection = findSectionContaining("Distributor Market", "Buy Stock");
  if (!pricingSection || !buySection || pricingSection === buySection) return;

  const eyebrow = Array.from(pricingSection.querySelectorAll("div")).find(node => textOf(node) === "Pricing Strategy");
  if (eyebrow) eyebrow.textContent = "Inventory Manager";

  const heading = Array.from(pricingSection.querySelectorAll("h2")).find(node => textOf(node) === "Set Prices");
  if (heading) heading.textContent = "Buy Stock & Set Prices";

  const intro = pricingSection.querySelector("p");
  if (intro) {
    intro.textContent = "Manage each section in one place: stock level, base price, pricing strategy, and restock button.";
  }

  for (const name of INVENTORY_NAMES) {
    const priceCard = Array.from(pricingSection.querySelectorAll("div"))
      .filter(node => textOf(node).includes(name) && textOf(node).includes("Current:") && textOf(node).includes("Base $"))
      .sort((a, b) => textOf(a).length - textOf(b).length)[0];

    const sourceButton = Array.from(buySection.querySelectorAll("button"))
      .find(button => textOf(button).includes(name) && textOf(button).includes("Buy"));

    if (!priceCard || !sourceButton) continue;

    priceCard.querySelectorAll("[data-longbox-merged-buy]").forEach(node => node.remove());
    priceCard.appendChild(makeRestockButton(name, sourceButton));
  }

  buySection.style.display = "none";
  buySection.setAttribute("data-longbox-hidden-buy-section", "true");
}

export default function CleanApp() {
  useEffect(() => {
    const run = () => window.requestAnimationFrame(mergeBuyTabControls);
    run();

    const observer = new MutationObserver(run);
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = window.setInterval(run, 600);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  return <CleanGame />;
}
