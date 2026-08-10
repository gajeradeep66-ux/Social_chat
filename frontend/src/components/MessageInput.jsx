import React, { useRef, useState, useEffect } from 'react'
import useKeyboardSound from '../hooks/useKeyboardSound'
import { useChatStore } from '../store/useChatStore'
import { XIcon, Paperclip, Image, Video, Music, Send } from 'lucide-react'
import toast from 'react-hot-toast'

const MessageInput = () => {

    const { playRandomKeyStrokeSound } = useKeyboardSound()
    const [text, setText] = useState('')
    const [imagePreview, setImagePreview] = useState(null)
    const [videoPreview, setVideoPreview] = useState(null)
    const [audioPreview, setAudioPreview] = useState(null)
    const [showMediaMenu, setShowMediaMenu] = useState(false)

    const fileInputRef = useRef(null)
    const menuRef = useRef(null)

    const { sendMessage, isSoundEnabled } = useChatStore()

    // Close media menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMediaMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSendMessage = (e) => {
        e.preventDefault()
        if (!text.trim() && !imagePreview && !videoPreview && !audioPreview) return;
        if (isSoundEnabled) playRandomKeyStrokeSound();

        sendMessage({
            text: text.trim(),
            image: imagePreview,
            video: videoPreview,
            audio: audioPreview
        })

        setText('')
        setImagePreview(null)
        setVideoPreview(null)
        setAudioPreview(null)

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
            fileInputRef.current.accept = 'image/*, video/*, audio/*'
        }
        setShowMediaMenu(false)
    }

    const triggerFileInput = (type) => {
        if (fileInputRef.current) {
            if (type === 'image') fileInputRef.current.accept = 'image/*'
            else if (type === 'video') fileInputRef.current.accept = 'video/*'
            else if (type === 'audio') fileInputRef.current.accept = 'audio/*'
            else fileInputRef.current.accept = 'image/*, video/*, audio/*'

            fileInputRef.current.click()
        }
        setShowMediaMenu(false)
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const mediaType = file.type.split('/')[0]; // 'image', 'video', or 'audio'

        const previewSetters = {
            image: setImagePreview,
            video: setVideoPreview,
            audio: setAudioPreview
        };

        const setPreview = previewSetters[mediaType];

        if (!setPreview) {
            toast.error('Please select a valid media file (image, video, or audio)');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        if (fileInputRef.current) {
            fileInputRef.current.accept = 'image/*, video/*, audio/*'
        }
    };

    const removeMedia = (type) => {
        const setters = {
            image: setImagePreview,
            video: setVideoPreview,
            audio: setAudioPreview
        };

        if (type && setters[type]) {
            setters[type](null);
        } else {
            setImagePreview(null);
            setVideoPreview(null);
            setAudioPreview(null);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.accept = 'image/*, video/*, audio/*';
        }
    };

    return (
        <div className='p-4 border-t border-slate-700/50 relative'>
            {[
                { type: 'image', url: imagePreview },
                { type: 'video', url: videoPreview },
                { type: 'audio', url: audioPreview }
            ]
                .filter(item => item.url)
                .map(({ type, url }) => (
                    <div key={type} className='w-full mb-3 flex items-center'>
                        <div className='relative'>
                            {type === 'image' && (
                                <img 
                                    src={url} 
                                    alt="Preview" 
                                    className='w-20 h-20 object-cover rounded-lg border border-slate-700' 
                                />
                            )}
                            {type === 'video' && (
                                <video 
                                    src={url} 
                                    controls 
                                    className='w-36 h-20 object-cover rounded-lg border border-slate-700' 
                                />
                            )}
                            {type === 'audio' && (
                                <div className='p-2 bg-slate-800 rounded-lg border border-slate-700 flex items-center'>
                                    <audio src={url} controls className='h-8 max-w-55' />
                                </div>
                            )}
                            <button
                                onClick={() => removeMedia(type)}
                                className='absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700 cursor-pointer'
                                type='button'
                            >
                                <XIcon className='w-4 h-4' />
                            </button>
                        </div>
                    </div>
                ))}

            <form 
                onSubmit={handleSendMessage}
                className='w-full flex items-center space-x-3'
            >
                <input 
                    type="file"
                    accept='image/*, video/*, audio/*'
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className='hidden'
                />

                <input 
                    type="text"
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value)
                        isSoundEnabled && playRandomKeyStrokeSound()
                    }}
                    className='flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg py-2.5 px-4 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/50 transition-colors'
                    placeholder='Type a message...' 
                />

                <div className='relative' ref={menuRef}>
                    {showMediaMenu && (
                        <div className='absolute bottom-14 left-0 bg-slate-800/95 backdrop-blur-md border border-slate-700/80 shadow-2xl rounded-xl p-1.5 flex flex-col items-center space-x-1 z-50 transition-all duration-200'>
                            <button
                                type='button'
                                onClick={() => triggerFileInput('image')}
                                className='flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-700/80 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer group'
                                title='Upload Image'
                            >
                                <Image className='w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform' />
                                <span className='text-xs font-medium'>Image</span>
                            </button>

                            <button
                                type='button'
                                onClick={() => triggerFileInput('video')}
                                className='flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-700/80 text-slate-300 hover:text-purple-400 transition-colors cursor-pointer group'
                                title='Upload Video'
                            >
                                <Video className='w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform' />
                                <span className='text-xs font-medium'>Video</span>
                            </button>

                            <button
                                type='button'
                                onClick={() => triggerFileInput('audio')}
                                className='flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-700/80 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer group'
                                title='Upload Audio'
                            >
                                <Music className='w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform' />
                                <span className='text-xs font-medium'>Audio</span>
                            </button>
                        </div>
                    )}

                    <button
                        type='button'
                        onClick={() => setShowMediaMenu(!showMediaMenu)}
                        className={`p-2.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 rounded-lg transition-colors border border-slate-700/50 flex items-center justify-center cursor-pointer ${
                            imagePreview || videoPreview || audioPreview || showMediaMenu ? "text-cyan-400 border-cyan-500/50 bg-cyan-500/10" : ""
                        }`}
                        title='Attach media'
                    >
                        <Paperclip className={`w-5 h-5 transition-transform duration-200 ${showMediaMenu ? "rotate-45 text-cyan-400" : ""}`} />
                    </button>
                </div>

                <button
                    type='submit'
                    disabled={!text.trim() && !imagePreview && !videoPreview && !audioPreview}
                    className='p-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed shadow-md'
                    title='Send message'
                >
                    <Send className='w-5 h-5' />
                </button>
            </form>
        </div>
    )
}

export default MessageInput
