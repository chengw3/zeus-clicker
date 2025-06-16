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
    console.log(this.availableUpgradesNames);
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
      people: 10, // Example cap for people
    };

    this.rate = {
      energy: 0,
      CO2: 0,
      people: 0,
    };

    this.warningTriggered = false;
    this.explosionTimer = null;
  }

  getEffectiveStats(targetId, type = "building") {
    const isBuilding = type === "building";
    const base = isBuilding
      ? this.baseBuildingStats?.[targetId]
      : this.baseUpgrades?.find((u) => u.id === targetId);

    if (!base) {
      console.warn(`${type} '${targetId}' not found in base stats`);
      return null;
    }

    // 1. Deep copy base stats to avoid mutation
    const effectiveStats = JSON.parse(JSON.stringify(base));

    // 2. Optional: apply people-based multiplier to staticImpact for buildings
    if (isBuilding && effectiveStats.staticImpact) {
      const staticMultiplier = 1 + this.state.totalPeople * 0.05;
      for (const key in effectiveStats.staticImpact) {
        effectiveStats.staticImpact[key] *= staticMultiplier;
      }
    }

    // 3. Apply relevant upgrades
    const purchased = this.purchasedUpgradesNames ?? [];
    for (const name of purchased) {
      const upgrade = this.baseUpgrades.find((u) => u.id === name);
      if (!upgrade || !upgrade.effect) continue;

      const isTargetedAtEntity = upgrade.target === targetId;
      const isGlobalForType =
        (upgrade.target === null || upgrade.target === undefined) &&
        (upgrade.scope === type || upgrade.scope === "all");

      const shouldApply = isTargetedAtEntity || isGlobalForType;

      if (
        !shouldApply ||
        upgrade.effect.type !== "multiply" ||
        !Array.isArray(upgrade.effect.path)
      )
        continue;

      const { path, value, type: effectType } = upgrade.effect;

      if (!this.applyPathUpgrade(effectiveStats, path, value, effectType)) {
        console.warn(
          `Failed to apply upgrade ${upgrade.id} to ${type} ${targetId}`
        );
      }
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
      const stats = this.getEffectiveStats(buildingName, "building");
      if (stats) {
        energyRate += stats.variableImpact?.energy * count || 0;
        CO2Rate += stats.variableImpact?.CO2 * count || 0;
        peopleRate += stats.variableImpact?.people * count || 0;
      }
    }

    CO2Rate += this.state.totalPeople * 0.1;

    // ⛔ disabled for now
    // peopleRate += this.state.totalPeople * 0.05;

    this.rate.energy = energyRate;
    this.rate.CO2 = CO2Rate;
    this.rate.people = 0;
  }

  tick(deltaTime = 1) {
    this.updateRates(); // <- invoke the method
    this.elapsedTime += deltaTime;
    this.state.totalPeople += this.rate.people * deltaTime || 0;
    this.state.totalPeople = Math.min(this.state.totalPeople, this.cap.people);

    this.state.totalEnergy += this.rate.energy * deltaTime || 0;
    this.state.totalCO2 += this.rate.CO2 * deltaTime || 0;

    this.handleCO2Collapse(deltaTime);
  }

  addPerson() {
    if (this.state.totalPeople >= this.cap.people) {
      return { success: false, reason: "cap_reached" };
    }

    this.state.totalPeople += 1;
    return { success: true };
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
    const stats = this.getEffectiveStats(buildingName, "building");
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
    const stats = this.getEffectiveStats(UpgradeName, "upgrade");
    if (!stats) {
      console.warn(`Upgrade ${UpgradeName} not found`);
      return;
    }

    if (this.availableUpgradesNames.has(UpgradeName)) {
      this.availableUpgradesNames.delete(UpgradeName);
      this.purchasedUpgradesNames.add(UpgradeName);
    }
  }
  handleCO2Collapse(deltaTime) {
    const dynamicLimit = this.state.totalPeople * 5; // tweak as needed
    const currentCO2 = this.state.totalCO2;

    if (currentCO2 > dynamicLimit && !this.warningTriggered) {
      this.warningTriggered = true;
      this.explosionTimer = Math.random() * 40 + 20;
      this.flashCO2UI(true);
    }

    if (this.warningTriggered) {
      this.explosionTimer -= deltaTime;

      if (currentCO2 <= dynamicLimit) {
        this.warningTriggered = false;
        this.explosionTimer = null;
        this.flashCO2UI(false);
      } else if (this.explosionTimer <= 0) {
        this.triggerGameOver();
      }
    }
  }

  getDynamicCO2Limit() {
    return this.state.totalPeople * 5;
  }

  flashCO2UI(shouldFlash) {
    const counterEl = document.getElementById("co2-counter");
    if (counterEl) {
      counterEl.classList.toggle("flashing", shouldFlash);
    }
  }

  triggerGameOver() {
    alert("🌍 Collapse triggered due to unchecked emissions.");
    // TODO: replace with proper game reset or end screen
  }
}
