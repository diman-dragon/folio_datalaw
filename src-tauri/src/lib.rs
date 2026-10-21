//! App builder: registers plugins and the commands the web UI may call.
mod commands;
mod doc_guard;
#[cfg(test)]
mod doc_guard_tests;
mod doc_scan;
#[cfg(test)]
mod doc_scan_tests;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::read_doc::read_doc,
            commands::list_docs::list_docs,
            commands::files_exist::files_exist
        ])
        .run(tauri::generate_context!())
        .expect("error while running Folio");
}
