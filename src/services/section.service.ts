import type {
    SectionMaterialData,
    SectionMaterialResponse,
    SectionCardData,
    SectionCardResponse,
    SectionQuestionData,
    SectionQuestionResponse,
    SectionCheckAnswerRequest,
    SectionCheckAnswerData,
    SectionCheckAnswerResponse,
    SaveProgressRequest,
    SaveProgressData,
    SaveProgressResponse,
} from '../types/section,types.ts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class SectionApiError extends Error {
    readonly code?: string
    readonly errorCode?: string
    readonly status?: number

    constructor(message: string, code?: string, errorCode?: string, status?: number) {
        super(message)
        this.name = 'SectionApiError'
        this.code = code
        this.errorCode = errorCode
        this.status = status
    }
}

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem('accessToken')
}

function buildHeaders(extra: HeadersInit = {}): HeadersInit {
    const token = getAuthToken()
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    }
}

async function readErrorBody<T extends { message?: string; code?: string; errorCode?: string }>(
    res: Response,
): Promise<T | undefined> {
    try {
        return (await res.json()) as T
    } catch {
        return undefined
    }
}

export async function fetchSectionMaterials(
    sectionId: number,
    signal?: AbortSignal,
): Promise<SectionMaterialData | null> {
    const res = await fetch(`${API_BASE_URL}/section/${sectionId}/material`, {
        method: 'GET',
        headers: buildHeaders(),
        signal,
    })
    if (!res.ok) {
        const body = await readErrorBody<SectionMaterialResponse>(res)
        throw new SectionApiError(
            body?.message ?? `Failed to fetch materials (HTTP ${res.status})`,
            body?.code,
            body?.errorCode,
            res.status,
        )
    }
    const body = (await res.json()) as SectionMaterialResponse
    if (!body.isSuccess) {
        throw new SectionApiError(body.message ?? 'Request failed', body.code, body.errorCode)
    }
    return body.data
}

export async function fetchSectionCards(
    sectionId: number,
    signal?: AbortSignal,
): Promise<SectionCardData | null> {
    const res = await fetch(`${API_BASE_URL}/section/${sectionId}/card`, {
        method: 'GET',
        headers: buildHeaders(),
        signal,
    })
    if (!res.ok) {
        const body = await readErrorBody<SectionCardResponse>(res)
        throw new SectionApiError(
            body?.message ?? `Failed to fetch cards (HTTP ${res.status})`,
            body?.code,
            undefined,
            res.status,
        )
    }
    const body = (await res.json()) as SectionCardResponse
    if (!body.isSuccess) {
        throw new SectionApiError(body.message ?? 'Request failed', body.code)
    }
    return body.data
}

export async function fetchSectionQuestions(
    sectionId: number,
    signal?: AbortSignal,
): Promise<SectionQuestionData | null> {
    const res = await fetch(`${API_BASE_URL}/section/${sectionId}/question`, {
        method: 'GET',
        headers: buildHeaders(),
        signal,
    })
    if (!res.ok) {
        const body = await readErrorBody<SectionQuestionResponse>(res)
        throw new SectionApiError(
            body?.message ?? `Failed to fetch questions (HTTP ${res.status})`,
            body?.code,
            undefined,
            res.status,
        )
    }
    const body = (await res.json()) as SectionQuestionResponse
    if (!body.isSuccess) {
        throw new SectionApiError(body.message ?? 'Request failed', body.code)
    }
    return body.data
}

export async function checkSectionAnswer(
    sectionId: number,
    payload: SectionCheckAnswerRequest,
): Promise<SectionCheckAnswerData | null> {
    const res = await fetch(`${API_BASE_URL}/section/${sectionId}/questions/check`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(payload),
    })
    if (!res.ok) {
        const body = await readErrorBody<SectionCheckAnswerResponse>(res)
        throw new SectionApiError(
            body?.message ?? `Failed to check answer (HTTP ${res.status})`,
            body?.code,
            body?.errorCode,
            res.status,
        )
    }
    const body = (await res.json()) as SectionCheckAnswerResponse
    if (!body.isSuccess) {
        throw new SectionApiError(body.message ?? 'Request failed', body.code, body.errorCode)
    }
    return body.data
}

export async function saveSectionProgress(
    sectionId: number,
    payload: SaveProgressRequest,
    idempotencyKey?: string,
): Promise<SaveProgressData | null> {
    const res = await fetch(`${API_BASE_URL}/section/${sectionId}/progress`, {
        method: 'POST',
        headers: buildHeaders(
            idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
        ),
        body: JSON.stringify(payload),
    })
    if (!res.ok) {
        const body = await readErrorBody<SaveProgressResponse>(res)
        throw new SectionApiError(
            body?.message ?? `Failed to save progress (HTTP ${res.status})`,
            body?.code,
            body?.errorCode,
            res.status,
        )
    }
    const body = (await res.json()) as SaveProgressResponse
    if (!body.isSuccess) {
        throw new SectionApiError(body.message ?? 'Request failed', body.code, body.errorCode)
    }
    return body.data
}

export function generateIdempotencyKey(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}