import {create} from 'zustand'
import { axiosInstance } from '../lib/axios'
import toast from 'react-hot-toast'
import { io } from "socket.io-client"
import { useChatStore } from "./useChatStore"

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:9056" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    socket: null,
    onlineUsers: [],
    followRequests: [],

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get('/auth/check')
            set({ authUser: res.data })
            get().connectSocket();
        } catch (error) {
            console.log(error.response?.status);
            console.log(error.response?.data);
            set({ authUser: null })
        } finally {
            set({ isCheckingAuth: false })
        }
    },

    signup : async (data) => {
        set({ isSigningUp : true })
        try {
            const res = await axiosInstance.post('/auth/signup', data)
            set({ authUser : res.data })
            toast.success("Account created successfully!!!")
            get().connectSocket();
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Signup failed")
        } finally {
            set({ isSigningUp : false })
        }
    },

    login : async (data) => {
        set({ isLoggingIn : true })
        try {
            const res = await axiosInstance.post('/auth/login', data)
            set({ authUser : res.data })
            toast.success("Logged in successfully!!!")
            get().connectSocket();
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Login failed")
        } finally {
            set({ isLoggingIn : false })
        }
    },

    logout : async () => {
        try {
            await axiosInstance.post('/auth/logout')
            set({ authUser : null })
            toast.success("Logged out successfully!!!")
            get().disconnectSocket();
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Logout error")
            console.log("Logout error", error?.response?.data?.message || error.message)
        }
    },

    updateProfile: async (data) => {
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("Error in update profile:", error);
            toast.error(error?.response?.data?.message || error?.message || "Update profile failed");
        }
    },    

    connectSocket: () => {
        const {authUser} = get()
        if(!authUser || get().socket?.connected) return

        const socket = io(BASE_URL, {
            withCredentials : true
        })

        socket.connect();

        set ({ socket });

        socket.on("getOnlineUsers", (userIds) => {
            set ({ onlineUsers : userIds})
        })
    },

    disconnectSocket: () => {
        if(get().socket?.connected) get().socket.disconnect();
    },

    allUsers: [],
    getUserById: async (userId) => {
        try {
            const res = await axiosInstance.get(`/follow/user/${userId}`);
            return res.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch user details");
            return null;
        }
    },

    getAllUsers: async () => {
        try {
            const res = await axiosInstance.get("/follow/users");
            set({ allUsers: res.data });
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Failed to show all users");
            console.log("Error in show all users:", error);
        }
    },

    // Get pending follow requests
    getFollowRequests: async () => {
        try {
            const res = await axiosInstance.get("/follow/requests");
            set({ followRequests: res.data });
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Failed to fetch follow requests");
            console.log("Error in fetch follow requests:", error);
        }
    },

    // Send request
    sendFollowRequest: async (userId) => {
        try {
            const res = await axiosInstance.post(`/follow/request/${userId}`);
            toast.success(res.data.message || "Contact request sent");
            await get().checkAuth();
            await get().getAllUsers();
            await get().getFollowRequests();
            useChatStore.getState().getAllContacts();
            useChatStore.getState().getMyChatPartners();
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Failed to send follow request");
            console.log("Error in send follow request:", error);
        }
    },

    // Cancel request
    cancelFollowRequest: async (userId) => {
        try {
            const res = await axiosInstance.delete(`/follow/cancel/${userId}`);
            toast.success(res.data.message || "Contact request cancelled");
            await get().checkAuth();
            await get().getAllUsers();
            await get().getFollowRequests();
            useChatStore.getState().getAllContacts();
            useChatStore.getState().getMyChatPartners();
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Failed to cancel follow request");
            console.log("Error in cancel follow request:", error);
        }
    },

    // Accept request
    acceptFollowRequest: async (userId) => {
        try {
            const res = await axiosInstance.post(`/follow/accept/${userId}`);
            toast.success(res.data.message || "Contact request accepted");
            await get().checkAuth();
            await get().getAllUsers();
            await get().getFollowRequests();
            useChatStore.getState().getAllContacts();
            useChatStore.getState().getMyChatPartners();
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Failed to accept follow request");
            console.log("Error in accept follow request:", error);
        }
    },

    // Reject request
    rejectFollowRequest: async (userId) => {
        try {
            const res = await axiosInstance.post(`/follow/reject/${userId}`);
            toast.success(res.data.message || "Contact request rejected");
            await get().checkAuth();
            await get().getAllUsers();
            await get().getFollowRequests();
            useChatStore.getState().getAllContacts();
            useChatStore.getState().getMyChatPartners();
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Failed to reject follow request");
            console.log("Error in reject follow request:", error);
        }
    },

}))