import { GameManager } from "./game-manager.js";
import {
  renderBuildButtons,
  renderBuildings,
  renderUpgradeButtons,
} from "./create-buttons.js";

window.game = new GameManager();
renderBuildButtons(game); // Update the build buttons UI
renderBuildings(game); // Update the building display UI
renderUpgradeButtons(game); // Update the upgrade buttons UI

setInterval(() => {
  game.tick(1); // Simulates 1 second passing
  updateUI(game); // Optional: refresh HTML with latest values
  renderBuildButtons(game); // Update the build buttons UI
  renderBuildings(game); // Update the building display UI
  renderUpgradeButtons(game); // Update the upgrade buttons UI
}, 1000); // every 1000 ms = 1 second

function updateUI(game) {
  document.getElementById("energy-count").textContent = Math.floor(
    game.state.totalEnergy
  );
  document.getElementById("co2-count").textContent = Math.floor(
    game.state.totalCO2
  );
  document.getElementById("people-count").textContent = game.state.totalPeople;

  const rate = game.rate;
  const rateStr = `⚡ Energy: ${Math.floor(rate.energy)} | 🌫️ CO₂: ${Math.floor(
    rate.CO2
  )} | 👥 People: ${Math.floor(rate.people)}`;
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

// create spawn people button
const addPeopleButton = document.getElementById("add-people");
//click to spawn person
addPeopleButton.addEventListener("click", () => {
  game.state.totalPeople += 1;

  // // Create a new person element
  // const person = document.createElement("div");
  // person.className = "person";
  // person.textContent = `Person ${game.state.totalPeople}`;

  // // Append the new person to the container
  // document.getElementById("middle").appendChild(person);
});
