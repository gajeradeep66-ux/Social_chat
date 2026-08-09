import React, { useEffect } from 'react'
import { LogOutIcon, VolumeOffIcon, Volume2Icon, UserPlus } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useChatStore } from '../store/useChatStore'
import { Link } from 'react-router-dom'

const mouseClickSound = new Audio('/sounds/mouse-click.mp3')

const ProfileHeader = () => {

    const { logout, authUser, followRequests, getFollowRequests } = useAuthStore();
    const { isSoundEnabled, toggleSound } = useChatStore();

    useEffect(() => {
        if (authUser) {
            getFollowRequests();
        }
    }, [authUser, getFollowRequests]);

    const pendingCount = authUser?.followRequests?.length || followRequests?.length || 0;

    return (
        <div className='p-6 border-b border-slate-700/50 '>
            <div className='flex items-center justify-between '>
                <div className='flex items-center gap-3 '>
                    <div className="relative inline-block">
                        <Link 
                            to={`/profile/${authUser?._id}`}
                            className="relative size-14 rounded-full overflow-hidden block group"
                            title="View Profile"
                        >
                            <img
                                src={authUser?.profilePic || "/avatar.png"}
                                alt="Profile"
                                className="size-full object-cover"
                            />
                            <div className="absolute inset-0 rounded-full ring-2 ring-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.5)] pointer-events-none"></div>
                        </Link>

                        <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-slate-900"></span>
                    </div>

                    <div>
                        <Link to={`/profile/${authUser?._id}`} className="hover:underline">
                            <h3 className='text-slate-200 font-medium text-base max-w-45 truncate'>
                                {authUser?.fullName}
                            </h3>
                        </Link>
                        <p className='text-slate-400 text-xs'>Online</p>
                    </div>
                </div>

                <div className='flex gap-4 items-center'>
                    {/* Person / Contact Requests Icon with Notification Badge */}
                    <Link
                        to="/follow-requests"
                        className="relative text-slate-400 hover:text-cyan-400 transition-colors p-1"
                        title="Contact Requests"
                    >
                        <UserPlus className="size-5" />
                        {pendingCount > 0 && (
                            <span className="absolute -top-1 -right-1 size-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {pendingCount}
                            </span>
                        )}
                    </Link>

                    {/*Sound toggle btn*/}
                    <button
                        className='text-slate-400 hover:text-slate-200 transition-colors'
                        onClick={() => {
                            mouseClickSound.currentTime = 0
                            mouseClickSound.play().catch((error) => console.log("Audio play failed:", error))
                            toggleSound()
                        }}
                    >
                        {isSoundEnabled ? (
                            <Volume2Icon className='size-5' />
                        ) : (
                            <VolumeOffIcon className='size-5' />
                        )}
                    </button>

                    <button 
                        className='text-slate-400 hover:text-slate-200 transition-colors'
                        onClick={logout}
                        title="Logout"
                    >
                        <LogOutIcon className='size-5' />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProfileHeader