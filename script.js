let count = 0;
const countDisplay = document.getElementById("count");
const cookieButton = document.getElementById("cookie");

cookieButton.addEventListener("click", () => {
  count++;
  countDisplay.textContent = count;
});
