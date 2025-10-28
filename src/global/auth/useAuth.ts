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
        // Helper: Check role
        hasRole: (roleName: string) =>
            ctx.user?.roles.some(r => r.name === roleName) ?? false,
        // Helper: Check permission
        hasPermission: (permission: string) =>
            ctx.user?.permissions.includes(permission) ?? false,
        // Helper: Check any of roles
        hasAnyRole: (roles: string[]) =>
            roles.some(role => ctx.user?.roles.some(r => r.name === role)) ?? false,
        // Helper: Check any of permissions
        hasAnyPermission: (permissions: string[]) =>
            permissions.some(p => ctx.user?.permissions.includes(p)) ?? false,
    };
};