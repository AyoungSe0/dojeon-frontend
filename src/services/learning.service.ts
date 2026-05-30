import type {
    DashboardData,
    DashboardResponse,
} from '../types/dasboard.types.ts'
import type {
    LessonSectionsData,
    LessonSectionsResponse,
} from '../types/lessons.types.ts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class LearningApiError extends Error {
    readonly code?: string
    readonly errorCode?: string
    readonly status?: number

    constructor(message: string, code?: string, errorCode?: string, status?: number) {
        super(message)
        this.name = 'LearningApiError'
        this.code = code
        this.errorCode = errorCode
        this.status = status
    }
}

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem('accessToken')
}

function buildHeaders(): HeadersInit {
    const token = getAuthToken()
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
}

export async function fetchCoursesDashboard(
    signal?: AbortSignal,
): Promise<DashboardData | null> {
    const res = await fetch(`${API_BASE_URL}/courses/dashboard`, {
        method: 'GET',
        headers: buildHeaders(),
        signal,
    })

    if (!res.ok) {
        let body: DashboardResponse | undefined
        try {
            body = (await res.json()) as DashboardResponse
        } catch {
            // ignore
        }
        throw new LearningApiError(
            body?.message ?? `Failed to fetch courses dashboard (HTTP ${res.status})`,
            body?.code,
            undefined,
            res.status,
        )
    }

    const body = (await res.json()) as DashboardResponse
    if (!body.isSuccess) {
        throw new LearningApiError(body.message ?? 'Request failed', body.code)
    }
    return body.data
}

export async function fetchLessonSections(
    lessonId: number,
    signal?: AbortSignal,
): Promise<LessonSectionsData | null> {
    const res = await fetch(`${API_BASE_URL}/lessons/${lessonId}/sections`, {
        method: 'GET',
        headers: buildHeaders(),
        signal,
    })

    if (!res.ok) {
        let body: LessonSectionsResponse | undefined
        try {
            body = (await res.json()) as LessonSectionsResponse
        } catch {
            // ignore
        }
        throw new LearningApiError(
            body?.message ?? `Failed to fetch lesson sections (HTTP ${res.status})`,
            body?.code,
            body?.errorCode,
            res.status,
        )
    }

    const body = (await res.json()) as LessonSectionsResponse
    if (!body.isSuccess) {
        throw new LearningApiError(body.message ?? 'Request failed', body.code, body.errorCode)
    }
    return body.data
}