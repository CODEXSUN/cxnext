"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Bell, LogOut, Search, Sun, Moon } from "lucide-react"
import { useAuth } from "@/global/auth/useAuth"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../ui/avatar"
import { Button } from "../../ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { Input } from "../../ui/input"
import { cn } from "@/lib/utils"

export function TopMenu() {
    const { user, logout } = useAuth()
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        const savedTheme = localStorage.getItem('theme')
        return savedTheme
            ? savedTheme === 'dark'
            : window.matchMedia('(prefers-color-scheme: dark)').matches
    })

    useEffect(() => {
        const theme = isDarkMode ? 'dark' : 'light'
        document.documentElement.classList.toggle('dark', isDarkMode)
        localStorage.setItem('theme', theme)
    }, [isDarkMode])

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev)
    }

    // Fallback user data if user is not yet loaded
    const fallbackUser = {
        name: "User",
        email: "user@example.com",
        avatar: "/avatars/user.jpg",
    }

    const currentUser = user || fallbackUser

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 flex h-16 items-center bg-background dark:bg-slate-900 text-foreground dark:text-slate-100 px-4 sm:px-6 border-b-2 border-border/50 dark:border-slate-800/50 shadow-sm"
            )}
        >
            {/* Left: Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-xl font-bold tracking-tight">Codexsun</div>
            </div>

            {/* Right: Search, Notification, User Dropdown, Theme Switch */}
            <div className="flex items-center gap-3 ml-auto">
                {/* Global Search */}
                <div className="hidden sm:block max-w-sm w-full">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search..."
                            className="pl-8 bg-background dark:bg-slate-800 border-border dark:border-slate-700 h-9 rounded-md"
                        />
                    </div>
                </div>

                {/* Notification */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-md hover:bg-accent dark:hover:bg-slate-800"
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-accent dark:hover:bg-slate-800"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                <AvatarFallback className="bg-muted text-muted-foreground dark:bg-slate-700 dark:text-slate-300">
                                    {currentUser.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56 bg-background dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                        align="end"
                        forceMount
                    >
                        <DropdownMenuLabel className="font-normal dark:text-slate-300">
                            <div className="flex flex-col space-y-1">
                                {/*<p className="text-sm font-medium leading-none">{currentUser.name}</p>*/}
                                <p className="text-xs leading-none text-muted-foreground dark:text-slate-400">
                                    {currentUser.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="dark:bg-slate-700" />
                        <DropdownMenuItem
                            onClick={logout}
                            className="dark:hover:bg-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme Switch */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="rounded-md hover:bg-accent dark:hover:bg-slate-800"
                    aria-label="Toggle theme"
                >
                    {isDarkMode ? (
                        <Sun className="h-5 w-5" />
                    ) : (
                        <Moon className="h-5 w-5" />
                    )}
                </Button>
            </div>
        </header>
    )
}