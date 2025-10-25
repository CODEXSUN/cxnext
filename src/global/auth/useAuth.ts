// app/global/auth/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "./AuthContextTypes";
import { API_URL } from "@/config";

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return {
        ...ctx,
        API_URL,
        headers: () => ({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ctx.token}`,
            ...(ctx.user?.tenantId ? { 'x-tenant-id': `${ctx.user.tenantId}` } : {}),
            'x-user-id': `${ctx.user?.id}`,
        }),
    };
};