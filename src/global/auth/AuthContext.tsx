// app/global/auth/AuthContext.tsx
'use client'

import React, { useState, ReactNode, useEffect } from "react";
import { AuthContext, User } from "./AuthContextTypes";
import { API_URL } from "@/config";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem("auth_user");
        const savedToken = localStorage.getItem("auth_token");
        if (savedUser && savedToken) {
            try {
                setUser(JSON.parse(savedUser));
                setToken(savedToken);
            } catch {
                localStorage.removeItem("auth_user");
                localStorage.removeItem("auth_token");
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            console.log('[AuthContext] Starting login...', { email });
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Invalid credentials');
            }

            const data = await res.json();
            console.log('[AuthContext] Login response:', data);

            const mappedUser: User = {
                id: data.user.id.toString(),
                username: data.user.name || "Unknown",  // Use name from backend
                email: data.user.email,
                tenantId: data.user.tenant_id || "default",  // Default if not present
                roles: data.user.roles?.map((role: any) => role.name) || [],  // Extract role names
                token: data.token,  // Correct: from data.token
            };

            setUser(mappedUser);
            setToken(data.token);
            localStorage.setItem("auth_user", JSON.stringify(mappedUser));
            localStorage.setItem("auth_token", data.token);
            console.log('[AuthContext] User and token stored in localStorage:', mappedUser);
            setLoading(false);
            return true;
        } catch (error) {
            setLoading(false);
            console.error('[AuthContext] Login error:', error instanceof Error ? error.message : 'Unknown error', { email });
            return false;
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            console.log('[AuthContext] Starting logout...');
            if (token) {
                const res = await fetch(`${API_URL}/logout`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Logout failed');
                }
                console.log('[AuthContext] Backend logout successful.');
            }
            setUser(null);
            setToken(null);
            localStorage.removeItem("auth_user");
            localStorage.removeItem("auth_token");
            console.log('[AuthContext] LocalStorage cleared.');
        } catch (error) {
            console.error('[AuthContext] Logout error:', error instanceof Error ? error.message : 'Unknown error');
            setUser(null);
            setToken(null);
            localStorage.removeItem("auth_user");
            localStorage.removeItem("auth_token");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}