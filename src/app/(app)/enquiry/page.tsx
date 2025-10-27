// src/app/(app)/enquiry/page.tsx
'use client';

import { useState, useMemo } from 'react';
import axios from 'axios';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Loader } from '@/components/loader/loader';
import {
    ColumnDef,
    ColumnFiltersState,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableToolbar } from '@/components/table/data-table-toolbar';
import { DataTable } from '@/components/table/data-table';
import { DataTablePagination } from '@/components/table/data-table-pagination';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { IconEye, IconPlus } from '@tabler/icons-react';
import { Toaster } from '@/components/ui/sonner';
import { useDebounce } from '@/hooks/use-debounce';
import Link from 'next/link';
import {API_URL} from "@/config";

const queryClient = new QueryClient();

// ---------------------------------------------------------------------
// 1. Embedded API – GET (list) + POST (create)
// ---------------------------------------------------------------------
async function getEnquiries(params: any) {
    const res = await fetch(`${API_URL}/enquiries?${new URLSearchParams(params).toString()}`, {
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
}

async function createEnquiry(data: any) {
    const res = await fetch(`${API_URL}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create');
    }
    return res.json();
}

// ---------------------------------------------------------------------
// 2. Table columns
// ---------------------------------------------------------------------
interface Enquiry {
    id: number;
    contact: {
        id: number;
        name: string;
        phone: string;
        contact_code: string;
    };
    query: string;
    status: string;
    created_at: string;
}

const columns: ColumnDef<Enquiry>[] = [
    {
        accessorKey: 'contact.contact_code',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
        cell: ({ row }) => <div className="font-mono">{row.original.contact.contact_code}</div>,
    },
    {
        accessorKey: 'contact.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
        cell: ({ row }) => <div>{row.original.contact.name}</div>,
    },
    {
        accessorKey: 'contact.phone',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
        cell: ({ row }) => <div>{row.original.contact.phone}</div>,
    },
    {
        accessorKey: 'query',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Query" />,
        cell: ({ row }) => (
            <div className="max-w-xs truncate" title={row.original.query}>
                {row.original.query}
            </div>
        ),
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => (
            <Badge
                variant={
                    row.original.status === 'open'
                        ? 'default'
                        : row.original.status === 'in_progress'
                            ? 'secondary'
                            : 'outline'
                }
            >
                {row.original.status.replace('_', ' ')}
            </Badge>
        ),
        filterFn: 'equals',
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted" />,
        cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <Button variant="ghost" size="icon" onClick={() => alert(`View #${row.original.id}`)}>
                <IconEye className="h-4 w-4" />
                <span className="sr-only">View</span>
            </Button>
        ),
    },
];

// ---------------------------------------------------------------------
// 3. List component
// ---------------------------------------------------------------------
function EnquiryListPageContent() {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const debouncedGlobalFilter = useDebounce(globalFilter, 500);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

    const queryKey = useMemo(
        () => [
            'enquiries',
            debouncedGlobalFilter,
            JSON.stringify(sorting),
            JSON.stringify(columnFilters),
            pagination.pageIndex,
            pagination.pageSize,
        ],
        [debouncedGlobalFilter, sorting, columnFilters, pagination]
    );

    const fetchEnquiries = async () => {
        const sortBy = sorting[0]?.id || 'id';
        const sortDir = sorting[0]?.desc ? 'desc' : 'asc';
        const params: any = {
            search: debouncedGlobalFilter,
            sort_by: sortBy,
            sort_dir: sortDir,
            page: pagination.pageIndex + 1,
            per_page: pagination.pageSize,
        };
        columnFilters.forEach((f) => {
            params[`filter[${f.id}]`] = f.value;
        });
        return getEnquiries(params);
    };

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey,
        queryFn: fetchEnquiries,
        keepPreviousData: true,
    });

    const enquiries = useMemo(() => data?.data || [], [data]);
    const pageCount = useMemo(() => data?.meta?.last_page || 0, [data]);

    const table = useReactTable({
        data: enquiries,
        columns,
        pageCount,
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        state: {
            sorting,
            columnVisibility,
            columnFilters,
            globalFilter,
            pagination,
        },
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

    // -----------------------------------------------------------------
    // 4. Create handler (used by the "Add" button → redirect)
    // -----------------------------------------------------------------
    const handleCreate = async (formData: any) => {
        await createEnquiry(formData);
        queryClient.invalidateQueries({ queryKey: ['enquiries'] });
    };

    if (isLoading) return <Loader />;
    if (error) return <p className="text-red-600">Error: {(error as any).message}</p>;

    return (
        <div className="container mx-auto p-4 space-y-6">
            {isFetching && <Loader />}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Enquiries</h1>
                <Link href="/enquiry/create">
                    <Button>
                        <IconPlus className="mr-2 h-4 w-4" /> Add Enquiry
                    </Button>
                </Link>
            </div>

            <DataTableToolbar table={table} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />

            <div className="overflow-hidden rounded-lg border">
                <DataTable table={table} />
            </div>

            <DataTablePagination table={table} />
            <Toaster />
        </div>
    );
}

// ---------------------------------------------------------------------
// 5. Page wrapper
// ---------------------------------------------------------------------
export default function EnquiryListPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <EnquiryListPageContent />
        </QueryClientProvider>
    );
}