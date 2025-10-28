// app/global/auth/useRefetch.ts
import { API_URL } from "@/config";
import { toast } from "sonner";

export const useRefetch = (
    token: string | null,
    user: any,
    setUser: (u: any) => void,
    router: any
) => {
    const refetch = async () => {
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/user`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (res.ok) {
                const payload = await res.json();
                const apiUser = payload.data; // ← Laravel: { data: { … } }

                if (!apiUser) throw new Error("Invalid response");

                const freshUser = {
                    id: apiUser.id.toString(),
                    name: apiUser.name,
                    email: apiUser.email,
                    active: apiUser.active ?? true,
                    tenantId: apiUser.tenant_id || "default",
                    roles: apiUser.roles || [],
                    permissions: apiUser.permissions || [],
                    token,
                };

                setUser(freshUser);
                localStorage.setItem("auth_user", JSON.stringify(freshUser));
                toast.success("Session refreshed");

                // ── Soft refresh current page ──
                router.refresh();
            } else {
                throw new Error("Invalid token");
            }
        } catch (err) {
            console.error('[useRefetch] Failed:', err);
            localStorage.clear();
            setUser(null);
            toast.error("Session expired. Redirecting to login...");
            router.push("/login");
        }
    };

    return { refetch };
};