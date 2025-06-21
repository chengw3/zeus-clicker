import { GameManager } from "./game-manager.js";
import {
  initAssetsVisuals,
  initBuildButtons,
  initUpgradeButtons,
  initMetadata,
  updateAssetsVisuals,
  updateBuildButtonStates,
  updateUpgradeButtonStates,
  updateMetadata,
  updateTopBar,
} from "./create-buttons.js";

import { startTutorial } from "./tutorial.js";

window.addEventListener("DOMContentLoaded", () => {
  window.game = new GameManager();

  startTutorial(game, () => {
    initBuildButtons(game);
    initUpgradeButtons(game);
    initAssetsVisuals(game);
    initMetadata(game);

    setInterval(() => {
      game.tick(0.01);
      updateUI(game);
    }, 10);
  });
});

function updateUI(game) {
  updateTopBar(game);
  updateAssetsVisuals(game);
  updateBuildButtonStates(game);
  updateUpgradeButtonStates(game);
  updateMetadata(game);
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
