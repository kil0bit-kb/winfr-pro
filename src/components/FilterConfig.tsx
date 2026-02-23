import { Filter, FileCode, Search, X, Image, FileText, Video, Music, Archive, HelpCircle, Tags } from "lucide-react";
import { useState } from "react";
import Tooltip from "./Tooltip";

interface FilterConfigProps {
    activeTags: string[];
    onTagsChange: (tags: string[]) => void;
}

export function FilterConfig({ activeTags, onTagsChange }: FilterConfigProps) {
    const [customInput, setCustomInput] = useState("");

    const commonTypes = [
        { name: "Images", color: "text-brand-blue-neon", icon: Image },
        { name: "Documents", color: "text-brand-cyan-neon", icon: FileText },
        { name: "Videos", color: "text-brand-blue-light", icon: Video },
        { name: "Audio", color: "text-brand-cyan-500", icon: Music },
        { name: "Archives", color: "text-slate-400", icon: Archive }
    ];

    const toggleCommonType = (type: string) => {
        if (activeTags.includes(type)) {
            onTagsChange(activeTags.filter(t => t !== type));
        } else {
            onTagsChange([...activeTags, type]);
        }
    };

    const handleCustomInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && customInput.trim()) {
            let formattedInput = customInput.trim();
            if (formattedInput.startsWith('.') && formattedInput.length > 1) {
                formattedInput = '*' + formattedInput;
            }
            if (!activeTags.includes(formattedInput)) {
                onTagsChange([...activeTags, formattedInput]);
            }
            setCustomInput("");
        }
    };

    const removeTag = (tag: string) => {
        onTagsChange(activeTags.filter(t => t !== tag));
    };

    return (
        <div className="relative z-20 p-1 bg-gradient-to-br from-white/5 to-transparent rounded-[32px] shadow-2xl transform translate-z-0">
            <div className="p-6 lg:p-8 bg-[#0a0b10] rounded-[31px] border border-white/5 transform translate-z-0">
                <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-[0.2em] pl-1">
                        <Filter size={18} className="text-white" /> Filters & Targeting
                    </h3>

                    <Tooltip
                        position="right"
                        content={
                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/10 pb-3 mb-4">Targeting Syntax Rules</h4>
                                <div>
                                    <p className="text-xs font-bold text-brand-cyan-neon mb-1.5">Extensions</p>
                                    <p className="text-xs text-slate-300 leading-relaxed">Use <code className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded">*.ext</code> to target file types.</p>
                                    <p className="text-[11px] text-slate-400 mt-1">Example: <span className="font-mono text-white/90">*.png</span></p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-brand-cyan-neon mb-1.5">Directories</p>
                                    <p className="text-xs text-slate-300 leading-relaxed">Wrap folder names in backslashes.</p>
                                    <p className="text-[11px] text-slate-400 mt-1">Example: <span className="font-mono text-white/90">\docs\</span></p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-brand-cyan-neon mb-1.5">Wildcards</p>
                                    <p className="text-xs text-slate-300 leading-relaxed">Use <code className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded">*</code> to match names.</p>
                                    <p className="text-[11px] text-slate-400 mt-1">Example: <span className="font-mono text-white/90">*invoice*</span></p>
                                </div>
                            </div>
                        }
                    >
                        <HelpCircle size={16} className="text-slate-500 hover:text-brand-cyan-neon transition-colors cursor-help" />
                    </Tooltip>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 min-h-[300px]">
                    {/* Left Side: Input and Presets */}
                    <div className="w-full lg:w-[45%] flex flex-col gap-4">
                        <div className="flex flex-col p-5 bg-black/40 rounded-[20px] border border-white/5 shadow-inner">
                            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest px-1">Target Path / Extension</label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-blue-neon transition-colors" size={16} />
                                <input
                                    type="text"
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    onKeyDown={handleCustomInputKeyDown}
                                    placeholder="e.g., *.png, \docs\, *invoice*..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-blue/50 transition-all font-medium text-xs sm:text-sm"
                                />
                            </div>
                            <div className="flex items-center justify-between mt-2.5 px-1">
                                <p className="text-[9px] text-slate-500">
                                    Press <span className="text-brand-cyan-neon font-bold">ENTER</span> to add
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-1 mt-1">
                            <div className="w-5 h-5 rounded flex items-center justify-center text-white">
                                <FileCode size={14} />
                            </div>
                            <span className="font-black text-[10px] text-white uppercase tracking-widest">Quick Presets</span>
                        </div>

                        <div className="flex flex-col p-4 bg-black/20 rounded-[20px] border border-white/5 shadow-inner justify-center">
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 lg:gap-1.5 xl:gap-2">
                                {commonTypes.map(type => {
                                    const isActive = activeTags.includes(type.name);
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.name}
                                            onClick={() => toggleCommonType(type.name)}
                                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all border group
                                ${isActive
                                                    ? 'bg-brand-blue/20 border-brand-blue/40 text-brand-blue-neon font-bold ring-1 ring-brand-blue'
                                                    : 'bg-black/40 border-white/5 text-slate-400 hover:border-brand-blue/30 hover:text-white'
                                                }`}
                                        >
                                            <Icon size={12} className={`transition-colors ${type.color} ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{type.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Active Filters */}
                    <div className="flex-1 flex flex-col p-5 lg:p-6 bg-black/40 rounded-[20px] border border-white/5 shadow-inner">
                        <div className="flex items-center justify-between mb-4 shrink-0 px-1">
                            <label className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
                                <Tags size={14} className="text-white" />
                                Active Filters {activeTags.length > 0 && `(${activeTags.length})`}
                            </label>
                            {activeTags.length > 0 && (
                                <Tooltip content="Remove all active filters" position="left">
                                    <button
                                        onClick={() => onTagsChange([])}
                                        className="text-[9px] font-black text-red-500/70 hover:text-red-400 uppercase tracking-widest transition-colors border-none bg-transparent"
                                    >
                                        Clear All
                                    </button>
                                </Tooltip>
                            )}
                        </div>

                        {activeTags.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl text-slate-600 text-xs font-bold tracking-widest min-h-[150px]">
                                NO FILTERS ACTIVE
                            </div>
                        ) : (
                            <div className="flex-1 bg-black/20 rounded-2xl border border-white/5 p-4 overflow-y-auto custom-scrollbar min-h-[150px]">
                                <div className="flex flex-wrap gap-2.5">
                                    {activeTags.map((tag) => (
                                        <div
                                            key={tag}
                                            className="flex items-center gap-2 px-2.5 py-1.5 bg-brand-blue/15 border border-brand-blue/30 rounded-lg shadow-sm"
                                        >
                                            <span className="text-xs font-bold text-brand-blue-neon truncate max-w-[150px]">{tag}</span>
                                            <button
                                                onClick={() => removeTag(tag)}
                                                className="p-1 hover:bg-white/10 rounded transition-colors text-slate-500 hover:text-red-400"
                                            >
                                                <X size={12} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
