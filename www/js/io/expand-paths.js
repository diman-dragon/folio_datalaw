// Files and folders -> flat list of document paths (folders are searched recursively by Rust).
import { invoke } from './bridge.js';
export const expandPaths = (paths) => invoke('list_docs', { paths });
