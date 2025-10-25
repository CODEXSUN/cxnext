// app/dashboard/layout.tsx
'use client'

import React, {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/global/auth/useAuth";
import Loader from "@/components/loader/loader";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/menu/sidebar/app-sidebar";
import {SiteHeader} from "@/components/menu/sidebar/site-header"


export default function ProtectedLayout({children}: { children: React.ReactNode }) {
    const {user, loading} = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    if (loading) {
        return <Loader/>;
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="inset"/>
                <SidebarInset>
                    <SiteHeader/>
                    <main className="flex-1 px-3 overflow-auto">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}