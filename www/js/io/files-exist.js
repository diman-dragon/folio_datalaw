// Which of the given PDF paths still exist on disk (one boolean per path, checked by Rust).
import { invoke } from './bridge.js';
export const filesExist = (paths) => invoke('files_exist', { paths });
