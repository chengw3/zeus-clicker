// 🌇 Updated renderer using emojis from baseEntities

// 🔧 Render building purchase buttons
export function renderBuildButtons(game) {
  const container = document.getElementById("build-buttons");
  container.innerHTML = "";
  for (const building of game.baseBuildings) {
    const effectiveEntity = game.getEffectiveEntity(building.id, "building");
    if (!effectiveEntity) continue; // Skip if no effective entity found
    const btn = createButtonfromEntity(effectiveEntity, game);
    container.appendChild(btn);
  }
}

// 🔼 Render upgrade buttons (available + purchased)
export function renderUpgradeButtons(game) {
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
    if (!effectiveEntity) continue; // Skip if no effective entity found
    const btn = createButtonfromEntity(effectiveEntity, game);

    const isPurchased = game.purchasedUpgradesNames.has(upgrade.id);
    if (isPurchased) {
      btn.disabled = true;
      purchasedContainer.appendChild(btn);
    } else {
      availableContainer.appendChild(btn);
    }
  }
}

// 🏗️ Render current buildings owned
export function renderBuildings(game) {
  const container = document.getElementById("building-display");
  if (!container) return;

  container.innerHTML = "";
  for (const [name, count] of Object.entries(game.buildingCount)) {
    const emoji = game.buildingMap[name]?.emoji || "🏗️";
    const div = document.createElement("div");
    div.className = "building-entry";
    div.textContent = `${emoji} ${name} × ${count}`;
    container.appendChild(div);
  }
}

function createButtonfromEntity(effectiveEntity, game) {
  const btn = document.createElement("button");
  btn.textContent = `${effectiveEntity.emoji || "🏗️"} ${effectiveEntity.id}`;
  btn.className = "purchase-btn";

  const energyCost = effectiveEntity?.cost?.energy ?? 0;
  const co2Cost = effectiveEntity?.cost?.CO2 ?? 0;

  btn.textContent += ` - ⚡${Math.floor(energyCost)} | 🌫️${Math.floor(
    co2Cost
  )}`;

  if (!game.canBuy(effectiveEntity)) {
    console.log(`Cannot buy ${effectiveEntity.id}, insufficient resources.`);
    btn.disabled = true;
    btn.classList.add("disabled");
  }

  btn.addEventListener("click", () => {
    if (effectiveEntity.type === "building") {
      game.purchaseBuilding(effectiveEntity.id);
      renderBuildButtons(game);
    } else if (effectiveEntity.type === "upgrade") {
      game.purchaseUpgrade(effectiveEntity.id);
      renderUpgradeButtons(game);
    }
  });

  return btn;
}
