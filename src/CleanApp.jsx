import { useEffect, useMemo, useState } from "react";
import CleanGame from "./CleanGame.jsx";
import { getTrend, INVENTORY_CATALOG } from "./game/catalog";
import { getSave, getUpgrades, stockFor, totalStock } from "./game/save";

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

function buildTodayPlan(save) {
  if (!save) {
    return [
      { icon: "🏪", title: "Start the shop", detail: "Open the game, stock a few shelves, then run your first live day." }
    ];
  }

  const day = Number(save.day) || 1;
  const trend = getTrend(day);
  const trendItem = INVENTORY_CATALOG[trend.itemId];
  const trendStock = stockFor(save, trend.itemId);
  const stock = totalStock(save);
  const upgrades = getUpgrades(save);
  const rep = Number(save.rep) || 0;
  const pricing = save.priceStrategy || {};
  const ideas = [];

  if (trendItem && trendStock < 8) {
    ideas.push({
      icon: trend.icon || "🔥",
      title: `Stock the trend: ${trendItem.name}`,
      detail: `${trend.name} is hot this week, but you only have ${trendStock}. Restock before opening.`
    });
  } else if (trendItem) {
    ideas.push({
      icon: trend.icon || "🔥",
      title: `Use the ${trend.name} trend`,
      detail: `${trendItem.name} has ${trendStock} in stock. Consider Premium pricing if demand feels strong.`
    });
  }

  if (stock < 30) {
    ideas.push({
      icon: "📦",
      title: "Shelves look thin",
      detail: `You have ${stock} total stock. Restock before opening so customers do not bounce.`
    });
  }

  if (!upgrades.includes("wall")) {
    ideas.push({
      icon: "🗄️",
      title: "Build the Longbox Wall",
      detail: "It makes back issues more meaningful and helps collectible discovery feel tied to the floor map."
    });
  } else if (!upgrades.includes("case")) {
    ideas.push({
      icon: "🔐",
      title: "Aim for the Rare Case",
      detail: "The Rare Case improves collector appeal and can allow extra collectible finds during Live Day."
    });
  }

  const premiumCount = Object.values(pricing).filter(value => ["premium", "collector"].includes(value)).length;
  if (premiumCount >= 3 && rep < 45) {
    ideas.push({
      icon: "⚠️",
      title: "Watch price pushback",
      detail: "Several sections are priced high. With lower rep, customers may skip purchases and hurt growth."
    });
  }

  if (ideas.length < 3 && rep < 35) {
    ideas.push({
      icon: "⭐",
      title: "Grow reputation steadily",
      detail: "Fair pricing, full shelves, and completed missions are safer than chasing giant margins early."
    });
  }

  if (ideas.length < 3) {
    ideas.push({
      icon: "▶️",
      title: "Open the shop",
      detail: "You are stocked enough to run a day. Watch the report for skipped customers and trend sales."
    });
  }

  return ideas.slice(0, 3);
}

function TodayPlan() {
  const [save, setSaveState] = useState(() => getSave());

  useEffect(() => {
    const refresh = () => setSaveState(getSave());
    refresh();
    window.addEventListener("longbox-save-changed", refresh);
    window.addEventListener("longbox-collection-changed", refresh);
    window.addEventListener("longbox-missions-changed", refresh);
    const interval = window.setInterval(refresh, 1200);
    return () => {
      window.removeEventListener("longbox-save-changed", refresh);
      window.removeEventListener("longbox-collection-changed", refresh);
      window.removeEventListener("longbox-missions-changed", refresh);
      window.clearInterval(interval);
    };
  }, []);

  const ideas = useMemo(() => buildTodayPlan(save), [save]);

  return <div className="bg-[#f6efe3] px-3 pt-3 text-slate-950 lg:px-6 lg:pt-6">
    <section className="mx-auto max-w-7xl rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-amber-600">Today&apos;s Plan</div>
          <h2 className="mt-1 text-xl font-black sm:text-2xl">Best next moves</h2>
        </div>
        <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">Day {save?.day || 1}</div>
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-3">
        {ideas.map((idea, index) => <div key={`${idea.title}-${index}`} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5">
          <div className="flex gap-3">
            <div className="text-2xl">{idea.icon}</div>
            <div>
              <div className="text-sm font-black">{idea.title}</div>
              <div className="mt-1 text-xs font-semibold text-slate-500">{idea.detail}</div>
            </div>
          </div>
        </div>)}
      </div>
    </section>
  </div>;
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

  return <>
    <TodayPlan />
    <CleanGame />
  </>;
}
