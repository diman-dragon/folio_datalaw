// Pin button in the palette's top-left corner: a pinned palette cannot be dragged (state is remembered).
import { getPref, setPref } from '../core/prefs.js';
const panel = document.getElementById('tools-panel');
const btn = document.getElementById('tp-pin');
let pinned = getPref('panelpinned', false);
export const isPinned = () => pinned;
const paint = () => { btn.classList.toggle('on', pinned); panel.classList.toggle('pinned', pinned); };
btn.addEventListener('click', () => { pinned = !pinned; setPref('panelpinned', pinned); paint(); });
paint();
