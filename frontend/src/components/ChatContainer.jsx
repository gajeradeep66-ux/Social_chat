import React, { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import ChatHeader from './ChatHeader'
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder'
import MessageInput from './MessageInput'
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton'
import MediaModal from './MediaModal'
import { Maximize2, Trash2 } from 'lucide-react'

const ChatContainer = () => {

    const { 
        selectedUser, 
        getMessagesByUserId, 
        messages, 
        isMessagesLoading, 
        subscribeToMessages, 
        unsubscribeFromMessages,
        deleteMessage
    } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);

    const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);

    // Extract all media items from the conversation
    const mediaList = messages.reduce((acc, msg) => {
        if (msg.image) acc.push({ type: 'image', url: msg.image, msgId: msg._id });
        if (msg.video) acc.push({ type: 'video', url: msg.video, msgId: msg._id });
        if (msg.audio) acc.push({ type: 'audio', url: msg.audio, msgId: msg._id });
        return acc;
    }, []);

    const handleOpenMedia = (url) => {
        const index = mediaList.findIndex((m) => m.url === url);
        if (index !== -1) setSelectedMediaIndex(index);
    };

    useEffect(() => {
        if (selectedUser?._id) {
            getMessagesByUserId(selectedUser._id);
            subscribeToMessages()

            return () => unsubscribeFromMessages()
        }
    }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior : "smooth"})
        }
    })

    return (
        <div className="flex-1 flex flex-col h-full relative">
            <ChatHeader />
            <div className="flex-1 px-6 overflow-y-auto py-8">
                {messages.length > 0 && !isMessagesLoading ? (
                    <div className="w-full space-y-6">
                        {messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`chat ${msg.senderId === authUser._id ? 'chat-end' : 'chat-start'} group/msg relative`}
                            >
                                {msg.senderId === authUser._id && (
                                    <button
                                        type="button"
                                        onClick={() => deleteMessage(msg._id)}
                                        className="opacity-0 group-hover/msg:opacity-100 p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-full cursor-pointer transition-all duration-200 self-center me-1.5"
                                        title="Delete Message"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <div
                                    className={`chat-bubble relative group ${
                                        msg.senderId === authUser._id
                                            ? 'bg-cyan-600 text-white'
                                            : 'bg-slate-800 text-slate-200'
                                    }`}
                                >
                                    {msg.image && (
                                        <div 
                                            onClick={() => handleOpenMedia(msg.image)}
                                            className="relative cursor-pointer group/media overflow-hidden rounded-lg mb-2"
                                        >
                                            <img src={msg.image} alt="shared" className="rounded-lg h-48 object-cover transition-transform duration-300 group-hover/media:scale-105" />
                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center">
                                                <Maximize2 className="w-6 h-6 text-white drop-shadow-md" />
                                            </div>
                                        </div>
                                    )}

                                    {msg.video && (
                                        <div className="relative group/media mb-2">
                                            <video src={msg.video} controls className="rounded-lg max-w-xs max-h-60 mb-1" />
                                            <button
                                                type="button"
                                                onClick={() => handleOpenMedia(msg.video)}
                                                className="flex items-center space-x-1 text-xs text-cyan-300 hover:text-cyan-100 bg-slate-900/60 hover:bg-slate-900/90 px-2 py-1 rounded-md border border-slate-700/50 cursor-pointer transition-colors"
                                            >
                                                <Maximize2 className="w-3.5 h-3.5" />
                                                <span>Open VLC Player Window</span>
                                            </button>
                                        </div>
                                    )}

                                    {msg.audio && (
                                        <div className="my-2 max-w-full">
                                            <audio src={msg.audio} controls className="max-w-full mb-1" />
                                            <button
                                                type="button"
                                                onClick={() => handleOpenMedia(msg.audio)}
                                                className="flex items-center space-x-1 text-xs text-amber-300 hover:text-amber-100 bg-slate-900/60 hover:bg-slate-900/90 px-2 py-1 rounded-md border border-slate-700/50 cursor-pointer transition-colors"
                                            >
                                                <Maximize2 className="w-3.5 h-3.5" />
                                                <span>Open Full Audio Player Window</span>
                                            </button>
                                        </div>
                                    )}

                                    {msg.text}
                                    <p className="text-xs opacity-75 flex items-center gap-1 mt-1">
                                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messageEndRef} />
                    </div>
                ) : isMessagesLoading ? <MessagesLoadingSkeleton /> : (
                    <NoChatHistoryPlaceholder name={selectedUser?.fullName || 'User'} />
                )}
            </div>
            <MessageInput />

            {/* Gallery & VLC Player Media Modal */}
            {selectedMediaIndex !== null && (
                <MediaModal
                    activeIndex={selectedMediaIndex}
                    mediaList={mediaList}
                    onClose={() => setSelectedMediaIndex(null)}
                    onNavigate={(index) => setSelectedMediaIndex(index)}
                />
            )}
        </div>
    )
}

export default ChatContainer