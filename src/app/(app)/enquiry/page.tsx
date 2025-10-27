// app/enquiry/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const enquirySchema = z.object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string().regex(/^\+?\d{10,15}$/, 'Valid phone number required'),
    email: z.string().email().optional().or(z.literal('')),
    company_name: z.string().optional(),
    query: z.string().min(10, 'Query too short'),
    contact_type: z.enum(['customer', 'supplier', 'both']),
    grant_portal_access: z.boolean().optional(),
});

type EnquiryFormData = z.infer<typeof enquirySchema>;

export default function EnquiryForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [contactFound, setContactFound] = useState<any>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset,
    } = useForm<EnquiryFormData>({
        resolver: zodResolver(enquirySchema),
        defaultValues: {
            contact_type: 'customer',
            grant_portal_access: false,
        },
    });

    const phone = watch('phone');

    // Auto-lookup contact by phone
    useEffect(() => {
        if (phone && phone.length >= 10) {
            const timer = setTimeout(async () => {
                try {
                    const res = await fetch(`/api/contacts/lookup?phone=${encodeURIComponent(phone)}`);
                    if (res.ok) {
                        const { contact } = await res.json();
                        if (contact) {
                            setContactFound(contact);
                            setValue('name', contact.name);
                            setValue('email', contact.email || '');
                            setValue('contact_type', contact.contact_type);
                            toast.success('Contact found! Details auto-filled.');
                        } else {
                            setContactFound(null);
                        }
                    }
                } catch (err) {
                    console.error('Lookup failed:', err);
                }
            }, 600);

            return () => clearTimeout(timer);
        } else {
            setContactFound(null);
        }
    }, [phone, setValue]);

    const onSubmit = async (data: EnquiryFormData) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/enquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success('Enquiry submitted successfully!');
                if (result.portal) {
                    toast.info(result.portal.message);
                }
                reset(); // Clear form
                setContactFound(null);
            } else {
                const errorMsg = result.message || result.errors?.[0] || 'Submission failed';
                toast.error(errorMsg);
            }
        } catch (err: any) {
            toast.error(err.message || 'Network error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
            <h1 className="text-2xl font-bold mb-6">Submit Enquiry</h1>

            {contactFound && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800">
                        <strong>Contact Found:</strong> {contactFound.name} ({contactFound.contact_code})
                        {contactFound.has_account && ' | Account Active'}
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Phone *</label>
                    <input
                        {...register('phone')}
                        type="tel"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="+919876543210"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input
                        {...register('name')}
                        type="text"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="John Doe"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Email (for portal)</label>
                    <input
                        {...register('email')}
                        type="email"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="john@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Company</label>
                    <input
                        {...register('company_name')}
                        type="text"
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Contact Type</label>
                    <select {...register('contact_type')} className="w-full px-3 py-2 border rounded-md">
                        <option value="customer">Customer</option>
                        <option value="supplier">Supplier</option>
                        <option value="both">Both</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Your Query *</label>
                    <textarea
                        {...register('query')}
                        rows={4}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Describe your requirement..."
                    />
                    {errors.query && <p className="text-red-500 text-xs mt-1">{errors.query.message}</p>}
                </div>

                <div className="flex items-center gap-2">
                    <input
                        {...register('grant_portal_access')}
                        type="checkbox"
                        id="grant_access"
                        className="h-4 w-4"
                    />
                    <label htmlFor="grant_access" className="text-sm">
                        Grant portal access (sends login link to email)
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
                </button>
            </form>
        </div>
    );
}