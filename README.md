<div align="center">
  <img src="iconwinfr.png" width="128" height="128" alt="Winfr Pro Logo">
  <h1> Winfr Pro</h1>
</div>

**Professional Graphical User Interface for Microsoft Windows File Recovery**
> [!IMPORTANT]
> **Beta Release**: This is the first public release (**v0.1.0-beta**). While fully functional, please report any issues on the GitHub tracker.
> 
> [!NOTE]
> This application is built exclusively for **Windows 10/11**.

Winfr Pro is a high-performance, open-source GUI for the official [Windows File Recovery](https://apps.microsoft.com/store/detail/windows-file-recovery/9N26S50LN705) command-line tool. Designed for power users and professionals, it transforms the complexity of CLI-based data recovery into a streamlined, "pro-aesthetic" experience without sacrificing technical control.

> [!TIP]
> **New to Winfr Pro?** Check out the [Comprehensive User Guide](GUIDE.md) for detailed instructions on modes, filters, and advanced options.
> <img width="1202" height="902" alt="image" src="https://github.com/user-attachments/assets/9deab1fa-1b23-4310-83bb-d4c6c5b87cdd" />


## ✨ Features

- **🚀 Live Terminal Integration**: Real-time sector-by-sector stream of the underlying `winfr.exe` engine logs (requires `/v` verbose flag).
- **🧠 Smart Filesystem Awareness**: Automatically configures the optimal recovery mode (Segment vs. Signature) based on the drive's filesystem (NTFS, FAT, exFAT).
- **⚡ Pro-User Switches**: Full access to Advanced Options including Verbose logging (`/v`), Signature Mode (`/x`), and Segment Mode (`/r`).
- **🏥 Disk Health integration**: Integrated pre-scan checks to detect filesystem issues before attempting recovery.
- **🖤 Premium Dark Theme**: A high-contrast, strictly dark user interface designed for focus and productivity.
- **📊 Adaptive Mode Selection**: Intelligent logic that recommends and applies the best scan strategy for your hardware.

## 📥 Download & Installation

### Option 1: Prebuilt Binaries (Recommended)
For most users, downloading the compiled `.exe` or `.msi` installer is the easiest way to get started.
1. Go to the [Releases](https://github.com/kil0bit-kb/winfr-pro/releases) page.
2. Download the latest `Winfr_Pro_x64_en-US.msi` or the standalone `.exe`.
3. Run the installer and follow the on-screen instructions.

### Option 2: Build from Source
If you are a developer and want to customize Winfr Pro, you can build it yourself.

**Prerequisites:**
- **Windows 10/11**
- **Windows File Recovery**: Ensure it's installed from the Microsoft Store.
- **Rust & Node.js**: Required for compilation.

**Steps:**
1. **Clone the repository**:
   ```bash
   git clone https://github.com/kil0bit-kb/winfr-pro.git
   cd winfr-pro
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run in development mode**:
   ```bash
   npm run tauri dev
   ```
4. **Build the production executable**:
   ```bash
   npm run tauri build
   ```

## 🤝 Support the Project

Winfr Pro is free and open-source. If you find it useful, consider supporting the creator:

- **Patreon**: [Support KB - kilObit](https://www.patreon.com/cw/KB_kilObit)
- **YouTube**: [@kilObit](https://www.youtube.com/@kilObit)

## 🗺️ Roadmap / Future Plans

We are constantly looking to improve Winfr Pro. Future milestones include:

- **🖼️ File Previews**: View recovered images and text files directly within the app before saving.
- **💿 Virtual Drive Cloning**: Clone a failing physical disk to a virtual image and perform recovery safely from the image.
- **📂 Advanced Selection UI**: A more granular interface for selecting specific files and folders from the scan results.
- **📦 winget Distribution**: Support for installing and updating Winfr Pro via `winget install winfr-pro`.
- **🔄 Auto-Update Check**: Built-in notification system to alert users when a new version is available on GitHub.
- **🔍 Deep Pattern Search**: Support for custom hex-based file signature scans.

## ⚖️ License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ by **KB - kilObit**
