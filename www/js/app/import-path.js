// File on disk -> opened pdf.js document + library record.
import { readPdf } from '../io/read-pdf.js';
import { openPdf } from '../formats/pdf/open-doc.js';
import { addDoc } from '../data/library.js';
import { askPassword } from '../ui/password-dialog.js';
import { fileName } from '../core/format.js';
export async function importPath(path, askPw = askPassword) {
  const bytes = await readPdf(path);
  const size = bytes.byteLength; // read before pdf.js takes over the buffer
  const pdf = await openPdf(bytes, { askPassword: askPw });
  const meta = addDoc({ path, name: fileName(path), size, pages: pdf.numPages });
  return { meta, pdf };
}
