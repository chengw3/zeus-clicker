class GameManager {
  constructor() {
    this.elapsedTime = 0;
    this.buildingCount = {
      House: 0,
      SolarPanel: 0,
      WindTurbine: 0,
      HydroPlant: 0,
    };

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

    this.baseBuildingStats = {
      House: {
        staticImpact: {
          energy: -50,
          CO2: 20,
        },
        variableImpact: {
          energy: 0,
          CO2: 10,
        },
      },

      SolarPanel: {
        staticImpact: {
          energy: -50,
          CO2: 20,
        },
        variableImpact: {
          energy: 10,
          CO2: 5,
        },
      },
      WindTurbine: {
        staticImpact: {
          energy: -50,
          CO2: 10,
        },
        variableImpact: {
          energy: 20,
          CO2: 10,
        },
      },
    };

    this.upgradeModifiers = {
      House: {
        staticMultiplier: {
          energy: 1.0,
          CO2: 1.0,
        },
        variableMultiplier: {
          energy: 1.0,
          CO2: 1.0,
        },
      },
      SolarPanel: {
        staticMultiplier: {
          energy: 1.0,
          CO2: 1.0,
        },
        variableMultiplier: {
          energy: 1.0,
          CO2: 1.0,
        },
      },
      WindTurbine: {
        staticMultiplier: {
          energy: 1.0,
          CO2: 1.0,
        },
        variableMultiplier: {
          energy: 1.0,
          CO2: 1.0,
        },
      },
    };
  }

  getEffectiveBuildingStats(buildingName) {
    const base = this.baseBuildingStats[buildingName];
    const mods = this.upgradeModifiers[buildingName];

    const effectiveStats = {
      staticImpact: {},
      variableImpact: {},
    };

    // Handle staticImpact
    for (const key in base.staticImpact) {
      const multiplier = mods?.staticMultiplier?.[key] ?? 1.0;
      effectiveStats.staticImpact[key] = base.staticImpact[key] * multiplier;
    }

    // Handle variableImpact
    for (const key in base.variableImpact) {
      const multiplier = mods?.variableMultiplier?.[key] ?? 1.0;
      effectiveStats.variableImpact[key] =
        base.variableImpact[key] * multiplier;
    }

    return effectiveBuildingStats;
  }

  tick(deltaTime = 1) {
    console.log("tick", game.elapsedTime);
    // --- Recalculate rates ---
    this.elapsedTime += deltaTime;
    // --- Update totals ---
    this.state.totalEnergy += this.state.totalEnergyRate * deltaTime || 0;
    this.state.totalCO2 += this.state.totalCO2Rate * deltaTime || 0;
  }

  getState() {
    return { ...this.state };
  }

  getRates() {
    return { ...this.rates };
  }
}
