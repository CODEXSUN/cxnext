// components/user-dialog.tsx
import { useState } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface User {
    id: number;
    name: string;
    email: string;
    roles?: { id: number; name: string }[];
    active: boolean;
}

const roles = [
    { value: 'superadmin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'cashier', label: 'Cashier' },
    { value: 'manager', label: 'Manager' },
];

const roleToId: Record<string, number> = {
    superadmin: 1,
    admin: 2,
    cashier: 3,
    manager: 4,
};

const formSchema = z
    .object({
        name: z.string().min(1, 'Name is required.'),
        email: z.string().email('Invalid email address.'),
        role: z.string().min(1, 'Role is required.'),
        password: z.string().transform((pwd) => pwd.trim()),
        confirmPassword: z.string().transform((pwd) => pwd.trim()),
        active: z.boolean(),
        isEdit: z.boolean(),
    })
    .refine(
        ({ isEdit, password }) => (isEdit && !password ? true : password.length > 0),
        { message: 'Password is required.', path: ['password'] }
    )
    .refine(
        ({ isEdit, password }) => (isEdit && !password ? true : password.length >= 8),
        { message: 'Password must be at least 8 characters long.', path: ['password'] }
    )
    .refine(
        ({ isEdit, password }) => (isEdit && !password ? true : /[a-z]/.test(password)),
        { message: 'Password must contain at least one lowercase letter.', path: ['password'] }
    )
    .refine(
        ({ isEdit, password }) => (isEdit && !password ? true : /\d/.test(password)),
        { message: 'Password must contain at least one number.', path: ['password'] }
    )
    .refine(
        ({ isEdit, password, confirmPassword }) => (isEdit && !password ? true : password === confirmPassword),
        { message: "Passwords don't match.", path: ['confirmPassword'] }
    );

type UserForm = z.infer<typeof formSchema>;

type UserDialogProps = {
    currentRow?: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dialogQueryKey: any[];
};

export default function UserDialog({ currentRow, open, onOpenChange, dialogQueryKey }: UserDialogProps) {
    const isEdit = !!currentRow;
    const token = localStorage.getItem('auth_token');
    const [isPasswordTouched, setIsPasswordTouched] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const form = useForm<UserForm>({
        resolver: zodResolver(formSchema),
        defaultValues: isEdit
            ? {
                name: currentRow?.name || '',
                email: currentRow?.email || '',
                role: currentRow?.roles?.[0]?.name.toLowerCase() || '',
                password: '',
                confirmPassword: '',
                active: currentRow?.active ?? true,
                isEdit,
            }
            : {
                name: '',
                email: '',
                role: '',
                password: '',
                confirmPassword: '',
                active: true,
                isEdit,
            },
    });

    const onSubmit = async (values: UserForm) => {
        if (!token) {
            form.setError('root', { message: 'Authentication required' });
            toast({ title: 'Error', description: 'Session expired, please log in.', variant: 'destructive' });
            return;
        }
        if (isEdit && !currentRow?.id) {
            form.setError('root', { message: 'User ID is missing for editing' });
            return;
        }
        setIsSubmitting(true);
        let previousData;
        try {
            await queryClient.cancelQueries({ queryKey: dialogQueryKey });
            previousData = queryClient.getQueryData(dialogQueryKey);
            let tempId;
            if (previousData) {
                if (isEdit) {
                    const updatedData = {
                        ...previousData,
                        data: previousData.data.map((user: User) =>
                            user.id === currentRow!.id
                                ? { ...user, name: values.name, email: values.email, active: values.active, roles: [{ id: roleToId[values.role], name: values.role }] }
                                : user
                        ),
                    };
                    queryClient.setQueryData(dialogQueryKey, updatedData);
                } else {
                    tempId = -Date.now(); // Negative temp ID to avoid conflicts
                    const newUser: User = {
                        id: tempId,
                        name: values.name,
                        email: values.email,
                        active: values.active,
                        roles: [{ id: roleToId[values.role], name: values.role }],
                    };
                    const updatedData = {
                        ...previousData,
                        data: [newUser, ...previousData.data], // Prepend for immediate visibility
                    };
                    queryClient.setQueryData(dialogQueryKey, updatedData);
                }
            }

            const endpoint = isEdit ? `/api/users/${currentRow!.id}` : `/api/users`;
            const response = await axios({
                method: isEdit ? 'put' : 'post',
                url: endpoint,
                data: {
                    name: values.name,
                    email: values.email,
                    active: values.active,
                    ...(values.password && {
                        password: values.password,
                        password_confirmation: values.confirmPassword,
                    }),
                },
                headers: { Authorization: `Bearer ${token}` },
            });

            const userId = isEdit ? currentRow!.id : response.data.user?.id || response.data.id;

            // Handle role
            const newRoleId = roleToId[values.role];
            const oldRoleId = currentRow?.roles?.[0]?.id;
            if (isEdit && oldRoleId && oldRoleId !== newRoleId) {
                await axios.post(`/api/users/${userId}/remove-role`, { role_id: oldRoleId }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            if (newRoleId) {
                await axios.post(`/api/users/${userId}/assign-role`, { role_id: newRoleId }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            await queryClient.invalidateQueries({ queryKey: ['users'] });
            toast({ title: `User ${isEdit ? 'updated' : 'added'} successfully` });
            onOpenChange(false);
            form.reset();
            setIsPasswordTouched(false);
        } catch (error: any) {
            if (previousData) {
                queryClient.setQueryData(dialogQueryKey, previousData);
            }
            const message = error.response?.data?.error || error.message || 'Unknown error';
            form.setError('root', { message });
            toast({ title: 'Error', description: message, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            onOpenChange(isOpen);
            if (!isOpen) {
                form.reset();
                setIsPasswordTouched(false);
            }
        }}>
            <DialogContent className='max-w-full sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit User' : 'Add User'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Make changes to the user here.' : 'Add a new user here.'} Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                    <Form {...form}>
                        <form id='user-form' onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"> {/* Added space-y-4 for spacing between inputs */}
                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-2'> {/* Increased gap-y */}
                                        <FormLabel className='col-span-2 text-end'>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder='e.g., John Doe' className='col-span-4' {...field} />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-2'>
                                        <FormLabel className='col-span-2 text-end'>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder='e.g., john@example.com' className='col-span-4' {...field} />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='role'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-2'>
                                        <FormLabel className='col-span-2 text-end'>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className='col-span-4'>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {roles.map(({ value, label }) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='password'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-2'>
                                        <FormLabel className='col-span-2 text-end'>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder='e.g., S3cur3P@ssw0rd'
                                                className='col-span-4'
                                                disabled={!isPasswordTouched && isEdit}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    setIsPasswordTouched(!!e.target.value);
                                                }}
                                                value={field.value}
                                            />
                                        </FormControl>
                                        <FormDescription className='col-span-4 col-start-3'>
                                            {isEdit ? 'Leave blank to keep current password.' : ''}
                                        </FormDescription>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='confirmPassword'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-2'>
                                        <FormLabel className='col-span-2 text-end'>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                disabled={!isPasswordTouched && isEdit}
                                                placeholder='e.g., S3cur3P@ssw0rd'
                                                className='col-span-4'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='active'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-2'>
                                        <FormLabel className='col-span-2 text-end'>Active</FormLabel>
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className='col-span-4'
                                            />
                                        </FormControl>
                                        <FormMessage className='col-span-4 col-start-3' />
                                    </FormItem>
                                )}
                            />
                            {form.formState.errors.root && (
                                <p className='text-red-600 text-sm col-span-6'>{form.formState.errors.root.message}</p>
                            )}
                        </form>
                    </Form>
                </div>
                <DialogFooter>
                    <Button type='submit' form='user-form' disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}