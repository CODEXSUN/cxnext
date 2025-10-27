// components/table/data-table-toolbar.tsx
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { IconLayoutColumns, IconPlus } from "@tabler/icons-react"
import { Table as ReactTable } from "@tanstack/react-table"
import {MixerHorizontalIcon} from "@radix-ui/react-icons";

export function DataTableToolbar<TData>({
                                            table,
                                            globalFilter,
                                            setGlobalFilter,
                                            onAddClick,
                                            label
                                        }: {
    table: ReactTable<TData>;
    globalFilter: string;
    setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
    onAddClick: () => void;
    label: string;
}) {
    return (
        <div className="flex items-center justify-between px-4 lg:px-6 mb-4">
            <Input
                placeholder="Search users..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="max-w-sm"
            />
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant='outline'
                            size='sm'
                            className='ms-auto hidden h-8 lg:flex'
                        >
                            <MixerHorizontalIcon className='size-4' />
                            View
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {table
                            .getAllColumns()
                            .filter(
                                (column) =>
                                    typeof column.accessorFn !== "undefined" &&
                                    column.getCanHide()
                            )
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={onAddClick}>
                    <IconPlus className="mr-1 h-4 w-4" />
                    <span className="hidden lg:inline">Add {label}</span>
                </Button>
            </div>
        </div>
    );
}