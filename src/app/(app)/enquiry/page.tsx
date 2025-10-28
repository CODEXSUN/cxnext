// src/app/(app)/enquiry/page.tsx
'use client';

import { useState, useMemo } from 'react';
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
import { IconEye } from '@tabler/icons-react';
import { Toaster } from '@/components/ui/sonner';
import { useDebounce } from '@/hooks/use-debounce';
import { API_URL } from '@/config';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/global/auth/useAuth';   // <-- Hook stays here

const queryClient = new QueryClient();

/* ------------------------------------------------------------------
   1. API – GET (list) – **NO HOOKS** – pure function
   ------------------------------------------------------------------ */
async function fetchEnquiriesRaw(
    params: Record<string, any>,
    authHeaders: Record<string, string>
) {
    const url = `${API_URL}/enquiries?${new URLSearchParams(params).toString()}`;

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            ...authHeaders,
            Accept: 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
    });

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
        const text = await res.text();
        console.error('[fetchEnquiriesRaw] Non-JSON response:', text);
        throw new Error('Received HTML – check auth / CORS');
    }

    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? 'Failed to fetch');

    return json;   // { data: [...], meta: { … } }
}

/* ------------------------------------------------------------------
   2. Table columns (unchanged)
   ------------------------------------------------------------------ */
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
            <Button
                variant="ghost"
                size="icon"
                onClick={() => alert(`View #${row.original.id}`)}
            >
                <IconEye className="h-4 w-4" />
                <span className="sr-only">View</span>
            </Button>
        ),
    },
];

/* ------------------------------------------------------------------
   3. List component – **hooks are allowed here**
   ------------------------------------------------------------------ */
function EnquiryListPageContent() {
    const { headers } = useAuth();                     // <-- Hook is safe
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const debouncedGlobalFilter = useDebounce(globalFilter, 500);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
    const router = useRouter();

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
        const params: Record<string, any> = {
            search: debouncedGlobalFilter,
            sort_by: sortBy,
            sort_dir: sortDir,
            page: pagination.pageIndex + 1,
            per_page: pagination.pageSize,
        };
        columnFilters.forEach((f) => {
            params[`filter[${f.id}]`] = f.value;
        });

        return fetchEnquiriesRaw(params, headers());   // <-- pass headers
    };

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey,
        queryFn: fetchEnquiries,
        keepPreviousData: true,
    });

    const enquiries = useMemo(() => data?.data ?? [], [data]);
    const pageCount = useMemo(() => data?.meta?.last_page ?? 0, [data]);

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

    if (isLoading) return <Loader />;
    if (error) return <p className="text-red-600">Error: {(error as any).message}</p>;

    return (
        <div className="container mx-auto p-4 space-y-6">
            {isFetching && <Loader />}
            <DataTableToolbar
                table={table}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                onAddClick={() => router.push('/enquiry/create')}
                label="Enquiry"
            />

            <div className="overflow-hidden rounded-lg border">
                <DataTable table={table} />
            </div>

            <DataTablePagination table={table} />
            <Toaster />
        </div>
    );
}

/* ------------------------------------------------------------------
   4. Page wrapper
   ------------------------------------------------------------------ */
export default function EnquiryListPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <EnquiryListPageContent />
        </QueryClientProvider>
    );
}