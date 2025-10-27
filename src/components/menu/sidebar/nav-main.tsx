// nav-main.tsx (FINAL: Darker Hover + Active | Auto Active State | CODEXSUN ERP)
"use client";

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // ← Auto-detect active route
import { Button } from "@/components/ui/button";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
                            items,
                        }: {
    items: {
        title: string;
        url: string;
        icon?: Icon;
    }[];
}) {
    const pathname = usePathname(); // ← Real-time active state (no refresh needed)

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center gap-2">
                        <Link href={"/dashboard"} passHref legacyBehavior>
                            <SidebarMenuButton
                                asChild
                                tooltip="Quick Create"
                                className="bg-primary text-primary-foreground hover:bg-primary/80 active:bg-primary/70 min-w-8 duration-200 ease-linear"
                            >
                                <a>
                                    <IconCirclePlusFilled />
                                    <span>Quick Create</span>
                                </a>
                            </SidebarMenuButton>
                        </Link>

                        <Link href={'/inbox'} passHref>
                            <Button
                                asChild
                                size="icon"
                                variant="outline"
                                className="size-8 group-data-[collapsible=icon]:opacity-0 hover:bg-accent/70"
                            >
                                <a>
                                    <IconMail />
                                    <span className="sr-only">Inbox</span>
                                </a>
                            </Button>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>

                {/* Dynamic Menu: Darker Hover + Active + Auto Update */}
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = pathname === item.url;

                        return (
                            <SidebarMenuItem key={item.title}>
                                <Link href={item.url} passHref>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={isActive}
                                        className={`
                      relative overflow-hidden rounded-md
                      transition-all duration-200 ease-out
                      /* Base */
                      hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground
                      data-[active=true]:bg-sidebar-accent/50 data-[active=true]:text-sidebar-accent-foreground
                      data-[active=true]:font-bold data-[active=true]:shadow-md
                      /* Darker Overlay Effect */
                      after:absolute after:inset-0 after:transition-opacity after:duration-200 after:pointer-events-none after:rounded-md
                      hover:after:bg-black/20 hover:after:opacity-100
                      data-[active=true]:after:bg-black/10 data-[active=true]:after:opacity-100
                      /* Icon Fix */
                      [&>svg]:shrink-0 [&>svg]:transition-colors [&>svg]:duration-200
                      [&>svg]:text-sidebar-foreground/80
                      hover:[&>svg]:text-sidebar-accent-foreground
                      data-[active=true]:[&>svg]:text-sidebar-accent-foreground
                    `}
                                    >
                                        <a className="relative z-10 flex items-center gap-2 w-full h-full px-2 py-1.5">
                                            {item.icon && <item.icon className="size-4" />}
                                            <span>{item.title}</span>
                                        </a>
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