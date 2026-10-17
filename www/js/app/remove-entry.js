// Removes a document from the library (record + cover). The file on disk is never touched.
import { removeDoc } from '../data/library.js';
import { dropCover } from '../data/covers.js';
import { toast } from '../ui/toast.js';
import { t } from '../core/strings.js';
import { emit } from '../core/bus.js';
export function removeEntry(id) {
  removeDoc(id);
  dropCover(id);
  emit('libchange');
  toast(t('home.removed'));
}
