// components/users/delete-user-dialog.tsx
'use client'

import { useState } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'

interface User {
    id: number;
    name: string;
    email: string;
    roles?: { id: number; name: string }[];
    active: boolean;
}

type DeleteUserDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: User
}

export function DeleteUserDialog({
                                     open,
                                     onOpenChange,
                                     currentRow,
                                 }: DeleteUserDialogProps) {
    const [value, setValue] = useState('')
    const token = localStorage.getItem('auth_token')
    const [error, setError] = useState<string | null>(null)
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const handleDelete = async () => {
        if (value.trim() !== currentRow.name) return
        if (!token) {
            setError('Authentication required')
            return
        }

        try {
            const response = await fetch(`/api/users/${currentRow.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                toast({ title: 'User deleted successfully' })
                queryClient.invalidateQueries({ queryKey: ['users'] })
                onOpenChange(false)
                setValue('')
                setError(null)
            } else {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(`Failed to delete user: ${errorData.error || response.statusText}`)
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            setError(message)
            toast({ title: 'Error', description: message, variant: 'destructive' })
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                onOpenChange(isOpen)
                if (!isOpen) {
                    setValue('')
                    setError(null)
                }
            }}
        >
            <DialogContent className='sm:max-w-md'>
                <DialogHeader className='text-start'>
                    <DialogTitle className='flex items-center gap-2 text-destructive'>
                        <IconAlertTriangle className='me-1' size={18} />
                        Delete User
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <span className='font-bold'>{currentRow.name}</span>?
                        <br />
                        This action will permanently remove the user with the role of <span className='font-bold'>{currentRow.roles?.[0]?.name?.toUpperCase() ?? ''}</span> from the system. This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className='space-y-4'>
                    <Label className='my-2'>
                        Name:
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder='Enter name to confirm deletion.'
                        />
                    </Label>

                    <Alert variant='destructive'>
                        <AlertTitle>Warning!</AlertTitle>
                        <AlertDescription>
                            Please be careful, this operation cannot be rolled back.
                        </AlertDescription>
                    </Alert>
                    {error && <p className='text-red-600 text-sm'>{error}</p>}
                </div>
                <DialogFooter className='gap-y-2'>
                    <Button variant='outline' onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button variant='destructive' onClick={handleDelete} disabled={value.trim() !== currentRow.name}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}