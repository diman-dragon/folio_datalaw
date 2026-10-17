// Dispatcher: one path opens the viewer, several are imported into the library.
import { openPath } from './open-path.js';
import { importMany } from './import-many.js';
export const openPaths = (paths) => (paths.length === 1 ? openPath(paths[0]) : importMany(paths));
