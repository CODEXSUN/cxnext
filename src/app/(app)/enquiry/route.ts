// app/api/enquiries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/config';

export async function POST(req: NextRequest) {
    const body = await req.json();

    try {
        const res = await fetch(`${API_URL}/enquiries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(data, { status: res.status });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error('Enquiry proxy error:', error);
        return NextResponse.json(
            { message: 'Backend unreachable', error: error.message },
            { status: 502 }
        );
    }
}