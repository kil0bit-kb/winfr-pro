import { X, Terminal, Clock, FileSearch, HardDrive, AlertCircle, FolderOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface RecoveryProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAbort: () => void;
    onOpenFolder: () => void;
    sourceDrive: string;
    destinationDrive: string;
    logs: string[];
    progress: number;
    status: 'scanning' | 'recovering' | 'completed' | 'aborted' | 'error';
}

export function RecoveryProgressModal({
    isOpen, onClose, onAbort, onOpenFolder,
    sourceDrive, destinationDrive,
    logs, progress, status
}: RecoveryProgressModalProps) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [displayProgress, setDisplayProgress] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Smooth progress interpolation
    useEffect(() => {
        if (!isOpen) {
            setDisplayProgress(0);
            return;
        }

        const interval = setInterval(() => {
            setDisplayProgress(prev => {
                if (status === 'completed') return 100;

                const diff = progress - prev;
                if (diff > 0) {
                    const step = Math.max(0.1, diff * 0.1);
                    return Math.min(progress, prev + step);
                } else if (status === 'scanning' || status === 'recovering') {
                    if (prev < progress + 0.9) {
                        return prev + 0.015;
                    }
                }
                return prev;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isOpen, progress, status]);

    // Auto-scroll terminal
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    // Elapsed time counter
    useEffect(() => {
        if (isOpen && (status === 'scanning' || status === 'recovering')) {
            setElapsedTime(0);
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isOpen, status]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // Count recovered files from log lines
    const filesFound = (() => {
        let maxFiles = 0;
        const recoveredRegex = /Files recovered:\s+(\d+)/i;
        logs.forEach(line => {
            const match = line.match(recoveredRegex);
            if (match) {
                const count = parseInt(match[1], 10);
                if (count > maxFiles) maxFiles = count;
            } else if (line.includes('[OK]')) {
                maxFiles++;
            }
        });
        return maxFiles;
    })();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1200] flex items-start justify-center p-4 pt-24 animate-in fade-in duration-200">
            {/* STABLE OVERLAY: No backdrop-blur */}
            <div className="absolute inset-0 bg-[#02040a]/90 transition-opacity" />

            <div className="relative bg-[#0a0b10] rounded-[32px] shadow-[0_0_80px_rgba(0,0,0,0.9)] w-full max-w-4xl border border-white/10 overflow-hidden flex flex-col transform translate-z-0">
                <div className="p-8 flex flex-col gap-6 transform translate-z-0">

                    {/* Top Status Bar */}
                    <div className="flex items-start justify-between transform translate-z-0">
                        <div className="text-left">
                            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                                {status === 'completed' && <span className="text-green-500">Recovery Complete</span>}
                                {status === 'aborted' && <span className="text-red-500">Recovery Aborted</span>}
                                {status === 'error' && <span className="text-red-500">Recovery Error</span>}
                                {status === 'scanning' && <span className="text-blue-400">Scanning Drive...</span>}
                                {status === 'recovering' && <span className="text-cyan-400">Recovering Files...</span>}
                            </h1>
                            <p className="text-sm font-medium text-slate-400 mt-1">
                                {sourceDrive || 'C:\\'} <span className="mx-2 text-slate-600">→</span> {destinationDrive || 'D:\\Recovery'}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {status === 'completed' ? (
                                <div className="flex items-center gap-2">
                                    <button onClick={onOpenFolder} className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold transition-all border border-white/10 hover:border-white/20 flex items-center gap-2 text-xs sm:text-sm">
                                        <FolderOpen size={16} />
                                        Open Folder
                                    </button>
                                </div>
                            ) : status === 'aborted' || status === 'error' ? (
                                <button onClick={onClose} className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/5 hover:border-white/20 text-xs sm:text-sm">
                                    Close
                                </button>
                            ) : (
                                <button onClick={onAbort} className="px-6 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold transition-all border border-red-500/20 hover:border-red-500/40 flex items-center gap-2 group text-xs sm:text-sm">
                                    <X size={16} className="group-hover:rotate-90 transition-transform" />
                                    Abort
                                </button>
                            )}

                            {(status === 'completed' || status === 'aborted' || status === 'error') && (
                                <button
                                    onClick={onClose}
                                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5 hover:border-white/20 ml-2"
                                    title="Close Window"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 transform translate-z-0">
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                <Clock size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Elapsed Time</div>
                                <div className="text-lg font-black text-white font-mono">{formatTime(elapsedTime)}</div>
                            </div>
                        </div>
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20">
                                <FileSearch size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Files Found</div>
                                <div className="text-lg font-black text-white font-mono">{filesFound.toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                                <HardDrive size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Progress</div>
                                <div className="text-lg font-black text-white font-mono">{Math.round(displayProgress)}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Overall Progress Bar */}
                    <div className="flex flex-col gap-2 transform translate-z-0">
                        <div className="flex justify-between text-xs font-bold text-slate-400">
                            <span>Overall Progress</span>
                            <span className="font-mono text-white">{Math.round(displayProgress)}%</span>
                        </div>
                        <div className="h-4 w-full bg-black/50 rounded-full overflow-hidden border border-white/10 p-0.5">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden
                                    ${status === 'completed' ? 'bg-green-500' : status === 'aborted' || status === 'error' ? 'bg-red-500' : 'bg-gradient-to-r from-blue-600 to-cyan-400'}`}
                                style={{ width: `${displayProgress}%` }}
                            >
                                {status !== 'completed' && status !== 'aborted' && status !== 'error' && (
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[stripes_1s_linear_infinite]"></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Terminal Window */}
                    <div className="flex flex-col border border-white/10 rounded-2xl overflow-hidden bg-[#0A0A0B] shadow-inner mt-2 transform translate-z-0">
                        <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2 bg-white/[0.02]">
                            <Terminal size={14} className="text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Live Output</span>

                            {(status === 'aborted' || status === 'error') && (
                                <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                    <AlertCircle size={12} />
                                    {status === 'aborted' ? 'Process Terminated' : 'Error Occurred'}
                                </span>
                            )}
                        </div>
                        <div
                            ref={terminalRef}
                            className="p-4 h-[250px] overflow-y-auto font-mono text-xs sm:text-sm text-slate-300 custom-scrollbar whitespace-pre-wrap leading-relaxed"
                        >
                            {logs.map((log, index) => (
                                <div key={index} className={`${log.includes('ERROR') || log.includes('ABORTED') || log.includes('error') ? 'text-red-400 font-bold' :
                                    log.includes('✓') || log.includes('successfully') ? 'text-green-400 font-bold' :
                                        log.includes('Recovering:') || log.includes('[OK]') ? 'text-cyan-300' :
                                            log.includes('===') || log.includes('---') ? 'text-blue-500' : 'text-slate-400'
                                    }`}>
                                    {log || ' '}
                                </div>
                            ))}
                            {(status === 'scanning' || status === 'recovering') && (
                                <div className="mt-1 flex items-center text-slate-500">
                                    <span className="animate-pulse">_</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Troubleshooting Guide (on Crash) */}
                    {status === 'error' && logs.some(l => l.includes('0xC0000005') || l.includes('CRASH DETECTED')) && (
                        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 space-y-4 animate-in slide-in-from-bottom-4 duration-500 mt-2 transform translate-z-0">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={24} className="text-red-400" />
                                <div>
                                    <h3 className="text-sm font-black text-red-400 uppercase tracking-widest">ExFAT Scan Crash Workarounds</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Known winfr binary bug on non-NTFS systems</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-black/60 p-4 rounded-xl border border-white/5 space-y-2">
                                    <div className="text-[10px] font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-brand-blue-500 text-[10px] flex items-center justify-center">1</div>
                                        Filesystem Health
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Use the <strong className="text-slate-300">Scan for Errors</strong> feature in the drive selector to run chkdsk before retrying.</p>
                                </div>
                                <div className="bg-black/60 p-4 rounded-xl border border-white/5 space-y-2">
                                    <div className="text-[10px] font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-brand-blue-500 text-[10px] flex items-center justify-center">2</div>
                                        Version Update
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Ensure you have the latest Winfr version from the Microsoft Store.</p>
                                    <button
                                        onClick={() => invoke('reveal_path', { path: "ms-windows-store://pdp/?productid=9N26S50LN705" })}
                                        className="text-[9px] font-black text-brand-blue-neon uppercase hover:underline"
                                    >
                                        Open Store
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
