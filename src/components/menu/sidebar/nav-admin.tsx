// app/components/nav-admin.tsx
"use client";

import { type LucideIcon } from "lucide-react";
import { type Icon } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/global/auth/useAuth";

type NavItemIcon = Icon | LucideIcon;

export function NavAdmin({
                             items,
                         }: {
    items: {
        title: string;
        url: string;
        icon?: NavItemIcon;
    }[];
}) {
    const { hasRole } = useAuth();
    const pathname = usePathname();

    // Hide entire NavAdmin if user is not admin
    if (!hasRole("admin")) {
        return null;
    }

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = pathname === item.url;

                        return (
                            <SidebarMenuItem key={item.title}>
                                <Link href={item.url} className="w-full">
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={isActive}
                                        className={`
                      relative overflow-hidden rounded-md w-full
                      transition-all duration-200 ease-out
                      hover:bg-sidebar-accent/85 hover:text-sidebar-accent-foreground
                      data-[active=true]:bg-sidebar-accent/95 data-[active=true]:text-sidebar-accent-foreground
                      data-[active=true]:font-bold data-[active=true]:shadow-md
                      after:absolute after:inset-0 after:transition-opacity after:duration-200 after:pointer-events-none after:rounded-md
                      hover:after:bg-black/25 hover:after:opacity-100
                      data-[active=true]:after:bg-black/35 data-[active=true]:after:opacity-100
                      [&>svg]:shrink-0 [&>svg]:transition-colors [&>svg]:duration-200
                      [&>svg]:text-sidebar-foreground/80
                      hover:[&>svg]:text-sidebar-accent-foreground
                      data-[active=true]:[&>svg]:text-sidebar-accent-foreground
                    `}
                                    >
                                        <span className="flex items-center gap-2 w-full h-8 px-2">
                                            {item.icon && <item.icon className="size-4" />}
                                            <span className="truncate">{item.title}</span>
                                        </span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}