const buildingEmojis = {
  House: "🏠",
  SolarPanel: "☀️",
  WindTurbine: "🌬️",
};

function renderBuildButtons(gameManager) {
  const container = document.getElementById("build-buttons");
  container.innerHTML = ""; // clear old buttons

  for (const buildingName in gameManager.baseBuildingStats) {
    const buildingStats = gameManager.getBuildingStats(buildingName);

    const btn = document.createElement("button");
    btn.textContent = `${
      buildingEmojis[buildingName] || buildingName
    } ${buildingName}`;
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

// Function to render a single building's display
// This function will create a display element for each building
function renderBuildings(gameManager) {
  console.log("Rendering buildings...");
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

// Function to render upgrade buttons
// This function will create buttons for each upgrade available in the game
function renderUpgradeButtons(gameManager) {
  const container = document.getElementById("upgrade-buttons");
  container.innerHTML = ""; // clear old buttons

  for (const UpgradeName in gameManager.baseBuildingStats) {
    const stats = gameManager.getUpgradeStats(UpgradeName);
    console.log(
      `Rendering upgrade button for ${UpgradeName} with stats:`,
      stats
    );
    const btn = document.createElement("button");
    btn.textContent = `Upgrade ${UpgradeName}`;
    btn.className = "purchase-btn";

    if (gameManager.canUpgrade(UpgradeName)) {
      btn.classList.add("available"); // add CSS to highlight it
    } else {
      btn.classList.add("disabled"); // add CSS to grey it out
    }

    // Attach upgrade logic
    btn.addEventListener("click", () => {
      gameManager.purchaseUpgrade(UpgradeName);
      renderUpgradeButtons(gameManager); // re-render buttons after state changes
    });

    container.appendChild(btn);
  }
}
