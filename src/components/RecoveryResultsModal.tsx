import { useState, useMemo } from 'react';
import { X, Image as ImageIcon, FileText, Film, Music, Archive, Check, Download, AlertCircle, File as FileIcon, Loader2 } from 'lucide-react';
import { open } from "@tauri-apps/plugin-dialog";
import Tooltip from "./Tooltip";

export interface RecoveredFile {
    id: string;
    name: string;
    path: string;
    size: number; // in bytes
    category: 'Images' | 'Documents' | 'Videos' | 'Audio' | 'Archives' | 'Other';
}

interface RecoveryResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    files: RecoveredFile[];
}

export function RecoveryResultsModal({ isOpen, onClose, files }: RecoveryResultsModalProps) {
    const [selectedCategory, setSelectedCategory] = useState<RecoveredFile['category'] | 'All'>('All');
    const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);

    // Filter files by category
    const displayedFiles = useMemo(() => {
        if (selectedCategory === 'All') return files;
        return files.filter(f => f.category === selectedCategory);
    }, [files, selectedCategory]);

    // Categories with counts
    const categories = useMemo(() => {
        const counts = files.reduce((acc, file) => {
            acc[file.category] = (acc[file.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return [
            { id: 'All', icon: FileIcon, count: files.length, color: 'text-white bg-white/10' },
            { id: 'Images', icon: ImageIcon, count: counts['Images'] || 0, color: 'text-blue-400 bg-blue-400/10' },
            { id: 'Documents', icon: FileText, count: counts['Documents'] || 0, color: 'text-cyan-400 bg-cyan-400/10' },
            { id: 'Videos', icon: Film, count: counts['Videos'] || 0, color: 'text-purple-400 bg-purple-400/10' },
            { id: 'Audio', icon: Music, count: counts['Audio'] || 0, color: 'text-pink-400 bg-pink-400/10' },
            { id: 'Archives', icon: Archive, count: counts['Archives'] || 0, color: 'text-amber-400 bg-amber-400/10' },
            { id: 'Other', icon: FileIcon, count: counts['Other'] || 0, color: 'text-slate-400 bg-slate-400/10' },
        ];
    }, [files]);

    // Selection mechanics
    const toggleFileSelection = (id: string) => {
        const newSet = new Set(selectedFileIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedFileIds(newSet);
    };

    const toggleSelectAllCategory = () => {
        const allDisplayedSelected = displayedFiles.every(f => selectedFileIds.has(f.id));
        const newSet = new Set(selectedFileIds);

        if (allDisplayedSelected) {
            // Deselect all in current view
            displayedFiles.forEach(f => newSet.delete(f.id));
        } else {
            // Select all in current view
            displayedFiles.forEach(f => newSet.add(f.id));
        }
        setSelectedFileIds(newSet);
    };

    const allDisplayedSelected = displayedFiles.length > 0 && displayedFiles.every(f => selectedFileIds.has(f.id));
    const someDisplayedSelected = displayedFiles.some(f => selectedFileIds.has(f.id)) && !allDisplayedSelected;

    // Footer stats
    const totalSelectedSize = useMemo(() => {
        return files
            .filter(f => selectedFileIds.has(f.id))
            .reduce((acc, f) => acc + f.size, 0);
    }, [files, selectedFileIds]);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSaveFiles = async () => {
        const selectedPath = await open({
            directory: true,
            multiple: false,
            title: 'Select Destination Folder for Recovered Files'
        });

        if (selectedPath) {
            setIsSaving(true);
            // Simulate copy operation time based on file size
            setTimeout(() => {
                setIsSaving(false);
                onClose(); // Close the modal, ideally showing a success toast on the main app
            }, 1500);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
                onClick={onClose}
            />

            <div className="relative bg-card/95 rounded-[32px] shadow-[0_0_80px_rgba(0,0,0,0.8)] w-full max-w-6xl h-[85vh] border border-white/10 overflow-hidden flex flex-col backdrop-blur-3xl animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                            Review Recovered Files
                        </h2>
                        <p className="text-sm font-medium text-slate-400 mt-1">
                            Select the files you wish to securely save to your destination drive.
                        </p>
                    </div>
                    <Tooltip content="Close Results & Exit" position="left">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                        >
                            <X size={24} />
                        </button>
                    </Tooltip>
                </div>

                <div className="flex flex-1 min-h-0">
                    {/* Sidebar Categories */}
                    <div className="w-64 border-r border-white/5 bg-black/40 p-4 overflow-y-auto custom-scrollbar shrink-0 flex flex-col gap-2">
                        <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 px-2">Categories</div>

                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id as any)}
                                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all border ${selectedCategory === cat.id
                                    ? 'bg-white/10 border-white/20 text-white shadow-inner'
                                    : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                                        <cat.icon size={16} />
                                    </div>
                                    <span className="font-bold text-sm tracking-wide">{cat.id}</span>
                                </div>
                                <div className="bg-black/50 px-2 py-0.5 rounded-md text-xs font-mono font-bold border border-white/5">
                                    {cat.count}
                                </div>
                            </button>
                        ))}

                    </div>

                    {/* Main File List */}
                    <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0B]">

                        {/* List Header Toolbar */}
                        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/[0.02]">
                            <Tooltip content={`Toggle selection for all ${selectedCategory !== 'All' ? selectedCategory : 'recovered files'}`} position="right">
                                <button
                                    onClick={toggleSelectAllCategory}
                                    className="flex items-center gap-3 group"
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${allDisplayedSelected ? 'bg-blue-500 border-blue-500' :
                                        someDisplayedSelected ? 'bg-blue-500/20 border-blue-500' : 'border-slate-600 group-hover:border-slate-400'
                                        }`}>
                                        {allDisplayedSelected && <Check size={14} className="text-white" />}
                                        {someDisplayedSelected && <div className="w-2.5 h-0.5 bg-blue-500 rounded-full" />}
                                    </div>
                                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                                        Select All {selectedCategory !== 'All' ? selectedCategory : 'Files'}
                                    </span>
                                </button>
                            </Tooltip>
                            <div className="text-xs font-bold text-slate-500">
                                Showing {displayedFiles.length} items
                            </div>
                        </div>

                        {/* File Grid/List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                            {displayedFiles.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                    <AlertCircle size={48} className="mb-4 opacity-50 text-slate-600" />
                                    <h3 className="text-lg font-bold text-slate-400">No {selectedCategory} Found</h3>
                                    <p className="text-sm">No files of this category were recovered.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                    {displayedFiles.map(file => {
                                        const isSelected = selectedFileIds.has(file.id);
                                        const catInfo = categories.find(c => c.id === file.category);
                                        const Icon = catInfo?.icon || FileIcon;

                                        return (
                                            <div
                                                key={file.id}
                                                onClick={() => toggleFileSelection(file.id)}
                                                className={`flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer group ${isSelected
                                                    ? 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/50'
                                                    : 'bg-black/40 border-white/5 hover:bg-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-600 group-hover:border-slate-400'
                                                    }`}>
                                                    {isSelected && <Check size={14} className="text-white" />}
                                                </div>

                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${catInfo?.color || 'text-slate-400 bg-slate-400/10'}`}>
                                                    <Icon size={20} />
                                                </div>

                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-blue-300' : 'text-white'}`}>
                                                        {file.name}
                                                    </div>
                                                    <div className="text-xs font-medium text-slate-500 truncate flex items-center gap-2 mt-0.5">
                                                        <span className="font-mono text-slate-400">{formatBytes(file.size)}</span>
                                                        <span>•</span>
                                                        <span className="truncate">{file.path}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-6">
                        <div>
                            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Selected Files</div>
                            <div className="text-xl font-black text-white font-mono">{selectedFileIds.size} / {files.length}</div>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div>
                            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Total Size to Save</div>
                            <div className="text-xl font-black text-cyan-400 font-mono">{formatBytes(totalSelectedSize)}</div>
                        </div>
                    </div>

                    <Tooltip content={selectedFileIds.size === 0 ? "Select files to save" : "Start saving selected files to drive"} position="top">
                        <button
                            onClick={handleSaveFiles}
                            disabled={selectedFileIds.size === 0 || isSaving}
                            className={`px-8 py-4 rounded-2xl font-black transition-all uppercase tracking-widest text-xs flex items-center gap-3 ${selectedFileIds.size > 0
                                ? 'bg-cyan-600 text-white hover:bg-cyan-500 active:scale-[0.98] ring-1 ring-cyan-500 hover:ring-2 hover:ring-cyan-400 shadow-xl shadow-cyan-900/20'
                                : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                                }`}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin text-white" />
                                    Saving Files...
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
                                    Save Selected Files
                                </>
                            )}
                        </button>
                    </Tooltip>
                </div>

            </div>
        </div>
    );
}
