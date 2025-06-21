export function initBuildButtons(game) {
  const container = document.getElementById("build-buttons");
  container.innerHTML = "";

  for (const building of game.baseBuildings) {
    const effectiveEntity = game.getEffectiveEntity(building.id, "building");
    if (!effectiveEntity) continue;

    const btn = createPersistentButton(effectiveEntity, game);
    container.appendChild(btn);
  }
}

function createPersistentButton(effectiveEntity, game) {
  const btn = document.createElement("button");
  btn.className = "purchase-btn";
  btn.dataset.entityId = effectiveEntity.id;
  btn.dataset.entityType = effectiveEntity.type;

  btn.addEventListener("mousedown", () => {
    const id = btn.dataset.entityId;
    const type = btn.dataset.entityType;

    if (type === "building") {
      game.purchaseBuilding(id);
    } else if (type === "upgrade") {
      game.purchaseUpgrade(id);
    }

    // Refresh UI after click
    updateBuildButtonStates(game);
  });

  return btn;
}

export function updateBuildButtonStates(game) {
  const buttons = document.querySelectorAll(".purchase-btn");

  for (const btn of buttons) {
    const id = btn.dataset.entityId;
    const type = btn.dataset.entityType;

    const effectiveEntity = game.getEffectiveEntity(id, type);
    if (!effectiveEntity) continue;

    const canBuy = game.canBuy(effectiveEntity);
    btn.disabled = !canBuy;
    btn.classList.toggle("disabled", !canBuy);

    // Update cost display if needed
    const energyCost = effectiveEntity?.cost?.energy ?? 0;
    const co2Cost = effectiveEntity?.cost?.CO2 ?? 0;
    btn.textContent = `${effectiveEntity.emoji || "🏗️"} ${
      effectiveEntity.id
    } - ⚡${Math.floor(energyCost)} | 🌫️${Math.floor(co2Cost)}`;
  }
}

export function initUpgradeButtons(game) {
  const availableContainer = document.getElementById(
    "available-upgrade-buttons"
  );
  const purchasedContainer = document.getElementById(
    "purchased-upgrade-buttons"
  );

  availableContainer.innerHTML = "";
  purchasedContainer.innerHTML = "";

  for (const upgrade of game.baseUpgrades) {
    const effectiveEntity = game.getEffectiveEntity(upgrade.id, "upgrade");
    if (!effectiveEntity) continue;

    const btn = document.createElement("button");
    btn.className = "upgrade-btn";
    btn.dataset.entityId = effectiveEntity.id;
    btn.dataset.entityType = "upgrade";
    btn.dataset.purchased = "false";

    btn.addEventListener("mousedown", () => {
      const id = btn.dataset.entityId;
      game.purchaseUpgrade(id);

      // Move to purchased section
      btn.disabled = true;
      btn.dataset.purchased = "true";
      purchasedContainer.appendChild(btn);
    });

    availableContainer.appendChild(btn);
  }
}

export function updateUpgradeButtonStates(game) {
  const buttons = document.querySelectorAll(".upgrade-btn");

  for (const btn of buttons) {
    const id = btn.dataset.entityId;
    const isPurchased = game.purchasedUpgradesNames.has(id);
    const effectiveEntity = game.getEffectiveEntity(id, "upgrade");
    if (!effectiveEntity) continue;

    const energyCost = effectiveEntity?.cost?.energy ?? 0;
    const co2Cost = effectiveEntity?.cost?.CO2 ?? 0;

    btn.textContent = `${effectiveEntity.emoji || "✨"} ${
      effectiveEntity.id
    } - ⚡${Math.floor(energyCost)} | 🌫️${Math.floor(co2Cost)}`;

    if (isPurchased && btn.dataset.purchased === "false") {
      btn.disabled = true;
      btn.dataset.purchased = "true";
      document.getElementById("purchased-upgrade-buttons").appendChild(btn);
    }

    const canBuy = game.canBuy(effectiveEntity);
    btn.disabled = isPurchased || !canBuy;
    btn.classList.toggle("disabled", !canBuy && !isPurchased);
  }
}

// 🏗️ Render current buildings owned
export function initAssetsVisuals(game) {
  const container = document.getElementById("building-display");
  if (!container) return;

  container.innerHTML = "";
  for (const [name, count] of Object.entries(game.buildingCount)) {
    const emoji = game.buildingMap[name]?.emoji || "🏗️";
    const div = document.createElement("div");
    div.id = `building-${name}`;
    div.className = "building-entry";
    div.textContent = `${emoji} ${name} × ${count}`;
    container.appendChild(div);
  }
}

export function updateAssetsVisuals(game) {
  //cheating
  initAssetsVisuals(game);
}

export function initMetadata(game) {
  const metadataContainer = document.getElementById("metadata-display");
  if (!metadataContainer) return;

  metadataContainer.innerHTML = "";

  for (const [key, value] of Object.entries(game.rate)) {
    const div = document.createElement("div");
    div.className = "metadata-entry";
    div.textContent = `${key} rate: ${Math.floor(value)}`;
    metadataContainer.appendChild(div);
  }

  const div = document.createElement("div");
  div.classname = "metadata-entry";
  div.textContent = `hidden-CO2-limit: ${game.getDynamicCO2Limit()}`;
  metadataContainer.appendChild(div);

  const div1 = document.createElement("div");
  div1.classname = "metadata-entry";
  div1.textContent = `explosion-timer: ${
    game.explosionTimer?.toFixed(2) || "N/A"
  }`;
  metadataContainer.appendChild(div1);
}

export function updateMetadata(game) {
  //cheating
  initMetadata(game);
}

export function updateTopBar(game) {
  document.getElementById("people-count").textContent = game.state.people;
  document.getElementById("people-cap").textContent = game.cap.people;
  document.getElementById("energy-count").textContent = Math.floor(
    game.state.energy
  );
  document.getElementById("energy-cap").textContent = Math.floor(
    game.cap.energy
  );
  document.getElementById("CO2-count").textContent = Math.floor(game.state.CO2);
  document.getElementById("CO2-cap").textContent = Math.floor(game.cap.CO2);

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
