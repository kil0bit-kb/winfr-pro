import { useState } from "react";
import { X, Check, Settings2, Activity, Zap } from "lucide-react";
import Tooltip from "./Tooltip";

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

interface AdvancedOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    options: AdvancedOptions;
    onOptionsChange: (options: AdvancedOptions) => void;
    sourceFs?: string;
    mode: 'regular' | 'extensive';
    onModeChange: (mode: 'regular' | 'extensive') => void;
}

export function AdvancedOptionsModal({ isOpen, onClose, options, onOptionsChange, sourceFs, mode, onModeChange }: AdvancedOptionsModalProps) {
    const [switchNotification, setSwitchNotification] = useState<string | null>(null);

    const updateOption = (key: keyof AdvancedOptions, value: boolean) => {
        const updated = { ...options, [key]: value };

        if (key === 'segmentMode' && value) {
            if (options.signatureMode) {
                updated.signatureMode = false;
                setSwitchNotification("Switched to Segment mode (Signature disabled)");
                setTimeout(() => setSwitchNotification(null), 3000);
            }
        } else if (key === 'signatureMode' && value) {
            let conflictMsg = "";
            if (options.segmentMode) {
                updated.segmentMode = false;
                conflictMsg = "Segment disabled";
            }
            if (options.keepBoth) {
                updated.keepBoth = false;
                conflictMsg += (conflictMsg ? ", " : "") + "Keep Both disabled";
            }
            if (options.verboseMode) {
                updated.verboseMode = false;
                conflictMsg += (conflictMsg ? ", " : "") + "Verbose disabled";
            }

            if (conflictMsg) {
                setSwitchNotification(`Switched to Signature mode (${conflictMsg})`);
                setTimeout(() => setSwitchNotification(null), 3000);
            }
        }
        onOptionsChange(updated);
    };

    if (!isOpen) return null;

    const fs = (sourceFs || '').toUpperCase();

    return (
        <div className="fixed inset-0 z-[1200] flex items-start justify-center p-4 pt-24 animate-in fade-in duration-200">
            {/* STABLE OVERLAY: No backdrop-blur */}
            <div className="absolute inset-0 bg-[#02040a]/90 transition-opacity" />

            <div
                className="relative bg-[#0a0b10] rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-2xl border border-white/10 overflow-hidden flex flex-col transform translate-z-0"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20 transform translate-z-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 ring-1 ring-red-500/50">
                            <Settings2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Advanced Options</h2>
                            <p className="text-sm font-bold text-slate-500 mt-0.5 tracking-wide uppercase">Configure deep scan parameters</p>
                        </div>
                    </div>
                    <Tooltip content="Close & Discard Changes" position="left">
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                            <X size={24} />
                        </button>
                    </Tooltip>
                </div>

                {/* Body */}
                <div className="p-8 flex flex-col gap-6 overflow-y-auto max-h-[60vh] custom-scrollbar transform translate-z-0">
                    {mode === 'regular' && (
                        <div className="mx-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                                <Zap size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-amber-500 uppercase tracking-tight flex items-center justify-between gap-4">
                                    Deep Scan Switch Disabled
                                    <button
                                        onClick={() => onModeChange('extensive')}
                                        className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1 rounded-lg border border-amber-500/30 transition-all active:scale-95"
                                    >
                                        Enable Deep Scan
                                    </button>
                                </h4>
                                <p className="text-xs font-medium text-slate-400 mt-1 leading-relaxed">
                                    Segment and Signature modes are only compatible with <span className="text-purple-400 font-bold">Extensive Mode</span>.
                                </p>
                            </div>
                        </div>
                    )}

                    {options.signatureMode && (
                        <div className="mx-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                                <Activity size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-amber-500 uppercase tracking-tight">Signature Mode Restriction</h4>
                                <p className="text-xs font-medium text-slate-400 mt-1 leading-relaxed">
                                    Signature Mode (/x) only supports preset file categories (Images, Videos, etc.).
                                    Custom filename filters or wildcards in the Dashboard will be ignored.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Switching Feedback / Toast */}
                    <div className={`mx-2 transition-all duration-500 overflow-hidden bg-blue-500/10 rounded-2xl ${switchNotification ? 'h-10 border border-blue-500/20 opacity-100' : 'h-0 opacity-0'}`}>
                        <div className="h-10 px-4 flex items-center gap-2">
                            <Activity size={12} className="text-blue-400 animate-pulse" />
                            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest leading-none">
                                {switchNotification}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { id: 'segmentMode' as const, label: 'Segment Mode (/r)', desc: 'Best for NTFS. Detailed scan for PCs that recovers all file types by reading remaining file record segments.' },
                            { id: 'signatureMode' as const, label: 'Signature Mode (/x)', desc: 'Deep scan for SD/USB (FAT/exFAT). Uses file headers to find specific categories like Images/Docs. Last resort for NTFS.' },
                            { id: 'recoverNonDeleted' as const, label: 'Recover Non-Deleted (/u)', desc: 'Recovers files that exist but are inaccessible.' },
                            { id: 'keepBoth' as const, label: 'Keep Both Files (/o:b)', desc: 'Automatically rename recovered files.' },
                            { id: 'autoAccept' as const, label: 'Auto-Accept Prompts (/a)', desc: 'Automatically accepts all command prompts.' },
                            { id: 'recoverSystemFiles' as const, label: 'Recover System Files (/k)', desc: 'Attempt recovery of core system files.' },
                            { id: 'keepAllExtensions' as const, label: 'Keep All Extensions (/e)', desc: 'Disables the default extension exclusion list.' },
                            { id: 'verboseMode' as const, label: 'Verbose Mode (/v)', desc: 'Enables sector-by-sector logging. Critical for accurate progress tracking.' },
                        ].map((item) => {
                            const isDeepScanSpecific = item.id === 'segmentMode' || item.id === 'signatureMode';
                            const isSignatureConflicted = (item.id === 'keepBoth' || item.id === 'verboseMode') && options.signatureMode;
                            const isDisabled = (mode === 'regular' && isDeepScanSpecific) || isSignatureConflicted;
                            const isChecked = options[item.id];
                            const isRecommended = (item.id === 'segmentMode' && fs === 'NTFS') || (item.id === 'signatureMode' && fs && fs !== 'NTFS');

                            return (
                                <Tooltip
                                    key={item.id}
                                    content={isSignatureConflicted ? "Not supported in Signature Mode" : undefined}
                                    position="right"
                                >
                                    <label
                                        className={`flex items-start gap-4 p-4 rounded-2xl transition-all group border border-transparent w-full
                                            ${isDisabled
                                                ? 'opacity-40 grayscale cursor-not-allowed bg-white/5'
                                                : 'hover:bg-white/5 cursor-pointer hover:border-white/5'
                                            }`}
                                    >
                                        <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center border transition-all shrink-0
                                        ${isChecked
                                                ? 'bg-blue-600 border-blue-500 text-white ring-1 ring-blue-500'
                                                : isDisabled
                                                    ? 'bg-white/5 border-white/10'
                                                    : 'bg-black/40 border-white/10 group-hover:border-blue-500/50'
                                            }`}>
                                            <Check size={16} className={`stroke-[4] transition-transform ${isChecked ? 'scale-100' : 'scale-0'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                                {item.label}
                                                {isRecommended && (
                                                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border transition-all bg-amber-500/20 text-amber-300 border-amber-500/30">
                                                        Recommended {fs && `for ${fs}`}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">{item.desc}</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isChecked}
                                            disabled={isDisabled}
                                            onChange={(e) => updateOption(item.id, e.target.checked)}
                                        />
                                    </label>
                                </Tooltip>
                            );
                        })}
                    </div>

                </div>

                {/* Footer */}
                <div className="p-8 bg-black/40 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-1 sm:gap-4 transform translate-z-0">
                    <button onClick={onClose} className="px-8 py-3 rounded-2xl font-black text-slate-400 hover:text-white hover:bg-white/5 hover:ring-1 hover:ring-white/10 transition-all uppercase tracking-widest text-xs">
                        Cancel
                    </button>
                    <button onClick={onClose} className="px-10 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all active:scale-95 uppercase tracking-widest text-xs border border-white/10 ring-1 ring-blue-500 hover:ring-2 hover:ring-blue-400">
                        Save & Apply
                    </button>
                </div>
            </div>
        </div>
    );
}
