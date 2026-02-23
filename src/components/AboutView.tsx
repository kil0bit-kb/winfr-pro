import { Github, Youtube, Twitter, BookOpen, Layers, Zap, Heart, CircleDollarSign } from "lucide-react";

export default function AboutView() {
    return (
        <div className="flex flex-col items-center max-w-4xl mx-auto py-6 px-6 transform translate-z-0">
            <div className="w-20 h-20 flex items-center justify-center mb-6 transform translate-z-0">
                <img src="/iconwinfr.png" alt="Winfr Pro Logo" className="w-full h-full object-contain" />
            </div>

            <h1 className="text-2xl font-black text-white tracking-tighter">Winfr <span className="text-blue-500">Pro</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[8px] mt-1">Free & Open Source Data Recovery Software</p>
            <p className="text-slate-400 font-medium text-[11px] mt-2 max-w-sm text-center leading-relaxed">
                A professional-grade Graphical User Interface (GUI) for the official <span className="text-white font-black">Windows File Recovery</span> command-line tool.
            </p>

            <div className="mt-8 w-full space-y-4 transform translate-z-0">
                <div className="bg-[#111113] rounded-[20px] border border-white/5 p-6 relative overflow-hidden group shadow-2xl transform translate-z-0">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <img src="/iconwinfr.png" alt="" className="w-20 h-20 object-contain grayscale" />
                    </div>
                    <h3 className="text-sm font-black text-white mb-4 uppercase tracking-wider">Project Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-2 text-[10px] font-black uppercase tracking-widest text-center sm:text-left">
                        <div>
                            <span className="text-slate-600 block mb-0.5 text-[9px]">Version</span>
                            <span className="text-blue-400">0.1 BETA</span>
                        </div>
                        <div>
                            <span className="text-slate-600 block mb-0.5 text-[9px]">Backend</span>
                            <span className="text-slate-300">Tauri 2 (Rust)</span>
                        </div>
                        <div>
                            <span className="text-slate-600 block mb-0.5 text-[9px]">CLI Engine</span>
                            <span className="text-slate-300">WinFR Engine</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 transform translate-z-0">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Connect & Support</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        <a href="https://www.youtube.com/@kilObit" target="_blank" className="flex flex-col items-center gap-1 p-3 bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10 hover:border-red-500/30 transition-all group">
                            <Youtube size={20} className="text-red-500 transition-transform group-hover:scale-110" />
                            <span className="text-[9px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest">YouTube</span>
                        </a>
                        <a href="https://x.com/kil0bit" target="_blank" className="flex flex-col items-center gap-1 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/20 transition-all group">
                            <Twitter size={20} className="text-white transition-transform group-hover:scale-110" />
                            <span className="text-[9px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest">Twitter / X</span>
                        </a>
                        <a href="https://kil0bit.blogspot.com/" target="_blank" className="flex flex-col items-center gap-1 p-3 bg-orange-500/5 hover:bg-orange-500/10 rounded-xl border border-orange-500/10 hover:border-orange-500/30 transition-all group">
                            <BookOpen size={20} className="text-orange-500 transition-transform group-hover:scale-110" />
                            <span className="text-[9px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest">Website</span>
                        </a>
                        <a href="https://github.com/kil0bit-kb" target="_blank" className="flex flex-col items-center gap-1 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/20 transition-all group">
                            <Github size={20} className="text-white transition-transform group-hover:scale-110" />
                            <span className="text-[9px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest">GitHub</span>
                        </a>
                        <a href="https://www.patreon.com/cw/KB_kilObit" target="_blank" className="flex flex-col items-center gap-1 p-3 bg-pink-500/5 hover:bg-pink-500/10 rounded-xl border border-pink-500/10 hover:border-pink-500/30 transition-all group">
                            <CircleDollarSign size={20} className="text-pink-500 transition-transform group-hover:scale-110" />
                            <span className="text-[9px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest">Support</span>
                        </a>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 transform translate-z-0">
                    <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 text-center">Built With</h4>
                    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                        <a href="https://tauri.app" target="_blank" className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity group">
                            <Layers size={11} className="text-blue-400" />
                            <span className="text-[8px] font-black uppercase text-slate-500 group-hover:text-white">Tauri</span>
                        </a>
                        <a href="https://www.rust-lang.org" target="_blank" className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity group">
                            <Zap size={11} className="text-orange-400" />
                            <span className="text-[8px] font-black uppercase text-slate-500 group-hover:text-white">Rust</span>
                        </a>
                        <a href="https://lucide.dev" target="_blank" className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity group">
                            <Heart size={11} className="text-pink-400" />
                            <span className="text-[8px] font-black uppercase text-slate-500 group-hover:text-white">Lucide</span>
                        </a>
                        <a href="https://apps.microsoft.com/store/detail/windows-file-recovery/9N26S50LN705" target="_blank" className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity group">
                            <img src="/iconwinfr.png" alt="" className="w-3 h-3 object-contain" />
                            <span className="text-[8px] font-black uppercase text-slate-500 group-hover:text-white">WinFR Engine</span>
                        </a>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] text-center flex items-center justify-center gap-1 transform translate-z-0">
                Built with <span className="text-red-500/80 mx-0.5">❤️</span> by KB - kilObit
            </p>
        </div>
    );
}
