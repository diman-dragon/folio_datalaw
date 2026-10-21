// File on disk -> opened document (PDF or FB2) + library record.
import { readDoc } from '../io/read-doc.js';
import { openDocument } from '../formats/open-any.js';
import { addDoc } from '../data/library.js';
import { askPassword } from '../ui/password-dialog.js';
import { fileName, docKind } from '../core/format.js';
export async function importPath(path, askPw = askPassword) {
  const bytes = await readDoc(path);
  const size = bytes.byteLength; // read before pdf.js takes over the buffer
  const pdf = await openDocument(bytes, path, { askPassword: askPw });
  const meta = addDoc({ path, name: fileName(path), size, pages: pdf.numPages, kind: docKind(path), title: pdf.title ?? null });
  return { meta, pdf };
}
