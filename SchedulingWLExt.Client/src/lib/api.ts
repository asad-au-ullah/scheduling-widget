const API_BASE = import.meta.env.VITE_API_URL ?? 'https://localhost:7024'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    })

    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Request failed: HTTP ${res.status}`)
    }

    // 204 No Content
    if (res.status === 204) return undefined as T

    return res.json() as Promise<T>
}

export const api = {
    get: <T>(path: string, init?: RequestInit) =>
        request<T>(path, { ...init, method: 'GET' }),

    post: <T>(path: string, body: unknown, init?: RequestInit) =>
        request<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) }),

    patch: <T>(path: string, body: unknown, init?: RequestInit) =>
        request<T>(path, { ...init, method: 'PATCH', body: JSON.stringify(body) }),

    delete: <T = void>(path: string, init?: RequestInit) =>
        request<T>(path, { ...init, method: 'DELETE' }),
}
