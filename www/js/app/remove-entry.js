// Removes a document from the library (record, cover, annotations). The file on disk is never touched.
import { removeDoc } from '../data/library.js';
import { dropCover } from '../data/covers.js';
import { dropAnnots } from '../data/annot-db.js';
import { dropOcr } from '../data/ocr-store.js';
import { toast } from '../ui/toast.js';
import { t } from '../core/strings.js';
import { emit } from '../core/bus.js';
export function removeEntry(id, { quiet = false } = {}) {
  removeDoc(id);
  dropCover(id);
  dropAnnots(id);
  dropOcr(id).catch(() => {});
  emit('libchange');
  if (!quiet) toast(t('home.removed'));
}
