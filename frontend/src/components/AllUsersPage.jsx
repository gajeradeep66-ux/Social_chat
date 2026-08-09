import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { UserPlus, UserCheck, XCircle, MessageSquare } from "lucide-react";

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

const AllUsersPage = () => {
    const navigate = useNavigate();
    const {
        authUser,
        allUsers,
        getAllUsers,
        sendFollowRequest,
        cancelFollowRequest,
        acceptFollowRequest,
        rejectFollowRequest,
    } = useAuthStore();
    
    const { 
        setSelectedUser, 
        allContacts, 
        getAllContacts, 
        chats, 
        getMyChatPartners 
    } = useChatStore();

    useEffect(() => {
        getAllUsers();
        getAllContacts();
        getMyChatPartners();
    }, [getAllUsers, getAllContacts, getMyChatPartners]);

    const isExistingContactOrChat = (user) => {
        if (!user) return false;
        const userIdStr = getIdStr(user._id);

        const isFollowContact = checkIsContact(user, authUser);
        const inContactsList = (allContacts || []).some((c) => getIdStr(c._id) === userIdStr);
        const inChatsList = (chats || []).some((c) => getIdStr(c._id) === userIdStr);

        return isFollowContact || inContactsList || inChatsList;
    };

    // Filter out users who are ALREADY contacts or chat partners
    const nonContactUsers = allUsers.filter(
        (user) => !isExistingContactOrChat(user)
    );

    return (
        <div className="p-4 bg-slate-900/40 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-slate-100">Find New Contacts</h2>

            {nonContactUsers.length === 0 ? (
                <p className="text-slate-400 text-sm">No new users to add. All available users are already in your contacts list.</p>
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
                                className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition-all"
                            >
                                <Link 
                                    to={`/profile/${user._id}`}
                                    className="flex items-center gap-3 group"
                                >
                                    <div className="size-11 rounded-full overflow-hidden border-2 border-cyan-500/30 group-hover:border-cyan-400">
                                        <img
                                            src={user.profilePic || "/avatar.png"}
                                            alt={user.fullName}
                                            className="size-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-200 text-sm group-hover:text-cyan-400 transition-colors">
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
                                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                                            >
                                                <UserCheck className="size-3.5" /> Accept
                                            </button>
                                            <button
                                                onClick={() => rejectFollowRequest(user._id)}
                                                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                                            >
                                                <XCircle className="size-3.5" /> Reject
                                            </button>
                                        </div>
                                    ) : isPendingOutgoing ? (
                                        <button
                                            onClick={() => cancelFollowRequest(user._id)}
                                            className="px-3 py-1.5 bg-amber-600/80 hover:bg-amber-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                                        >
                                            <XCircle className="size-3.5" /> Cancel Request
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => sendFollowRequest(user._id)}
                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                                        >
                                            <UserPlus className="size-3.5" /> Add Contact
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AllUsersPage;