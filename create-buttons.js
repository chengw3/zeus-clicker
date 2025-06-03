const buildingEmojis = {
  House: "🏠",
  SolarPanel: "☀️",
  WindTurbine: "🌬️",
};

function renderBuildButtons(gameManager) {
  const container = document.getElementById("build-buttons");
  container.innerHTML = ""; // clear old buttons

  for (const buildingName in gameManager.baseBuildingStats) {
    const stats = gameManager.getEffectiveStats(buildingName);
    const cost = stats.staticCost;

    const btn = document.createElement("button");
    btn.textContent = `${
      buildingEmojis[buildingName] || buildingName
    } ${buildingName}`;
    btn.className = "build-btn";

    // Disable if player can't afford it
    const notEnough =
      gameManager.state.totalEnergy < (cost.energy || 0) ||
      gameManager.state.totalCO2 < (cost.co2 || 0);

    if (notEnough) {
      btn.disabled = true;
      btn.classList.add("disabled"); // add CSS to grey it out
    }

    // Attach build logic
    btn.addEventListener("click", () => {
      gameManager.build(buildingName);
      renderBuildButtons(gameManager); // re-render buttons after state changes
    });

    container.appendChild(btn);
  }
}
