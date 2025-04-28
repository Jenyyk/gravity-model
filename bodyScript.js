// Add a body input form
function addBody() {
  const bodyContainer = document.getElementById('bodiesContainer');
  const bodyIndex = bodyContainer.children.length + 1;
  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('bodyInput');
  bodyDiv.innerHTML = `
    <label>Position X:</label><input type="number" id="positionX${bodyIndex}" value="0">
    <label>Position Y:</label><input type="number" id="positionY${bodyIndex}" value="0">
    <label>Mass:</label><input type="number" id="mass${bodyIndex}" value="5">
    <label>Velocity X:</label><input type="number" id="velocityX${bodyIndex}" value="0.2">
    <label>Velocity Y:</label><input type="number" id="velocityY${bodyIndex}" value="0">
    <button class="remove-body-btn" onclick="removeBody(${bodyIndex})">Remove Body</button>
  `;
  bodyContainer.appendChild(bodyDiv);
}

// Remove a body input form
function removeBody(bodyIndex) {
  const bodyContainer = document.getElementById('bodiesContainer');
  const bodyElement = document.querySelector(`#positionX${bodyIndex}`).parentElement;
  bodyContainer.removeChild(bodyElement);
}
