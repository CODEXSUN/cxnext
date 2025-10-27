// app/api/contacts/lookup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/config';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
        return NextResponse.json({ error: 'Phone required' }, { status: 400 });
    }

    try {
        const res = await fetch(`${API_URL}/contacts/lookup?phone=${encodeURIComponent(phone)}`, {
            cache: 'no-store',
        });

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Contact lookup error:', error);
        return NextResponse.json({ error: 'Failed to lookup contact' }, { status: 500 });
    }
}