// Library cover images (small JPEG data URLs), one storage key per document.
import { store } from '../core/storage.js';
export const getCover = (id) => store.get('cover.' + id);
export const setCover = (id, url) => store.set('cover.' + id, url);
export const dropCover = (id) => store.del('cover.' + id);
