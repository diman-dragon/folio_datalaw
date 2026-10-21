//! Command `list_docs`: turns dropped / picked files and folders into a flat list of document paths.
use crate::doc_scan;

#[tauri::command]
pub async fn list_docs(paths: Vec<String>) -> Result<Vec<String>, String> {
    tauri::async_runtime::spawn_blocking(move || doc_scan::expand(&paths))
        .await
        .map_err(|e| format!("io: {e}"))
}
