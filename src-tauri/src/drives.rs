use serde::Serialize;
use sysinfo::Disks;

#[derive(Debug, Clone, Serialize)]
pub struct DriveInfo {
    pub id: String,           // "C:", "D:", etc.
    pub label: String,        // Volume label or "Local Disk"
    #[serde(rename = "type")]
    pub drive_type: String,   // "SSD", "HDD", "Removable", "Network"
    pub fs: String,           // "NTFS", "exFAT", "FAT32", etc.
    pub size: String,         // "476 GB"
    pub used: String,         // "234 GB"
    pub percent: u8,          // 0-100
    #[serde(rename = "isSystem")]
    pub is_system: bool,
}

fn format_bytes(bytes: u64) -> String {
    const GB: u64 = 1_073_741_824;
    const TB: u64 = 1_099_511_627_776;
    const MB: u64 = 1_048_576;

    if bytes >= TB {
        format!("{:.1} TB", bytes as f64 / TB as f64)
    } else if bytes >= GB {
        format!("{:.0} GB", bytes as f64 / GB as f64)
    } else {
        format!("{:.0} MB", bytes as f64 / MB as f64)
    }
}

pub fn get_drives() -> Vec<DriveInfo> {
    let disks = Disks::new_with_refreshed_list();
    let mut drives: Vec<DriveInfo> = Vec::new();

    for disk in disks.list() {
        let mount = disk.mount_point().to_string_lossy().to_string();
        // Only include drives with a letter (e.g., "C:\")
        if mount.len() < 2 || !mount.chars().next().unwrap_or(' ').is_ascii_alphabetic() {
            continue;
        }

        let id = format!("{}:", mount.chars().next().unwrap().to_uppercase().next().unwrap());
        let total = disk.total_space();
        let available = disk.available_space();
        let used = total.saturating_sub(available);
        let percent = if total > 0 {
            ((used as f64 / total as f64) * 100.0) as u8
        } else {
            0
        };

        let label = {
            let name = disk.name().to_string_lossy().to_string();
            if name.is_empty() {
                "Local Disk".to_string()
            } else {
                name
            }
        };

        let drive_type = match disk.kind() {
            sysinfo::DiskKind::SSD => "SSD".to_string(),
            sysinfo::DiskKind::HDD => "HDD".to_string(),
            _ => "Drive".to_string(),
        };

        let fs = disk.file_system().to_string_lossy().to_string();

        // Heuristic: C: is usually the system drive
        let is_system = id == "C:";

        drives.push(DriveInfo {
            id,
            label,
            drive_type,
            fs,
            size: format_bytes(total),
            used: format_bytes(used),
            percent,
            is_system,
        });
    }

    // Sort: system drive first, then alphabetically
    drives.sort_by(|a, b| {
        b.is_system.cmp(&a.is_system).then(a.id.cmp(&b.id))
    });

    drives
}
