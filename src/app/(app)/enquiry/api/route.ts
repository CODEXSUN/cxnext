// src/app/(app)/enquiry/api/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/config';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const res = await fetch(`${API_URL}/enquiries?${new URLSearchParams(params).toString()}`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const res = await fetch(`${API_URL}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 201 : res.status });
}