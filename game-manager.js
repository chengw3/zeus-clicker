import { baseBuildingStats } from "./BaseStats.js";
import { baseUpgrades } from "./BaseStats.js";

// modified this explanation here
export class GameManager {
  constructor() {
    this.baseBuildingStats = JSON.parse(JSON.stringify(baseBuildingStats));
    this.baseUpgrades = JSON.parse(JSON.stringify(baseUpgrades));
    this.availableUpgradesNames = new Set(
      this.baseUpgrades.map((upgrade) => upgrade.id)
    );
    console.log(this.availableUpgradesNames)
    this.purchasedUpgradesNames = new Set();
    this.elapsedTime = 0;
    this.buildingCount = Object.keys(this.baseBuildingStats).reduce(
      (acc, key) => {
        acc[key] = 0;
        return acc;
      },
      {}
    );

    this.state = {
      totalEnergy: 500,
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
    const staticMultiplier = 1 + this.state.totalPeople * 0.05;
    // console.log(
    //   `Applying static multiplier of ${staticMultiplier} to building ${buildingName}.`
    // );
    for (const key in effectiveStats.staticImpact) {
      effectiveStats.staticImpact[key] *= staticMultiplier;
    }

    // 3. Apply upgrade effects
    for (const upgrade of this.purchasedUpgradesNames || []) {
      //if the upgrade does not target this building, skip it
      const isTargetedAtBuilding = upgrade.target === buildingName;
      const isGlobalForBuildings =
        (upgrade.target === null || upgrade.target === undefined) &&
        (upgrade.scope === "building" || upgrade.scope === "all");

      const isValidTarget = isTargetedAtBuilding || isGlobalForBuildings;

      if (
        !isValidTarget ||
        !upgrade.effect ||
        upgrade.effect.type !== "multiply" ||
        !Array.isArray(upgrade.effect.path)
      )
        continue;

      // Traverse the path to find the correct reference
      let ref = effectiveStats; // Start with the basestats object\
      const type = upgrade.effect.type;
      const path = upgrade.effect.path;
      const value = upgrade.effect.value;

      if (!this.applyPathUpgrade(ref, path, value, type))
        console.warn(
          `Failed to apply upgrade ${upgrade.id} to building ${buildingName}`
        );
    }

    return effectiveStats;
  }

  getUpgradeStats(UpgradeName) {
    const base = this.baseUpgrades.find(
      (upgrade) => upgrade.id === UpgradeName
    );
    if (!base) {
      console.warn(`Upgrade ${UpgradeName} not found in base stats`);
      return null;
    }
    // 1. Deep copy base stats to avoid mutation
    const effectiveStats = JSON.parse(JSON.stringify(base));

    // apply upgrade effects
    for (const upgradeName of this.purchasedUpgradesNames || []) {
      //if the upgrade does not target this upgrade, skip it
      const upgrade = this.baseUpgrades.find(u => u.id === upgradeName);
      console.log(this.baseUpgrades)
      if (
        upgrade.target !== UpgradeName ||
        !upgrade.effect ||
        !Array.isArray(upgrade.effect.path)
      )
        continue;

      // Traverse the path to find the correct reference
      let ref = effectiveStats; // Start with the basestats object
      const type = upgrade.effect.type;
      const path = upgrade.effect.path;
      const value = upgrade.effect.value;

      if (!this.applyPathUpgrade(ref, path, value, type))
        console.warn(
          `Failed to apply upgrade ${upgrade.id} to upgrade ${UpgradeName}`
        );
    }
    return effectiveStats;
  }

  applyPathUpgrade(targetObj, path, value, type = "multiply") {
    let ref = targetObj;
    for (let i = 0; i < path.length - 1; i++) {
      if (!ref[path[i]]) return false;
      ref = ref[path[i]];
    }
    const key = path[path.length - 1];
    if (ref[key] === undefined) return false;

    switch (type) {
      case "multiply":
        ref[key] *= value;
        break;
      case "add":
        ref[key] += value;
        break;
      case "override":
        ref[key] = value;
        break;
      default:
        return false;
    }
    return true;
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
    // console.log("tick", game.elapsedTime);
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
    if (this.purchasedUpgradesNames.has(UpgradeName)) {
      console.warn(`Upgrade ${UpgradeName} already purchased`);
      return;
    }
    const stats = this.getUpgradeStats(UpgradeName);
    if (!stats) {
      console.warn(`Upgrade ${UpgradeName} not found`);
      return;
    }

    if (this.availableUpgradesNames.has(UpgradeName)) {
      this.availableUpgradesNames.delete(UpgradeName);
      this.purchasedUpgradesNames.add(UpgradeName);
    }
  }
}
