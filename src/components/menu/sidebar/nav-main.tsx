// nav-main.tsx (Quick Create: Full Width | White Hover Text | Inbox Removed | CODEXSUN ERP)
"use client";

import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    const pathname = usePathname();

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    <SidebarMenuItem>

                        <Link href={"/create"} className="flex-1">
                            <SidebarMenuButton
                                asChild
                                tooltip="Quick Create"
                                className="
                  bg-primary text-primary-foreground
                  hover:bg-primary/70 hover:text-white/80
                  active:bg-primary/80 active:text-white/80
                  w-full justify-start h-8 px-2.5
                  duration-200 ease-linear
                  font-medium
                "
                            >
                <span className="flex items-center gap-2 w-full h-full">
                  <IconCirclePlusFilled className="size-4 shrink-0" />
                  <span className="truncate">Quick Create</span>
                </span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>

                {/* Dynamic Menu Items */}
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