import init, { simulate, stable_orbit } from "./pkg/gravity_model.js";

let isPlaying = false;
let currentFrame = 0;
let animationInterval;
let currentSpeed = 5;
let frames = [];
let pathTraces = [];
let data = [];
let lastSim = null;

const downloadButton = document.getElementById("downloadButton");
const playPauseBtn = document.getElementById('playPauseBtn');
const speedInput = document.getElementById('speedControl');
const speedDisplay = document.getElementById('speedDisplay');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const timeStepInput = document.getElementById('timeStep');
const stepsInput = document.getElementById('steps');
const sampleRateInput = document.getElementById('sampleRate');
const stable_orbit_btn = document.getElementById("stableOrbitButton");
const performanceReminder = document.getElementById("performanceReminder");
[stepsInput, sampleRateInput].forEach((el) => el.addEventListener("input", () => {
  performanceReminder.innerHTML = ((+stepsInput.value / +timeStepInput.value) / +sampleRateInput.value > 5000) ? "--- animace nebude obsahovat cesty z důvodu výkonu... <span title='zkuste splnit, že kroky/sample < 5000' style='text-decoration: underline'>proč?</span>" : ""
}))

// fuck this stupid ass button
stable_orbit_btn.disabled = true;

// Speed slider handler
speedInput.addEventListener('input', () => {
  currentSpeed = +speedInput.value / 10;
  speedDisplay.textContent = `${currentSpeed} frames at once`;
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
    if (currentFrame >= frames.length) {
      currentFrame = 0;
      Plotly.animate('plotly', [frames[currentFrame].name], {
        frame: { duration: 0, redraw: true },
        transition: { duration: 0 },
        mode: 'immediate'
      });
    }
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
    Plotly.animate('plotly', [frames[Math.floor(currentFrame)].name], {
      frame: { duration: 0, redraw: true },
      transition: { duration: 0 },
      mode: 'immediate'
    });
    currentFrame += (currentSpeed >= 1) ? currentSpeed : 1;
  }, (currentSpeed >= 1) ? 50 : 150 * Math.pow(currentSpeed, -1));
}

function stopAnimation() {
  isPlaying = false;
  playPauseBtn.textContent = '▶ Play';
  clearInterval(animationInterval);
}

// Reset Animation to the start
function resetAnimation() {
  stopAnimation();
  createPlot(lastSim);
}

// Load JSON file
document.getElementById('jsonFile').addEventListener('input', handleFile);

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

stable_orbit_btn.addEventListener("click", async () => {
  const bodyElements = document.querySelectorAll('.bodyInput');
  if (bodyElements.length !== 2) {
    console.warn("STOP CLICKING THE FUCKING BUTTON I OBVIOUSLY SAID ONLY FOR TWO BODY SYSTEMS");
    stable_orbit_btn.disabled = true;
    return;
  }
  const bodies = [];


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

  const request_data = { starting_bodies: bodies }
  await init();
  const response = await stable_orbit(request_data);

  const velx1 = document.getElementById("velocityX1")
  const vely1 = document.getElementById("velocityY1")
  const velx2 = document.getElementById("velocityX2")
  const vely2 = document.getElementById("velocityY2")

  console.log(response);

  velx1.value = response.body1_vel.x;
  vely1.value = response.body1_vel.y;
  velx2.value = response.body2_vel.x;
  vely2.value = response.body2_vel.y;
})


let latestBlob = null;
// run WASM
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
  const time = parseInt(stepsInput.value);
  const sampleRate = parseInt(sampleRateInput.value);

  // Send data to WASM
  const requestData = {
    total_time: time,
    time_step: timeStep,
    sample_rate: sampleRate,
    starting_bodies: bodies
  };

  await init();
  const response = await simulate(requestData);

  console.log(response);
  lastSim = response;
  createPlot(response);

  // put the file up for download
  if (latestBlob) { URL.revokeObjectURL(latestBlob); }
  const prettyJson = JSON.stringify(response, null, 2);
  const blob = new Blob([prettyJson], { type: "application/json" })
  latestBlob = URL.createObjectURL(blob);
  downloadButton.disabled = false;
  downloadButton.onclick = () => {
    const link = document.createElement("a");
    link.href = latestBlob;
    link.download = "latest_simulation.json";
    link.click();
  }
});

function createPlot(inputData) {
  data = inputData;
  currentFrame = 0;
  stopAnimation();
  frames = [];
  const maxAnimationFrames = 10_000;

  const steps = data[0].x.length;
  const frameStride = Math.ceil(steps / maxAnimationFrames);

  // Full paths
  pathTraces = data.map(trace => ({
    ...trace,
    mode: 'lines+markers',
    opacity: 0.2,
    line: {
      color: trace.line?.color || undefined,
      width: 1,
      shape: 'spline'
    },
    marker: {
      color: trace.line?.color || undefined,
      size: 4,
    },
    showlegend: false
  }));

  // Initial bodies
  const bodyTraces = data.map((trace, index) => ({
    x: [trace.x[0]],
    y: [trace.y[0]],
    mode: 'markers',
    marker: {
      size: 8,
      color: trace.line?.color || undefined
    },
    name: `Těleso ${excelNaming(index + 1)}`
  }));

  for (let i = 0; i < steps; i += frameStride) {
    const frameData = [];

    // Static paths
    for (let trace of pathTraces) {
      frameData.push({ ...trace, visible: (steps > 5000) ? false : true });
    }

    // Animated bodies
    for (let j = 0; j < data.length; j += 1) {
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

  Plotly.react('plotly', [...pathTraces, ...bodyTraces], layout).then(() => {
    Plotly.addFrames('plotly', frames);
  });
}
