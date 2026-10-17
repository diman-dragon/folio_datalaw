// Binary entry point: hides the console window on Windows release builds and starts the app.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    folio_datalaw_lib::run()
}
