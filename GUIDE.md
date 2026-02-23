# 📖 Winfr Pro: Complete User Guide

Welcome to the official documentation for **Winfr Pro**. This guide explains how to get the most out of the application, from choosing the right recovery mode to understanding how the engine works under the hood.

---

## 🚀 Quick Start Guide

1.  **Select Source Drive**: Choose the drive you want to recover files FROM.
2.  **Select Destination Drive**: Choose a DIFFERENT drive to save recovered files TO. 
    > [!WARNING]
    > Never save recovered files to the same drive you are scanning. This can overwrite the data you are trying to rescue.
3.  **Configure Filters**: Enter file types (e.g., `.jpg`, `.pdf`) or use common presets.
4.  **Start Recovery**: Click "Start Recovery" and watch the live terminal logs.

---

## 🧠 Understanding Recovery Modes

Winfr Pro intelligently recommends modes based on your filesystem, but you can manually override them in **Advanced Options**.

### 1. Regular Mode (`/regular`)
- **Use Case**: Recently deleted files on an **NTFS** drive.
- **How it works**: Uses the Master File Table (MFT) to find files. It is the fastest mode.

### 2. Extensive Mode (`/extensive`)
- **Use Case**: Files deleted long ago, drives that have been formatted, or corrupted filesystems.
- **Requirement**: Works on all filesystems (NTFS, FAT, exFAT, ReFS).

### 3. Segment Mode (`/r`)
- **Use Case**: Deep scan for **NTFS** only.
- **How it works**: Scans File Record Segments (FRS). Best for drives where the MFT is corrupted.

### 4. Signature Mode (`/x`)
- **Use Case**: Recovery for **FAT, exFAT, or ReFS** drives.
- **How it works**: Scans for specific file headers (signatures). It does not rely on the filesystem metadata.

---

## 🛠️ Advanced Options

- **Verbose Mode (`/v`)**: Enables detailed, sector-by-sector logging. Winfr Pro uses this to drive the real-time progress bar and terminal.
- **Keep Both Files (`/o:b`)**: If a file with the same name exists in the destination, this appends a suffix instead of overwriting. 
    > [!NOTE]
    > This is automatically disabled for exFAT drives to prevent engine crashes.
- **Recover System Files (`/k`)**: Includes hidden and system-protected files in the scan.
- **Auto-Accept (`/a`)**: Skips confirmation prompts for a seamless experience.

---

## 🏥 Diagnostics & Health

Before starting a recovery, you can use the **Scan for Errors** feature in the Drive Selector.
- This runs a read-only `chkdsk` to verify if the source drive has physical or logical errors.
- If errors are found, it's often safer to clone the drive before attempting deep recovery.

---

## ⚙️ How it Works (Under the Hood)

### The Wrapper Architecture
Winfr Pro is a **Tauri** application. The UI is built with **React**, while the heavy lifting is handled by a **Rust** backend.
- **Command Generation**: When you click "Start", the Rust backend assembles a complex `winfr.exe` command string with all your chosen flags.
- **Log Piping**: We execute `winfr.exe` as a child process and pipe its `stdout` directly to the frontend.
- **Progress Tracking**: The backend uses Regex to parse the verbose log stream, extracting sector counts and percentages to update the React progress bar in real-time.

---

## 🐞 Troubleshooting

### Exit Code `0xC0000005` (Access Violation)
This is a known bug in the underlying Microsoft `winfr.exe` binary, often triggered when scanning large exFAT volumes with specific switches.
- **Solution**: Winfr Pro automatically disables incompatible switches (`/o:b`) when it detects exFAT. If it still crashes, try updating "Windows File Recovery" from the Microsoft Store.

### No files found?
- Ensure you are using **Extensive** or **Signature** mode if the drive was formatted.
- Ensure your filters (e.g., `*.jpg`) are correct. If in doubt, try a scan with no filters first.

---

## 🛡️ Trust & Code Signing

When you download and run Winfr Pro, Windows might show a "SmartScreen" warning (Blue window) stating that the publisher is unknown.

- **Why?**: Publicly trusted code signing certificates cost ~$300/year. As an independent open-source project, we currently use self-built binaries without a commercial signature.
- **Is it safe?**: Yes. Winfr Pro is 100% open-source. You can audit the source code or build it yourself using the instructions in the [README](README.md).
- **Future Solution**: We are looking into **SignPath Foundation**, which provides free code signing for qualified open-source projects. Once integrated, these warnings will disappear.

---

## 🚀 Releasing New Versions (Automation)

Winfr Pro uses **GitHub Actions** to automate production builds. To release a new version:

1.  **Update Version**: Update the `version` field in both `src-tauri/tauri.conf.json` and `package.json`.
2.  **Commit and Push**: Push your changes to the main branch.
3.  **Tag the Release**: Create and push a git tag (e.g., `v0.1.0`):
    ```bash
    git tag v0.1.0
    git push origin v0.1.0
    ```
4.  **Draft Release**: GitHub will automatically start a Windows build. Once finished, a **Draft Release** will appear in your GitHub repository with the `.msi` and `.exe` installers attached as assets.
5.  **Publish**: Review the draft, add your release notes, and click **Publish**.

---
Built with ❤️ by **KB - kilObit**
