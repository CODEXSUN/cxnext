// app/components/nav-user.tsx
"use client"

import {
    IconCreditCard,
    IconDotsVertical,
    IconLogout,
    IconNotification,
    IconUserCircle,
    IconRefresh,
} from "@tabler/icons-react"
import { useState } from "react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/global/auth/useAuth"

export function NavUser({
                            user,
                        }: {
    user: {
        name: string
        email: string
        avatar?: string
    }
}) {
    const { isMobile } = useSidebar()
    const { logout, refetch } = useAuth()
    const [isRefreshing, setIsRefreshing] = useState(false)

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

    const initials = getInitials(user.name)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await refetch() // ← silent validate + refresh page
        setIsRefreshing(false)
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-medium">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user.name}</span>
                                <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                            </div>
                            <IconDotsVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-medium">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem className="cursor-pointer"><IconUserCircle /> Account</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer"><IconNotification /> Notifications</DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={ h => h.preventDefault() } disabled={isRefreshing}>
                            <IconRefresh className={isRefreshing ? "animate-spin" : ""} />
                            <button onClick={handleRefresh} className="w-full text-left cursor-pointer">
                                {isRefreshing ? "Refreshing..." : "Reload Session"}
                            </button>
                        </DropdownMenuItem>
                        <DropdownMenuItem  className="cursor-pointer" onSelect={logout}>
                            <IconLogout />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}