import type {
    PracticeTopicListData,
    PracticeTopicListResponse,
    PracticeQuestionsData,
    PracticeQuestionsResponse,
    CheckAnswerRequest,
    CheckAnswerData,
    CheckAnswerResponse,
} from '../types/practice.types.ts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class PracticeApiError extends Error {
    readonly code?: string
    readonly errorCode?: string
    readonly status?: number

    constructor(message: string, code?: string, errorCode?: string, status?: number) {
        super(message)
        this.name = 'PracticeApiError'
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

/**
 * GET /practice/topic — list of active practice topics.
 */
export async function fetchPracticeTopics(
    signal?: AbortSignal,
): Promise<PracticeTopicListData | null> {
    const res = await fetch(`${API_BASE_URL}/practice/topic`, {
        method: 'GET',
        headers: buildHeaders(),
        signal,
    })

    if (!res.ok) {
        throw new PracticeApiError(
            `Failed to fetch topics (HTTP ${res.status})`,
            undefined,
            undefined,
            res.status,
        )
    }

    const body = (await res.json()) as PracticeTopicListResponse
    if (!body.isSuccess) {
        throw new PracticeApiError(body.message ?? 'Request failed', body.code)
    }
    return body.data
}

/**
 * GET /practice/topic/{topicId}/question — questions for a given topic.
 */
export async function fetchPracticeQuestions(
    topicId: number,
    signal?: AbortSignal,
): Promise<PracticeQuestionsData | null> {
    const res = await fetch(`${API_BASE_URL}/practice/topic/${topicId}/question`, {
        method: 'GET',
        headers: buildHeaders(),
        signal,
    })

    if (!res.ok) {
        // Try to read structured error for 404 with errorCode
        let body: PracticeQuestionsResponse | undefined
        try {
            body = (await res.json()) as PracticeQuestionsResponse
        } catch {
            // ignore
        }
        throw new PracticeApiError(
            body?.message ?? `Failed to fetch questions (HTTP ${res.status})`,
            body?.code,
            body?.errorCode,
            res.status,
        )
    }

    const body = (await res.json()) as PracticeQuestionsResponse
    if (!body.isSuccess) {
        throw new PracticeApiError(body.message ?? 'Request failed', body.code, body.errorCode)
    }
    return body.data
}

/**
 * POST /practice/topic/{topicId}/questions/check — grade a single answer.
 * On a wrong answer the backend returns only `{ correct: false }`.
 */
export async function checkPracticeAnswer(
    topicId: number,
    payload: CheckAnswerRequest,
): Promise<CheckAnswerData | null> {
    const res = await fetch(`${API_BASE_URL}/practice/topic/${topicId}/questions/check`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        let body: CheckAnswerResponse | undefined
        try {
            body = (await res.json()) as CheckAnswerResponse
        } catch {
            // ignore
        }
        throw new PracticeApiError(
            body?.message ?? `Failed to check answer (HTTP ${res.status})`,
            body?.code,
            body?.errorCode,
            res.status,
        )
    }

    const body = (await res.json()) as CheckAnswerResponse
    if (!body.isSuccess) {
        throw new PracticeApiError(body.message ?? 'Request failed', body.code, body.errorCode)
    }
    return body.data
}