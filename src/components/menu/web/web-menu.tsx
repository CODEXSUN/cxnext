"use client"

import * as React from "react"
import Link from "next/link"
import { CircleCheckIcon, CircleHelpIcon, CircleIcon, MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeSwitch } from "@/components/blocks/theme-switch" // Assume this is a custom theme toggle component
import { useAuth } from "@/global/auth/useAuth" // Assume a custom auth hook; replace with your implementation

import { useIsMobile } from "@/hooks/use-mobile"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const components: { title: string; href: string; description: string }[] = [
    {
        title: "Alert Dialog",
        href: "/docs/primitives/alert-dialog",
        description:
            "A modal dialog that interrupts the user with important content and expects a response.",
    },
    {
        title: "Hover Card",
        href: "/docs/primitives/hover-card",
        description:
            "For sighted users to preview content available behind a link.",
    },
    {
        title: "Progress",
        href: "/docs/primitives/progress",
        description:
            "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
    },
    {
        title: "Scroll-area",
        href: "/docs/primitives/scroll-area",
        description: "Visually or semantically separates content.",
    },
    {
        title: "Tabs",
        href: "/docs/primitives/tabs",
        description:
            "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
    },
    {
        title: "Tooltip",
        href: "/docs/primitives/tooltip",
        description:
            "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
    },
]

