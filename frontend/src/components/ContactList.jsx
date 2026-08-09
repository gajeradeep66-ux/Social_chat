import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import UsersLoadingSkeleton from './UsersLoadingSkeleton'
import { UserPlus, Users } from 'lucide-react'

const getIdStr = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    if (typeof item === "object") {
        return item._id ? item._id.toString() : item.toString ? item.toString() : "";
    }
    return String(item);
};

const ContactList = () => {
    const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } = useChatStore();
    const { onlineUsers } = useAuthStore();

    useEffect(() => {
        getAllContacts()
    }, [getAllContacts])

    if(isUsersLoading) return <UsersLoadingSkeleton />;

    if (!allContacts || allContacts.length === 0) {
        return (
            <div className="text-center py-8 px-4 bg-slate-900/40 rounded-xl border border-slate-700/40 flex flex-col items-center">
                <Users className="size-10 text-slate-600 mb-2" />
                <p className="text-slate-300 font-medium text-sm mb-1">No contacts yet</p>
                <p className="text-slate-400 text-xs mb-4">Send or accept contact requests to start chatting!</p>
                <Link
                    to="/follow-requests"
                    className="px-3.5 py-2 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all shadow-md"
                >
                    <UserPlus className="size-4" /> Find Contacts
                </Link>
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-2'>
            {allContacts.map((contact) => {
                const contactIdStr = getIdStr(contact._id);
                const isOnline = (onlineUsers || []).some((uId) => getIdStr(uId) === contactIdStr);

                return (
                    <div
                        key={contact._id}
                        className='bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors'
                        onClick={() => setSelectedUser(contact)}
                    >
                        <div className='flex items-center gap-3'>
                            <div className='relative size-12 shrink-0'>
                                <div className='size-full rounded-full overflow-hidden'>
                                    <img 
                                        src={contact.profilePic || './avatar.png'} 
                                        alt={contact.fullName} 
                                        className="size-full object-cover"
                                    />
                                </div>
                                {isOnline && (
                                    <span className="absolute bottom-0 right-0 size-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-md"></span>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h4 className='text-slate-200 font-medium truncate'>{contact.fullName}</h4>
                                <span className={`text-xs ${isOnline ? 'text-emerald-400 font-medium' : 'text-slate-400'}`}>
                                    {isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

export default ContactList