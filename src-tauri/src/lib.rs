//! App builder: registers plugins and the commands the web UI may call.
mod commands;
mod pdf_guard;
#[cfg(test)]
mod pdf_guard_tests;
mod pdf_scan;
#[cfg(test)]
mod pdf_scan_tests;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::read_pdf::read_pdf,
            commands::list_pdfs::list_pdfs,
            commands::files_exist::files_exist
        ])
        .run(tauri::generate_context!())
        .expect("error while running Folio");
}
