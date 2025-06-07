import { baseBuildingStats } from "./BaseStats.js";
import { baseUpgrades } from "./BaseStats.js";

export class GameManager {
  constructor() {
    this.baseBuildingStats = JSON.parse(JSON.stringify(baseBuildingStats));
    this.baseUpgrades = JSON.parse(JSON.stringify(baseUpgrades));
    this.availableUpgrades = new Set(
      this.baseUpgrades.map((upgrade) => upgrade.id)
    );
    this.purchasedUpgrades = new Set();
    this.elapsedTime = 0;
    this.buildingCount = Object.keys(this.baseBuildingStats).reduce(
      (acc, key) => {
        acc[key] = 0;
        return acc;
      },
      {}
    );

    this.state = {
      totalEnergy: 0,
      totalCO2: 0,
      totalPeople: 0,
    };

    this.cap = {
      energy: 1000, // Example cap for energy
      CO2: 500, // Example cap for CO2
      people: 100, // Example cap for people
    };

    this.rate = {
      energy: 0,
      CO2: 0,
      people: 0,
    };
  }

  getBuildingStats(buildingName) {
    const base = this.baseBuildingStats[buildingName];
    if (!base) {
      console.warn(`Building ${buildingName} not found in base stats`);
      return null;
    }

    // 1. Deep copy base stats to avoid mutation
    const effectiveStats = JSON.parse(JSON.stringify(base));

    // 2. Apply people-based multiplier to staticImpact
    const staticMultiplier = 1 + (this.state.totalPeople * 0.01 || 0);
    for (const key in effectiveStats.staticImpact) {
      effectiveStats.staticImpact[key] *= staticMultiplier;
    }

    // 3. Apply upgrade effects
    for (const upgrade of this.purchasedUpgrades || []) {
      if (
        upgrade.target !== buildingName ||
        !upgrade.effect ||
        upgrade.effect.type !== "multiply" ||
        !Array.isArray(upgrade.effect.path)
      )
        continue;

      let ref = effectiveStats;
      const path = upgrade.effect.path;
      for (let i = 0; i < path.length - 1; i++) {
        if (!ref[path[i]]) {
          console.warn(`Invalid upgrade path in ${upgrade.id}`);
          continue;
        }
        ref = ref[path[i]];
      }

      const key = path[path.length - 1];
      if (ref[key] !== undefined) {
        ref[key] *= upgrade.effect.value;
      }
    }

    return effectiveStats;
  }

  getUpgradeStats(UpgradeName) {
    return upgradeStats;
  }

  updateRates() {
    let energyRate = 0;
    let CO2Rate = 0;
    let peopleRate = 0;

    for (const buildingName in this.buildingCount) {
      const count = this.buildingCount[buildingName];
      const stats = this.getBuildingStats(buildingName);
      if (stats) {
        energyRate += stats.variableImpact?.energy * count || 0;
        CO2Rate += stats.variableImpact?.CO2 * count || 0;
        peopleRate += stats.variableImpact?.people * count || 0;
      }
    }

    CO2Rate += this.state.totalPeople * 0.1; // CO2 from people
    peopleRate += this.state.totalPeople * 0.05; // People rate from existing people
    // // Apply caps
    // energyRate = Math.min(energyRate, this.cap.energy);

    this.rate.energy = energyRate;
    this.rate.CO2 = CO2Rate;
    this.rate.people = peopleRate;
  }

  tick(deltaTime = 1) {
    console.log("tick", game.elapsedTime);
    // --- Recalculate rates ---
    this.updateRates;
    this.elapsedTime += deltaTime;
    // --- Update totals ---
    this.state.totalEnergy += this.rate.energy * deltaTime || 0;
    this.state.totalCO2 += this.rate.CO2 * deltaTime || 0;
  }

  getState() {
    return { ...this.state };
  }

  getRates() {
    return { ...this.rates };
  }

  canBuild(buildingName) {
    const stats = this.getBuildingStats(buildingName);
    if (!stats) {
      console.warn(`Building ${buildingName} not found`);
      return false;
    }
    return this.state.totalEnergy >= stats.staticImpact.energy;
  }

  canUpgrade(UpgradeName) {
    const stats = this.getUpgradeStats(UpgradeName);
    if (!stats) {
      console.warn(`Upgrade ${UpgradeName} not found`);
      return false;
    }
    return this.state.totalEnergy >= stats.staticImpact.energy;
  }

  purchaseBuilding(buildingName) {
    /*assumes you can build already */
    const stats = this.getBuildingStats(buildingName);
    this.state.totalEnergy += stats.staticImpact.energy;
    this.state.totalCO2 += stats.staticImpact.CO2;
    this.buildingCount[buildingName] += 1;

    // Update rates based on the new building
    this.updateRates();
  }

  purchaseUpgrade(UpgradeName) {
    if (this.purchasedUpgrades.includes(UpgradeName)) {
      console.warn(`Upgrade ${UpgradeName} already purchased`);
      return;
    }
    const stats = this.getUpgradeStats(UpgradeName);
    if (!stats) {
      console.warn(`Upgrade ${UpgradeName} not found`);
      return;
    }

    if (this.availableUpgrades.has(UpgradeName)) {
      this.availableUpgrades.delete(UpgradeName);
      this.purchasedUpgrades.add(UpgradeName);
    }
  }
}
