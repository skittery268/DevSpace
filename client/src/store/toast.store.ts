"use client";

import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export interface Toast {
    id: string;
    tone: ToastTone;
    title: string;
    description?: string;
}

interface ToastState {
    toasts: Toast[];
    push: (toast: Omit<Toast, "id">) => string;
    dismiss: (id: string) => void;
}

let counter = 0;

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    push: (toast) => {
        const id = `toast-${++counter}`;
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
        return id;
    },
    dismiss: (id) =>
        set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

/** Imperative helpers for mutation callbacks, where hooks are not available. */
export const toast = {
    success: (title: string, description?: string) =>
        useToastStore.getState().push({ tone: "success", title, description }),
    error: (title: string, description?: string) =>
        useToastStore.getState().push({ tone: "error", title, description }),
    info: (title: string, description?: string) =>
        useToastStore.getState().push({ tone: "info", title, description }),
};
