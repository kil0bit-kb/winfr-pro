import { HardDrive, Folder, ChevronRight, RefreshCw, Database, Download } from "lucide-react";
import Tooltip from "./Tooltip";

interface DriveSelectProps {
    source: any;
    destination: any;
    onOpenSource: () => void;
    onOpenDestination: () => void;
    onRefresh: () => void;
}

export function DriveSelect({ source, destination, onOpenSource, onOpenDestination, onRefresh }: DriveSelectProps) {
    return (
        <div className="relative flex flex-col md:flex-row items-stretch gap-4 md:gap-0">
            <div className="flex-1">
                <DriveCard
                    label="Source"
                    instruction="Select drive or folder to scan for files"
                    value={source}
                    onClick={onOpenSource}
                    iconColor="text-brand-blue-neon"
                    icon={Database}
                />
            </div>

            {/* Refresh Button / Separator Bridge */}
            <div className="flex flex-row md:flex-col items-center justify-center py-2 md:py-0 md:px-8 relative group/bridge">
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
                <div className="md:hidden w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                <Tooltip content="Refresh Hardware & Clear Selections" position="bottom">
                    <button
                        onClick={onRefresh}
                        className="h-10 px-5 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center gap-2 text-slate-400 hover:text-brand-blue-neon hover:border-brand-blue/50 hover:ring-1 hover:ring-brand-blue-neon transition-[color,border-color,box-shadow] group active:scale-95 shadow-2xl z-10 relative"
                    >
                        <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Refresh</span>
                    </button>
                </Tooltip>
            </div>

            <div className="flex-1">
                <DriveCard
                    label="Destination"
                    instruction="Select drive or folder to save recovered files"
                    value={destination}
                    onClick={onOpenDestination}
                    iconColor="text-brand-cyan-neon"
                    icon={Download}
                />
            </div>
        </div>
    );
}

function DriveCard({ label, instruction, value, onClick, iconColor, icon: Icon }: {
    label: string,
    instruction: string,
    value: any,
    onClick: () => void,
    iconColor: string,
    icon: any
}) {
    const isFolder = (val: any) => val?.isFolder || false;
    const isEmpty = !value;

    return (
        <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-brand-blue-500/20 to-brand-cyan-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-1 bg-gradient-to-br from-white/10 to-transparent rounded-3xl shadow-xl transform translate-z-0">
                <div className="px-5 py-4 bg-[#141416] rounded-[22px] border border-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-1.5 opacity-90">
                            <Icon size={14} className={iconColor} />
                            <span className="text-[12px] font-black text-white uppercase tracking-wider">{label}</span>
                        </div>
                        <div className={`w-1.5 h-1.5 rounded-full ${isEmpty ? 'bg-slate-700' : 'bg-brand-blue-neon ring-1 ring-brand-blue-neon'}`}></div>
                    </div>

                    <button
                        onClick={onClick}
                        className={`w-full group/btn flex items-center gap-4 p-4 ${isEmpty ? 'bg-black/20 border-dashed border-white/10' : 'bg-black/40 border-solid border-white/5 shadow-inner'} border rounded-2xl transition-[border-color,box-shadow,background-color] hover:border-brand-blue/50 hover:shadow-2xl text-left overflow-hidden`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover/btn:scale-110 ${iconColor} ${isEmpty ? 'opacity-30' : 'bg-black/20 shadow-sm border border-white/5 opacity-100'}`}>
                            {isFolder(value) ? <Folder size={24} /> : <HardDrive size={24} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            {isEmpty ? (
                                <div className="text-sm font-bold text-white/80 leading-snug">
                                    {instruction}
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-baseline gap-2 mb-0.5">
                                        <div className="text-lg font-black text-white truncate group-hover/btn:text-brand-blue-light transition-colors leading-tight">
                                            {value.label}
                                        </div>
                                        <div className="text-sm font-black text-brand-blue-neon">
                                            {value.id}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black bg-white/5 text-slate-400 px-1.5 py-0.5 rounded border border-white/5 uppercase tracking-tighter">
                                            {value.type}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            {value.size} Total
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                        <ChevronRight size={20} className={`${isEmpty ? 'text-slate-700' : 'text-slate-500 group-hover/btn:text-brand-blue-neon'} transition-colors duration-200`} />
                    </button>
                </div>
            </div>
        </div>
    );
}
