import React, { useEffect, useState } from "react";
import AppV5 from "./AppV5.jsx";

const PRIMARY_SAVE_KEY = "longbox-legends-save-v5";
const SAVE_KEYS = [
  "longbox-legends-save-v5",
  "longbox-legends-save-v4",
  "longbox-legends-save-v3",
  "longbox-legends-save-v2",
  "longbox-legends-save-v1"
];

function clamp(num, min, max) {
  return Math.min(max, Math.max(min, num));
}

function safeParse(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function totalStock(save) {
  const inventory = Array.isArray(save?.inventory) ? save.inventory : [];
  const rare = Array.isArray(save?.rare) ? save.rare : [];
  return inventory.reduce((sum, item) => sum + (Number(item.stock) || 0), 0) + rare.length;
}

function loyaltyTotal(save) {
  const loyalty = save?.loyalty && typeof save.loyalty === "object" ? save.loyalty : {};
  return Object.values(loyalty).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

function computeReputationFloor(save) {
  const day = Number(save?.day) || 1;
  const lifetimeSales = Number(save?.lifetimeSales) || 0;
  const fulfilledPulls = Number(save?.fulfilledPulls) || 0;
  const trendWins = Number(save?.trendWins) || 0;
  const upgrades = Array.isArray(save?.upgrades) ? save.upgrades.length : 0;
  const debt = Number(save?.debt) || 0;
  const stock = totalStock(save);
  const fans = loyaltyTotal(save);

  const dayRep = Math.floor(day / 4);
  const salesRep = Math.floor(lifetimeSales / 250);
  const pullRep = fulfilledPulls * 2;
  const trendRep = Math.floor(trendWins / 3);
  const fanRep = Math.floor(fans / 12);
  const stockRep = Math.floor(stock / 18);
  const upgradeRep = upgrades * 2;
  const debtPenalty = Math.min(8, Math.floor(debt / 250));

  return clamp(10 + dayRep + salesRep + pullRep + trendRep + fanRep + stockRep + upgradeRep - debtPenalty, 0, 100);
}

function improveSaveReputation() {
  for (const key of SAVE_KEYS) {
    const save = safeParse(localStorage.getItem(key));
    if (!save) continue;

    const currentRep = Number(save.rep) || 0;
    const reputationFloor = computeReputationFloor(save);
    const recoveredRep = save.cash > 0 || totalStock(save) > 0 ? Math.max(reputationFloor, 8) : reputationFloor;
    const improvedRep = Math.max(currentRep, recoveredRep);

    if (improvedRep > currentRep) {
      const improved = {
        ...save,
        rep: improvedRep,
        log: [
          `Reputation recalibrated to ${improvedRep}/100 based on sales, loyalty, pull lists, trends, and shop progress.`,
          ...(Array.isArray(save.log) ? save.log : [])
        ].slice(0, 10)
      };
      localStorage.setItem(PRIMARY_SAVE_KEY, JSON.stringify(improved));
      return true;
    }

    if (key !== PRIMARY_SAVE_KEY) {
      localStorage.setItem(PRIMARY_SAVE_KEY, JSON.stringify(save));
      return true;
    }

    return false;
  }

  return false;
}

export default function AppV6() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (improveSaveReputation()) {
      setVersion(v => v + 1);
    }

    const timer = setInterval(() => {
      if (improveSaveReputation()) {
        setVersion(v => v + 1);
      }
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  return <AppV5 key={version} />;
}
