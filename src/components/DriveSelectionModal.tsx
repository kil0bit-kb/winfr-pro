import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { X, HardDrive, FolderOpen, Cpu, ShieldCheck, Loader2, Activity, AlertCircle, CheckCircle2 } from "lucide-react";

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

interface DriveSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (value: any) => void;
    title: string;
    description?: string;
    excludedDrive?: string;
    drives: DriveInfo[];
    loading: boolean;
}

export function DriveSelectionModal({ isOpen, onClose, onSelect, title, description, excludedDrive, drives, loading }: DriveSelectionModalProps) {
    const [healthResults, setHealthResults] = useState<Record<string, { status: 'idle' | 'loading' | 'success' | 'error', message: string }>>({});

    const checkHealth = async (e: React.MouseEvent, driveId: string) => {
        e.stopPropagation();
        setHealthResults(prev => ({ ...prev, [driveId]: { status: 'loading', message: '' } }));

        try {
            const res = await invoke<string>("get_disk_health", { drive: driveId });
            const hasErrors = res.toLowerCase().includes("errors") || res.toLowerCase().includes("corruption") || res.toLowerCase().includes("fix");
            setHealthResults(prev => ({
                ...prev,
                [driveId]: {
                    status: hasErrors ? 'error' : 'success',
                    message: res
                }
            }));
        } catch (err: any) {
            setHealthResults(prev => ({ ...prev, [driveId]: { status: 'error', message: String(err) } }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1200] flex items-start justify-center p-4 pt-24 sm:pt-28 animate-in fade-in duration-200">
            {/* STABLE OVERLAY: No backdrop-blur to prevent flickering on Windows */}
            <div className="absolute inset-0 bg-[#02040a]/90 transition-opacity" onClick={onClose} />

            <div
                className="relative bg-[#0a0b10] rounded-[32px] shadow-[0_0_100px_rgba(0,0,0,0.9)] w-full max-w-4xl border border-white/10 overflow-hidden flex flex-col h-fit max-h-[85vh] transform translate-z-0"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 transform translate-z-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-blue/15 flex items-center justify-center text-brand-blue-neon border border-brand-blue/20 shadow-lg shadow-brand-blue/10">
                            <Cpu size={26} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
                            <p className="text-xs font-medium text-slate-300 mt-0.5 px-0.5">
                                {description || "Select a drive or folder to scan for lost or deleted files"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                        <X size={24} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar max-h-[450px] transform translate-z-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 min-h-[300px]">
                            <div className="w-12 h-12 border-2 border-brand-blue-neon/20 border-t-brand-blue-neon rounded-full animate-spin mb-4" />
                            <span className="text-sm font-black uppercase tracking-widest text-brand-blue-neon animate-pulse">Detecting Drives...</span>
                        </div>
                    ) : drives.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 min-h-[300px]">
                            <HardDrive size={48} className="mb-4 opacity-50 text-slate-600" />
                            <span className="text-sm font-bold">No drives detected</span>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Try using "Select Specific Folder" below</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                            {drives.map((drive) => {
                                const isExcluded = drive.id === excludedDrive;
                                return (
                                    <button
                                        key={drive.id}
                                        onClick={() => onSelect(drive)}
                                        disabled={isExcluded}
                                        className={`flex flex-col p-6 bg-white/5 border border-white/5 rounded-3xl transition-[background-color,border-color,transform] hover:bg-brand-blue-600/10 hover:border-brand-blue-500/40 group relative ${isExcluded ? 'cursor-default' : 'active:scale-95'}`}
                                    >
                                        {isExcluded && (
                                            <div className="absolute inset-0 z-20 bg-slate-950/40 flex items-center justify-center p-4 backdrop-blur-[1px] group/conflict pointer-events-auto rounded-3xl">
                                                <div className="flex flex-col items-center gap-2 bg-black/90 px-5 py-4 rounded-3xl ring-1 ring-red-500 border border-red-500/50 relative z-30">
                                                    <ShieldCheck size={28} className="text-red-500 animate-pulse" />
                                                    <span className="text-[11px] font-black text-red-500 uppercase tracking-widest text-center leading-tight">
                                                        Source / Target<br />Conflict
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className={`w-full ${isExcluded ? 'opacity-20 grayscale' : ''}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center text-slate-400 group-hover:text-brand-blue-neon transition-colors border border-white/5 shadow-inner relative">
                                                    <HardDrive size={24} />
                                                    {drive.isSystem && (
                                                        <div className="absolute -top-2 -right-2 bg-brand-blue-500 text-white rounded-full p-0.5 shadow-lg shadow-brand-blue/30 scale-75">
                                                            <ShieldCheck size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-3xl font-black text-brand-blue-neon tracking-tighter group-hover:scale-110 transition-transform">
                                                    {drive.id}
                                                </div>
                                            </div>

                                            <div className="text-left mb-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="text-sm font-black text-white group-hover:text-brand-blue-neon transition-colors truncate">
                                                        {drive.label}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${drive.type === 'HDD' ? 'bg-slate-800 text-slate-400' : 'bg-brand-blue-500/20 text-brand-blue-neon'} border border-white/5`}>
                                                        {drive.type}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">
                                                        {drive.fs}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Usage Section */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${drive.percent > 90 ? 'text-red-400' : 'text-slate-500'}`}>Used</span>
                                                    <span className={`text-[11px] font-black ${drive.percent > 90 ? 'text-red-400' : 'text-white/80'}`}>{drive.percent}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                                                    <div
                                                        className={`h-full transition-[width,background-color] duration-1000 rounded-full ${drive.percent > 90
                                                            ? 'bg-red-500'
                                                            : 'bg-blue-600 group-hover:bg-cyan-400'}`}
                                                        style={{ width: `${drive.percent}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center text-[9px] font-bold text-slate-600">
                                                    <span>{drive.used}</span>
                                                    <span>of {drive.size}</span>
                                                </div>
                                            </div>

                                            {/* Health Check Button / Status */}
                                            <div className="mt-5 pt-4 border-t border-white/5">
                                                {healthResults[drive.id]?.status === 'loading' ? (
                                                    <div className="flex items-center justify-center gap-2 py-1.5 bg-brand-blue/5 rounded-xl border border-brand-blue/10">
                                                        <Loader2 size={14} className="animate-spin text-brand-blue-neon" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue-neon">Scanning...</span>
                                                    </div>
                                                ) : healthResults[drive.id]?.status === 'success' ? (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center justify-center gap-2 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                                            <CheckCircle2 size={14} className="text-emerald-400" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">FS Healthy</span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => checkHealth(e, drive.id)}
                                                            className="text-[9px] font-bold text-slate-500 hover:text-white uppercase tracking-tighter"
                                                        >
                                                            Re-scan
                                                        </button>
                                                    </div>
                                                ) : healthResults[drive.id]?.status === 'error' ? (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center justify-center gap-2 py-1.5 bg-red-500/10 rounded-xl border border-red-500/20">
                                                            <AlertCircle size={14} className="text-red-400" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Errors Found</span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                alert(healthResults[drive.id].message);
                                                            }}
                                                            className="text-[9px] font-bold text-red-400 hover:text-red-300 uppercase underline"
                                                        >
                                                            View Report
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => checkHealth(e, drive.id)}
                                                        className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors group/health"
                                                    >
                                                        <Activity size={14} className="text-slate-400 group-hover/health:text-brand-blue-neon transition-colors" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/health:text-white transition-colors">Check Health</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-[#08090d] border-t border-white/5 flex items-center justify-between transform translate-z-0">
                    <button onClick={() => onSelect("BROWSE")} className="flex items-center gap-3 px-8 py-4 bg-blue-600 border border-blue-500 rounded-2xl transition-all hover:bg-blue-500 group relative overflow-hidden active:scale-95 shadow-xl">
                        <FolderOpen size={22} className="text-white group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-black text-white uppercase tracking-widest relative z-10">Select Specific Folder...</span>
                    </button>
                    <button onClick={onClose} className="px-8 py-3 rounded-xl font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest text-[11px]">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
