import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { 
    UserCheck, 
    XCircle, 
    UserPlus, 
    MessageSquare, 
    ArrowLeft, 
    Users 
} from "lucide-react";

const getIdStr = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item;
    if (typeof item === "object") {
        return item._id ? item._id.toString() : item.toString ? item.toString() : "";
    }
    return String(item);
};

const normalizeIdArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(getIdStr).filter(Boolean);
    return [getIdStr(val)].filter(Boolean);
};

const checkIsContact = (user, authUser) => {
    if (!user || !authUser) return false;
    const userIdStr = getIdStr(user._id);
    const authUserIdStr = getIdStr(authUser._id);

    const authFollowers = normalizeIdArray(authUser.followers);
    const authFollowing = normalizeIdArray(authUser.following);
    const userFollowers = normalizeIdArray(user.followers);
    const userFollowing = normalizeIdArray(user.following);

    return (
        authFollowers.includes(userIdStr) ||
        authFollowing.includes(userIdStr) ||
        userFollowers.includes(authUserIdStr) ||
        userFollowing.includes(authUserIdStr)
    );
};

const FollowRequestsPage = () => {
    const navigate = useNavigate();
    const {
        authUser,
        followRequests,
        getFollowRequests,
        allUsers,
        getAllUsers,
        sendFollowRequest,
        cancelFollowRequest,
        acceptFollowRequest,
        rejectFollowRequest,
        onlineUsers,
    } = useAuthStore();
    
    const { 
        setSelectedUser, 
        setActiveTab, 
        allContacts, 
        getAllContacts, 
        chats, 
        getMyChatPartners 
    } = useChatStore();

    const [activeSection, setActiveSection] = useState("incoming"); // "incoming" | "discover"

    useEffect(() => {
        if (!authUser) return;
        getFollowRequests();
        getAllUsers();
        getAllContacts();
        getMyChatPartners();
    }, [authUser, getFollowRequests, getAllUsers, getAllContacts, getMyChatPartners]);

    const handleChat = (user) => {
        setSelectedUser(user);
        setActiveTab("chats");
        navigate("/");
    };

    // Thorough check if user is already a contact or active chat partner
    const isExistingContactOrChat = (user) => {
        if (!user) return false;
        const userIdStr = getIdStr(user._id);

        const isFollowContact = checkIsContact(user, authUser);
        const inContactsList = (allContacts || []).some((c) => getIdStr(c._id) === userIdStr);
        const inChatsList = (chats || []).some((c) => getIdStr(c._id) === userIdStr);

        return isFollowContact || inContactsList || inChatsList;
    };

    // Filter incoming requests to exclude users who are already contacts
    const pendingIncomingRequests = followRequests.filter(
        (user) => !isExistingContactOrChat(user)
    );

    // Filter out users who are ALREADY contacts or chat partners from Find Contacts
    const nonContactUsers = allUsers.filter(
        (user) => !isExistingContactOrChat(user)
    );

    return (
        <div className="w-full max-w-2xl mx-auto bg-slate-800/90 border border-slate-700/60 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100 min-h-125 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium cursor-pointer"
                >
                    <ArrowLeft className="size-4" /> Back
                </button>

                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <UserPlus className="size-5 text-cyan-400" /> Contact Requests & Discovery
                </h2>

                <div className="size-6"></div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/50 mb-6">
                <button
                    onClick={() => setActiveSection("incoming")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        activeSection === "incoming"
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                    <UserPlus className="size-4" /> Incoming Requests ({pendingIncomingRequests.length})
                </button>

                <button
                    onClick={() => setActiveSection("discover")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        activeSection === "discover"
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                    <Users className="size-4" /> Find Contacts ({nonContactUsers.length})
                </button>
            </div>

            {/* Section Content */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {activeSection === "incoming" && (
                    <div>
                        {pendingIncomingRequests.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-2">
                                <UserPlus className="size-10 text-slate-600 mb-2" />
                                <p className="font-medium text-base">No pending contact requests</p>
                                <p className="text-xs text-slate-500">When people send you contact requests, they will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingIncomingRequests.map((user) => (
                                    <div
                                        key={user._id}
                                        className="flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-900/80 border border-slate-700/40 rounded-xl transition-all"
                                    >
                                        <Link 
                                            to={`/profile/${user._id}`}
                                            className="flex items-center gap-3 group"
                                        >
                                            <div className="size-12 rounded-full overflow-hidden border-2 border-cyan-500/30 group-hover:border-cyan-400">
                                                <img
                                                    src={user.profilePic || "/avatar.png"}
                                                    alt={user.fullName}
                                                    className="size-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                                                    {user.fullName}
                                                </h3>
                                                <p className="text-xs text-slate-400">{user.email}</p>
                                            </div>
                                        </Link>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => acceptFollowRequest(user._id)}
                                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                                            >
                                                <UserCheck className="size-4" /> Accept
                                            </button>
                                            <button
                                                onClick={() => rejectFollowRequest(user._id)}
                                                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                                            >
                                                <XCircle className="size-4" /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeSection === "discover" && (
                    <div>
                        {nonContactUsers.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-2">
                                <Users className="size-10 text-slate-600 mb-2" />
                                <p className="font-medium text-base">No new users to add</p>
                                <p className="text-xs text-slate-500">All available users are already in your contacts list.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {nonContactUsers.map((user) => {
                                    const userIdStr = getIdStr(user._id);
                                    const authUserIdStr = getIdStr(authUser?._id);

                                    const userFollowRequests = normalizeIdArray(user?.followRequests);
                                    const authFollowRequests = normalizeIdArray(authUser?.followRequests);

                                    const isPendingIncoming = authFollowRequests.includes(userIdStr);
                                    const isPendingOutgoing = userFollowRequests.includes(authUserIdStr);

                                    return (
                                        <div
                                            key={user._id}
                                            className="flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-900/80 border border-slate-700/40 rounded-xl transition-all"
                                        >
                                            <Link 
                                                to={`/profile/${user._id}`}
                                                className="flex items-center gap-3 group"
                                            >
                                                <div className="size-12 rounded-full overflow-hidden border-2 border-cyan-500/30 group-hover:border-cyan-400">
                                                    <img
                                                        src={user.profilePic || "/avatar.png"}
                                                        alt={user.fullName}
                                                        className="size-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                                                        {user.fullName}
                                                    </h3>
                                                    <p className="text-xs text-slate-400">{user.email}</p>
                                                </div>
                                            </Link>

                                            <div className="flex gap-2">
                                                {isPendingIncoming ? (
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            onClick={() => acceptFollowRequest(user._id)}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                                                        >
                                                            <UserCheck className="size-3.5" /> Accept
                                                        </button>
                                                        <button
                                                            onClick={() => rejectFollowRequest(user._id)}
                                                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                                                        >
                                                            <XCircle className="size-3.5" /> Reject
                                                        </button>
                                                    </div>
                                                ) : isPendingOutgoing ? (
                                                    <button
                                                        onClick={() => cancelFollowRequest(user._id)}
                                                        className="px-3.5 py-1.5 bg-amber-600/80 hover:bg-amber-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                                                    >
                                                        <XCircle className="size-4" /> Cancel Request
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => sendFollowRequest(user._id)}
                                                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                                                    >
                                                        <UserPlus className="size-4" /> Add Contact
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FollowRequestsPage;