import React from 'react'
import { useChatStore } from '../store/useChatStore'
import { MessageSquare, Users } from 'lucide-react'

const ActiveTabSwitch = () => {
    const { activeTab, setActiveTab } = useChatStore()

    return (
        <div className='bg-slate-900/60 p-1.5 flex w-full gap-2 border-b border-slate-700/50'>
            <button 
                onClick={() => setActiveTab('chats')}
                className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'chats' 
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                }`}
            >
                <MessageSquare className="size-4" /> Chats
            </button>
            
            <button 
                onClick={() => setActiveTab('contacts')}
                className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'contacts' 
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                }`}
            >
                <Users className="size-4" /> Contacts
            </button>
        </div>
    )
}

export default ActiveTabSwitch