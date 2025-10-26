// app/users/page.tsx (Next.js Frontend)
'use client';

import { useState, useMemo } from 'react';
import axios from 'axios';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader } from "@/components/loader/loader"; // Assuming this is a spinner component

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
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableToolbar } from "@/components/table/data-table-toolbar";
import { DataTable } from "@/components/table/data-table";
import { DataTablePagination } from "@/components/table/data-table-pagination";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { IconDotsVertical } from "@tabler/icons-react";
import { Toaster } from "@/components/ui/toaster";
import UserDialog from './user-dialog';
import DeleteUserDialog from './delete-user-dialog';
import { useDebounce } from '@/hooks/use-debounce';

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
        id: "roles",
        accessorFn: (row) => row.roles?.[0]?.name ?? '',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => (
            <Badge variant="outline" className="text-muted-foreground px-1.5">
                {row.original.roles?.[0]?.name ?? ''}
            </Badge>
        ),
        enableSorting: false,
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
        cell: ({ row, table }) => (
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
                    <DropdownMenuItem onClick={() => (table.options.meta as any)?.onEdit(row.original)}>Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => (table.options.meta as any)?.onDelete(row.original)}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false,
    },
];

function UsersPageContent() {
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const debouncedGlobalFilter = useDebounce(globalFilter, 500); // Debounce search to prevent server calls on every keystroke
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [addOpen, setAddOpen] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [dialogQueryKey, setDialogQueryKey] = useState<any[]>([]);

    const queryKey = useMemo(
        () => [
            'users',
            debouncedGlobalFilter, // Use debounced value for query key
            JSON.stringify(sorting),
            JSON.stringify(columnFilters),
            pagination.pageIndex,
            pagination.pageSize,
        ],
        [debouncedGlobalFilter, sorting, columnFilters, pagination]
    );

    const fetchUsers = async () => {
        const sortBy = sorting[0]?.id || 'id';
        const sortDir = sorting[0]?.desc ? 'desc' : 'asc';
        let params: any = {
            search: debouncedGlobalFilter, // Use debounced value for server params
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

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey,
        queryFn: fetchUsers,
        keepPreviousData: true, // Optimization: Keep previous data while fetching new
    });

    const users = useMemo(() => [...(data?.data || [])], [data]);
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
        meta: {
            onEdit: (user: User) => {
                setEditUser(user);
                setDialogQueryKey(queryKey);
            },
            onDelete: (user: User) => {
                setDeleteUser(user);
                setDialogQueryKey(queryKey);
            },
        },
    });

    if (isLoading) return <Loader />;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="container mx-auto p-4">
            {isFetching && <Loader />}
            <h1 className="text-2xl font-bold mb-4">Users Management</h1>

            <DataTableToolbar
                table={table}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                onAddClick={() => {
                    setAddOpen(true);
                    setDialogQueryKey(queryKey);
                }}
            />

            <div className="overflow-hidden rounded-lg border">
                <DataTable table={table} />
            </div>

            <DataTablePagination table={table} />

            <UserDialog
                currentRow={editUser ?? undefined}
                open={addOpen || !!editUser}
                onOpenChange={(open) => {
                    if (!open) {
                        setAddOpen(false);
                        setEditUser(null);
                    }
                }}
                dialogQueryKey={dialogQueryKey}
            />
            {deleteUser && (
                <DeleteUserDialog
                    currentRow={deleteUser}
                    open={!!deleteUser}
                    onOpenChange={(open) => {
                        if (!open) {
                            setDeleteUser(null);
                        }
                    }}
                    dialogQueryKey={dialogQueryKey}
                />
            )}
            <Toaster />
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