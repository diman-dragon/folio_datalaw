// Reads a PDF from disk through the Rust command `read_pdf`; resolves with its bytes.
import { invoke } from './bridge.js';
export async function readPdf(path) {
  const buf = await invoke('read_pdf', { path });
  return new Uint8Array(buf);
}
