let isPlaying = false;
let currentFrame = 0;
let animationInterval;
let currentSpeed = 50;
let frames = [];
let pathTraces = [];
let data = [];

const playPauseBtn = document.getElementById('playPauseBtn');
const speedInput = document.getElementById('speedControl');
const speedDisplay = document.getElementById('speedDisplay');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const timeStepInput = document.getElementById('timeStep');
const stepsInput = document.getElementById('steps');
const sampleRateInput = document.getElementById('sampleRate');
const apiURLSelect = document.getElementById('apiURL');

// Speed slider handler
speedInput.addEventListener('input', () => {
  currentSpeed = parseInt(speedInput.value);
  speedDisplay.textContent = `${currentSpeed} ms/frame`;
  if (isPlaying) {
    stopAnimation();
    startAnimation();
  }
});

// Play/Pause handler
playPauseBtn.addEventListener('click', () => {
  if (isPlaying) {
    stopAnimation();
  } else {
    startAnimation();
  }
});

// Reset Button handler
resetBtn.addEventListener('click', () => {
  resetAnimation();
});

function startAnimation() {
  isPlaying = true;
  playPauseBtn.textContent = '⏸ Pause';
  animationInterval = setInterval(() => {
    if (currentFrame >= frames.length) {
      stopAnimation();
      return;
    }
    Plotly.animate('plotly', [frames[currentFrame].name], {
      frame: { duration: 0, redraw: true },
      transition: { duration: 0 },
      mode: 'immediate'
    });
    currentFrame++;
  }, currentSpeed);
}

function stopAnimation() {
  isPlaying = false;
  playPauseBtn.textContent = '▶ Play';
  clearInterval(animationInterval);
}

// Reset Animation to the start
function resetAnimation() {
  stopAnimation();
  currentFrame = 0;
  Plotly.animate('plotly', [frames[currentFrame].name], {
    frame: { duration: 0, redraw: true },
    transition: { duration: 0 },
    mode: 'immediate'
  });
  playPauseBtn.textContent = '▶ Play';
}

// Load JSON file
document.getElementById('jsonFile').addEventListener('change', handleFile);

function handleFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const jsonData = JSON.parse(e.target.result);
      createPlot(jsonData);
    } catch (error) {
      console.error('Error parsing JSON', error);
    }
  };
  reader.readAsText(file);
}

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

// Collect data from form and call API
submitBtn.addEventListener('click', async () => {
  const bodies = [];
  const bodyElements = document.querySelectorAll('.bodyInput');

  bodyElements.forEach((bodyElement, index) => {
    const positionX = parseFloat(bodyElement.querySelector(`#positionX${index + 1}`).value);
    const positionY = parseFloat(bodyElement.querySelector(`#positionY${index + 1}`).value);
    const mass = parseFloat(bodyElement.querySelector(`#mass${index + 1}`).value);
    const velocityX = parseFloat(bodyElement.querySelector(`#velocityX${index + 1}`).value);
    const velocityY = parseFloat(bodyElement.querySelector(`#velocityY${index + 1}`).value);

    // Set acceleration to zero always
    bodies.push({
      position: { x: positionX, y: positionY },
      mass: mass,
      velocity: { x: velocityX, y: velocityY },
      acceleration: { x: 0.0, y: 0.0 }
    });
  });

  // Get the simulation parameters from the form
  const timeStep = parseFloat(timeStepInput.value);
  const steps = parseInt(stepsInput.value);
  const sampleRate = parseInt(sampleRateInput.value);

  // Get the selected API URL
  const apiUrl = apiURLSelect.value;

  // Send data to API
  const requestData = {
    steps: steps,
    time_step: timeStep,
    sample_rate: sampleRate,
    starting_bodies: bodies
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  });

  if (response.ok) {
    const jsonResponse = await response.json();
    console.log(jsonResponse);
    createPlot(jsonResponse.traces);
  } else {
    alert('Error: ' + response.statusText);
  }
});

function createPlot(inputData) {
  data = inputData;
  currentFrame = 0;
  stopAnimation();
  frames = [];

  const steps = data[0].x.length;

  // Full paths
  pathTraces = data.map(trace => ({
    ...trace,
    mode: 'lines',
    opacity: 0.2,
    line: {
      color: trace.line?.color || undefined,
      width: 1
    },
    showlegend: false
  }));

  // Initial bodies
  const bodyTraces = data.map(trace => ({
    x: [trace.x[0]],
    y: [trace.y[0]],
    mode: 'markers',
    marker: {
      size: 8,
      color: trace.line?.color || undefined
    },
  }));

  // Animation frames (paths stay, bodies update)
  for (let i = 0; i < steps; i++) {
    const frameData = [];

    // Static paths
    for (let trace of pathTraces) {
      frameData.push({ ...trace, visible: true });
    }

    // Animated bodies
    for (let j = 0; j < data.length; j++) {
      frameData.push({
        x: [data[j].x[i]],
        y: [data[j].y[i]],
        mode: 'markers',
        marker: {
          size: 8,
          color: data[j].line?.color || undefined
        }
      });
    }

    frames.push({ name: i.toString(), data: frameData });
  }

  const layout = {
    title: 'Orbit Data Visualization',
    xaxis: { title: 'X-Axis', scaleanchor: 'y' },
    yaxis: { title: 'Y-Axis'},
  };

  Plotly.newPlot('plotly', [...pathTraces, ...bodyTraces], layout).then(() => {
    Plotly.addFrames('plotly', frames);
  });
}
