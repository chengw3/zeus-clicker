// 🧠 Assumes unified baseEntities[] structure from UnifiedGameData
import { baseEntities } from "./BaseEntities.js";

export class GameManager {
  constructor() {
    // Separate into buildings and upgrades
    this.baseBuildings = baseEntities.filter((e) => e.type === "building");
    this.baseUpgrades = baseEntities.filter((e) => e.type === "upgrade");
    this.buildingMap = Object.fromEntries(
      this.baseBuildings.map((b) => [b.id, b])
    );
    this.upgradeMap = Object.fromEntries(
      this.baseUpgrades.map((u) => [u.id, u])
    );

    this.availableUpgradesNames = new Set(
      this.baseUpgrades.map((upg) => upg.id)
    );
    this.purchasedUpgradesNames = new Set();

    this.buildingCount = {};
    this.baseBuildings.forEach((b) => (this.buildingCount[b.id] = 0));

    this.elapsedTime = 0;

    this.state = {
      energy: 500,
      CO2: 20,
      people: 0,
    };

    this.cap = {
      energy: 1000,
      CO2: 500,
      people: 10,
    };

    this.rate = {
      energy: 0,
      CO2: 0,
      people: 0,
    };

    this.warningTriggered = false;
    this.explosionTimer = null;
  }

  getEffectiveEntity(id, type = "building") {
    const base =
      type === "building" ? this.buildingMap[id] : this.upgradeMap[id];
    if (!base) return null;
    const effectiveEntity = JSON.parse(JSON.stringify(base));

    //NOT used, since existing people does not affect building rates
    // if (type === "building" && stats.rate) {
    //   const mult = 1 + this.state.totalPeople * 0.05;
    //   for (const key in stats.rate) {
    //     stats.rate[key] *= mult;
    //   }
    // }

    for (const upgradeId of this.purchasedUpgradesNames) {
      const upgrade = this.upgradeMap[upgradeId];
      if (!upgrade?.effects?.modify) continue;

      const isTargeted = upgrade.target === id;
      // it is global if it has no target and applies to this type or scope is marked "all"
      const isGlobal =
        !upgrade.target && (upgrade.scope === type || upgrade.scope === "all");
      // skip if not targeted and not global
      if (!isTargeted && !isGlobal) continue;

      this.applyUpgradeEffects(effectiveEntity, upgrade);
    }

    return effectiveEntity;
  }

  applyUpgradeEffects(targetEntity, upgrade) {
    if (!upgrade?.effects?.modify) return;

    for (const { path, value, type: effectType } of upgrade.effects.modify) {
      this.applySinglePathEffect(targetEntity, path, value, effectType);
    }
  }

  // an upgrade can have multiple effects, each with a path to the target property
  applySinglePathEffect(obj, path, value, type = "multiply") {
    let ref = obj;
    for (let i = 0; i < path.length - 1; i++) {
      ref = ref?.[path[i]];
      if (ref === undefined) return false;
    }
    const key = path[path.length - 1];
    if (ref?.[key] === undefined) return false;

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

  checkCaps() {
    const cappedResources = [
      {
        key: "energy",
        capKey: "energy",
        elementId: "energy-counter",
        isHard: true,
      },
      {
        key: "totalPeople",
        capKey: "people",
        elementId: "people-counter",
        isHard: true,
      },
      {
        key: "CO2",
        capKey: "CO2",
        elementId: "CO2-counter", // Note lowercase "co2-counter"
        isHard: false,
      },
    ];

    for (const { key, capKey, elementId, isHard } of cappedResources) {
      const value = this.state[key];
      const cap = this.cap[capKey];
      const el = document.getElementById(elementId);

      if (!el) continue;

      if (value > cap) {
        el.classList.add("flashing");
        if (isHard) this.state[key] = cap;
      } else {
        el.classList.remove("flashing");
      }
    }
  }

  updateRates() {
    let energyRate = 0;
    let CO2Rate = 0;
    console.log("Building Count:", this.buildingCount);
    for (const [id, count] of Object.entries(this.buildingCount)) {
      if (count <= 0) continue;

      const stats = this.getEffectiveEntity(id, "building");
      console.log("Stats for", id, stats);
      if (!stats?.rate) continue;

      energyRate += (stats.rate.energy || 0) * count;
      CO2Rate += (stats.rate.CO2 || 0) * count;
    }

    CO2Rate += this.state.people * 0.1;

    // Preserve existing people rate
    this.rate.energy = energyRate;
    this.rate.CO2 = CO2Rate;
    console.log("Updated rates:", this.rate);
  }

  tick(deltaTime) {
    this.elapsedTime += deltaTime;
    this.state.energy += this.rate.energy * deltaTime;
    this.state.CO2 += this.rate.CO2 * deltaTime;
    this.updateRates();
    this.checkCaps();
    this.handleCO2Collapse(deltaTime);
  }

  canBuy(effectiveEntity) {
    if (!effectiveEntity?.cost) {
      console.log("no cost parameter");
      return false;
    }
    for (const [resource, cost] of Object.entries(effectiveEntity.cost)) {
      const available = this.state[resource];
      console.log(`Checking ${resource}: available=${available}, cost=${cost}`);
      if (available === undefined || available < cost) {
        console.log("no cost param 2");
        return false;
      }
    }
    return true;
  }

  purchaseBuilding(id) {
    const stats = this.getEffectiveEntity(id, "building");
    if (!stats) return;

    // Subtract all costs dynamically
    if (stats.cost) {
      for (const [resource, amount] of Object.entries(stats.cost)) {
        if (this.state[resource] !== undefined) {
          this.state[resource] -= amount;
        } else {
          console.warn(`⚠️ Unknown resource "${resource}" in building cost`);
        }
      }
    }

    // Apply effects (e.g., population cap)
    if (stats.effects?.cap) {
      for (const [key, value] of Object.entries(stats.effects.cap)) {
        if (this.cap[key] !== undefined) {
          this.cap[key] += value;
        } else {
          console.warn(`⚠️ Unknown cap "${key}" in building effect`);
        }
      }
    }

    // Increment building count
    this.buildingCount[id] = (this.buildingCount[id] || 0) + 1;

    this.updateRates();
  }

  purchaseUpgrade(id) {
    if (this.purchasedUpgradesNames.has(id)) return;
    const stats = this.getEffectiveEntity(id, "upgrade");
    if (!stats) return;
    this.state.energy -= stats.cost?.energy || 0;
    this.purchasedUpgradesNames.add(id);
    this.availableUpgradesNames.delete(id);
  }

  addPerson() {
    if (this.state.people >= this.cap.people) {
      this.flashUI("people-counter", true);
      setTimeout(() => this.flashUI("people-counter", false), 1000);
      return { success: false, reason: "cap_reached" };
    }

    this.state.people += 1;
    return { success: true };
  }

  handleCO2Collapse(deltaTime) {
    const limit = this.getDynamicCO2Limit();
    const currentCO2 = this.state.CO2;

    if (this.warningTriggered) {
      this.explosionTimer -= deltaTime;

      if (currentCO2 <= limit) {
        this.warningTriggered = false;
        this.explosionTimer = null;
      } else if (this.explosionTimer <= 0) {
        this.triggerGameOver();
      }
    }
  }

  flashUI(elementId, shouldFlash) {
    const el = document.getElementById(elementId);
    if (el) el.classList.toggle("flashing", shouldFlash);
  }

  getDynamicCO2Limit() {
    return this.state.people * 5;
  }

  triggerGameOver() {
    alert("🌍 Collapse triggered due to unchecked emissions.");
  }
}
