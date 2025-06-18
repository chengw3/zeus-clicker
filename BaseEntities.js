// 🔁 UNIFIED ENTITY DATA: Buildings and Upgrades
export const baseEntities = [
  // 🏠 Buildings
  {
    id: "House",
    type: "building",
    emoji: "🏠",
    cost: {
      energy: 50,
      CO2: -20,
    },
    rate: {
      CO2: 10,
    },
    effects: {
      cap: { people: 5 },
    },
  },
  {
    id: "SolarPanel",
    type: "building",
    emoji: "☀️",
    cost: {
      energy: 50,
      CO2: -20,
    },
    rate: {
      energy: 10,
      CO2: 5,
    },
  },
  {
    id: "WindTurbine",
    type: "building",
    emoji: "🌬️",
    cost: {
      energy: 50,
      CO2: -10,
    },
    rate: {
      energy: 20,
      CO2: -10,
    },
  },

  // 🔼 Upgrades
  {
    id: "solar-boost-1",
    type: "upgrade",
    target: "SolarPanel",
    scope: "building",
    cost: {
      energy: 50,
    },
    effects: {
      modify: [
        {
          path: ["rate", "energy"],
          type: "multiply",
          value: 1.5,
        },
      ],
    },
    description: "+50% solar panel energy",
  },
  {
    id: "free-solar-1",
    type: "upgrade",
    target: "SolarPanel",
    scope: "building",
    cost: {
      energy: 50,
    },
    effects: {
      modify: [
        {
          path: ["cost", "energy"],
          type: "multiply",
          value: 0,
        },
      ],
    },
    description: "FREE solar panel energy",
  },
  {
    id: "upgrade-discount",
    type: "upgrade",
    scope: "upgrade",
    cost: {
      energy: 50,
    },
    effects: {
      special: {
        type: "globalUpgradeDiscount",
        value: 0.75,
      },
    },
    description: "-25% all future upgrade costs",
  },
];
