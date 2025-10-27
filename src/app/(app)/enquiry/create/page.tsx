// src/app/(app)/enquiry/create/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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

export default function EnquiryCreatePage() {
    const router = useRouter();
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/enquiries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success('Enquiry submitted successfully!');
                if (result.portal) toast.info(result.portal.message);
                reset();
                setContactFound(null);
                router.push('/enquiry');
            } else {
                toast.error(result.message || 'Submission failed');
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
                {/* ... same inputs ... */}
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