import React from 'react'
import { Link } from 'react-router-dom'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import { XIcon, ArrowLeft } from 'lucide-react'

const getIdStr = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    if (typeof item === "object") {
        return item._id ? item._id.toString() : item.toString ? item.toString() : "";
    }
    return String(item);
};

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useChatStore()
    const { onlineUsers } = useAuthStore()

    const selectedUserIdStr = getIdStr(selectedUser?._id);
    const isOnline = Boolean(
        selectedUser && 
        (onlineUsers || []).some((uId) => getIdStr(uId) === selectedUserIdStr)
    );

    return (
        <div className='flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 py-3.5 px-6 shrink-0'>
            <div className="flex items-center space-x-3">
                <button
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden p-1 mr-1 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                    title="Back to chats"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <Link 
                    to={`/profile/${selectedUser?._id}`}
                    className='flex items-center space-x-3 group cursor-pointer'
                    title="View Profile"
                >
                    <div className='relative size-12 shrink-0'>
                        <div className='size-full rounded-full overflow-hidden ring-2 ring-cyan-500/20 group-hover:ring-cyan-400 transition-all'>
                            <img 
                                src={selectedUser?.profilePic || '/avatar.png'} 
                                alt={selectedUser?.fullName || 'User'} 
                                className="size-full object-cover"
                            />
                        </div>
                        {isOnline && (
                            <span className="absolute bottom-0 right-0 size-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-md"></span>
                        )}
                    </div>
                    <div>
                        <h3 className='text-slate-200 font-medium group-hover:text-cyan-400 transition-colors'>
                            {selectedUser?.fullName}
                        </h3>
                        <p className='text-slate-400 text-sm flex items-center gap-1.5'>
                            <span className={`inline-block size-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                            {isOnline ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </Link>
            </div>
            <button
                onClick={() => setSelectedUser(null)}
                title="Close Chat"
            >
                <XIcon className='w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer'/>
            </button>
        </div>
    )
}    

export default ChatHeader