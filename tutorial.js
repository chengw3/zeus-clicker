export function startTutorial(game, onComplete) {
  const steps = [
    "Welcome to the tutorial!",
    "Click the button to earn points.",
    "Upgrade your abilities to progress faster.",
    "Good luck and have fun!",
  ]; // your steps
  let current = 0;

  const overlay = document.getElementById("tutorial-overlay");
  const text = document.getElementById("tutorial-text");
  const btn = document.getElementById("next-tutorial-btn");

  const showStep = () => {
    text.textContent = steps[current];
    btn.textContent = current === steps.length - 1 ? "Start Game" : "Next";
  };

  btn.onclick = () => {
    current++;
    if (current >= steps.length) {
      overlay.classList.add("hidden");
      if (game?.start) game.start();
      if (onComplete) onComplete(); // 🔥 start ticking here
    } else {
      showStep();
    }
  };

  overlay.classList.remove("hidden");
  showStep();
}
