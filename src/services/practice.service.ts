import type {
    PracticeTopicListData,
    PracticeQuestionsData,
    CheckAnswerRequest,
    CheckAnswerData,
} from '../types/practice.types.ts'
import { authenticatedFetch, getAuthToken } from './session.ts'

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

function buildHeaders(): HeadersInit {
    const token = getAuthToken()
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
}

type PracticeApiResponse<T> = {
    isSuccess: boolean
    code: string
    message: string
    data: T | null
    errorCode?: string
    timestamp?: string
}

function isWrappedResponse<T>(body: unknown): body is PracticeApiResponse<T> {
    return Boolean(body && typeof body === 'object' && 'isSuccess' in body)
}

async function fetchPracticeResponse<T>(
    input: RequestInfo | URL,
    init: RequestInit,
    fallbackMessage: string,
): Promise<T | null> {
    let res: Response
    try {
        res = await authenticatedFetch(input, init)
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') throw error
        throw new PracticeApiError(fallbackMessage)
    }

    const bodyText = await res.text()
    let body: unknown = null

    if (!bodyText.trim()) {
        if (!res.ok) {
            throw new PracticeApiError(
                `${fallbackMessage} (HTTP ${res.status})`,
                undefined,
                undefined,
                res.status,
            )
        }

        return null
    }

    try {
        body = JSON.parse(bodyText)
    } catch {
        if (!res.ok) {
            throw new PracticeApiError(
                `${fallbackMessage} (HTTP ${res.status})`,
                undefined,
                undefined,
                res.status,
            )
        }

        throw new PracticeApiError(
            `${fallbackMessage} (invalid JSON, HTTP ${res.status})`,
            undefined,
            undefined,
            res.status,
        )
    }

    if (!res.ok) {
        const wrapped = isWrappedResponse<T>(body) ? body : null
        throw new PracticeApiError(
            wrapped?.message ?? `${fallbackMessage} (HTTP ${res.status})`,
            wrapped?.code,
            wrapped?.errorCode,
            res.status,
        )
    }

    if (isWrappedResponse<T>(body)) {
        if (!body.isSuccess) {
            throw new PracticeApiError(body.message ?? 'Request failed', body.code, body.errorCode, res.status)
        }
        return body.data
    }

    return body as T
}

/**
 * GET /practice/topic — list of active practice topics.
 */
export async function fetchPracticeTopics(
    signal?: AbortSignal,
): Promise<PracticeTopicListData | null> {
    return fetchPracticeResponse<PracticeTopicListData>(
        `${API_BASE_URL}/practice/topic`,
        {
            method: 'GET',
            headers: buildHeaders(),
            signal,
        },
        'Failed to fetch topics',
    )
}

/**
 * GET /practice/topic/{topicId}/question — questions for a given topic.
 */
export async function fetchPracticeQuestions(
    topicId: number,
    signal?: AbortSignal,
): Promise<PracticeQuestionsData | null> {
    return fetchPracticeResponse<PracticeQuestionsData>(
        `${API_BASE_URL}/practice/topic/${topicId}/question`,
        {
            method: 'GET',
            headers: buildHeaders(),
            signal,
        },
        'Failed to fetch questions',
    )
}

/**
 * POST /practice/topic/{topicId}/questions/check — grade a single answer.
 * On a wrong answer the backend returns only `{ correct: false }`.
 */
export async function checkPracticeAnswer(
    topicId: number,
    payload: CheckAnswerRequest,
): Promise<CheckAnswerData | null> {
    return fetchPracticeResponse<CheckAnswerData>(
        `${API_BASE_URL}/practice/topic/${topicId}/questions/check`,
        {
            method: 'POST',
            headers: buildHeaders(),
            body: JSON.stringify(payload),
        },
        'Failed to check answer',
    )
}
