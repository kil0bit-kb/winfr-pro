import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
// import { openPath } from "@tauri-apps/plugin-opener"; // Now using reveal_path backend command instead
import { DriveSelect } from "./components/DriveSelect";
import { FilterConfig } from "./components/FilterConfig";
import { AdvancedOptionsModal } from "./components/AdvancedOptionsModal";
import { DriveSelectionModal } from "./components/DriveSelectionModal";
import { RecoveryProgressModal } from "./components/RecoveryProgressModal";
import { Home, Info, Minus, Square, X, Search, Activity, Settings2, Play, Heart } from "lucide-react";
import { getCurrentWindow, Window } from '@tauri-apps/api/window';
import AboutView from "./components/AboutView";
import Tooltip from "./components/Tooltip";

const appWindow = getCurrentWindow();

const navItems = [
  { id: 'home' as const, name: 'Dashboard', icon: Home },
  { id: 'about' as const, name: 'About', icon: Info },
];

// Types matching Rust backend
interface DriveInfo {
  id: string;
  label: string;
  type: string;
  fs: string;
  size: string;
  used: string;
  percent: number;
  isSystem: boolean;
}

interface RecoveryEvent {
  event_type: string;
  message: string;
  progress: number | null;
  path?: string;
}

interface AdvancedOptions {
  segmentMode: boolean;
  signatureMode: boolean;
  recoverNonDeleted: boolean;
  keepBoth: boolean;
  autoAccept: boolean;
  recoverSystemFiles: boolean;
  keepAllExtensions: boolean;
  verboseMode: boolean;
}

