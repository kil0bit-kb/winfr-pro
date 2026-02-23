# Project History & Milestones 📜

> [!IMPORTANT]
> **🤖 AI HANDOFF NOTES & CURRENT STATE (Feb 22, 2026)**
> Welcome to the Winfr Pro project! If you are a new model jumping in here, here is precisely what you need to know about the current architecture and design philosophy:
> 
> **Tech Stack**: Tauri v2, React 18, Tailwind CSS, TypeScript, `lucide-react` for all icons.
> **Design Vibe**: "Pro/Power-user" aesthetic. Strict deep dark mode (`bg-[#08050a]`). We DO NOT use diffused glowing drop-shadows. All active states, highlights, and hovers use crisp, solid 1px border rings (e.g., `ring-1 ring-blue-500`) and structured backgrounds. Typography relies on high-contrast whites and specific brand tints (Blue for Regular Search, Cyan for Extensive Search).
> **Current Flow**: 
> 1. Dashboard (`App.tsx`): Users select Source/Dest drives (`DriveSelect` / `DriveSelectionModal`), configure filters (`FilterConfig`), and set Advanced Options.
> 2. Recovery (`RecoveryProgressModal.tsx`): A simulated animated progress bar with a live, auto-scrolling terminal outputting fake `winfr` logs.
> 3. Results (`RecoveryResultsModal.tsx`): A detailed grid view where users can filter recovered files by category, select specific items, and use a native Tauri OS dialog (`@tauri-apps/plugin-dialog`) to choose where to save them.
> 
> **What's Next**: The UI shell is virtually complete and thoroughly tested with mock data. The next major phase is integrating the actual Rust backend commands to run the real Microsoft `winfr.exe` CLI executable. 
> *Architecture Note*: To drive the real UI progress bars, you **MUST** execute `winfr` using the `/v` (verbose) flag under the hood. The default `winfr` output relies on carriage returns (`\r`) to overwrite lines which can be extremely difficult to pipe reliably to frontends. Passing `/v` streams raw, continuous sector-by-sector processing logs to `stdout/stderr`, which Rust can easily parse via Regex to feed the React progress bar and terminal.
> 
> 🔴 **CRITICAL DIRECTIVE FOR THE NEXT AI**: You must continuously update this `history.md` file with a detailed, structured log of every significant change, feature, or bug fix you implement during your session. Keep track of everything here!

