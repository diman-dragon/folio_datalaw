// Library header actions: open files / open folder buttons and the Ctrl+O / Ctrl+Shift+O shortcuts.
import { openDialog } from '../app/open-dialog.js';
import { openFolder } from '../app/open-folder.js';
import './theme-toggle.js';
document.getElementById('open-btn').addEventListener('click', () => openDialog());
document.getElementById('folder-btn').addEventListener('click', () => openFolder());
document.getElementById('empty-open').addEventListener('click', () => openDialog());
document.getElementById('empty-folder').addEventListener('click', () => openFolder());
document.addEventListener('keydown', (e) => {
  if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'o' || !document.getElementById('viewer').hidden) return;
  e.preventDefault();
  if (e.shiftKey) openFolder(); else openDialog();
});
