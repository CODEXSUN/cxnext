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
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
                setToken(savedToken);
            } catch {
                localStorage.removeItem("auth_user");
                localStorage.removeItem("auth_token");
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            setLoading(true);
            console.log('[AuthContext] Starting login...', { email });

            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Invalid credentials');
            }

            const data = await res.json();
            console.log('[AuthContext] Login response:', data);

            const mappedUser: User = {
                id: data.user.id.toString(),
                name: data.user.name,
                email: data.user.email,
                active: data.user.active ?? true,
                tenantId: data.user.tenant_id || "default",
                roles: data.user.roles || [],                    // ← Full role objects
                permissions: data.user.permissions || [],        // ← Full permissions array
                token: data.token,
            };

            setUser(mappedUser);
            setToken(data.token);
            localStorage.setItem("auth_user", JSON.stringify(mappedUser));
            localStorage.setItem("auth_token", data.token);
            console.log('[AuthContext] Auth saved:', mappedUser);
            return true;
        } catch (error) {
            console.error('[AuthContext] Login failed:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            if (token) {
                await fetch(`${API_URL}/logout`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
            }
        } catch (error) {
            console.error('[AuthContext] Logout API error:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem("auth_user");
            localStorage.removeItem("auth_token");
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}