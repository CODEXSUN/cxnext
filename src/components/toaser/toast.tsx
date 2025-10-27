// components/ui/toast.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { IconX } from "@tabler/icons-react"

const toastVariants = cva(
    "group pointer-events-auto relative flex items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
    {
        variants: {
            variant: {
                default: "border bg-background text-foreground",
                destructive:
                    "destructive group border-destructive bg-destructive text-destructive-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    duration?: number
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
    ({ className, variant, open, duration, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(toastVariants({ variant }), className)}
                data-state={open ? "open" : "closed"}
                {...props}
            >
                {children}
                {duration && duration !== Infinity && (
                    <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden">
                        <div
                            className="h-full w-full origin-left scale-x-100 bg-foreground animate-toast-progress"
                            style={{ animationDuration: `${duration}ms` }}
                        />
                    </div>
                )}
            </div>
        )
    }
)
Toast.displayName = "Toast"

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
}

const ToastViewport = React.forwardRef<
    HTMLOListElement,
    React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
    <ol
        ref={ref}
        className={cn(
            "fixed top-0 right-0 z-[100] flex max-h-screen w-auto flex-col p-4 gap-2 sm:right-0 sm:top-0 md:max-w-[420px]",
            className
        )}
        {...props}
    />
))
ToastViewport.displayName = "ToastViewport"

const ToastClose = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(
            "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
            className
        )}
        toast-close=""
        {...props}
    >
        <IconX className="h-4 w-4" />
    </button>
))
ToastClose.displayName = "ToastClose"

const ToastTitle = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm font-semibold", className)}
        {...props}
    />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm opacity-90", className)}
        {...props}
    />
))
ToastDescription.displayName = "ToastDescription"

const ToastAction = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(
            "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
            className
        )}
        {...props}
    />
))
ToastAction.displayName = "ToastAction"

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
    toastVariants,
    ToastProvider,
    Toast,
    ToastViewport,
    ToastClose,
    ToastTitle,
    ToastDescription,
    ToastAction,
}
export type { ToastActionElement }