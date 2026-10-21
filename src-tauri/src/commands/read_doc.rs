//! Command `read_doc`: returns the raw bytes of a PDF / FB2 / FB2.ZIP file to the web UI (no base64).
use std::path::PathBuf;

use tauri::ipc::Response;

use crate::doc_guard;

#[tauri::command]
pub async fn read_doc(path: String) -> Result<Response, String> {
    let path = PathBuf::from(path);
    let bytes = tauri::async_runtime::spawn_blocking(move || doc_guard::read_doc_bytes(&path))
        .await
        .map_err(|e| format!("io: {e}"))?
        .map_err(|e| e.to_string())?;
    Ok(Response::new(bytes))
}
