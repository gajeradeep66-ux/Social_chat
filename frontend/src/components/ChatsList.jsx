import React, { useEffect } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import UsersLoadingSkeleton from './UsersLoadingSkeleton'
import NoChatsFound from './NoChatsFound'

const getIdStr = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    if (typeof item === "object") {
        return item._id ? item._id.toString() : item.toString ? item.toString() : "";
    }
    return String(item);
};

const ChatsList = () => {
    const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } = useChatStore()
    const { onlineUsers } = useAuthStore()

    useEffect(() => {
        getMyChatPartners()
    }, [getMyChatPartners])

    if(isUsersLoading) return <UsersLoadingSkeleton />
    if(chats.length === 0 ) return <NoChatsFound />

    return (
        <div className='flex flex-col gap-2'>
            {chats.map ((chat) => {
                const chatIdStr = getIdStr(chat._id);
                const isOnline = (onlineUsers || []).some((uId) => getIdStr(uId) === chatIdStr);

                return (
                    <div 
                        key={chat._id}
                        className='bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors'
                        onClick={() => setSelectedUser(chat)}
                    >
                        <div className='flex items-center gap-3'>
                            <div className='relative size-12 shrink-0'>
                                <div className='size-full rounded-full overflow-hidden'>
                                    <img 
                                        src={chat.profilePic || './avatar.png'} 
                                        alt={chat.fullName} 
                                        className="size-full object-cover"
                                    />
                                </div>
                                {isOnline && (
                                    <span className="absolute bottom-0 right-0 size-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-md"></span>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h4 className='text-slate-200 font-medium truncate'>{chat.fullName}</h4>
                                <span className={`text-xs ${isOnline ? 'text-emerald-400 font-medium' : 'text-slate-400'}`}>
                                    {isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ChatsList