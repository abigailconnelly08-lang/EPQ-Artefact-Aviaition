/* EPQ Artefact — vanilla JavaScript only. No React, TypeScript, or framework code. */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const timelineNotes = [
  { period: '1903', title: 'First powered flight', detail: 'The first sustained powered flights establish a practical starting point for modern aircraft design.' },
  { period: '1914', title: 'Aircraft enter service', detail: 'Early aircraft become useful for observation, communication, and rapid development of aviation technology.' },
  { period: '1947', title: 'Breaking the sound barrier', detail: 'A new chapter begins as aircraft engineering moves into transonic and supersonic flight.' },
  { period: '1969', title: 'A new way to travel', detail: "Speed, aerodynamics, and passenger travel converge in one of aviation's most recognisable aircraft." },
  { period: '2026', title: 'Learning through simulation', detail: 'A digital sketchbook turns the four forces of flight into something learners can manipulate and understand.' }
];

$$('.timeline-event').forEach((event) => {
  event.addEventListener('click', () => {
    const note = timelineNotes[Number(event.dataset.index)];
    $$('.timeline-event').forEach((item) => item.classList.remove('is-selected'));
    event.classList.add('is-selected');
    $('.timeline-detail .eyebrow').textContent = `Selected note / ${note.period}`;
    $('.timeline-detail h3').textContent = note.title;
    $('.timeline-detail p').textContent = note.detail;
  });
});

const controls = { throttle: 70, pitch: 2, mass: 750, headwind: 0 };
const flight = { altitude: 1850, airspeed: 55, verticalSpeed: 0, distance: 0 };
let isFlying = true;
let lastTime = null;

function calculateForces() {
  const airspeedEffect = Math.max(0.55, (flight.airspeed + controls.headwind) / 55);
  const lift = 6500 * airspeedEffect * (1 + controls.pitch * 0.025);
  const weight = controls.mass * 9.81;
  const thrust = 9800 * (controls.throttle / 100);
  const drag = 3600 * airspeedEffect * airspeedEffect + Math.max(0, controls.pitch) * 110;
  const verticalForce = lift - weight;
  let mode = 'Level flight';
  let insight = 'Lift and weight are closely balanced, so altitude stays steady.';
  if (verticalForce > 350) { mode = 'Climbing'; insight = 'Lift exceeds weight, so the airplane gains vertical speed.'; }
  if (verticalForce < -350) { mode = 'Descending'; insight = 'Weight exceeds lift, so the airplane loses altitude.'; }
  return { lift, weight, thrust, drag, verticalForce, mode, insight };
}

function formatForce(force) { return `${(force / 1000).toFixed(1)} kN`; }
function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
function vectorLength(force) { return clamp(45 + force / 88, 48, 142); }

