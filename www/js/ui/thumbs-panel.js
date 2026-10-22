// Thumbnail sidebar: an overlay (never shifts the pages). Opens by button / left edge, closes on a click elsewhere, pin keeps it.
import { store } from '../core/storage.js';
const $ = (id) => document.getElementById(id);
const main = $('viewer-main');
let pinned = store.get('thumbsPinned') === '1';
const isOpen = () => main.classList.contains('open');
function setOpen(on) {
  main.classList.toggle('open', on);
  $('thumbs-btn').classList.toggle('on', on);
  $('thumbs-btn').setAttribute('aria-pressed', String(on));
}
function setPinned(on) {
  pinned = on;
  $('pin-btn').classList.toggle('on', on);
  $('pin-btn').setAttribute('aria-pressed', String(on));
  store.set('thumbsPinned', on ? '1' : '0');
  if (on) setOpen(true);
}
$('pin-btn').addEventListener('click', () => setPinned(!pinned));
$('thumbs-btn').addEventListener('click', () => { if (isOpen()) { setPinned(false); setOpen(false); } else setOpen(true); });
$('thumbs-hot').addEventListener('mouseenter', () => setOpen(true));
document.addEventListener('pointerdown', (e) => {
  if (isOpen() && !pinned && !e.target.closest('#thumbs, #thumbs-btn')) setOpen(false);
});
// Called when a document opens (pinned panels come back open) and by Esc (returns true when it closed something).
export const resetThumbs = () => { $('pin-btn').classList.toggle('on', pinned); $('pin-btn').setAttribute('aria-pressed', String(pinned)); setOpen(pinned); };
export function closeThumbs() {
  if (!isOpen() || pinned) return false;
  setOpen(false);
  return true;
}
