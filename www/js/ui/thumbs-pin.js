// Thumbnail sidebar pin state (persisted): pinned = in the layout, unpinned = overlay revealed at the left edge.
import { store } from '../core/storage.js';
const $ = (id) => document.getElementById(id);
const main = $('viewer-main');
function set(on) {
  main.classList.toggle('pinned', on);
  $('pin-btn').classList.toggle('on', on);
  $('thumbs-btn').classList.toggle('on', on);
  store.set('thumbsPinned', on ? '1' : '0');
}
const toggle = () => set(!main.classList.contains('pinned'));
$('pin-btn').addEventListener('click', toggle);
$('thumbs-btn').addEventListener('click', toggle);
set(store.get('thumbsPinned') === '1');