function render() {
  const forces = calculateForces();
  const planeX = 355 + Math.sin(flight.distance / 90) * 34;
  const planeY = clamp(215 - (flight.altitude - 1850) * 0.052, 92, 316);
  const planeAngle = clamp(-controls.pitch * 0.9, -13, 10);
  const liftLength = vectorLength(forces.lift);
  const weightLength = vectorLength(forces.weight);
  const thrustLength = vectorLength(forces.thrust);
  const dragLength = vectorLength(forces.drag);

  $('#flight-mode').textContent = forces.mode;
  $('#flight-insight').textContent = forces.insight;
  $('#lift-readout').textContent = formatForce(forces.lift);
  $('#weight-readout').textContent = formatForce(forces.weight);
  $('#thrust-readout').textContent = formatForce(forces.thrust);
  $('#drag-readout').textContent = formatForce(forces.drag);
  $('#altitude-readout').textContent = `${Math.round(flight.altitude)} m`;
  $('#airspeed-readout').textContent = `${flight.airspeed.toFixed(1)} m/s`;
  $('#vertical-readout').textContent = `${flight.verticalSpeed >= 0 ? '+' : ''}${flight.verticalSpeed.toFixed(1)} m/s`;

  const setLine = (id, x1, y1, x2, y2) => { const line = $(`#${id}`); line.setAttribute('x1', x1); line.setAttribute('y1', y1); line.setAttribute('x2', x2); line.setAttribute('y2', y2); };
  const setText = (id, x, y, text) => { const label = $(`#${id}`); label.setAttribute('x', x); label.setAttribute('y', y); label.textContent = text; };
  setLine('lift-line', planeX, planeY - 8, planeX, planeY - liftLength);
  setLine('weight-line', planeX, planeY + 8, planeX, planeY + weightLength);
  setLine('thrust-line', planeX + 23, planeY, planeX + thrustLength + 25, planeY);
  setLine('drag-line', planeX - 23, planeY, planeX - dragLength - 25, planeY);
  setText('lift-text', planeX + 10, planeY - liftLength - 9, `LIFT ${formatForce(forces.lift)}`);
  setText('weight-text', planeX + 10, planeY + weightLength + 18, `WEIGHT ${formatForce(forces.weight)}`);
  setText('thrust-text', planeX + thrustLength + 34, planeY - 10, `THRUST ${formatForce(forces.thrust)}`);
  setText('drag-text', planeX - dragLength - 34, planeY - 10, `DRAG ${formatForce(forces.drag)}`);
  $('#aircraft').setAttribute('transform', `translate(${planeX} ${planeY}) rotate(${planeAngle})`);
}

function updateFlight(seconds) {
  const forces = calculateForces();
  const acceleration = (forces.thrust - forces.drag) / controls.mass;
  flight.airspeed = clamp(flight.airspeed + acceleration * seconds * 0.35, 22, 95);
  flight.verticalSpeed = clamp(flight.verticalSpeed + (forces.verticalForce / controls.mass) * seconds * 0.12, -18, 18);
  flight.altitude = clamp(flight.altitude + flight.verticalSpeed * seconds * 4, 500, 5000);
  flight.distance += flight.airspeed * seconds;
}

function animate(timestamp) {
  if (isFlying) {
    const seconds = Math.min((timestamp - (lastTime || timestamp)) / 1000, 0.08);
    updateFlight(seconds);
    render();
  }
  lastTime = timestamp;
  requestAnimationFrame(animate);
}

function connectRange(id, key, suffix) {
  const input = $(`#${id}`);
  const output = $(`#${id}-value`);
  const update = () => { controls[key] = Number(input.value); output.textContent = `${input.value}${suffix}`; render(); };
  input.addEventListener('input', update);
  update();
}
connectRange('throttle', 'throttle', '%');
connectRange('pitch', 'pitch', '°');
connectRange('mass', 'mass', ' kg');
connectRange('headwind', 'headwind', ' m/s');

$('#pause-button').addEventListener('click', () => {
  isFlying = !isFlying;
  $('#pause-button').textContent = isFlying ? 'Ⅱ Pause' : '▶ Fly';
});

$('#reset-button').addEventListener('click', () => {
  controls.throttle = 70; controls.pitch = 2; controls.mass = 750; controls.headwind = 0;
  flight.altitude = 1850; flight.airspeed = 55; flight.verticalSpeed = 0; flight.distance = 0;
  [['throttle', 70], ['pitch', 2], ['mass', 750], ['headwind', 0]].forEach(([id, value]) => { $(`#${id}`).value = value; });
  $$('.control-row').forEach((row) => row.querySelector('output').textContent = row.querySelector('input').value + (row.querySelector('input').id === 'throttle' ? '%' : row.querySelector('input').id === 'pitch' ? '°' : row.querySelector('input').id === 'mass' ? ' kg' : ' m/s'));
  isFlying = true;
  $('#pause-button').textContent = 'Ⅱ Pause';
  render();
});

render();
requestAnimationFrame(animate);