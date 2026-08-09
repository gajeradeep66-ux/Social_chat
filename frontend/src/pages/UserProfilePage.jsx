import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { 
    UserPlus, 
    UserCheck, 
    XCircle, 
    MessageSquare, 
    ArrowLeft, 
    Camera, 
    Mail, 
    Users,
    User as UserIcon,
    ShieldCheck,
    Clock
} from "lucide-react";
import PageLoader from "../components/PageLoader";

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

const UserProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { 
        authUser, 
        getUserById, 
        sendFollowRequest, 
        cancelFollowRequest, 
        acceptFollowRequest, 
        rejectFollowRequest,
        updateProfile,
        checkAuth
    } = useAuthStore();

    const { 
        setSelectedUser, 
        allContacts, 
        getAllContacts, 
        chats, 
        getMyChatPartners 
    } = useChatStore();

    const [targetUser, setTargetUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdatingPic, setIsUpdatingPic] = useState(false);
    const fileInputRef = useRef(null);

    const targetUserId = id || authUser?._id;
    const isOwnProfile = authUser?._id && getIdStr(authUser._id) === getIdStr(targetUserId);

    const refreshProfileData = async () => {
        if (isOwnProfile) {
            await checkAuth();
            await getAllContacts();
            await getMyChatPartners();
            setTargetUser(useAuthStore.getState().authUser);
        } else if (targetUserId) {
            const fetched = await getUserById(targetUserId);
            setTargetUser(fetched);
        }
    };

    useEffect(() => {
        const loadUserProfile = async () => {
            setLoading(true);
            getAllContacts();
            getMyChatPartners();
            if (isOwnProfile) {
                setTargetUser(authUser);
                setLoading(false);
            } else if (targetUserId) {
                const fetched = await getUserById(targetUserId);
                setTargetUser(fetched);
                setLoading(false);
            }
        };
        loadUserProfile();
    }, [targetUserId, isOwnProfile, getAllContacts, getMyChatPartners]);

    if (loading) return <PageLoader />;
    if (!targetUser) {
        return (
            <div className="text-center p-8 bg-slate-800 text-slate-200 rounded-xl max-w-md mx-auto">
                <p className="mb-4 text-base">User not found.</p>
                <Link to="/" className="text-cyan-400 hover:underline flex items-center justify-center gap-2">
                    <ArrowLeft className="size-4" /> Return to Chat
                </Link>
            </div>
        );
    }

    const currentProfileUser = isOwnProfile ? authUser : targetUser;
    const authUserIdStr = getIdStr(authUser?._id);
    const currentUserIdStr = getIdStr(currentProfileUser?._id);

    // Calculate contacts count accurately across all sources
    const followersList = normalizeIdArray(currentProfileUser?.followers);
    const followingList = normalizeIdArray(currentProfileUser?.following);
    const chatsList = isOwnProfile ? (chats || []).map((c) => getIdStr(c._id)) : [];
    const contactsStoreList = isOwnProfile ? (allContacts || []).map((c) => getIdStr(c._id)) : [];

    const allContactIds = [...new Set([
        ...followersList,
        ...followingList,
        ...chatsList,
        ...contactsStoreList
    ])].filter((cId) => cId && cId !== currentUserIdStr);

    const contactsCount = allContactIds.length;
    const pendingRequestsCount = normalizeIdArray(currentProfileUser?.followRequests).length;

    // Check relationship status safely
    const isContact = allContactIds.includes(currentUserIdStr) || 
        followersList.includes(authUserIdStr) || 
        followingList.includes(authUserIdStr) ||
        normalizeIdArray(authUser?.followers).includes(currentUserIdStr) ||
        normalizeIdArray(authUser?.following).includes(currentUserIdStr);

    const hasIncomingRequest = normalizeIdArray(authUser?.followRequests).includes(currentUserIdStr);
    const hasOutgoingRequest = normalizeIdArray(currentProfileUser?.followRequests).includes(authUserIdStr);

    const handleStartChat = () => {
        setSelectedUser(currentProfileUser);
        navigate("/");
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = async () => {
            const base64Image = reader.result;
            setIsUpdatingPic(true);
            await updateProfile({ profilePic: base64Image });
            setIsUpdatingPic(false);
        };
    };

    return (
        <div className="w-full max-w-md mx-auto bg-slate-800/90 border border-slate-700/60 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium cursor-pointer"
                >
                    <ArrowLeft className="size-4" /> Back
                </button>
                <h2 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                    <UserIcon className="size-5" /> {isOwnProfile ? "My Profile" : "User Profile"}
                </h2>
                <div className="size-6"></div>
            </div>

            {/* Profile Avatar */}
            <div className="flex flex-col items-center mb-6">
                <div className="relative group mb-4">
                    <div className="size-28 rounded-full overflow-hidden border-4 border-cyan-500/30 shadow-[0_0_25px_rgba(34,211,238,0.3)]">
                        <img
                            src={currentProfileUser.profilePic || "/avatar.png"}
                            alt={currentProfileUser.fullName}
                            className="size-full object-cover"
                        />
                    </div>

                    {isOwnProfile && (
                        <>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUpdatingPic}
                                className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <Camera className="size-6 mb-1 text-cyan-400" />
                                <span className="text-xs font-medium">
                                    {isUpdatingPic ? "Uploading..." : "Change"}
                                </span>
                            </button>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </>
                    )}
                </div>

                <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                    {currentProfileUser.fullName}
                </h3>
                <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1">
                    <Mail className="size-4 text-cyan-500/70" /> {currentProfileUser.email}
                </p>
            </div>

            {/* Stats Cards: Contact Count & Requests Count */}
            <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-900/60 p-4 rounded-xl border border-slate-700/40">
                <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                        <Users className="size-3.5 text-cyan-400" /> Contacts
                    </p>
                    <p className="text-2xl font-bold text-cyan-400 mt-1">
                        {contactsCount}
                    </p>
                </div>
                <div className="text-center border-l border-slate-700/60">
                    <p className="text-xs text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                        <Clock className="size-3.5 text-amber-400" /> Pending Requests
                    </p>
                    <p className="text-2xl font-bold text-amber-400 mt-1">
                        {pendingRequestsCount}
                    </p>
                </div>
            </div>

            {/* Dynamic Actions */}
            <div className="flex flex-col gap-3">
                {isOwnProfile ? (
                    <button
                        onClick={() => navigate("/")}
                        className="w-full py-3 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                    >
                        <MessageSquare className="size-5" /> Open My Chats
                    </button>
                ) : isContact ? (
                    <button
                        onClick={handleStartChat}
                        className="w-full py-3 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                    >
                        <MessageSquare className="size-5" /> Chat
                    </button>
                ) : hasIncomingRequest ? (
                    <div className="flex gap-3">
                        <button
                            onClick={async () => {
                                await acceptFollowRequest(currentProfileUser._id);
                                await refreshProfileData();
                            }}
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                        >
                            <UserCheck className="size-5" /> Accept Request
                        </button>
                        <button
                            onClick={async () => {
                                await rejectFollowRequest(currentProfileUser._id);
                                await refreshProfileData();
                            }}
                            className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                        >
                            <XCircle className="size-5" /> Reject
                        </button>
                    </div>
                ) : hasOutgoingRequest ? (
                    <button
                        onClick={async () => {
                            await cancelFollowRequest(currentProfileUser._id);
                            await refreshProfileData();
                        }}
                        className="w-full py-3 bg-amber-600/80 hover:bg-amber-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                    >
                        <XCircle className="size-5" /> Cancel Request
                    </button>
                ) : (
                    <button
                        onClick={async () => {
                            await sendFollowRequest(currentProfileUser._id);
                            await refreshProfileData();
                        }}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                    >
                        <UserPlus className="size-5" /> Add Contact
                    </button>
                )}
            </div>
        </div>
    );
};

export default UserProfilePage;