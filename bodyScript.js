const stable_orbit_btn = document.getElementById("stableOrbitButton");

// Add a body input form
function addBody() {
  const bodyContainer = document.getElementById('bodiesContainer');
  const bodyIndex = bodyContainer.children.length + 1;
  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('bodyInput');
  bodyDiv.innerHTML = `
    <label>Pozice X:</label><input type="number" id="positionX${bodyIndex}" value="0">
    <label>Pozice Y:</label><input type="number" id="positionY${bodyIndex}" value="0">
    <label>Hmotnost:</label><input type="number" id="mass${bodyIndex}" value="5">
    <label>Rychlost X:</label><input type="number" id="velocityX${bodyIndex}" value="0.2">
    <label>Rychlost Y:</label><input type="number" id="velocityY${bodyIndex}" value="0">
    <button class="remove-body-btn" onclick="removeBody(${bodyIndex})">Odeber Těleso</button>
    <span>Těleso ${excelNaming(bodyIndex)}</span>
  `;
  bodyContainer.appendChild(bodyDiv);

  if (document.querySelectorAll('.bodyInput').length == 2) { stable_orbit_btn.disabled = false; }
  else { stable_orbit_btn.disabled = true; }
}

// Remove a body input form
function removeBody(bodyIndex) {
  const bodyContainer = document.getElementById('bodiesContainer');
  const bodyElement = document.querySelector(`#positionX${bodyIndex}`).parentElement;
  bodyContainer.removeChild(bodyElement);

  if (document.querySelectorAll('.bodyInput').length == 2) { stable_orbit_btn.disabled = false; }
  else { stable_orbit_btn.disabled = true; }
}

const chars = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]
function excelNaming(index) {
  if (index <= 0) return ""; // base case
  index--; // adjust for 1-based indexing
  return excelNaming(Math.floor(index / 26)) + chars[index % 26];
}
