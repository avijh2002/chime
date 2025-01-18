import { create } from "zustand";

//state refers to an object that holds information about a component's current situation or condition.
export const useThemeStore=create((set)=>({
    theme:localStorage.getItem("chat-theme")||"dark",
    setTheme:(theme)=>{
        localStorage.setItem("chat-theme",theme),
        set({theme})
    }
}));