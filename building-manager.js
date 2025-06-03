class BuildingManager {
  constructor() {
    this.instances = [];
  }

  build(templateName) {
    const instance = new BuildingInstance(buildingTemplates[templateName]);
    this.instances.push(instance);
  }

  getTotalGain() {
    return this.instances.reduce(
      (totals, inst) => {
        const g = inst.getGain();
        totals.energy += g.energy;
        totals.co2 += g.co2;
        return totals;
      },
      { energy: 0, co2: 0 }
    );
  }
}

class Building {
  constructor(name, config) {
    this.name = name;
    this.level = 1;

    this.energyCost = config.energyCost;
    this.co2Cost = config.co2Cost;
    this.staticGain = config.staticGain;

    this.energyPerSecond = config.energyPerSecond;
    this.co2PerSecond = config.co2PerSecond;

    this.built = 0;
  }

  build() {
    this.built += 1;
    return {
      energyCost: this.energyCost,
      co2Cost: this.co2Cost,
      staticGain: this.staticGain,
    };
  }

  upgrade() {
    this.level += 1;
    this.energyPerSecond *= 1.5;
    this.co2PerSecond *= 1.5;
  }

  getOngoingGain() {
    return {
      energy: this.energyPerSecond * this.built,
      co2: this.co2PerSecond * this.built,
    };
  }
}
