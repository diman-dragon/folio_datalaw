//! Command `list_pdfs`: turns dropped / picked files and folders into a flat list of PDF paths.
use crate::pdf_scan;

#[tauri::command]
pub async fn list_pdfs(paths: Vec<String>) -> Result<Vec<String>, String> {
    tauri::async_runtime::spawn_blocking(move || pdf_scan::expand(&paths))
        .await
        .map_err(|e| format!("io: {e}"))
}
