// Drag & drop of files and folders onto the window (Tauri delivers real paths, not File objects).
import { listen } from './bridge.js';
export async function watchDrops(onPaths) {
  const veil = document.getElementById('drop');
  await listen('tauri://drag-enter', () => { veil.hidden = false; });
  await listen('tauri://drag-leave', () => { veil.hidden = true; });
  await listen('tauri://drag-drop', (e) => {
    veil.hidden = true;
    const paths = e.payload?.paths ?? [];
    if (paths.length) onPaths(paths);
  });
}
