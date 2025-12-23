import { create } from "zustand";

export type ErrorType = "rate_limit" | "unauthorized" | "server_error" | "connection_error";

interface ErrorState {
    isOpen: boolean;
    type: ErrorType | null;
    message: string;
    showError: (type: ErrorType, message: string) => void;
    closeError: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
    isOpen: false,
    type: null,
    message: "",
    showError: (type, message) => set({ isOpen: true, type, message }),
    closeError: () => set({ isOpen: false, type: null, message: "" }),
}));
