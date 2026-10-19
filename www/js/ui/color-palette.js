// Colour dots of the palette (12 presets + a custom picker); the choice is remembered between launches.
import { setDrawColor } from './draw-state.js';
import { getPref, setPref } from '../core/prefs.js';
const panel = document.getElementById('tools-panel');
const dots = panel.querySelectorAll('.color-dot[data-color]');
const custom = document.getElementById('tp-custom');
const customDot = custom.parentElement;
function setColor(c, from) {
  dots.forEach((x) => x.classList.toggle('active', x === from));
  customDot.classList.toggle('active', from === customDot);
  setDrawColor(c);
  setPref('color', c);
}
dots.forEach((d) => d.addEventListener('click', () => setColor(d.dataset.color, d)));
custom.addEventListener('input', () => { customDot.style.setProperty('--c', custom.value); setColor(custom.value, customDot); });
const saved = getPref('color', null);
const preset = [...dots].find((d) => d.dataset.color === saved);
if (saved && preset) setColor(saved, preset);
else if (saved) { custom.value = saved; customDot.style.setProperty('--c', saved); setColor(saved, customDot); }
