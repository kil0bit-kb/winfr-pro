import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
    content?: React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    wrapperClassName?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top', wrapperClassName = "" }) => {
    const [isVisible, setIsVisible] = useState(false);

    if (!content) return <>{children}</>;

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div
            className={`relative flex items-center ${wrapperClassName}`}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={`absolute z-[2000] px-4 py-2 pointer-events-none ${positionClasses[position]}`}
                    >
                        {/* Tooltip Card - Box Layout */}
                        <div className="bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden min-w-[180px] max-w-[320px] relative p-4">
                            {/* Premium Accent Glow */}
                            <div className={`absolute ${position === 'bottom' ? 'bottom-0' : 'top-0'} left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50`} />

                            <div className="text-slate-200 leading-relaxed">
                                {typeof content === 'string' ? (
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-center block">
                                        {content}
                                    </span>
                                ) : (
                                    content
                                )}
                            </div>
                        </div>

                        {/* Refined Arrow */}
                        <div className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-slate-950/95 border-r border-b border-white/10 ${position === 'top' ? 'top-full -mt-1.25' : 'bottom-full -mb-1.25'}`} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip;
