const modalConfigs = [
  {
    id: "people-popup",
    title: "People Info",
    message: "Each person generates CO₂ over time.",
  },
  {
    id: "co2-popup",
    title: "CO₂ Info",
    message: "CO₂ increases by 0.1 per person per second.",
  },
  {
    id: "time-popup",
    title: "Time Info",
    message: "This tracks how long the game has been running.",
  },
  {
    id: "energy-popup",
    title: "Energy Info",
    message: "Renewables reduce CO₂ over time.",
  },
];

function createModal({ id, title, message }) {
  const overlay = document.createElement("div");
  overlay.id = id;
  overlay.className = "popup-overlay hidden";

  const window = document.createElement("div");
  window.className = "popup-window";
  window.innerHTML = `<h3>${title}</h3><p>${message}</p>`;

  overlay.appendChild(window);
  document.body.appendChild(overlay);

  // Click outside to close
  overlay.addEventListener("click", (e) => {
    if (!e.target.closest(".popup-window")) {
      overlay.classList.add("hidden");
    }
  });

  // ESC to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      overlay.classList.add("hidden");
    }
  });

  return overlay;
}

modalConfigs.forEach((config) => {
  createModal(config);
});

document.querySelectorAll(".clickable-counter").forEach((counter) => {
  counter.addEventListener("click", () => {
    const id = counter.id.replace("-counter", "-popup");
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove("hidden");
    }
  });
});
