import type {
    ScrapDashboardData,
    ScrapDashboardResponse,
    ScrapListParams,
    ScrapListResponse,
    GrammarScrapListData,
    VocabScrapListData,
    CreateScrapRequest,
    CreateScrapResponse,
    CreateScrapData,
    DeleteScrapResponse,
    DeleteScrapData,
} from '../types/scraps.types.ts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class ScrapApiError extends Error {
    readonly code?: string
    readonly errorCode?: string
    readonly status?: number

    constructor(message: string, code?: string, errorCode?: string, status?: number) {
        super(message)
        this.name = 'ScrapApiError'
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

async function readErrorBody<T extends { message?: string; code?: string; errorCode?: string }>(
    res: Response,
): Promise<T | undefined> {
    try {
        return (await res.json()) as T
    } catch {
        return undefined
    }
}

/**
 * GET /scrap/dashboard — vocabulary group + grammar previews for the notebook home.
 */
export async function fetchScrapDashboard(
    signal?: AbortSignal,
): Promise<ScrapDashboardData | null> {
    const res = await fetch(`${API_BASE_URL}/scrap/dashboard`, {
        method: 'GET',
        headers: buildHeaders(),
        signal,
    })

    if (!res.ok) {
        const body = await readErrorBody<ScrapDashboardResponse>(res)
        throw new ScrapApiError(
            body?.message ?? `Failed to fetch scrap dashboard (HTTP ${res.status})`,
            body?.code,
            undefined,
            res.status,
        )
    }

    const body = (await res.json()) as ScrapDashboardResponse
    if (!body.isSuccess) {
        throw new ScrapApiError(body.message ?? 'Request failed', body.code)
    }
    return body.data
}

/**
 * GET /scrap — paginated list. type === 'VOCAB' → groups; type === 'GRAMMAR' → items.
 */
export async function fetchScrapList(
    params: ScrapListParams,
    signal?: AbortSignal,
): Promise<GrammarScrapListData | VocabScrapListData | null> {
    const query = new URLSearchParams()
    query.set('type', params.type)
    if (params.sort) query.set('sort', params.sort)
    if (params.cursor) query.set('cursor', params.cursor)
    if (params.limit) query.set('limit', params.limit)

    const res = await fetch(`${API_BASE_URL}/scrap?${query.toString()}`, {
        method: 'GET',
        headers: buildHeaders(),
        signal,
    })

    if (!res.ok) {
        const body = await readErrorBody<ScrapListResponse>(res)
        throw new ScrapApiError(
            body?.message ?? `Failed to fetch scrap list (HTTP ${res.status})`,
            body?.code,
            body?.errorCode,
            res.status,
        )
    }

    const body = (await res.json()) as ScrapListResponse
    if (!body.isSuccess) {
        throw new ScrapApiError(body.message ?? 'Request failed', body.code, body.errorCode)
    }
    return body.data
}

/**
 * POST /scrap — add a scrap. VOCAB needs cardId; GRAMMAR needs materialId.
 */
export async function createScrap(
    payload: CreateScrapRequest,
): Promise<CreateScrapData | null> {
    const res = await fetch(`${API_BASE_URL}/scrap`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const body = await readErrorBody<CreateScrapResponse>(res)
        throw new ScrapApiError(
            body?.message ?? `Failed to create scrap (HTTP ${res.status})`,
            body?.code,
            body?.errorCode,
            res.status,
        )
    }

    const body = (await res.json()) as CreateScrapResponse
    if (!body.isSuccess) {
        throw new ScrapApiError(body.message ?? 'Request failed', body.code, body.errorCode)
    }
    return body.data
}

/**
 * DELETE /scrap/{scrapId} — remove a scrap owned by the current user.
 */
export async function deleteScrap(scrapId: string): Promise<DeleteScrapData | null> {
    const res = await fetch(`${API_BASE_URL}/scrap/${scrapId}`, {
        method: 'DELETE',
        headers: buildHeaders(),
    })

    if (!res.ok) {
        const body = await readErrorBody<DeleteScrapResponse>(res)
        throw new ScrapApiError(
            body?.message ?? `Failed to delete scrap (HTTP ${res.status})`,
            body?.code,
            body?.errorCode,
            res.status,
        )
    }

    const body = (await res.json()) as DeleteScrapResponse
    if (!body.isSuccess) {
        throw new ScrapApiError(body.message ?? 'Request failed', body.code, body.errorCode)
    }
    return body.data
}