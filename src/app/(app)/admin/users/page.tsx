// app/users/page.tsx (Next.js Frontend)
'use client';

import { useState, useMemo } from 'react';
import axios from 'axios';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Loader } from "@/components/loader/loader";

import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableToolbar } from "@/components/table/data-table-toolbar"
import { DataTable } from "@/components/table/data-table"
import { DataTablePagination } from "@/components/table/data-table-pagination"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
import { IconDotsVertical } from "@tabler/icons-react"

const queryClient = new QueryClient();

interface User {
    id: number;
    name: string;
    email: string;
    roles?: { id: number; name: string }[]; // Made optional
    active: boolean;
}

const columns: ColumnDef<User>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => <div>{row.original.name}</div>,
    },
    {
        accessorKey: "email",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => <div>{row.original.email}</div>,
    },
    {
        accessorKey: "roles",
        header: "Roles",
        cell: ({ row }) => (
            <div className="flex flex-wrap gap-1">
                {row.original.roles?.map(role => (
                    <Badge key={role.id} variant="outline" className="text-muted-foreground px-1.5">
                        {role.name}
                    </Badge>
                )) ?? null}
            </div>
        ),
    },
    {
        accessorKey: "active",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Active" />
        ),
        cell: ({ row }) => (
            <Badge variant="outline" className="text-muted-foreground px-1.5">
                {row.original.active ? "Active" : "Inactive"}
            </Badge>
        ),
    },
    {
        id: "actions",
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                        size="icon"
                    >
                        <IconDotsVertical />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Make a copy</DropdownMenuItem>
                    <DropdownMenuItem>Favorite</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

function UsersPageContent() {
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const fetchUsers = async () => {
        const sortBy = sorting[0]?.id || 'id';
        const sortDir = sorting[0]?.desc ? 'desc' : 'asc';
        let params: any = {
            search: globalFilter,
            sort_by: sortBy,
            sort_dir: sortDir,
            page: pagination.pageIndex + 1,
            per_page: pagination.pageSize,
        };
        columnFilters.forEach((filter) => {
            params[`filter[${filter.id}]`] = filter.value;
        });
        const response = await axios.get('/api/users', {
            params,
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        });
        return response.data;
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ['users', globalFilter, JSON.stringify(sorting), JSON.stringify(columnFilters), pagination.pageIndex, pagination.pageSize],
        queryFn: fetchUsers,
    });

    const users = useMemo(() => data?.data || [], [data]);
    const pageCount = useMemo(() => data?.meta?.last_page || 0, [data]);

    const table = useReactTable({
        data: users,
        columns,
        pageCount,
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            globalFilter,
            pagination,
        },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    if (isLoading) return <Loader />;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">ERP Users Management</h1>

            <DataTableToolbar table={table} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />

            <div className="overflow-hidden rounded-lg border">
                <DataTable table={table} />
            </div>

            <DataTablePagination table={table} />
        </div>
    );
}

export default function UsersPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <UsersPageContent />
        </QueryClientProvider>
    );
}