function App() {
  const [mode, setMode] = useState<'regular' | 'extensive'>('regular');
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [activeSelectType, setActiveSelectType] = useState<'source' | 'destination'>('source');
  const [source, setSource] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [drives, setDrives] = useState<DriveInfo[]>([]);
  const [drivesLoading, setDrivesLoading] = useState(false);
  const [activeRecoveryBaseDir, setActiveRecoveryBaseDir] = useState<string | null>(null);
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>({
    segmentMode: false,
    signatureMode: false,
    recoverNonDeleted: false,
    keepBoth: true,
    autoAccept: true,
    recoverSystemFiles: false,
    keepAllExtensions: false,
    verboseMode: true,
  });
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'about'>('home');

  const isAnyModalOpen = isAdvancedModalOpen || isDriveModalOpen || isRecoveryModalOpen;

  // Recovery state driven by Tauri events
  const [recoveryLogs, setRecoveryLogs] = useState<string[]>([]);
  const [recoveryProgress, setRecoveryProgress] = useState(0);
  const [recoveryStatus, setRecoveryStatus] = useState<'scanning' | 'recovering' | 'completed' | 'aborted' | 'error'>('scanning');
  const [recoveryPath, setRecoveryPath] = useState<string | null>(null);


  // Fetch real drives from backend
  const fetchDrives = useCallback(async () => {
    console.log("Logic Verification: Calling fetchDrives()");
    setDrivesLoading(true);
    try {
      const result = await invoke<DriveInfo[]>('list_drives');
      setDrives(result);
    } catch (err) {
      console.error('Failed to list drives:', err);
      setErrorToast("Failed to detect drives. Please try again.");
      setTimeout(() => setErrorToast(null), 3000);
    } finally {
      setDrivesLoading(false);
    }
  }, []);

  // Fetch drives on mount
  useEffect(() => {
    console.log("App mounted. Starting launch sequence...");

    // Safety Fallback: Always show main window after 2.5s if transition hangs
    const safetyTimeout = setTimeout(async () => {
      console.log("Safety fallback triggered: ensuring main window is visible.");
      await appWindow.show().catch(console.error);
      const splash = await Window.getByLabel('splashscreen');
      if (splash) await splash.close().catch(console.error);
    }, 2500);

    fetchDrives().then(async () => {
      console.log("Drives loaded. Starting instant transition...");
      try {
        const splashWindow = await Window.getByLabel('splashscreen');
        if (splashWindow) {
          console.log("Revealing main window.");
          await appWindow.show();
          await splashWindow.close();
          clearTimeout(safetyTimeout);
        } else {
          await appWindow.show();
          clearTimeout(safetyTimeout);
        }
      } catch (err) {
        console.error("Transition failed:", err);
        await appWindow.show().catch(console.error);
        clearTimeout(safetyTimeout);
      }
    });

    return () => clearTimeout(safetyTimeout);
  }, [fetchDrives]);

  // Listen for recovery events from Rust backend
  useEffect(() => {
    let active = true;
    const cleanups: UnlistenFn[] = [];

    const setup = async () => {
      const u1 = await listen<RecoveryEvent>('recovery-log', (event) => {
        setRecoveryLogs(prev => [...prev, event.payload.message]);
      });
      if (!active) u1(); else cleanups.push(u1);

      const u2 = await listen<RecoveryEvent>('recovery-progress', (event) => {
        if (event.payload.progress !== null) {
          setRecoveryProgress(event.payload.progress);
        }
      });
      if (!active) u2(); else cleanups.push(u2);

      const u3 = await listen<RecoveryEvent>('recovery-status', (event) => {
        const status = event.payload.message as any;
        setRecoveryStatus(status);
        if (event.payload.progress !== null) {
          setRecoveryProgress(event.payload.progress);
        }
      });
      if (!active) u3(); else cleanups.push(u3);

      const u4 = await listen<RecoveryEvent>('recovery-path', (event) => {
        if (event.payload.path) {
          setRecoveryPath(event.payload.path);
        }
      });
      if (!active) u4(); else cleanups.push(u4);
    };

    setup();

    return () => {
      active = false;
      cleanups.forEach(fn => fn());
    };
  }, []);

  const handleOpenDriveModal = (type: 'source' | 'destination') => {
    setActiveSelectType(type);
    setIsDriveModalOpen(true);
  };

  const handleSelectDrive = async (value: any) => {
    let finalValue = value;
    if (value === "BROWSE") {
      const selected = await open({
        directory: true,
        multiple: false,
        title: `Select ${activeSelectType === 'source' ? 'Source Folder' : 'Destination Folder'}`
      });
      if (selected && typeof selected === 'string') {
        const pathParts = selected.split(/\\|\//);
        const folderName = pathParts[pathParts.length - 1] || selected;
        finalValue = {
          id: selected,
          label: folderName,
          type: "Folder",
          fs: "",
          size: "External",
          used: "",
          percent: 0,
          isFolder: true
        };
      } else {
        setIsDriveModalOpen(false);
        return;
      }
    }

    if (activeSelectType === 'source') {
      setSource(finalValue);
      if (finalValue.id === destination?.id) {
        setDestination(null);
      }
      // Auto-switch to Extensive if source is non-NTFS (Regular won't work)
      // AND set smart defaults for Segment/Signature modes
      const fs = (finalValue.fs || '').toUpperCase();
      if (fs && fs !== 'NTFS') {
        setMode('extensive');
        setAdvancedOptions(prev => ({
          ...prev,
          signatureMode: true,
          segmentMode: false,
          keepBoth: false,
          verboseMode: false
        }));
      } else if (fs === 'NTFS') {
        setAdvancedOptions(prev => ({
          ...prev,
          segmentMode: true,
          signatureMode: false
        }));
      }
    } else {
      setDestination(finalValue);
    }
    setIsDriveModalOpen(false);
  };

  const handleRefresh = () => {
    setSource(null);
    setDestination(null);
    fetchDrives();
  };

  const handleStartRecovery = async () => {
    if (!source) {
      setErrorToast("Please select a Source Drive to scan.");
      setTimeout(() => setErrorToast(null), 3000);
      return;
    }
    if (!destination) {
      setErrorToast("Please select a Destination to save recovered files.");
      setTimeout(() => setErrorToast(null), 3000);
      return;
    }

    // Reset recovery state
    setRecoveryLogs([]);
    setRecoveryProgress(0);
    setRecoveryStatus('scanning');
    setRecoveryPath(null);
    setIsRecoveryModalOpen(true);

    // Build the destination path — if it's a drive, append a subfolder
    let destPath = destination.id;
    if (destPath.length === 2 && destPath.endsWith(':')) {
      destPath = destPath + '\\WinfrRecovery';
    }

    setActiveRecoveryBaseDir(destPath);

    try {
      await invoke('start_recovery', {
        config: {
          source: source.id,
          destination: destPath,
          mode: mode,
          filters: activeTags,
          segment_mode: advancedOptions.segmentMode,
          signature_mode: advancedOptions.signatureMode,
          recover_non_deleted: advancedOptions.recoverNonDeleted,
          keep_both: advancedOptions.keepBoth,
          auto_accept: advancedOptions.autoAccept,
          recover_system_files: advancedOptions.recoverSystemFiles,
          keep_all_extensions: advancedOptions.keepAllExtensions,
          verbose_mode: advancedOptions.verboseMode,
          source_fs: source.fs,
        }
      });
    } catch (err: any) {
      setErrorToast(err?.toString() || "Failed to start recovery");
      setTimeout(() => setErrorToast(null), 3000);
      setIsRecoveryModalOpen(false);
    }
  };

  const handleCancelRecovery = async () => {
    try {
      await invoke('cancel_recovery');
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  return (
    <div className="dark min-h-screen h-screen bg-[#08050a] flex flex-col font-sans selection:bg-brand-blue/30 overflow-hidden text-foreground">

      {/* Full-Width Topbar */}
      <div
        data-tauri-drag-region
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            appWindow.startDragging();
          }
        }}
        className="flex h-12 sm:h-14 items-center px-4 sm:px-6 md:px-8 bg-[#0d0d0f] border-b border-white/5 shrink-0 z-[1300] relative shadow-2xl justify-between cursor-move transform translate-z-0"
      >

        {/* Left Side: Navigation Icons */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => !isAnyModalOpen && setActiveTab(item.id)}
              disabled={isAnyModalOpen}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all ${activeTab === item.id
                ? 'bg-brand-blue/15 text-brand-blue-neon font-bold border border-brand-blue/20 shadow-lg shadow-brand-blue/5'
                : isAnyModalOpen
                  ? 'text-slate-600 cursor-not-allowed opacity-50 border border-transparent'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium border border-transparent'
                }`}
            >
              <item.icon size={16} className={activeTab === item.id ? "text-brand-blue-neon" : "opacity-70"} />
              <span className="text-xs uppercase tracking-widest font-black text-nowrap">
                {item.name}
              </span>
            </button>
          ))}
        </nav>

        {/* Center: Title only */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
          <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
            Winfr <span className="text-blue-500">Pro</span>
            <Tooltip
              position="bottom"
              content={
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-blue-400">Development Build</p>
                  <p className="text-xs text-slate-300">Winfr Pro is currently in Beta. We are refining features and stability daily.</p>
                </div>
              }
            >
              <span
                className="px-1.5 py-0.5 text-[8px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded pointer-events-auto cursor-help"
              >
                Beta
              </span>
            </Tooltip>
          </h1>
        </div>

        {/* Temporary Error Toast */}
        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 px-6 py-3 bg-red-500/90 text-white font-bold rounded-2xl shadow-2xl backdrop-blur-md border border-red-400/50 transition-all duration-300 z-[1002] ${errorToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          {errorToast}
        </div>

        {/* Custom Window Controls & Patreon Support */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Patreon Support Link */}
          <Tooltip
            position="bottom"
            content={
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-pink-400">Support Development</p>
                <p className="text-xs text-slate-300">Help us keep Winfr Pro free and powerful on Patreon.</p>
              </div>
            }
          >
            <a
              href="https://www.patreon.com/cw/KB_kilObit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 mr-2 rounded-full bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 border border-pink-500/20 hover:border-pink-500/40 transition-all group pointer-events-auto"
            >
              <Heart size={14} className="fill-pink-500/20 group-hover:fill-pink-500 transition-all" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Support Me</span>
            </a>
          </Tooltip>

          <button onClick={() => appWindow.minimize()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 transition-colors pointer-events-auto">
            <Minus size={16} />
          </button>

          <button onClick={() => appWindow.toggleMaximize()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 transition-colors">
            <Square size={14} />
          </button>

          <button onClick={() => appWindow.close()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/80 hover:text-white text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Wrapper (Scrollable) */}
      <div className={`flex-1 overflow-y-auto w-full custom-scrollbar transition-opacity duration-200 ${isAnyModalOpen ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex justify-center p-4 sm:p-6 md:p-8 min-h-full">
          <div className="w-full max-w-screen-xl flex flex-col gap-4 pb-6">

            {activeTab === 'home' && (
              <>
                {/* Main Configuration Grid */}
                <div className="flex flex-col gap-4 mt-1 lg:mt-2">
                  <DriveSelect
                    source={source}
                    destination={destination}
                    onOpenSource={() => handleOpenDriveModal('source')}
                    onOpenDestination={() => handleOpenDriveModal('destination')}
                    onRefresh={handleRefresh}
                  />
                  <FilterConfig
                    activeTags={activeTags}
                    onTagsChange={setActiveTags}
                  />
                </div>

                {/* Unified Bottom Action Bar */}
                <div className="mt-2 flex flex-col md:flex-row gap-4 items-stretch justify-between bg-[#111113] p-2 rounded-3xl border border-white/5 shadow-2xl relative z-50 transform translate-z-0">

                  {/* Mode Selection Segmented Control */}
                  <div className="flex bg-black/40 p-1.5 rounded-2xl md:w-2/3 lg:w-3/4 border border-white/5">
                    {(() => {
                      const sourceFs = source?.fs?.toUpperCase() || '';
                      const isNtfs = !source || sourceFs === 'NTFS' || sourceFs === '';
                      const regularDisabled = !isNtfs;

                      return (
                        <Tooltip
                          content={regularDisabled ? `Your drive is ${source?.fs || 'non-NTFS'} — use Extensive Mode` : undefined}
                          position="top"
                          wrapperClassName="flex-1"
                        >
                          <button
                            onClick={() => {
                              if (!regularDisabled) {
                                setMode('regular');
                                setAdvancedOptions(prev => ({
                                  ...prev,
                                  segmentMode: false,
                                  signatureMode: false
                                }));
                              }
                            }}
                            disabled={regularDisabled}
                            className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl transition-all ${regularDisabled
                              ? 'opacity-30 cursor-not-allowed'
                              : mode === 'regular'
                                ? 'bg-emerald-600/20 ring-1 ring-emerald-600 text-white font-bold shadow-inner'
                                : 'text-white/40 bg-emerald-600/5 hover:text-white/80 hover:bg-emerald-600/10 font-medium border border-emerald-600/10'
                              }`}
                          >
                            <div className="flex items-center gap-2 text-base">
                              <Search size={18} className={mode === 'regular' && !regularDisabled ? '' : 'opacity-70'} />
                              Regular Mode
                            </div>
                            <span className={`text-[10px] mt-1 block ${!regularDisabled && mode === 'regular' ? 'text-emerald-300/80' : 'opacity-50'}`}>
                              Fast recovery for healthy NTFS
                            </span>
                          </button>
                        </Tooltip>
                      );
                    })()}

                    <button
                      onClick={() => setMode('extensive')}
                      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl transition-all ${mode === 'extensive'
                        ? 'bg-purple-500/20 ring-1 ring-purple-500 text-white font-bold shadow-inner'
                        : 'text-white/40 bg-purple-500/5 hover:text-white/80 hover:bg-purple-500/10 font-medium border border-purple-500/10'
                        }`}
                    >
                      <div className="flex items-center gap-2 text-base">
                        <Activity size={18} className={mode === 'extensive' ? '' : 'opacity-70'} />
                        Extensive Mode
                      </div>
                      <span className={`text-[10px] mt-1 block ${mode === 'extensive' ? 'text-purple-300/80' : 'opacity-50'}`}>
                        Deep scan for formatted or corrupted drives
                      </span>
                    </button>

                    <div className="w-px bg-white/10 my-2 mx-1 hidden sm:block"></div>

                    <button
                      onClick={() => setIsAdvancedModalOpen(true)}
                      className={`flex-none flex flex-col items-center justify-center px-4 md:px-6 p-3 rounded-xl transition-all text-red-500/80 hover:text-red-400 font-medium border border-transparent hover:bg-red-500/10 group`}
                    >
                      <div className="flex items-center justify-center py-1">
                        <Settings2 size={20} className="opacity-90 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className={`text-[11px] mt-1 font-bold transition-colors`}>
                        Advanced
                      </span>
                    </button>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleStartRecovery}
                    className="md:w-1/3 lg:w-1/4 px-6 py-4 sm:py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl ring-1 ring-blue-500 hover:ring-2 hover:ring-blue-400 transition-all flex items-center justify-center gap-2.5 text-lg sm:text-xl border border-white/10 active:scale-[0.98]">
                    <Play size={22} className="text-white fill-white" />
                    Start Recovery
                  </button>
                </div>
              </>
            )}

            {activeTab === 'about' && (
              <AboutView />
            )}

          </div>
        </div>
      </div>

      <AdvancedOptionsModal
        isOpen={isAdvancedModalOpen}
        onClose={() => setIsAdvancedModalOpen(false)}
        options={advancedOptions}
        onOptionsChange={(options) => setAdvancedOptions(options)}
        sourceFs={source?.fs}
        mode={mode}
        onModeChange={setMode}
      />
      <DriveSelectionModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onSelect={handleSelectDrive}
        title={activeSelectType === 'source' ? 'Select Source' : 'Select Destination'}
        description={activeSelectType === 'source'
          ? "Select a drive or folder to scan for lost or deleted files"
          : "Choose a secure location to store your recovered data"
        }
        excludedDrive={activeSelectType === 'destination' ? source?.id : undefined}
        drives={drives}
        loading={drivesLoading}
      />
      <RecoveryProgressModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        onAbort={handleCancelRecovery}
        onOpenFolder={() => {
          if (!activeRecoveryBaseDir) return;
          let fullPath = activeRecoveryBaseDir;
          if (recoveryPath) {
            const separator = fullPath.endsWith('\\') ? '' : '\\';
            fullPath += separator + recoveryPath;
          }
          console.log("Opening folder:", fullPath);
          invoke('reveal_path', { path: fullPath }).catch(console.error);
        }}
        sourceDrive={source?.id}
        destinationDrive={destination?.id}
        logs={recoveryLogs}
        progress={recoveryProgress}
        status={recoveryStatus}
      />
    </div>
  );
}

export default App;
