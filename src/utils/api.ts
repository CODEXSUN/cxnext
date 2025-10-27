// utils/api.ts  (central fetch wrapper)
export async function api<T = any>(input: string, init?: RequestInit): Promise<T> {
    const res = await fetch(input, init);

    let data;
    try {
        data = await res.json();
    } catch {
        data = { message: await res.text() };
    }

    if (!res.ok) {
        console.error('API error →', { url: input, status: res.status, data });
        throw new Error(data.message ?? `HTTP ${res.status}`);
    }

    return data;
}