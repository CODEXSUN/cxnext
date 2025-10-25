// components/table/data-table-column-header.tsx

import * as React from "react"
import {Column} from "@tanstack/react-table"

import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"

import {IconArrowDown, IconArrowUp, IconArrowsSort} from "@tabler/icons-react"

interface DataTableColumnHeaderProps<TData, TValue>
    extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>
    title: string
}

export function DataTableColumnHeader<TData, TValue>({
                                                         column,
                                                         title,
                                                         className,
                                                     }: DataTableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <div className={cn(className)}>{title}</div>
    }

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                {title}
                {column.getIsSorted() === "asc" ? (
                    <IconArrowDown className="ml-2 h-4 w-4"/>
                ) : column.getIsSorted() === "desc" ? (
                    <IconArrowUp className="ml-2 h-4 w-4"/>
                ) : (
                    <IconArrowsSort className="ml-2 h-4 w-4"/>
                )}
            </Button>
        </div>
    )
}