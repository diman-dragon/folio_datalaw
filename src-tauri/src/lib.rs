//! App builder: registers plugins and the commands the web UI may call.
mod commands;
mod pdf_guard;
#[cfg(test)]
mod pdf_guard_tests;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![commands::read_pdf::read_pdf])
        .run(tauri::generate_context!())
        .expect("error while running Folio");
}
