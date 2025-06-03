const popup = document.getElementById("popup-overlay");
const counter = document.getElementById("people-count");

// Loop through all counters with the class
document.querySelectorAll(".clickable-counter").forEach((counter) => {
  counter.addEventListener("click", () => {
    popup.classList.remove("hidden");
  });
});

// Hide popup when clicking outside the window
popup.addEventListener("click", (e) => {
  if (!e.target.closest(".popup-window")) {
    popup.classList.add("hidden");
  }
});

// Optional: Close on ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    popup.classList.add("hidden");
  }
});
