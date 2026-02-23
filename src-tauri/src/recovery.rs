use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Read;
use std::os::windows::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter};
use walkdir::WalkDir;
use encoding_rs::UTF_16LE;

// ── Types ────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecoveryConfig {
    pub source: String,
    pub destination: String,
    pub mode: String,
    pub filters: Vec<String>,
    pub segment_mode: bool,
    pub signature_mode: bool,
    pub recover_non_deleted: bool,
    pub keep_both: bool,
    pub auto_accept: bool,
    pub recover_system_files: bool,
    pub keep_all_extensions: bool,
    pub source_fs: Option<String>,
    pub verbose_mode: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct RecoveryEvent {
    pub event_type: String,
    pub message: String,
    pub progress: Option<f64>,
    pub path: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct RecoveredFile {
    pub id: String,
    pub name: String,
    pub path: String,
    pub size: u64,
    pub category: String,
}

// Global handle to track the running recovery process
static RECOVERY_ACTIVE: Mutex<bool> = Mutex::new(false);

// ── Build winfr command args ─────────────────────────────────────────

fn build_winfr_args(config: &RecoveryConfig) -> Vec<String> {
    let mut args: Vec<String> = Vec::new();

    args.push(config.source.clone());

    let mut dest = config.destination.clone();
    if !dest.ends_with('\\') && !dest.ends_with('/') {
        dest.push('\\');
    }
    args.push(dest.clone());

    // Mode selection — modes are mutually exclusive in winfr
    // Signature (/x) and Segment (/r) are deep scans that should run on top of /extensive
    if config.signature_mode {
        args.push("/extensive".to_string());
        args.push("/x".to_string());
    } else if config.segment_mode {
        args.push("/extensive".to_string());
        args.push("/r".to_string());
    } else if config.mode == "extensive" {
        args.push("/extensive".to_string());
    } else {
        args.push("/regular".to_string());
    }

    if config.auto_accept {
        args.push("/a".to_string());
    }

    if config.keep_both && !config.signature_mode {
        // Safe Mode Mitigation: /o:b is known to crash winfr.exe on exFAT drives.
        // Also strictly incompatible with Signature Mode (/x).
        let is_exfat = config.source_fs.as_ref().map_or(false, |fs| fs.to_lowercase() == "exfat");
        if !is_exfat {
            args.push("/o:b".to_string());
        }
    }

    if config.recover_non_deleted {
        args.push("/u".to_string());
    }
    if config.recover_system_files {
        args.push("/k".to_string());
    }
    if config.keep_all_extensions {
        args.push("/e".to_string());
    }
    if config.verbose_mode && !config.signature_mode {
        // Verbose mode (/v) is documented as incompatible with /x in some versions.
        args.push("/v".to_string());
    }

    // Filter processing
    if config.signature_mode {
        // Signature mode (/x) uses /y: for file type groups, NOT /n
        let mut groups: Vec<&str> = Vec::new();
        for filter in &config.filters {
            match filter.as_str() {
                "Images" => groups.extend(["JPEG", "PNG"]),
                "Documents" => groups.extend(["PDF", "ZIP"]),
                "Videos" => groups.extend(["MPEG"]),
                "Audio" => groups.extend(["MP3", "ASF"]),
                "Archives" => groups.extend(["ZIP"]),
                _ => {} // Custom filters not supported in /x mode
            }
        }
        
        if !groups.is_empty() {
            groups.sort();
            groups.dedup();
            args.push("/y:".to_string() + &groups.join(","));
        }
    } else {
        // Regular/Extensive/Segment use /n filters
        for filter in &config.filters {
            match filter.as_str() {
                "Images" => {
                    for ext in ["*.jpg", "*.jpeg", "*.png", "*.gif", "*.bmp", "*.webp", "*.heic", "*.raw"] {
                        args.push("/n".to_string());
                        args.push(ext.to_string());
                    }
                }
                "Documents" => {
                    for ext in ["*.pdf", "*.doc", "*.docx", "*.xls", "*.xlsx", "*.ppt", "*.pptx", "*.txt", "*.rtf", "*.odt", "*.csv"] {
                        args.push("/n".to_string());
                        args.push(ext.to_string());
                    }
                }
                "Videos" => {
                    for ext in ["*.mp4", "*.avi", "*.mkv", "*.mov", "*.wmv", "*.flv", "*.webm", "*.m4v"] {
                        args.push("/n".to_string());
                        args.push(ext.to_string());
                    }
                }
                "Audio" => {
                    for ext in ["*.mp3", "*.wav", "*.flac", "*.aac", "*.ogg", "*.wma", "*.m4a"] {
                        args.push("/n".to_string());
                        args.push(ext.to_string());
                    }
                }
                "Archives" => {
                    for ext in ["*.zip", "*.rar", "*.7z", "*.tar", "*.gz", "*.bz2", "*.iso"] {
                        args.push("/n".to_string());
                        args.push(ext.to_string());
                    }
                }
                _ => {
                    args.push("/n".to_string());
                    args.push(filter.clone());
                }
            }
        }
    }

    args
}

// ── Category detection from file extension ──────────────────────────

fn categorize_file(ext: &str) -> String {
    match ext.to_lowercase().as_str() {
        "jpg" | "jpeg" | "png" | "gif" | "bmp" | "svg" | "webp" | "ico" | "tiff" | "tif" | "heic" | "heif" | "raw" | "cr2" | "nef" | "arw" => "Images".to_string(),
        "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "txt" | "rtf" | "odt" | "ods" | "odp" | "csv" | "md" => "Documents".to_string(),
        "mp4" | "avi" | "mkv" | "mov" | "wmv" | "flv" | "webm" | "m4v" | "3gp" | "mpg" | "mpeg" => "Videos".to_string(),
        "mp3" | "wav" | "flac" | "aac" | "ogg" | "wma" | "m4a" | "opus" | "aiff" => "Audio".to_string(),
        "zip" | "rar" | "7z" | "tar" | "gz" | "bz2" | "xz" | "iso" | "cab" => "Archives".to_string(),
        _ => "Other".to_string(),
    }
}

// ── Start Recovery (direct spawn — app already runs as admin) ───────

pub fn start_recovery(app: AppHandle, config: RecoveryConfig) -> Result<String, String> {
    {
        let mut active = RECOVERY_ACTIVE.lock().map_err(|e| e.to_string())?;
        if *active {
            return Err("A recovery operation is already in progress.".to_string());
        }
        *active = true;
    }

    let winfr_args = build_winfr_args(&config);

    // Pre-create destination directory to prevent winfr crashes
    if let Err(e) = std::fs::create_dir_all(&config.destination) {
        return Err(format!("Failed to create destination directory: {}", e));
    }

    // Emit initial events
    let _ = app.emit("recovery-status", RecoveryEvent {
        event_type: "status".to_string(),
        message: "scanning".to_string(),
        progress: Some(0.0),
        path: None,
    });
    let _ = app.emit("recovery-log", RecoveryEvent {
        event_type: "log".to_string(),
        message: "Windows File Recovery (Winfr Pro)".to_string(),
        progress: None,
        path: None,
    });
    let _ = app.emit("recovery-log", RecoveryEvent {
        event_type: "log".to_string(),
        message: format!("Command: winfr {}", winfr_args.join(" ")),
        progress: None,
        path: None,
    });
    let _ = app.emit("recovery-log", RecoveryEvent {
        event_type: "log".to_string(),
        message: "Starting recovery process...".to_string(),
        progress: None,
        path: None,
    });

    // Spawn winfr directly — app already has admin privileges
    let child = Command::new("winfr")
        .args(&winfr_args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .creation_flags(0x08000000) // CREATE_NO_WINDOW — prevent console flash
        .spawn();

    match child {
        Ok(mut child) => {
            let app_clone = app.clone();
            let mut stdout_reader = child.stdout.take().expect("Failed to open stdout");
            let mut stderr_reader = child.stderr.take().expect("Failed to open stderr");

            // Shared log cache to prevent cross-pipe duplication
            let recent_logs = Arc::new(Mutex::new(std::collections::VecDeque::<String>::with_capacity(10)));
            let recent_logs_stderr = recent_logs.clone();
            let recent_logs_stdout = recent_logs.clone();

            // Spawn thread to read stdout
            let app_stdout = app_clone.clone();
            let stdout_thread = thread::spawn(move || {
                let mut buffer = [0u8; 4096];
                let mut leftover = Vec::new();
                let mut current_phase = "scanning";
                let progress_re = regex::Regex::new(r"(\d+)%").ok();
                let pass_re = regex::Regex::new(r"(?i)pass\s*(1|2|scanning|recovering)").ok();

                while let Ok(n) = stdout_reader.read(&mut buffer) {
                    if n == 0 { break; }
                    
                    // Combine leftover from previous read
                    let mut current_bytes = leftover.clone();
                    current_bytes.extend_from_slice(&buffer[..n]);

                    // UTF-16LE characters are 2 bytes each
                    // If we have an odd number of bytes, save the last one for next time
                    if current_bytes.len() % 2 != 0 {
                        leftover = vec![current_bytes.pop().unwrap()];
                    } else {
                        leftover.clear();
                    }

                    if current_bytes.is_empty() { continue; }

                    // Decode UTF-16LE to UTF-8
                    let (decoded, _, _) = UTF_16LE.decode(&current_bytes);
                    let text = decoded.into_owned();

                    // Split by lines and emit
                    for line in text.lines() {
                        let trimmed = line.trim().to_string();
                        if trimmed.is_empty() { continue; }

                        // Check if cancelled
                        {
                            let active = RECOVERY_ACTIVE.lock().unwrap_or_else(|e| e.into_inner());
                            if !*active { break; }
                        }

                        // Detect phase from log keywords
                        if let Some(ref re) = pass_re {
                            if let Some(caps) = re.captures(&trimmed) {
                                let pass_id = caps[1].to_lowercase();
                                if pass_id == "1" || pass_id == "scanning" {
                                    current_phase = "scanning";
                                } else if pass_id == "2" || pass_id == "recovering" {
                                    current_phase = "recovering";
                                }
                            }
                        }

                        // Try to extract progress percentage
                        if let Some(ref re) = progress_re {
                            if let Some(caps) = re.captures(&trimmed) {
                                if let Ok(mut pct) = caps[1].parse::<f64>() {
                                    // Weighted progress: 
                                    // Pass 1 (Scanning) maps 0-100% to 0-50%
                                    // Pass 2 (Recovering) maps 0-100% to 51-100%
                                    if current_phase == "scanning" {
                                        pct = pct * 0.5;
                                    } else {
                                        pct = 50.0 + (pct * 0.5);
                                    }

                                    let _ = app_stdout.emit("recovery-progress", RecoveryEvent {
                                        event_type: "progress".to_string(),
                                        message: trimmed.clone(),
                                        progress: Some(pct.min(100.0)),
                                        path: None,
                                    });

                                    let _ = app_stdout.emit("recovery-status", RecoveryEvent {
                                        event_type: "status".to_string(),
                                        message: current_phase.to_string(),
                                        progress: Some(pct),
                                        path: None,
                                    });
                                }
                            }
                        }

                        // Extract the actual recovery folder path
                        if let Some(caps) = regex::Regex::new(r"Recovery_\d{8}_\d{6}").ok().and_then(|re| re.captures(&trimmed)) {
                            let folder_name = &caps[0];
                            let _ = app_stdout.emit("recovery-path", RecoveryEvent {
                                event_type: "path".to_string(),
                                message: folder_name.to_string(),
                                progress: None,
                                path: Some(folder_name.to_string()),
                            });
                        }

                        // Only emit to logs if NOT a progress line to avoid clutter
                        let is_progress = progress_re.as_ref().map_or(false, |re| re.is_match(&trimmed));
                        if !is_progress {
                            // De-duplicate check
                            let should_emit = {
                                let mut logs = recent_logs_stdout.lock().unwrap();
                                if logs.contains(&trimmed) {
                                    false
                                } else {
                                    if logs.len() >= 10 { logs.pop_front(); }
                                    logs.push_back(trimmed.clone());
                                    true
                                }
                            };

                            if should_emit {
                                let _ = app_stdout.emit("recovery-log", RecoveryEvent {
                                    event_type: "log".to_string(),
                                    message: trimmed,
                                    progress: None,
                                    path: None,
                                });
                            }
                        }
                    }
                }
            });

            // Spawn thread to read stderr
            let app_stderr = app_clone.clone();
            let stderr_thread = thread::spawn(move || {
                let mut buffer = [0u8; 4096];
                let mut leftover = Vec::new();

                while let Ok(n) = stderr_reader.read(&mut buffer) {
                    if n == 0 { break; }
                    
                    let mut current_bytes = leftover.clone();
                    current_bytes.extend_from_slice(&buffer[..n]);

                    if current_bytes.len() % 2 != 0 {
                        leftover = vec![current_bytes.pop().unwrap()];
                    } else {
                        leftover.clear();
                    }

                    if current_bytes.is_empty() { continue; }

                    let (decoded, _, _) = UTF_16LE.decode(&current_bytes);
                    let text = decoded.into_owned();

                    for line in text.lines() {
                        let trimmed = line.trim().to_string();
                        if !trimmed.is_empty() {
                            // De-duplicate check
                            let should_emit = {
                                let mut logs = recent_logs_stderr.lock().unwrap();
                                if logs.contains(&trimmed) {
                                    false
                                } else {
                                    if logs.len() >= 10 { logs.pop_front(); }
                                    logs.push_back(trimmed.clone());
                                    true
                                }
                            };

                            if should_emit {
                                let _ = app_stderr.emit("recovery-log", RecoveryEvent {
                                    event_type: "log".to_string(),
                                    message: format!("[stderr] {}", trimmed),
                                    progress: None,
                                    path: None,
                                });
                            }
                        }
                    }
                }
            });

            // Spawn thread to wait for process completion
            thread::spawn(move || {
                let exit_status = child.wait();

                // Wait for reader threads to finish
                let _ = stdout_thread.join();
                let _ = stderr_thread.join();

                let was_active = {
                    let mut active = RECOVERY_ACTIVE.lock().unwrap_or_else(|e| e.into_inner());
                    let was = *active;
                    *active = false;
                    was
                };

                if !was_active {
                    // Was cancelled by user
                    let _ = app_clone.emit("recovery-status", RecoveryEvent {
                        event_type: "status".to_string(),
                        message: "aborted".to_string(),
                        progress: None,
                        path: None,
                    });
                    let _ = app_clone.emit("recovery-log", RecoveryEvent {
                        event_type: "log".to_string(),
                        message: "! OPERATION ABORTED BY USER !".to_string(),
                        progress: None,
                        path: None,
                    });
                    return;
                }

                match exit_status {
                    Ok(status) => {
                        if status.success() {
                            let _ = app_clone.emit("recovery-status", RecoveryEvent {
                                event_type: "status".to_string(),
                                message: "completed".to_string(),
                                progress: Some(100.0),
                                path: None,
                            });
                            let _ = app_clone.emit("recovery-log", RecoveryEvent {
                                event_type: "log".to_string(),
                                message: "✓ Recovery operation completed successfully.".to_string(),
                                progress: None,
                                path: None,
                            });
                        } else {
                            let code = status.code().unwrap_or(-1);
                            let _ = app_clone.emit("recovery-status", RecoveryEvent {
                                event_type: "status".to_string(),
                                message: "error".to_string(),
                                progress: None,
                                path: None,
                            });
                            
                            if code == -1073741819 {
                                // 0xC0000005 Access Violation
                                let _ = app_clone.emit("recovery-log", RecoveryEvent {
                                    event_type: "log".to_string(),
                                    message: "CRASH DETECTED: winfr.exe encountered an Access Violation (0xC0000005).".to_string(),
                                    progress: None,
                                    path: None,
                                });
                                let _ = app_clone.emit("recovery-log", RecoveryEvent {
                                    event_type: "log".to_string(),
                                    message: "This is a known bug in winfr.exe when scanning exFAT drives in Extensive mode.".to_string(),
                                    progress: None,
                                    path: None,
                                });
                                let _ = app_clone.emit("recovery-log", RecoveryEvent {
                                    event_type: "log".to_string(),
                                    message: "--- TROUBLESHOOTING ---".to_string(),
                                    progress: None,
                                    path: None,
                                });
                                let _ = app_clone.emit("recovery-log", RecoveryEvent {
                                    event_type: "log".to_string(),
                                    message: "1. Run health check on source drive: chkdsk E: /f".to_string(),
                                    progress: None,
                                    path: None,
                                });
                                let _ = app_clone.emit("recovery-log", RecoveryEvent {
                                    event_type: "log".to_string(),
                                    message: "2. Check Microsoft Store for 'Windows File Recovery' updates.".to_string(),
                                    progress: None,
                                    path: None,
                                });
                                let _ = app_clone.emit("recovery-log", RecoveryEvent {
                                    event_type: "log".to_string(),
                                    message: "3. Try 'Advanced Options' -> Disable 'Keep Both' to reduce file conflicts.".to_string(),
                                    progress: None,
                                    path: None,
                                });
                            } else {
                                let _ = app_clone.emit("recovery-log", RecoveryEvent {
                                    event_type: "log".to_string(),
                                    message: format!("Recovery process exited with code: {}", code),
                                    progress: None,
                                    path: None,
                                });
                            }
                        }
                    }
                    Err(e) => {
                        let _ = app_clone.emit("recovery-status", RecoveryEvent {
                            event_type: "status".to_string(),
                            message: "error".to_string(),
                            progress: None,
                            path: None,
                        });
                        let _ = app_clone.emit("recovery-log", RecoveryEvent {
                            event_type: "log".to_string(),
                            message: format!("Failed to wait for process: {}", e),
                            progress: None,
                            path: None,
                        });
                    }
                }
            });

            Ok("Recovery started".to_string())
        }
        Err(e) => {
            let mut active = RECOVERY_ACTIVE.lock().unwrap_or_else(|e| e.into_inner());
            *active = false;
            Err(format!("Failed to launch winfr: {}", e))
        }
    }
}

// ── Cancel Recovery ─────────────────────────────────────────────────

pub fn cancel_recovery() -> Result<String, String> {
    let mut active = RECOVERY_ACTIVE.lock().map_err(|e| e.to_string())?;
    if !*active {
        return Err("No recovery operation is running.".to_string());
    }
    *active = false;

    // Kill any running winfr processes
    let _ = Command::new("taskkill")
        .args(["/F", "/IM", "winfr.exe"])
        .creation_flags(0x08000000)
        .output();

    Ok("Recovery cancelled".to_string())
}

// ── Scan Recovered Files ────────────────────────────────────────────

pub fn scan_recovered_files(destination: &str) -> Result<Vec<RecoveredFile>, String> {
    let dest_path = Path::new(destination);

    if !dest_path.exists() {
        return Err(format!("Destination path does not exist: {}", destination));
    }

    // winfr creates a subfolder like "Recovery_YYYYMMDD_HHMMSS" in the destination
    let recovery_dir = find_latest_recovery_dir(dest_path)
        .unwrap_or_else(|| dest_path.to_path_buf());

    let mut files: Vec<RecoveredFile> = Vec::new();
    let mut id_counter = 0u64;

    for entry in WalkDir::new(&recovery_dir)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_type().is_file() {
            let path = entry.path();
            let name = path
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_default();
            let ext = path
                .extension()
                .map(|e| e.to_string_lossy().to_string())
                .unwrap_or_default();
            let size = entry.metadata().map(|m| m.len()).unwrap_or(0);
            let relative_path = path
                .strip_prefix(&recovery_dir)
                .unwrap_or(path)
                .to_string_lossy()
                .to_string();

            id_counter += 1;
            files.push(RecoveredFile {
                id: id_counter.to_string(),
                name,
                path: format!("\\{}", relative_path.replace("/", "\\")),
                size,
                category: categorize_file(&ext),
            });
        }
    }

    files.sort_by(|a, b| a.category.cmp(&b.category).then(a.name.cmp(&b.name)));
    Ok(files)
}

fn find_latest_recovery_dir(base: &Path) -> Option<PathBuf> {
    let mut latest: Option<(PathBuf, std::time::SystemTime)> = None;

    if let Ok(entries) = fs::read_dir(base) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_dir() {
                let name = entry.file_name().to_string_lossy().to_string();
                if name.starts_with("Recovery_") {
                    if let Ok(meta) = entry.metadata() {
                        if let Ok(modified) = meta.modified() {
                            match &latest {
                                Some((_, prev_time)) if modified > *prev_time => {
                                    latest = Some((path, modified));
                                }
                                None => {
                                    latest = Some((path, modified));
                                }
                                _ => {}
                            }
                        }
                    }
                }
            }
        }
    }

    latest.map(|(p, _)| p)
}

// ── Reveal Path in Explorer ──────────────────────────────────────────

pub fn reveal_path(path: &str) -> Result<(), String> {
    Command::new("explorer")
        .arg(path)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ── Get Disk Health (via chkdsk) ───────────────────────────────────

pub fn get_disk_health(drive: String) -> Result<String, String> {
    let mut drive_fix = drive.clone();
    if !drive_fix.ends_with(':') {
        drive_fix.push(':');
    }

    let output = Command::new("chkdsk")
        .arg(&drive_fix)
        .creation_flags(0x08000000) // CREATE_NO_WINDOW
        .output()
        .map_err(|e| e.to_string())?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if !stderr.is_empty() && output.status.code() != Some(0) {
        return Err(stderr);
    }

    Ok(stdout)
}
