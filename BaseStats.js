export const baseBuildingStats = {
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

export const baseUpgrades = [
  {
    id: "solar-boost-1",
    target: "SolarPanel",
    scope: "building",
    staticImpact: {
      energy: -50,
    },
    effect: {
      type: "multiply",
      path: ["variableImpact", "energy"],
      value: 1.5,
    },
    description: "+50% solar panel energy",
  },

  {
    id: "free-solar-1",
    target: "SolarPanel",
    scope: "building",
    staticImpact: {
      energy: -50,
    },
    effect: {
      type: "multiply",
      path: ["staticImpact", "energy"],
      value: 0, // effectively makes it free
    },
    description: "FREE solar panel energy",
  },

  {
    id: "upgrade-discount",
    staticImpact: {
      energy: -50,
    },
    target: null, // optional, explicitly marks as global
    scope: "upgrade",
    effect: {
      type: "globalUpgradeDiscount", // special effect type, handled separately
      value: 0.75,
    },
    target: null, // optional, explicitly marks as global
    description: "-25% all future upgrade costs",
  },
];
