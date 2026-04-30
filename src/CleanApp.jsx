import { useEffect, useMemo, useState } from "react";
import CleanGame from "./CleanGame.jsx";
import { getTrend, INVENTORY_CATALOG } from "./game/catalog";
import { getSave, getUpgrades, stockFor, totalStock } from "./game/save";

// Longbox Legends clean entry point.
// The deployed game runs through the rebuilt component architecture while this
// wrapper handles a few lightweight UI helpers.

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
  if (heading) heading.textContent = "Stock & Prices";

  const intro = pricingSection.querySelector("p");
  if (intro) intro.textContent = "Pick a price. Buy stock. Then open the shop.";

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

function trafficFor(save) {
  const day = Number(save?.day) || 1;
  const upgrades = getUpgrades(save).length;
  const rep = Number(save?.rep) || 0;
  return Math.min(26, 4 + Math.floor(rep / 18) + upgrades + Math.floor(day / 7));
}

function getSimpleCoach(save) {
  if (!save) {
    return {
      headline: "Stock shelves, then open.",
      subline: "That is the game. Buy stuff, sell stuff, get better stuff.",
      steps: [
        { icon: "📦", label: "Stock", value: "Buy comics" },
        { icon: "⚖️", label: "Price", value: "Fair is safe" },
        { icon: "▶️", label: "Open", value: "Run day" }
      ],
      note: "Start simple. Fancy stuff can wait."
    };
  }

  const day = Number(save.day) || 1;
  const trend = getTrend(day);
  const trendItem = INVENTORY_CATALOG[trend.itemId];
  const trendStock = stockFor(save, trend.itemId);
  const stock = totalStock(save);
  const rep = Number(save.rep) || 0;
  const upgrades = getUpgrades(save);
  const pricing = save.priceStrategy || {};
  const highPrices = Object.values(pricing).filter(value => ["premium", "collector"].includes(value)).length;

  let headline = "Open the shop.";
  let subline = "You are good enough to run a day. Do not overthink it.";
  let note = `${trend.icon} Trend: ${trendItem?.name || "Hot items"} (${trendStock} stocked).`;

  if (stock < 20) {
    headline = "Buy stock first.";
    subline = "Shelves are too empty. Customers hate empty shelves. Very rude of them, but true.";
  } else if (trendItem && trendStock < 6) {
    headline = `Restock ${trendItem.name}.`;
    subline = "The trend item is low. Feed the trend before opening.";
  } else if (highPrices >= 3 && rep < 45) {
    headline = "Lower some prices.";
    subline = "Too much Premium/Collector pricing can make customers walk out.";
  } else if (!upgrades.includes("wall") && Number(save.cash) >= 380) {
    headline = "Build Longbox Wall.";
    subline = "It makes the shop feel more like a real comic shop and helps collector gameplay.";
  } else if (upgrades.includes("wall") && !upgrades.includes("case") && Number(save.cash) >= 600) {
    headline = "Build Rare Case.";
    subline = "It helps rare collectible finds. Also: shiny case go brrr.";
  }

  return {
    headline,
    subline,
    steps: [
      { icon: stock < 20 ? "⚠️" : "📦", label: "Stock", value: stock < 20 ? "Low" : `${stock} total` },
      { icon: highPrices >= 3 && rep < 45 ? "⚠️" : "⚖️", label: "Price", value: highPrices >= 3 && rep < 45 ? "Too high" : "Mostly fair" },
      { icon: "▶️", label: "Open", value: `${trafficFor(save)} visitors` }
    ],
    note
  };
}

function CoachStep({ step }) {
  return <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5">
    <div className="text-2xl">{step.icon}</div>
    <div className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-500">{step.label}</div>
    <div className="mt-1 text-base font-black">{step.value}</div>
  </div>;
}

function SimpleCoach() {
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

  const coach = useMemo(() => getSimpleCoach(save), [save]);

  return <div className="bg-[#f6efe3] px-3 pt-3 text-slate-950 lg:px-6 lg:pt-6">
    <section className="mx-auto max-w-7xl rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-amber-600">Simple Mode</div>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl">{coach.headline}</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">{coach.subline}</p>
        </div>
        <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">Day {save?.day || 1}</div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {coach.steps.map(step => <CoachStep key={step.label} step={step} />)}
      </div>
      <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm font-black text-amber-950 ring-1 ring-amber-100">{coach.note}</div>
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
    <SimpleCoach />
    <CleanGame />
  </>;
}
