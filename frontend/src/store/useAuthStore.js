import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import {toast} from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

//state refers to an object that holds information about a component's current situation or condition.
export const useAuthStore=create((set,get)=>({
    authUser:null,
    isCheckingAuth:true,

    isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,

    onlineUsers:[],

    socket:null,
    
    checkAuth:async()=>{
        try {
            const res=await axiosInstance.get("/auth/check");

            set({authUser:res.data});

            get().connectSocket();
        } catch (error) {
            set({authUser:null});
            console.log("Error in checkAuth:",error);
        } finally{
            set({isCheckingAuth:false});
        }
    },

    signup: async(data)=>{
        try {
            set({isSigningUp:true});
            const res=await axiosInstance.post("/auth/signup",data);
            set({authUser:res.data});
            toast.success("Account created successfully");

            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
            set({authUser:null});
            console.log("Error in signup:",error);
        } finally{
            set({isSigningUp:false});
        }
    },

    login: async(data)=>{
        try {
            set({isLoggingIn:true});
            const res=await axiosInstance.post("/auth/login",data);
            set({authUser:res.data});
            toast.success("LoggedIn successfully");

            get().connectSocket();
        } catch (error) {
            
            set({authUser:null});
            console.log("Error in login:",error);
            toast.error(error.response.data.message);
        } finally{
            set({isLoggingIn:false});
        }
    },

    logout: async()=>{
        try {
            const res=await axiosInstance.post("/auth/logout");
            set({authUser:null});
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
            set({authUser:null});
            console.log("Error in logout:",error);
        }
    },

    updateProfile: async(data)=>{
        set({isUpdatingProfile:true});
        try {
            const res=await axiosInstance.put("/auth/update-profile",data);
            set({authUser:res.data});
            toast.success("profile pic updated successfully");
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("Error in update-profile:",error);
        } finally{
            set({isUpdatingProfile:false});
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;
    
        const socket = io(BASE_URL, {
          query: {
            userId: authUser._id,
          },
        });
        socket.connect();
    
        set({ socket: socket });
    
        socket.on("getOnlineUsers", (userIds) => {
          set({ onlineUsers: userIds });
        });
      },
      disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
      },
}));