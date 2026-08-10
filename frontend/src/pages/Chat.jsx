import React from 'react'
import { useChatStore } from '../store/useChatStore';
import BorderAnimatedContainer from '../components/BorderAnimatedContainer'
import ProfileHeader from '../components/ProfileHeader'
import ActiveTabSwitch from '../components/ActiveTabSwitch'
import ChatsList from '../components/ChatsList'
import ContactList from '../components/ContactList'
import ChatContainer from '../components/ChatContainer'
import NoConversationPlaceholder from '../components/NoConversationPlaceholder'

const Chat = () => {

    const { activeTab, selectedUser } = useChatStore();

    return (
        <div className="w-full h-full flex overflow-hidden bg-slate-900">
            {/* Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 bg-slate-800/80 backdrop-blur-md flex flex-col shrink-0 border-r border-slate-700/50 h-full ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                <ProfileHeader />
                <ActiveTabSwitch />

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {activeTab === "chats" ? <ChatsList /> : <ContactList />}
                </div>
            </div>

            {/* Chat Pane */}
            <div className={`flex-1 flex flex-col h-full bg-slate-900/95 backdrop-blur-sm overflow-hidden ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
            </div>
        </div>
    )
}

export default Chat