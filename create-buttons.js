import { GameManager } from "./game-manager.js";

const buildingEmojis = {
  House: "🏠",
  SolarPanel: "☀️",
  WindTurbine: "🌬️",
};

export function renderBuildButtons(gameManager) {
  const container = document.getElementById("build-buttons");
  container.innerHTML = ""; // clear old buttons

  for (const buildingName in gameManager.baseBuildingStats) {
    const buildingStats = gameManager.getBuildingStats(buildingName);

    const impact = buildingStats.staticImpact || {};
    const energyCost = -impact.energy ?? 0;
    const co2Cost = impact.CO2 ?? 0;

    const btn = document.createElement("button");
    btn.textContent = `${
      buildingEmojis[buildingName] || buildingName
    } ${buildingName} - ⚡${Math.floor(energyCost)} | 🌫️${Math.floor(co2Cost)}`;
    btn.className = "purchase-btn";

    // Disable if player can't afford it
    const notEnough =
      gameManager.state.totalEnergy < (buildingStats.staticImpact.energy || 0);

    if (notEnough) {
      btn.disabled = true;
      btn.classList.add("disabled"); // add CSS to grey it out
    }

    // Attach build logic
    btn.addEventListener("click", () => {
      gameManager.purchaseBuilding(buildingName);
      renderBuildButtons(gameManager); // re-render buttons after state changes
    });

    container.appendChild(btn);
  }
}

// Function to render upgrade buttons
// This function will create buttons for each upgrade available in the game
export function renderUpgradeButtons(gameManager) {
  const available_container = document.getElementById(
    "available-upgrade-buttons"
  );
  const purchased_container = document.getElementById(
    "purchased-upgrade-buttons"
  );
  available_container.innerHTML = ""; // clear old buttons
  purchased_container.innerHTML = ""; // clear old buttons


  for (const Upgrade of gameManager.baseUpgrades) {
    const upgradename = Upgrade.id;
    console.log(upgradename)
    const stats = gameManager.getUpgradeStats(upgradename);

    const btn = document.createElement("button");
    btn.textContent = `Upgrade ${upgradename}`;
    btn.className = "purchase-btn";

    // Check if the upgrade has already been purchased
    if (gameManager.purchasedUpgradesNames.has(upgradename)) {
      // If the upgrade has already been purchased, render it in the purchased section
      btn.textContent = `Purchased: ${upgradename}`;
      btn.disabled = true; // Disable button since it's already purchased
      btn.classList.add("purchased"); // add CSS to style it differently
      purchased_container.appendChild(btn);
      continue; // Skip to next upgrade
      console.log("ALREADY PURCHASED")
    }

    // If the upgrade is available for purchase, render it in the available section
    btn.textContent = `Upgrade ${upgradename} - ⚡${Math.floor(
      stats.staticImpact.energy || 0
    )} | 🌫️${Math.floor(stats.staticImpact.CO2 || 0)}`;

    // Disable if player can't afford it
    const notEnough =
      gameManager.state.totalEnergy < (stats.staticImpact.energy || 0);
    if (notEnough) {
      btn.disabled = true; // Disable button if not enough energy
      btn.classList.add("disabled"); // add CSS to grey it out
    } else {
      btn.disabled = false; // Enable button if enough energy

      // Attach upgrade logic
      btn.addEventListener("click", () => {
        gameManager.purchaseUpgrade(upgradename);
        renderUpgradeButtons(gameManager); // re-render buttons after state changes
      });

      available_container.appendChild(btn);
    }
  }
}

// Function to render a single building's display
// This function will create a display element for each building
export function renderBuildings(gameManager) {
  const container = document.getElementById("building-display");
  if (!container) {
    console.warn("No #building-display container found");
    return;
  }

  container.innerHTML = ""; // Clear old content
  if (!gameManager || !gameManager.buildingCount) {
    console.warn("GameManager or buildingCount is not defined");
    return;
  }
  for (const buildingName in gameManager.buildingCount) {
    const count = gameManager.buildingCount[buildingName];
    const emoji = buildingEmojis?.[buildingName] || "🏗️";

    const buildingElement = document.createElement("div");
    buildingElement.className = "building-entry";
    buildingElement.textContent = `${emoji} ${buildingName} × ${count}`;

    container.appendChild(buildingElement);
  }
}
