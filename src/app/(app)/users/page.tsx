"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { IconDotsVertical, IconPlus, IconTrash, IconPencil } from "@tabler/icons-react"

export const userSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
    created_at: z.string(),
})

type User = z.infer<typeof userSchema>

const columns: ColumnDef<User>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <div>{row.original.id}</div>,
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <div>{row.original.name}</div>,
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <div>{row.original.email}</div>,
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
            <Badge variant="outline" className="text-muted-foreground px-1.5">
                {row.original.role}
            </Badge>
        ),
    },
    {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => <div>{new Date(row.original.created_at).toLocaleDateString()}</div>,
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <UserActions user={row.original} onUpdate={handleUpdate} onDelete={handleDelete} />
        ),
    },
]

async function fetchUsers(): Promise<User[]> {
    const response = await fetch("/api/users", {
        headers: {
            "Content-Type": "application/json",
            // Add auth token if using Sanctum: Authorization: `Bearer ${token}`
        },
    })
    if (!response.ok) {
        throw new Error("Failed to fetch users")
    }
    return response.json()
}

async function createUser(data: Partial<User>): Promise<User> {
    const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        throw new Error("Failed to create user")
    }
    return response.json()
}

async function updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        throw new Error("Failed to update user")
    }
    return response.json()
}

async function deleteUser(id: number): Promise<void> {
    const response = await fetch(`/api/users/${id}`, { method: "DELETE" })
    if (!response.ok) {
        throw new Error("Failed to delete user")
    }
}

function UserForm({
                      user,
                      onSubmit,
                  }: {
    user?: User
    onSubmit: (data: Partial<User>) => void
}) {
    const [name, setName] = React.useState(user?.name || "")
    const [email, setEmail] = React.useState(user?.email || "")
    const [role, setRole] = React.useState(user?.role || "user")
    const [password, setPassword] = React.useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({ name, email, role, password })
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {!user && (
                <div className="flex flex-col gap-3">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                </div>
            )}
            <div className="flex flex-col gap-3">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button type="submit">Submit</Button>
        </form>
    )
}

function UserActions({
                         user,
                         onUpdate,
                         onDelete,
                     }: {
    user: User
    onUpdate: (id: number) => void
    onDelete: (id: number) => void
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <IconDotsVertical />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onUpdate(user.id)}>
                    <IconPencil className="mr-2 size-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(user.id)}>
                    <IconTrash className="mr-2 size-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function UsersTable() {
    const [data, setData] = React.useState<User[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [isEditOpen, setIsEditOpen] = React.useState(false)
    const [selectedUser, setSelectedUser] = React.useState<User | undefined>()

    React.useEffect(() => {
        async function loadUsers() {
            try {
                const users = await fetchUsers()
                setData(users)
            } catch (error) {
                toast.error("Error loading users")
            } finally {
                setIsLoading(false)
            }
        }
        loadUsers()
    }, [])

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            pagination,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        globalFilterFn: "includesString",
        onGlobalFilterChange: setGlobalFilter,
    })

    const handleCreate = async (formData: Partial<User>) => {
        try {
            const newUser = await createUser(formData)
            setData([...data, newUser])
            setIsCreateOpen(false)
            toast.success("User created")
        } catch (error) {
            toast.error("Error creating user")
        }
    }

    const handleUpdate = (id: number) => {
        const user = data.find((u) => u.id === id)
        setSelectedUser(user)
        setIsEditOpen(true)
    }

    const handleEditSubmit = async (formData: Partial<User>) => {
        if (!selectedUser) return
        try {
            const updatedUser = await updateUser(selectedUser.id, formData)
            setData(data.map((u) => (u.id === selectedUser.id ? updatedUser : u)))
            setIsEditOpen(false)
            toast.success("User updated")
        } catch (error) {
            toast.error("Error updating user")
        }
    }

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this user?")) {
            try {
                await deleteUser(id)
                setData(data.filter((u) => u.id !== id))
                toast.success("User deleted")
            } catch (error) {
                toast.error("Error deleting user")
            }
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <Input
                    placeholder="Search users..."
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-64"
                />
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <IconPlus className="mr-2" />
                            Create User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create User</DialogTitle>
                            <DialogDescription>Fill in the details to create a new user.</DialogDescription>
                        </DialogHeader>
                        <UserForm onSubmit={handleCreate} />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Update the user details.</DialogDescription>
                    </DialogHeader>
                    <UserForm user={selectedUser} onSubmit={handleEditSubmit} />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}