// Add an event listener to the checkbox
document.querySelector("#toggle").addEventListener("change", updateToggleLabel);

// Function to update the label based on the checkbox's checked state
function updateToggleLabel() {
  const isChecked = document.querySelector("#toggle").checked;
  document.querySelector("#toggle-label").textContent = isChecked ? "Utility" : "Random";
}