// app/global/auth/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "./AuthContextTypes";
import { API_URL } from "@/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRefetch } from "./useRefetch";

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    const router = useRouter();

    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");

    const headers = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ctx.token}`,
        ...(ctx.user?.tenantId ? { 'x-tenant-id': `${ctx.user.tenantId}` } : {}),
        'x-user-id': `${ctx.user?.id || ''}`,
    });

    // ── Refetch with router ──
    const { refetch } = useRefetch(ctx.token, ctx.user, ctx.setUser, router);

    const logout = async () => {
        try {
            if (ctx.token) {
                await fetch(`${API_URL}/logout`, {
                    method: "POST",
                    headers: headers(),
                    credentials: 'include',
                });
            }
        } catch (err) {
            console.error('[useAuth] Logout failed:', err);
        } finally {
            ctx.logout();
            localStorage.clear();
            toast.success("Logged out");
            router.push("/");
        }
    };

    return {
        ...ctx,
        API_URL,
        headers,
        logout,
        refetch,
        hasRole: (roleName: string) =>
            ctx.user?.roles.some(r => r.name === roleName) ?? false,
        hasPermission: (permission: string) =>
            ctx.user?.permissions.includes(permission) ?? false,
    };
};