mod drives;
mod recovery;

use recovery::RecoveryConfig;

#[tauri::command]
fn list_drives() -> Vec<drives::DriveInfo> {
    drives::get_drives()
}

#[tauri::command]
fn start_recovery(app: tauri::AppHandle, config: RecoveryConfig) -> Result<String, String> {
    recovery::start_recovery(app, config)
}

#[tauri::command]
fn cancel_recovery() -> Result<String, String> {
    recovery::cancel_recovery()
}

#[tauri::command]
fn scan_recovered_files(destination: String) -> Result<Vec<recovery::RecoveredFile>, String> {
    recovery::scan_recovered_files(&destination)
}

#[tauri::command]
fn reveal_path(path: String) -> Result<(), String> {
    recovery::reveal_path(&path)
}

#[tauri::command]
fn get_disk_health(drive: String) -> Result<String, String> {
    recovery::get_disk_health(drive)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            use tauri::Manager;
            if let Some(splash) = app.get_webview_window("splashscreen") {
                splash.show().unwrap();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_drives,
            start_recovery,
            cancel_recovery,
            scan_recovered_files,
            reveal_path,
            get_disk_health,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