### 🚀 v0.1.0 Beta: The Official Launch *(8:15 PM)*
- **GitHub Repository Launch**: Successfully initialized the project on GitHub ([winfr-pro](https://github.com/kil0bit-kb/winfr-pro)). Configured automated CI/CD pipelines for linting, building, and production releases.
- **CI/CD Build Certification**: Surgically resolved four critical Rust backend Clippy errors (map_or simplification, regex loop optimization, and assignment patterns) to ensure 100% build compliance with the GitHub Action quality gates.
- **Full-Stack Branding & Documentation**: Established a professional repository presence with a custom-branded `README.md`, `LICENSE`, `GUIDE.md`, and community templates (`CONTRIBUTING`, `CHANGELOG`, `ISSUE_TEMPLATES`).
- **Surgical UI Stability**: Eliminated high-frequency flickering in Chromium/WebView2 on Windows by purging all `backdrop-blur` effects and implementing `translate-z-0` across the entire React component stack.
- **Engine Logic Hardening**: Neutralized an infinite drive detection loop in `App.tsx` and standardized the Rust backend for direct, admin-privileged command execution.

### 📅 Upcoming Builds & Roadmap
- [ ] **v0.2.0 (The Preview Release)**: Implement a virtual "Clone & Scan" sandbox and file previewers for common formats (Txt, Jpeg, Png) directly inside the Results viewer.
- [ ] **v0.3.0 (Distribution)**: Integrate `winget` submission and implement an automated "Check for Updates" service within the Topbar.
- [ ] **v0.4.0 (Advanced Recovery)**: Add deep-level sector inspection tools and custom raw hex viewing for power users.

### 🛡️ Core UI Stability & Rendering Milestone *(5:05 PM)*
- **System-Wide Backdrop-Blur Removal**: Exhaustively removed all volatile `backdrop-filters` from the Topbar, Modals, and Dashboard. These were identified as the primary source of flickering in Chromium/WebView2 on Windows.
- **Hardware-Accelerated Layout**: Implemented `translate-z-0` across all primary UI containers to force a dedicated rendering path.
- **Surgical Transition Polish**: Refined modal entrance animations and background dimming to use stable opacity fades.
- **Topbar Streamlining**: Removed tooltips from standard window control buttons (Minimize, Maximize, Close).

### 🧹 Feature Removal: History & Settings *(11:45 AM)*
- **Core Simplification**: Removed the History and Settings features to focus the application on its primary goal: efficient data recovery.
- **Backend Purge**: Deleted `history.rs`, removed `uuid` and `chrono` dependencies, and stripped all history-saving logic from the recovery lifecycle.
- **Frontend Refinement**: Deleted `HistoryView.tsx` and `SettingsView.tsx`. Refactored the UI to a streamlined Dashboard/About two-tab layout.

### 🗺️ Navigation Refinement & Label Visibility *(11:35 AM)*
- **Streamlined Navigation**: Removed the "Settings" tab and deleted the `SettingsView.tsx` component to keep the interface focused on core data recovery tasks.
- **Enhanced Labeling**: Updated the topbar navigation to display explicit text labels (**Dashboard**, **History**, **About**) alongside icons for better accessibility and clarity.
- **Codebase Sanitization**: Cleaned up unused imports and state variables related to the removed Settings tab.

### 📂 Multi-Tab Architecture & Persistent History *(11:30 AM)*
- **Tabbed Navigation**: Refactored `App.tsx` into a modular multi-tab system (Home, History, Settings, About).
- **Persistent History Service**: Built a Rust backend service (`history.rs`) using `serde_json`, `chrono`, and `uuid` to save and load recovery sessions.
- **Auto-Save**: Integrated history tracking into the `recovery.rs` lifecycle.
- **Re-run Logic**: Implemented a "Smart Restore" feature that populates the home screen with any previous scan configuration from the history list.
- **New UI Views**:
    - `HistoryView`: Interactive list of past scans with status indicators.
    - `SettingsView`: Control panel for app behavior and history cleanup.
    - `AboutView`: Premium landing page with documentation and project info.

### 🔗 Cascading Toggle Logic & UI Sync *(10:25 AM)*
- **Smart UI Sanitization**: The Advanced Options modal now automatically unchecks and locks **Keep Both Files (/o:b)** and **Verbose Mode (/v)** when Signature Mode is enabled.
- **Visual Locking**: These incompatible switches are now greyed out and show a "Not supported in Signature Mode" hint to prevent user confusion.
- **Smart Selection Sync**: Updated the "Smart Drive Selection" logic in `App.tsx` to immediately apply these clean-state rules when a non-NTFS drive is picked.

### 🧠 Smart Switch Compatibility & Auto-Sanitization *(10:20 AM)*
- **Mode-Aware Logic**: Implemented a backend "sanitizer" that automatically manages `winfr` switch compatibility based on the active scan mode.
- **Signature Mode (/x) Safety**: Automatically strips `/o:b` (Keep both) and `/v` (Verbose) when in Signature mode to prevent the "Incompatible Switch" crash, as these flags are not supported by the `/x` engine.
- **Segment Mode (/r) Full Feature Support**: Re-enabled `/o:b` and `/v` for Segment Mode to ensure power users on NTFS get full functionality.
- **Standardized Base Modes**: Guaranteed that all deep scans (`/x` or `/r`) correctly include the required `/extensive` base flag.

### 🐞 Signature Mode (/x) Group Fix *(10:15 AM)*
- **Invalid Group Mitigation**: Fixed the "Incompatible Switch" error by correctly mapping Dashboard categories to valid standard `winfr` groups (e.g., `MPEG` for Videos, `ZIP` for Documents). `winfr` does not support specific file extensions in Signature mode.
- **Improved Syntax Accuracy**: Replaced extension-based filters with consolidated group switches to ensure compatibility with all filesystems.

### 🛠️ Advanced Mode Prioritization Fix *(10:05 AM)*
- **Precedence Logic**: Fixed a bug where `/extensive` was incorrectly prioritized over advanced switches. Now, checking **Segment Mode (/r)** or **Signature Mode (/x)** correctly overrides the generic Dashboard mode in the generated `winfr` command.
- **Feature Parity**: Verified that all advanced options (Auto-Accept, Keep Both, Verbose Mode, etc.) are correctly mapped and transmitted between the UI and the recovery engine.
- **ExFAT Resilience**: Maintained the safety check that disables `/o:b` on exFAT drives to prevent binary crashes in extensive scans.

### 🛡️ Smart Mode Exclusivity (/regular vs /r, /x) *(10:10 AM)*
- **Clarified Mode Guidance**: Revamped the descriptions for Segment and Signature modes to explicitly mention their ideal filesystems (NTFS vs. FAT/exFAT).
- **Deep Scan Safeguards**: Implemented strict UI blocking for Segment (`/r`) and Signature (`/x`) modes when the app is in Regular mode, preventing invalid `winfr` command combinations.
- **Auto-Sync Logic**: Switching to Regular mode on the Dashboard now automatically unchecks all deep scan options to maintain a valid state.
- **Unified Visual Theme**: Standardized all warning and informational tooltips in the Advanced Options modal to a "Gold" (Amber) theme for better visibility and consistency.
- **Enable Deep Scan Shortcut**: Integrated a one-click "Enable Deep Scan" button directly within the Advanced Modal to allow seamless transition from Regular to Extensive mode.

### 🧠 Smart Mode Selection & Filesystem Awareness *(7:45 PM)*
- **FS-Based Auto-Selection**: Integrated logic into `App.tsx` to automatically configure the best deep-scan strategy when a source drive is selected. NTFS drives now default to Segment mode (`/r`), while FAT/exFAT drives default to Signature mode (`/x`).
- **Mutual Exclusivity UX**: Standardized the radio-button behavior between Segment and Signature modes in the Advanced Options modal. Manually selecting one automatically unchecks the other.
- **Visual Recommendations**: Added dynamic "Recommended" badges in the Advanced UI that adapt to the selected drive's filesystem.
- **Switch Notifications**: Implemented a transient visual feedback system in the modal that notifies users when a scan mode has been automatically swapped or disabled.
- **Flexibility Enhancement**: Removed the restrictive "Auto-Extensive" forcing logic, allowing users full control over their scan switches while still providing smart defaults.

### ⚖️ Winfr Mode Alignment (/r, /x) *(7:30 PM)*
- **Modern Syntax Migration**: Replaced legacy `/segment` and `/signature` switches with modern `/r` (Segment) and `/x` (Signature) flags to align with the latest `winfr` documentation.
- **Signature Mode Logic**: Implemented intelligent `/y:` group mapping for Signature mode. When `/x` is active, the app now automatically translates category tags into supported file type groups, ensuring command compatibility.
- **Enhanced UX Warnings**: Added a dedicated warning in the Advanced Options modal for Signature Mode, clarifying its lack of support for custom filename filters.
- **Improved Exclusivity**: Standardized radio-button logic to ensure hardware-level compatibility between scanning modes.

### 🔍 Verbose Mode & Detailed Logging *(7:20 PM)*
- **Implemented /v Flag**: Added "Verbose Mode" to the backend `RecoveryConfig` and Arg builder. This passes the `/v` flag to `winfr.exe`, enabling detailed sector-by-sector logging.
- **Advanced Options Toggle**: Integrated a new toggle in `AdvancedOptionsModal.tsx` to allow users to control verbose logging.
- **Default Enablement**: Set Verbose Mode to be enabled by default for all searches, ensuring maximum log detail for more accurate progress tracking as per architectural recommendations.
- **Frontend Sync**: Updated `App.tsx` state and backend invocation to properly pass the verbose preference.
- **Type Safety**: Unified `AdvancedOptions` interfaces across components and resolved type mismatches in state setters.

### 🏥 Disk Health & Binary Resilience *(6:30 PM)*
- **Pre-Recovery Health Scans**: Added "Scan for Errors" to the drive selector. This invokes a read-only `chkdsk` on the backend to detect filesystem issues before starting recovery.
- **Intelligent Crash Detection**: The app now specifically identifies the `-1073741819` (0xC0000005) Access Violation. It displays a dedicated "Troubleshooting Guide" with actionable steps (chkdsk repo, Store updates) instead of a raw exit code.
- **exFAT Safe Mode**: Automatically hardened command parameters for exFAT drives by disabling the `/o:b` flag, a known trigger for binary instability on non-NTFS volumes.

### 🛠️ Stability & Terminal Precision *(6:15 PM)*

### 🛠️ Stability & Terminal Precision *(6:15 PM)*
- **Resolved Duplicate Logs**: Fixed a race condition in the event listeners and added a backend log cache.
- **Improved Parameter Precision**: Reverted source drive formatting to `X:` (no trailing backslash) after identifying that `winfr` rejects the `X:\` format.
- **Async Listener Hardening**: Re-engineered the frontend event setup to be mount-safe, preventing double-registration of listeners.

### 🔒 Persistent Modals & Interaction Flow *(6:05 PM)*
- **Disabled Outside-Click Dismissal**: Modals (Drive Selection, Advanced Options) now only close via their explicit "X" or "Close" buttons. This prevents accidental data loss or closure during configuration.
- **Improved Layout Depth**: Standardized top-offset positioning (`pt-24`) for all modals to ensure they never overlap with the interactive window topbar.
- **Consistent Visual Language**: Adjusted modal height and width to provide a more compact and professional feel across the entire application.

### 🔝 Persistent Topbar Accessibility *(6:00 PM)*
- **Z-Index Elevation**: Boosted the topbar to `z-[1001]` and the error toast to `z-[1002]`. This ensures window controls (minimize, maximize, close) are always visible and interactive, even when modals like "Advanced Options" or "Drive Selection" are open.
- **Improved Window Management**: Users can now manage the application window or view critical toasts without needing to close active modal dialogs first.

### 🧹 Clean Single-Stream Logs *(5:55 PM)*
- **De-duplication**: Removed redundant messages while keeping a singular, clear "✓ Success" indicator at the end of the recovery operation.
- **Log Filtering**: Continued filtering raw "Progress: X%" lines to keep the terminal focused on meaningful events.
- **Improved Scannability**: The terminal now provides a clean, professional summary of the recovery without any visual clutter.

### ✨ Ultra-Smooth Progress Animation *(5:50 PM)*
- **Linear Interpolation**: Introduced a local `displayProgress` state that smoothly catches up to backend updates, eliminating "jerky" bar movements.
- **Idle Trickle**: Added a subtle trickle effect that keeps the progress bar moving forward even when the backend is busy, ensuring the app always feels responsive.
- **Unified Flow**: Combined with the previous 50/50 split, the progress bar now moves continuously and smoothly from 0% to 100%.

### 📉 Unified Progress Bar Visualization *(5:45 PM)*
- **Weighted Progress Mapping**: Implemented a 50/50 split for the progress bar. Scanning (Pass 1) now maps to 0-50%, and Recovery (Pass 2) maps to 51-100%.
- **Phase Detection**: Enhanced the backend to detect "Pass 1/Scanning" and "Pass 2/Recovering" from the `winfr` output for accurate phase synchronization.
- **Smooth UX**: The progress bar now flows continuously from start to finish, eliminating the "stuck at 100%" confusion during file recovery.

### 📂 Robust Native Folder Opening *(5:35 PM)*
- **Native Explorer Integration**: Replaced the `plugin-opener` with a custom `reveal_path` backend command that spawns `explorer.exe` directly. This is the most reliable method for opening deep recovery paths on Windows.
- **Diagnostic Logging**: Added console logging to track the exact paths being opened, ensuring full transparency in the recovery workflow.
- **Unified Path Logic**: Consolidated all path construction into a secure, predictable pattern that works across all drive and folder types.

### 📂 Precision "Open Folder" & UI Simplification *(5:30 PM)*
- **Reliable Folder Opening**: Added `activeRecoveryBaseDir` state to ensure the "Open Folder" button correctly targets the `WinfrRecovery` subfolder even when scanning to a drive root.
- **Removed "Review Files"**: Purged the results viewer and associated logic to streamline the recovery workflow. Users now jump directly to their files in File Explorer.
- **Cleanup**: Removed unused state, imports, and interface definitions relating to file scanning.


### � Precision "Open Folder" Fix *(5:21 PM)*
- **Specific Folder Tracking**: Updated the backend to capture the exact timestamped subfolder created by `winfr` (e.g., `Recovery_20260222_170516`) from the log stream.
- **Frontend Sync**: Added a new `recovery-path` event that feeds this specific folder name to the frontend.
- **Reliable Opening**: The "Open Folder" button now opens the precise recovery location instead of just the destination drive.

### �🖼️ Scan Window UX Refinements *(5:17 PM)*
- **Removed Top Progress Bar**: Deleted the thin colored bar at the very top of the window for a cleaner, more focused look.
- **Repositioned Close Button**: Standard "X" button is now located at the **far top-right** of the window, outside the status text group.
- **Disabled Click-Outside**: Modal stays open until an explicit Close/X click after completion.
- **Restored Header Layout**: Improved alignment of status text and action buttons.

###  Filter Preset Expansion Fix *(5:04 PM)*
- **Resolved "No files found" with presets**: Quick Presets (Images, Videos, etc.) were being passed as literals to `winfr`, which it didn't recognize.
- Updated `recovery.rs` to map preset names to actual extension wildcards (e.g., "Videos" now correctly expands to `/n *.mp4 /n *.avi /n *.mkv ...`).
- Users can now click the standard category presets and have them work correctly with the CLI.

### 🔢 Files Found & UTF-16LE Encoding Fix *(4:59 PM)*
- **Fixed backend decoding**: `winfr.exe` outputs in UTF-16LE, which was causing "spaced-out" text and breaking regex matching.
- Implemented a robust decoding loop in Rust (`recovery.rs`) using the `encoding_rs` crate to convert stream bytes to UTF-8 in real-time.
- Updated `Cargo.toml` with `encoding_rs` dependency.
- Refined frontend regex in `RecoveryProgressModal.tsx` to accurately parse `Files recovered: X` from the corrected stream.
- Verified: `cargo build` passes, text is correctly decoded, and counters are now functional.

### 📂 Open Destination Folder *(4:41 PM)*
- "Open Folder" button appears alongside "Review Files" on recovery completion in `RecoveryProgressModal`.
- Uses `openPath` from `@tauri-apps/plugin-opener` to open the destination in Windows Explorer.
- Files changed: `App.tsx`, `RecoveryProgressModal.tsx`.

### 💽 Smart Mode for Non-NTFS Drives *(4:35 PM)*
- Regular mode **disabled** (30% opacity, `cursor-not-allowed`) when source drive is not NTFS.
- Hover tooltip shows: *"Your drive is FAT32 — use Extensive Mode"* (shows actual filesystem name).
- **Auto-switches** to Extensive mode when a non-NTFS source drive is selected.
- File changed: `App.tsx`.

### 🧠 Mode-Aware Advanced Options *(4:30 PM)*
- **Mutually exclusive mode logic** in `recovery.rs`: Segment and Signature override Regular mode. Both can't be active simultaneously.
- **Radio-style toggle**: In Regular mode, checking Segment auto-unchecks Signature and vice versa. Descriptions note "Overrides Regular mode."
- **Extensive mode**: Segment/Signature auto-enabled and greyed out with purple "Auto · Extensive" badge.
- Files changed: `App.tsx`, `AdvancedOptionsModal.tsx`, `recovery.rs`.

### 🔒 Admin Launch & Recovery Simplification *(4:04 PM)*
- **Admin Manifest**: App now always launches with UAC admin elevation via `tauri_build::WindowsAttributes::app_manifest()` with `requireAdministrator` in `build.rs`.
- **Recovery Engine Simplified (`recovery.rs`)**: Since app runs as admin, removed the PowerShell `Start-Process -Verb RunAs` wrapper, batch script creation, and temp log file tailing. `winfr.exe` is now spawned directly as a child process with piped stdout/stderr read via `BufReader` in background threads. Much cleaner and more reliable.
- `CREATE_NO_WINDOW` flag (0x08000000) prevents console flashing on winfr/taskkill spawns.
- Cleaned up unused files (`app.manifest`, `app-manifest.rc`) and removed `embed-resource` dependency.
- Build verified: `cargo build` passes.

### ⚙️ Full Backend Implementation *(3:53 PM)*
- **Rust Backend — Real Drive Enumeration (`drives.rs`)**:
  - Uses `sysinfo::Disks` to list all physical drives with id, label, type (SSD/HDD), filesystem, size, used space, and usage percent.
  - System drive detection heuristic (C:). Drives sorted with system drive first.
- **Rust Backend — Recovery Engine (`recovery.rs`)**:
  - Builds `winfr.exe` CLI args from frontend state (source, destination, mode, filters, all 7 advanced options).
  - Creates a temp batch script that runs `winfr.exe` with output redirection.
  - Launches via PowerShell `Start-Process -Verb RunAs` for UAC elevation.
  - Background thread tails the log file every 500ms and emits Tauri events: `recovery-log` (raw lines), `recovery-progress` (parsed % from output), `recovery-status` (scanning/recovering/completed/aborted/error).
  - Handles UTF-16LE decoding (winfr outputs UTF-16).
  - `cancel_recovery` kills the winfr process via `taskkill`.
  - `scan_recovered_files` walks the destination folder (finds latest `Recovery_*` subfolder), categorizes files by extension, returns structured data.
- **Rust Backend — Command Registration (`lib.rs`)**:
  - 4 Tauri commands: `list_drives`, `start_recovery`, `cancel_recovery`, `scan_recovered_files`.
  - Capabilities updated with `core:event:default`, `core:event:allow-listen`, `core:event:allow-emit`.
- **Frontend Integration**:
  - `App.tsx`: Calls `invoke('list_drives')` on mount. Starts recovery via `invoke('start_recovery', { config })`. Listens for 3 Tauri events for real-time streaming. Scans files via `invoke('scan_recovered_files')` on review. Lifted filter tags and advanced options state.
  - `DriveSelectionModal.tsx`: Accepts `drives[]` and `loading` props. Shows spinner during fetch, empty state if no drives.
  - `RecoveryProgressModal.tsx`: Removed all simulation. Accepts real `logs[]`, `progress`, `status`, `onAbort` props. Timer runs locally.
  - `AdvancedOptionsModal.tsx`: State lifted to parent via `options`/`onOptionsChange` props.
  - `FilterConfig.tsx`: State lifted to parent via `activeTags`/`onTagsChange` props.
- **Dependencies**: Added `regex` and `walkdir` to `Cargo.toml`.
- **Build Verified**: Both `tsc && vite build` and `cargo build` pass with zero errors.

### 🎨 Mode Button Color Remap *(3:46 PM)*
- **Regular Mode**: Changed from blue (`brand-blue`) to muted green (`emerald-600`). Ring, background tint, and subtitle use emerald; main label text stays white.
- **Extensive Mode**: Changed from cyan (`brand-cyan-500`) to purple (`purple-500`). Ring, background tint, and subtitle use purple; main label text stays white.
- **Advanced Settings**: Remains red (unchanged).
- File changed: `App.tsx` (mode segmented control in bottom action bar).

### 🔄 Complete Reversion to Stable State
- Systematically undid all experimental changes from earlier in the day.
- Restored `tailwind.config.js`, `index.css`, and component structures to the Feb 21st baseline.
- Verified build stability before proceeding with new theme implementation.

### 🌙 Deep Midnight Theme Implementation
- **Design System**: Implemented a premium dark theme with a `#08050a` base.
- **Glassmorphism**: Added `glass-card` utilities using `backdrop-blur-xl` and semi-transparent backgrounds.
- **Neon Accents**: Introduced `brand-purple-neon` and `brand-indigo-neon` for high-contrast interactive elements.
- **Typography**: Switched to bold, black-weight fonts for a sophisticated dashboard aesthetic.

### 🛠️ Debugging: Blank Screen Resolution
- **Issue**: App was rendering a white screen due to PostCSS resolution failures.
- **Fix 1 (Flattening)**: Converted nested Tailwind color objects to flat keys to assist the `@apply` directive.
- **Fix 2 (CSS Variables)**: Transferred neon brand colors to CSS variables in `:root` to ensure they are available to both Tailwind and custom CSS layers regardless of build order.
- **Verification**: Used a "Debug Mode" `App.tsx` to isolate and confirm React mounting before restoring the full UI.

### ⚡ UI Compaction: Filters & Targeting
- **Density**: Reduced the footprint of the Filter section by 30%.
- **Layout**: Switched preset list to a multi-column grid for better space utilization.
- **Refinement**: Optimized padding, internal margins, and font scales for a more professional, "pro-tool" feel.

### 💎 Sapphire Professional Theme Pivot
- **Aesthetic Shift**: Transitioned from purple "Deep Midnight" to a corporate-ready "Sapphire Professional" blue theme.
- **Color Palette**: Implemented Slate-950 foundation with Sapphire Blue (#2563eb) and Electric Cyan accents.
- **Component Global Update**: Refactored `App.tsx`, `DriveSelect`, `FilterConfig`, and `AdvancedModal` to the new blue design system.
- **Stability**: Maintained the build-stable CSS variable architecture for all neon and primary brand colors.

### 🖥️ Drive Selection & Hardware Discovery
- **Native Directory Picker**: Integrated `@tauri-apps/plugin-dialog` enabling users to select specific folders via the native Windows dialog.
- **Hardware Recognition**: Implemented automatic drive discovery mapping (e.g., C:, D:) with dynamic badges indicating OS-critical system drives and storage types (SSD, HDD, NVMe).
- **Rich Metadata Display**: Re-designed drive cards to show full storage analytics: Total Capacity, Used Storage, and Usage Percentages.

### �️ Selection Validation & Conflict Prevention
- **Safety Locks**: Built a robust validation system preventing users from selecting the same physical drive for both Source and Destination.
- **Dynamic Alerts**: Conflicting selections are instantly disabled and grayed out, accompanied by a vibrant, high-contrast red warning badge.
- **Contextual Guidance**: Added interactive hover tooltips that clearly explain the technical reasons behind selection blocks (preventing data corruption).
- **Auto-Resolution**: Implemented smart logic that prioritizes Source selection—if a new Source conflicts with the current Destination, the Destination is automatically cleared.

### ✨ Drive Selection UX Refinements
- **Context-Aware Messaging**: Dynamic subheaders now properly differentiate instructions ("Select source to scan" vs "Select destination to save").
- **Hardware Refresh**: Added a dedicated, center-aligned Refresh action with micro-animations to clear selections and simulate hardware re-scans.
- **Visual Polish**: Scaled up font sizes, optimized spacing, removed unnecessary "ghost" letters, and enforced high-contrast states across the entire modal and native selection cards.

### 🎯 Filter Configuration Refinement
- **Two-Column Architecture**: Restructured the targeting area into a high-efficiency Left (Inputs & Presets) vs Right (Active Filters) layout.
- **Ultra-Compact Visual Presets**: Replaced the standard list with horizontal chips featuring `lucide-react` icons. Re-designed the icon styling to retain their distinct identification colors (blue, green, purple, etc.) even when inactive, rather than graying out. Removed artificial white hover glows in favor of a clean, structured appearance.
- **Smart User Guidance**: Integrated a dark-themed syntax tooltip (`?` icon) that explicitly details WinFR rules for Extensions (`*.ext`), Directories (`\docs\`), and Wildcards (`*name*`).
- **Input Formatting**: Enhanced the filter input with automated syntax correction (e.g., auto-prepending `*` when a user types just `.png`).

### 📐 Dashboard Vertical Optimization
- **Viewport Fitting**: Significantly reduced the vertical margins (`mt-6` to `mt-2`) and container gaps (`gap-8` to `gap-4`) between the main logical blocks in `App.tsx`.
- **Scroll Elimination**: Ensures the entire application dashboard (Drive Select, Filter Config, Action Bar) renders perfectly within a minimum `1220x900` window without requiring scrollbars.

### ✨ Global UI Highlight Refinement
- **Glow Elimination**: Executed a codebase-wide deprecation of diffused, glowing drop-shadows (e.g., `shadow-[0_0_15px...]`) used for hovered and selected states.
- **Sharp Ring Structure**: Replaced all active UI glows with solid, structured 1px border rings (`ring-1`). This includes:
  - Active Filter Presets (`ring-brand-blue`)
  - Target/Destination Dots (`ring-brand-blue-neon`)
  - Hover states for Advanced Options, Refresh, and Recover buttons (`ring-blue-500`)
  - Drive Progress bars and Conflict Badges (`ring-red-500` and `ring-brand-cyan`)
- **Advanced Options Consistency**: Repainted the internal checkboxes and the primary "Save & Apply" button inside the Advanced Settings modal to utilize the unified solid `blue-600` action color and structured ring highlights, moving away from previous shadow effects. Upgraded the modal's header icon from blue to red (`text-red-500`, `ring-red-500/50`) to perfectly match the warning color of the button that triggers it. Finally, added a structured hover background and outline to the "Cancel" button to give it appropriate UI weight next to the primary action button.
- **Visual Impact**: Transitioned the aesthetic from a "glowing neon" vibe to a much crisper, strictly delineated "Pro/Power-user" interface where highlighted options form physical boxes.

### 🔘 Action Bar Proportions & Styling
- **Action Button Transformation**: Re-designed the primary "Recover Files" button from a gradient warning style (Shield icon) to a solid `blue-600` action style (Play icon).
- **Proportional Rebalancing**: Shrunk the width of the action button from 50% (`w-1/2`) to 33% (`w-1/3`). This explicitly allocates more horizontal space to the adjacent Segmented Control and "Advanced Options" toggle, drastically improving their click target size and visibility.
- **Advanced Options Prominence**: Removed the `hidden` breakpoint class from the "Advanced" text, ensuring it is always visible. Styled the button with high-contrast red typography (`text-red-500`) and a red hover glow to clearly signal that it contains power-user/potentially dangerous settings.
- **Mode Toggle Refinement**: Upgraded the specific brand colors for the search modes. The active state now uses a sharp, solid 1px border ring (`ring-brand-blue` / `ring-brand-cyan-500`) instead of a diffused shadow glow, explicitly "highlighting" the selected perimeter. Regular Mode features a `brand-blue` footprint with matching hover-tints. Extensive Mode mirrors this with its intense `brand-cyan` styling to visually separate deep scanning. Additionally, their *inactive* states now have distinct tinted backgrounds (`bg-brand-blue/5` vs `bg-brand-cyan/5`) and colored typography to ensure immediate visual recognition. Finally, removed the breakpoints from their descriptive subtext (e.g., "Standard fast recovery...") ensuring this helpful context is permanently visible on all window sizes.

### 🚀 Recovery Progress UI & Terminal
- **Dedicated Progress Modal**: Built a new `RecoveryProgressModal.tsx` component that takes over the screen when the user clicks "Start Recovery".
- **Live Terminal Simulation**: Engineered a custom dark terminal window (`bg-[#0A0A0B]`) inside the modal featuring a monospace font (`font-mono`), color-coded log parsing (Errors in red, Successes in green, Info in blue), and automatic bottom-scrolling logic to display live `winfr` output.
- **Dynamic Progress Visualization**: Implemented a multi-stage animated progress bar that physically transforms based on the operation state (Blue for scanning, Cyan gradient for recovering, Green for completion, Red for aborted). Added a custom CSS `@keyframes` striped animation (`animate-[stripes...]`) for active processing feedback.
- **Real-time Statistics**: Designed a three-column grid at the top of the modal displaying live readouts for Elapsed Time, Files Found, and Data Recovered, anchored by glowing `lucide-react` icons.
- **Abort Functionality**: Included an explicit "Abort" action that halts the simulated process, paints the UI red to signify termination, and injects an abort log into the terminal.
- **Pre-Flight Validation**: Hooked the "Start Recovery" action to a validation check (`handleStartRecovery`). If a user attempts to proceed without selecting a Source or Destination drive, the action is blocked and a visually distinct red toast notification (`errorToast`) slides up from the action bar to explicitly instruct the user on what is missing.

### 🗂️ Post-Recovery Results & Selection
- **Results Explorer Interface**: Built the massive `RecoveryResultsModal.tsx` to handle the post-scan file review phase. This modal launches when a user clicks "Review Files" after a successful simulated scan.
- **Smart Categorization Sidebar**: Created a persistent left-hand sidebar that automatically parses recovered files into distinct logical buckets (Images, Documents, Videos, Audio, Archives) with distinct icon colors and visual counts, allowing users to rapidly filter their results.
- **File Preview Grid**: Designed a clean, dense file list layout displaying the filename, exact file path, human-readable file sizes (e.g., "1.2 MB"), and category-specific icons. Added interactive hover states and distinct blue highlights for selected rows.
- **Advanced Selection Tools**: Built mechanics allowing users to select individual files via checkboxes, or use the "Select All" toolbar button to bulk-select everything currently visible within their filtered category.
- **Live Calculation Footer**: Implemented an action footer that continually monitors the user's selections, outputting a real-time tally of the Total Selected Files (e.g., "3 / 10") and calculating the exact "Total Size to Save", styled in high-visibility cyan text.
- **Native Save Destination Dialog**: Wired the "Save Selected Files" button to trigger a native OS folder-picker dialog (`@tauri-apps/plugin-dialog`). This allows users to selectively extract their chosen files from the bulk recovery dump into a specific, organized location on their machine. Included a simulated "Saving..." visual state with a spinning loader for immediate feedback.
- **Safety Locks**: The final "Save Selected Files" button is dynamically disabled (`cursor-not-allowed`, `bg-white/5`) until the user has selected at least one file, seamlessly preventing empty save actions.
