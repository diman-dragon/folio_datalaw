// Annotations <-> library: loaded when a document opens, saved (debounced) on every change, flushed on close.
import { loadAnnots, saveAnnots } from '../data/annot-db.js';
import { exportAll } from '../ui/annot-data.js';
import { replaceAll, clearAll } from '../ui/annot-history.js';
import { toast } from '../ui/toast.js';
import { t } from '../core/strings.js';
import { on } from '../core/bus.js';
let id = null, timer = 0, warned = false;
function flush() {
  clearTimeout(timer);
  timer = 0;
  if (id && !saveAnnots(id, exportAll()) && !warned) { warned = true; toast(t('annot.nosave')); }
}
on('annotchange', () => {
  if (!id) return;
  clearTimeout(timer);
  timer = setTimeout(flush, 600);
});
export function attachAnnots(docId) {
  replaceAll(loadAnnots(docId));
  id = docId;
}
export function detachAnnots() {
  flush();
  id = null;
  clearAll();
}
