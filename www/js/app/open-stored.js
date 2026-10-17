// Opens a library entry by id (its file is read from the stored path).
import { getDoc } from '../data/library.js';
import { openPath } from './open-path.js';
export function openStored(id) {
  const d = getDoc(id);
  return d ? openPath(d.path) : undefined;
}
