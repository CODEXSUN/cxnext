"use client";

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react";
import Link from "next/link"; // Import Next.js Link for client-side navigation
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
    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center gap-2">
                        {/* Quick Create Button – wrap with Link if you want it to navigate */}
                        <Link href="/create" passHref legacyBehavior>
                            <SidebarMenuButton
                                asChild // Important: allows the button to be wrapped by Link
                                tooltip="Quick Create"
                                className="bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                            >
                                <a>
                                    <IconCirclePlusFilled />
                                    <span>Quick Create</span>
                                </a>
                            </SidebarMenuButton>
                        </Link>

                        {/* Inbox Button – optional: make it a link too */}
                        <Link href="/inbox" passHref legacyBehavior>
                            <Button
                                asChild
                                size="icon"
                                className="size-8 group-data-[collapsible=icon]:opacity-0"
                                variant="outline"
                            >
                                <a>
                                    <IconMail />
                                    <span className="sr-only">Inbox</span>
                                </a>
                            </Button>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>

                {/* Dynamic Menu Items – now fully linked */}
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <Link href={item.url} passHref legacyBehavior>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                >
                                    <a>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </a>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}