export function WebMenu() {
    const isMobile = useIsMobile()
    const { user, logout } = useAuth() // Assume hook returns user and logout function

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center w-full justify-between px-4">

                {/* Logo with Text - Left */}
                <div className="flex items-center space-x-2">
                    <Link href="/" className="flex items-center space-x-2">
                        {/* Add your logo SVG or image here */}
                        <span className="text-xl font-bold">CODEXSUN</span>
                        <span className="text-sm text-muted-foreground">ERP SOFTWARE</span>
                    </Link>
                </div>

                {/* Menu - Middle (Centered, hidden on mobile) */}
                <div className={`flex flex-1 items-center justify-center ${isMobile ? 'hidden' : ''}`}>
                    <NavigationMenu>
                        <NavigationMenuList className="flex-wrap">
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Home</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                        <li className="row-span-3">
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-4 no-underline outline-hidden transition-all duration-200 select-none focus:shadow-md md:p-6"
                                                    href="/"
                                                >
                                                    <div className="mb-2 text-lg font-medium sm:mt-4">
                                                        shadcn/ui
                                                    </div>
                                                    <p className="text-muted-foreground text-sm leading-tight">
                                                        Beautifully designed components built with Tailwind CSS.
                                                    </p>
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                        <ListItem href="/docs" title="Introduction">
                                            Re-usable components built using Radix UI and Tailwind CSS.
                                        </ListItem>
                                        <ListItem href="/docs/installation" title="Installation">
                                            How to install dependencies and structure your app.
                                        </ListItem>
                                        <ListItem href="/docs/primitives/typography" title="Typography">
                                            Styles for headings, paragraphs, lists...etc
                                        </ListItem>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                        {components.map((component) => (
                                            <ListItem
                                                key={component.title}
                                                title={component.title}
                                                href={component.href}
                                            >
                                                {component.description}
                                            </ListItem>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                    <Link href="/docs">Docs</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="hidden md:block">
                                <NavigationMenuTrigger>List</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[300px] gap-4">
                                        <li>
                                            <NavigationMenuLink asChild>
                                                <Link href="#">
                                                    <div className="font-medium">Components</div>
                                                    <div className="text-muted-foreground">
                                                        Browse all components in the library.
                                                    </div>
                                                </Link>
                                            </NavigationMenuLink>
                                            <NavigationMenuLink asChild>
                                                <Link href="#">
                                                    <div className="font-medium">Documentation</div>
                                                    <div className="text-muted-foreground">
                                                        Learn how to use the library.
                                                    </div>
                                                </Link>
                                            </NavigationMenuLink>
                                            <NavigationMenuLink asChild>
                                                <Link href="#">
                                                    <div className="font-medium">Blog</div>
                                                    <div className="text-muted-foreground">
                                                        Read our latest blog posts.
                                                    </div>
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="hidden md:block">
                                <NavigationMenuTrigger>Simple</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[200px] gap-4">
                                        <li>
                                            <NavigationMenuLink asChild>
                                                <Link href="#">Components</Link>
                                            </NavigationMenuLink>
                                            <NavigationMenuLink asChild>
                                                <Link href="#">Documentation</Link>
                                            </NavigationMenuLink>
                                            <NavigationMenuLink asChild>
                                                <Link href="#">Blocks</Link>
                                            </NavigationMenuLink>
                                        </li>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="hidden md:block">
                                <NavigationMenuTrigger>With Icon</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[200px] gap-4">
                                        <li>
                                            <NavigationMenuLink asChild>
                                                <Link href="#" className="flex items-center gap-2">
                                                    <CircleHelpIcon />
                                                    Backlog
                                                </Link>
                                            </NavigationMenuLink>
                                            <NavigationMenuLink asChild>
                                                <Link href="#" className="flex items-center gap-2">
                                                    <CircleIcon />
                                                    To Do
                                                </Link>
                                            </NavigationMenuLink>
                                            <NavigationMenuLink asChild>
                                                <Link href="#" className="flex items-center gap-2">
                                                    <CircleCheckIcon />
                                                    Done
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* Auth Buttons + Theme - Right */}
                <div className="flex items-center space-x-2">
                    {isMobile && (
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost">
                                    <MenuIcon className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="top" className="p-4">
                                <div className="flex flex-col space-y-4">
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="home">
                                            <AccordionTrigger>Home</AccordionTrigger>
                                            <AccordionContent>
                                                <ul className="grid gap-2">
                                                    <li className="row-span-3">
                                                        <NavigationMenuLink asChild>
                                                            <Link
                                                                className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-4 no-underline outline-hidden transition-all duration-200 select-none focus:shadow-md md:p-6"
                                                                href="/"
                                                            >
                                                                <div className="mb-2 text-lg font-medium sm:mt-4">
                                                                    shadcn/ui
                                                                </div>
                                                                <p className="text-muted-foreground text-sm leading-tight">
                                                                    Beautifully designed components built with Tailwind CSS.
                                                                </p>
                                                            </Link>
                                                        </NavigationMenuLink>
                                                    </li>
                                                    <ListItem href="/docs" title="Introduction">
                                                        Re-usable components built using Radix UI and Tailwind CSS.
                                                    </ListItem>
                                                    <ListItem href="/docs/installation" title="Installation">
                                                        How to install dependencies and structure your app.
                                                    </ListItem>
                                                    <ListItem href="/docs/primitives/typography" title="Typography">
                                                        Styles for headings, paragraphs, lists...etc
                                                    </ListItem>
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="components">
                                            <AccordionTrigger>Components</AccordionTrigger>
                                            <AccordionContent>
                                                <ul className="grid gap-2">
                                                    {components.map((component) => (
                                                        <ListItem
                                                            key={component.title}
                                                            title={component.title}
                                                            href={component.href}
                                                        >
                                                            {component.description}
                                                        </ListItem>
                                                    ))}
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="list">
                                            <AccordionTrigger>List</AccordionTrigger>
                                            <AccordionContent>
                                                <ul className="grid gap-4">
                                                    <li>
                                                        <NavigationMenuLink asChild>
                                                            <Link href="#">
                                                                <div className="font-medium">Components</div>
                                                                <div className="text-muted-foreground">
                                                                    Browse all components in the library.
                                                                </div>
                                                            </Link>
                                                        </NavigationMenuLink>
                                                        <NavigationMenuLink asChild>
                                                            <Link href="#">
                                                                <div className="font-medium">Documentation</div>
                                                                <div className="text-muted-foreground">
                                                                    Learn how to use the library.
                                                                </div>
                                                            </Link>
                                                        </NavigationMenuLink>
                                                        <NavigationMenuLink asChild>
                                                            <Link href="#">
                                                                <div className="font-medium">Blog</div>
                                                                <div className="text-muted-foreground">
                                                                    Read our latest blog posts.
                                                                </div>
                                                            </Link>
                                                        </NavigationMenuLink>
                                                    </li>
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="simple">
                                            <AccordionTrigger>Simple</AccordionTrigger>
                                            <AccordionContent>
                                                <ul className="grid gap-4">
                                                    <li>
                                                        <NavigationMenuLink asChild>
                                                            <Link href="#">Components</Link>
                                                        </NavigationMenuLink>
                                                        <NavigationMenuLink asChild>
                                                            <Link href="#">Documentation</Link>
                                                        </NavigationMenuLink>
                                                        <NavigationMenuLink asChild>
                                                            <Link href="#">Blocks</Link>
                                                        </NavigationMenuLink>
                                                    </li>
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="with-icon">
                                            <AccordionTrigger>With Icon</AccordionTrigger>
                                            <AccordionContent>
                                                <ul className="grid gap-4">
                                                    <li>
                                                        <NavigationMenuLink asChild>
                                                            <Link href="#" className="flex items-center gap-2">
                                                                <CircleHelpIcon />
                                                                Backlog
                                                            </Link>
                                                        </NavigationMenuLink>
                                                        <NavigationMenuLink asChild>
                                                            <Link href="#" className="flex items-center gap-2">
                                                                <CircleIcon />
                                                                To Do
                                                            </Link>
                                                        </NavigationMenuLink>
                                                        <NavigationMenuLink asChild>
                                                            <Link href="#" className="flex items-center gap-2">
                                                                <CircleCheckIcon />
                                                                Done
                                                            </Link>
                                                        </NavigationMenuLink>
                                                    </li>
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                    {/* Docs as direct link */}
                                    <Button variant="ghost" asChild className="w-full justify-start">
                                        <Link href="/docs">Docs</Link>
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}
                    {user ? (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={logout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/login">Login</Link>
                        </Button>
                    )}
                    <ThemeSwitch />
                </div>

            </div>
        </header>
    )
}

function ListItem({
                      title,
                      children,
                      href,
                      ...props
                  }: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
    return (
        <li {...props}>
            <NavigationMenuLink asChild>
                <Link href={href}>
                    <div className="text-sm leading-none font-medium">{title}</div>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    )
}