import { GameManager } from "./game-manager.js";
import {
  renderBuildButtons,
  renderBuildings,
  renderUpgradeButtons,
} from "./create-buttons.js";

import { startTutorial } from "./tutorial.js";

window.addEventListener("DOMContentLoaded", () => {
  window.game = new GameManager();

  renderBuildButtons(game);
  renderBuildings(game);
  renderUpgradeButtons(game);

  startTutorial(game, () => {
    // 🕐 Start ticking only after tutorial is done
    setInterval(() => {
      game.tick(1);
      updateUI(game);
      renderBuildButtons(game);
      renderBuildings(game);
      renderUpgradeButtons(game);
    }, 1000);
  });
});

function updateUI(game) {
  document.getElementById("energy-count").textContent = Math.floor(
    game.state.totalEnergy
  );
  document.getElementById("co2-count").textContent = Math.floor(
    game.state.totalCO2
  );
  document.getElementById("people-count").textContent = game.state.totalPeople;
  document.getElementById("people-cap").textContent = game.cap.people;

  const rate = game.rate;
  const rateStr = `⚡ Energy: ${Math.floor(rate.energy)} | 🌫️ CO₂: ${Math.floor(
    rate.CO2
  )} | 👥 People: ${Math.floor(rate.people)} | availableU: ${Array.from(
    game.availableUpgradesNames
  ).join(", ")} | hiddenCO2Cap: ${game.getDynamicCO2Limit().toFixed(2)}`;
  document.getElementById("stats-display2").textContent = rateStr;

  // Format time as HH:MM:SS
  const totalSeconds = Math.floor(game.elapsedTime);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0"
  );
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  document.getElementById(
    "time-count"
  ).textContent = `${hours}:${minutes}:${seconds}`;
}

const addPeopleButton = document.getElementById("add-people");

addPeopleButton.addEventListener("click", () => {
  const result = game.addPerson();

  if (!result.success) {
    if (result.reason === "cap_reached") {
      showPeopleCapWarning(); // brief red flash or tooltip
    }
    return;
  }

  updateUI(game);
});

// Show a brief warning when people cap is reached
// This function will flash a warning message or change the button color briefly
function showPeopleCapWarning() {
  console.log("People cap reached, cannot add more.");
  const el = document.getElementById("people-cap-warning");
  if (!el) return;

  el.classList.add("visible");
  setTimeout(() => el.classList.remove("visible"), 1500);
}
