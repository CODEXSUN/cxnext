// app/components/app-sidebar.tsx
"use client"

import * as React from "react"
import {
    IconCamera,
    IconDeviceTabletQuestion,
    IconDashboard,
    IconDatabase,
    IconFileAi,
    IconFileDescription,
    IconFileWord,
    IconBriefcase,
    IconHelp,
    IconBrandCarbon,
    IconReport,
    IconSearch,
    IconSettings,
    IconUsers,
    IconShieldLock,
} from "@tabler/icons-react"
import { ListTodo } from "lucide-react";

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

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: IconDashboard,
        },
        {
            title: "Enquiry",
            url: "/enquiry",
            icon: IconDeviceTabletQuestion,
        },
        {
            title: "Job Manager",
            url: "/job-manager",
            icon: IconBriefcase,
        },
        {
            title: "Todos",
            url: "/todos",
            icon: ListTodo,
        }
    ],
    navAdmin: [
        {
            title: "Users",
            url: "/admin/users",
            icon: IconUsers,
        },
        {
            title: "Credentials",
            url: "/credentials",
            icon: IconShieldLock,
        }
    ],
    navSecondary: [
        {
            title: "Settings",
            url: "#",
            icon: IconSettings,
        },
        {
            title: "Get Help",
            url: "#",
            icon: IconHelp,
        },
        {
            title: "Search",
            url: "#",
            icon: IconSearch,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a href="/dashboard">
                                <IconBrandCarbon className="!size-5" />
                                <span className="text-base font-semibold">Codexsun</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavAdmin items={data.navAdmin} /> {/* ← Only renders if admin */}
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}