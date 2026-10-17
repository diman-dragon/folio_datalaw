// Library header actions: "Open PDF" buttons and the Ctrl+O shortcut.
import { openDialog } from '../app/open-dialog.js';
import './theme-toggle.js';
const open = () => openDialog();
document.getElementById('open-btn').addEventListener('click', open);
document.getElementById('empty-open').addEventListener('click', open);
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') { e.preventDefault(); open(); }
});
