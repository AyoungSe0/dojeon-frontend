import type { HomeResumeData, HomeResumeResponse } from '../types/home.types.ts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class HomeApiError extends Error {
    readonly code?: string
    readonly status?: number

    constructor(message: string, code?: string, status?: number) {
        super(message)
        this.name = 'HomeApiError'
        this.code = code
        this.status = status
    }
}

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem('accessToken')
}

export async function fetchHomeResume(signal?: AbortSignal): Promise<HomeResumeData | null> {
    const token = getAuthToken()

    const res = await fetch(`${API_BASE_URL}/home/resume`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal,
    })

    if (!res.ok) {
        throw new HomeApiError(
            `Failed to fetch home resume (HTTP ${res.status})`,
            undefined,
            res.status,
        )
    }

    const body = (await res.json()) as HomeResumeResponse

    if (!body.isSuccess) {
        throw new HomeApiError(body.message ?? 'Request failed', body.code)
    }

    return body.data
}