// app/global/auth/AuthContextTypes.ts
import React from "react";

export interface Role {
    id: number;
    name: string;
}

export interface User {
    id: string;
    name: string;          // ← Updated from `username` to `name`
    email: string;
    active: boolean;       // ← Added from API
    tenantId?: string;     // Optional
    roles: Role[];         // ← Full role objects
    permissions: string[]; // ← All permission names
    token: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType | null>(null);