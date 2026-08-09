import React, { useEffect } from 'react'
import { X, Download, ExternalLink, ChevronLeft, ChevronRight, Film, Music, Image as ImageIcon } from 'lucide-react'

const MediaModal = ({ activeIndex, mediaList, onClose, onNavigate }) => {
    const currentMedia = mediaList[activeIndex];

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && activeIndex > 0) onNavigate(activeIndex - 1);
            if (e.key === 'ArrowRight' && activeIndex < mediaList.length - 1) onNavigate(activeIndex + 1);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeIndex, mediaList.length, onClose, onNavigate]);

    if (!currentMedia) return null;

    const { type, url } = currentMedia;

    const handleDownload = async () => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `socialchat-media-${Date.now()}.${type === 'image' ? 'png' : type === 'video' ? 'mp4' : 'mp3'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 transition-opacity duration-300 animate-fadeIn">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between z-10 bg-slate-900/60 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-800 shadow-xl">
                <div className="flex items-center space-x-3">
                    <span className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                        {type === 'image' && <ImageIcon className="w-5 h-5" />}
                        {type === 'video' && <Film className="w-5 h-5 text-purple-400" />}
                        {type === 'audio' && <Music className="w-5 h-5 text-amber-400" />}
                    </span>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-200 capitalize">
                            {type} Preview ({activeIndex + 1} / {mediaList.length})
                        </h3>
                        <p className="text-xs text-slate-400">Media Gallery & VLC Player</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleDownload}
                        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/50 cursor-pointer flex items-center space-x-1.5 text-xs font-medium"
                        title="Download file"
                    >
                        <Download className="w-4 h-4 text-cyan-400" />
                        <span className="hidden sm:inline">Download</span>
                    </button>
                    
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/50 cursor-pointer"
                        title="Open in new tab"
                    >
                        <ExternalLink className="w-4 h-4 text-slate-300" />
                    </a>

                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all border border-red-500/20 cursor-pointer"
                        title="Close player"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
                {/* Navigation Arrows */}
                {activeIndex > 0 && (
                    <button
                        onClick={() => onNavigate(activeIndex - 1)}
                        className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-cyan-600 text-slate-200 hover:text-white border border-slate-700/80 transition-all transform hover:scale-110 shadow-2xl cursor-pointer"
                        title="Previous Media (Left Arrow)"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}

                {activeIndex < mediaList.length - 1 && (
                    <button
                        onClick={() => onNavigate(activeIndex + 1)}
                        className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-cyan-600 text-slate-200 hover:text-white border border-slate-700/80 transition-all transform hover:scale-110 shadow-2xl cursor-pointer"
                        title="Next Media (Right Arrow)"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}

                {/* Media Display Component */}
                <div className="max-w-5xl max-h-full flex items-center justify-center p-2 rounded-2xl overflow-hidden">
                    {type === 'image' && (
                        <img
                            src={url}
                            alt="Media Preview"
                            className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
                        />
                    )}

                    {type === 'video' && (
                        <div className="w-full max-w-4xl bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
                            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                                <span className="text-xs font-mono text-purple-400 flex items-center space-x-1.5">
                                    <Film className="w-3.5 h-3.5" />
                                    <span>VLC Media Player Window</span>
                                </span>
                            </div>
                            <video
                                src={url}
                                controls
                                autoPlay
                                className="w-full max-h-[70vh] rounded-b-2xl"
                            />
                        </div>
                    )}

                    {type === 'audio' && (
                        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center space-y-6">
                            <div className="relative w-28 h-28 rounded-full bg-linear-to-tr from-amber-500/20 to-purple-500/20 border-2 border-amber-500/30 flex items-center justify-center shadow-inner animate-pulse">
                                <Music className="w-12 h-12 text-amber-400" />
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold text-slate-100">Audio Player Window</h4>
                                <p className="text-xs text-slate-400 mt-1">High Quality Sound Player</p>
                            </div>

                            {/* Soundwave Visualizer Bars */}
                            <div className="flex items-center space-x-1.5 h-8">
                                {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65].map((height, i) => (
                                    <span
                                        key={i}
                                        className="w-1.5 bg-amber-400/80 rounded-full animate-bounce"
                                        style={{ height: `${height}%`, animationDelay: `${i * 0.15}s` }}
                                    />
                                ))}
                            </div>

                            <audio
                                src={url}
                                controls
                                autoPlay
                                className="w-full h-10 accent-amber-500"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Footer Thumbnail Strip */}
            <div className="flex items-center justify-center space-x-2 py-2 overflow-x-auto max-w-2xl mx-auto px-4 scrollbar-none">
                {mediaList.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => onNavigate(idx)}
                        className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                            idx === activeIndex
                                ? 'border-cyan-400 scale-110 shadow-lg shadow-cyan-500/20'
                                : 'border-slate-800 opacity-50 hover:opacity-100'
                        }`}
                    >
                        {item.type === 'image' && (
                            <img src={item.url} alt="thumb" className="w-full h-full object-cover" />
                        )}
                        {item.type === 'video' && (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                <Film className="w-5 h-5 text-purple-400" />
                            </div>
                        )}
                        {item.type === 'audio' && (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                <Music className="w-5 h-5 text-amber-400" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MediaModal;
