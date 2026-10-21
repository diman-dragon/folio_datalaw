// Reads a PDF / FB2 / FB2.ZIP file from disk through the Rust command `read_doc`; resolves with its bytes.
import { invoke } from './bridge.js';
export async function readDoc(path) {
  const buf = await invoke('read_doc', { path });
  return new Uint8Array(buf);
}
