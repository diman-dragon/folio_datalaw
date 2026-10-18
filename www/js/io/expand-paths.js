// Files and folders -> flat list of PDF paths (folders are searched recursively by Rust).
import { invoke } from './bridge.js';
export const expandPaths = (paths) => invoke('list_pdfs', { paths });
