//! Command `read_pdf`: returns the raw bytes of a PDF file to the web UI (no base64).
use std::path::PathBuf;

use tauri::ipc::Response;

use crate::pdf_guard;

#[tauri::command]
pub async fn read_pdf(path: String) -> Result<Response, String> {
    let path = PathBuf::from(path);
    let bytes = tauri::async_runtime::spawn_blocking(move || pdf_guard::read_pdf_bytes(&path))
        .await
        .map_err(|e| format!("io: {e}"))?
        .map_err(|e| e.to_string())?;
    Ok(Response::new(bytes))
}
