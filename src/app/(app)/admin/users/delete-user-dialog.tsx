// components/delete-user-dialog.tsx
import { useState } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner'; // ← Replaced useToast
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconAlertTriangle } from "@tabler/icons-react";

interface User {
    id: number;
    name: string;
    email: string;
    roles?: { id: number; name: string }[];
    active: boolean;
}

type DeleteUserDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentRow: User;
    dialogQueryKey: any[];
};

export default function DeleteUserDialog({
                                             open,
                                             onOpenChange,
                                             currentRow,
                                             dialogQueryKey,
                                         }: DeleteUserDialogProps) {
    const [value, setValue] = useState('');
    const token = localStorage.getItem('auth_token');
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const queryClient = useQueryClient();

    const handleDelete = async () => {
        if (value.trim() !== currentRow.name) return;
        if (!token) {
            setError('Authentication required');
            toast.error('Session expired, please log in.');
            return;
        }
        setIsDeleting(true);
        let previousData;
        try {
            await queryClient.cancelQueries({ queryKey: dialogQueryKey });
            previousData = queryClient.getQueryData(dialogQueryKey);
            if (previousData) {
                const updatedData = {
                    ...previousData,
                    data: previousData.data.filter((user: User) => user.id !== currentRow.id),
                };
                queryClient.setQueryData(dialogQueryKey, updatedData);
            }

            await axios.delete(`/api/users/${currentRow.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            await queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User deleted successfully');
            onOpenChange(false);
            setValue('');
            setError(null);
        } catch (error: any) {
            if (previousData) {
                queryClient.setQueryData(dialogQueryKey, previousData);
            }
            const message = error.response?.data?.error || error.message || 'Unknown error';
            setError(message);
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            onOpenChange(isOpen);
            if (!isOpen) {
                setValue('');
                setError(null);
            }
        }}>
            <DialogContent className='max-w-full sm:max-w-md'>
                <DialogHeader className='text-start'>
                    <DialogTitle className='flex items-center gap-2 text-destructive'>
                        <IconAlertTriangle className='me-1' size={18} />
                        Delete User
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <span className='font-bold'>{currentRow.name}</span>?
                        <br />
                        This action will permanently remove the user with the role of <span className='font-bold'>{currentRow.roles?.map(r => r.name.toUpperCase()).join(', ') ?? 'NONE'}</span> from the system. This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className='space-y-4'>
                    <Label className='my-2'>
                        Name:
                        <Input
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                setError(null);
                            }}
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
                    <Button
                        variant='destructive'
                        onClick={handleDelete}
                        disabled={value.trim() !== currentRow.name || isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}