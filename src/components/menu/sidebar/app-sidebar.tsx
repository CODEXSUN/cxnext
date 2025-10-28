"use client"

import * as React from "react"
import {
    IconDeviceTabletQuestion,
    IconDashboard,
    IconBriefcase,
    IconHelp,
    IconBrandCarbon,
    IconSearch,
    IconSettings,
    IconUsers,
    IconShieldLock,
} from "@tabler/icons-react"
import { ListTodo } from "lucide-react"

import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import { NavAdmin } from "./nav-admin"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/global/auth/useAuth"

const navMain = [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Enquiry", url: "/enquiry", icon: IconDeviceTabletQuestion },
    { title: "Job Manager", url: "/job-manager", icon: IconBriefcase },
    { title: "Todos", url: "/todos", icon: ListTodo },
]

const navAdmin = [
    { title: "Users", url: "/admin/users", icon: IconUsers },
    { title: "Credentials", url: "/credentials", icon: IconShieldLock },
]

const navSecondary = [
    { title: "Settings", url: "#", icon: IconSettings },
    { title: "Get Help", url: "#", icon: IconHelp },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user } = useAuth()

    // ── Fallback user (never null) ──
    const safeUser = user ?? {
        id: '',
        name: 'Guest',
        email: 'guest@example.com',
        avatar: undefined,
        roles: [],
    }

    // ── Check if user has admin role (by role.name) ──
    const isAdmin = user?.roles?.some(r => r.name === 'admin') ?? false

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                            <a href="/dashboard">
                                <IconBrandCarbon className="!size-5" />
                                <span className="text-base font-semibold">Codexsun</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} />
                {isAdmin && <NavAdmin items={navAdmin} />}
                <NavSecondary items={navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={safeUser} />
            </SidebarFooter>
        </Sidebar>
    )
}