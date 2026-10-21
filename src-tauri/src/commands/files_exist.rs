//! Command `files_exist`: which of the given document paths still exist (the library hides the rest).
use crate::doc_scan;

#[tauri::command]
pub async fn files_exist(paths: Vec<String>) -> Result<Vec<bool>, String> {
    tauri::async_runtime::spawn_blocking(move || doc_scan::existing(&paths))
        .await
        .map_err(|e| format!("io: {e}"))
}
