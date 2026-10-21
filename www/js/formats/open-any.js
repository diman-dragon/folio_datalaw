// Opens document bytes by kind (decided by the file name): FB2 through the FB2 engine, PDF through pdf.js.
import { openPdf } from './pdf/open-doc.js';
import { openFb2 } from './fb2/fb2-doc.js';
import { fb2Deps } from './fb2/fb2-deps.js';
import { docKind } from '../core/format.js';
export const openDocument = (bytes, path, opts) => (docKind(path) === 'fb2' ? openFb2(bytes, fb2Deps()) : openPdf(bytes, opts));
