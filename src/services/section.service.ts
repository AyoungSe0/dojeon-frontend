import type {
    SectionMaterialData,
    SectionCardData,
    SectionQuestionData,
    SectionCheckAnswerRequest,
    SectionCheckAnswerData,
    SaveProgressRequest,
    SaveProgressData,
} from '../types/section,types.ts'
import { authenticatedFetch, getAuthToken } from './session.ts'

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

function buildHeaders(extra: HeadersInit = {}): HeadersInit {
    const token = getAuthToken()
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    }
}

type SectionApiResponse<T> = {
    isSuccess: boolean
    code: string
    message: string
    data: T | null
    errorCode?: string
    timestamp?: string
}

function isWrappedResponse<T>(body: unknown): body is SectionApiResponse<T> {
    return Boolean(body && typeof body === 'object' && 'isSuccess' in body)
}

async function fetchSectionResponse<T>(
    input: RequestInfo | URL,
    init: RequestInit,
    fallbackMessage: string,
): Promise<T | null> {
    let res: Response
    try {
        res = await authenticatedFetch(input, init)
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') throw error
        throw new SectionApiError(fallbackMessage)
    }

    const bodyText = await res.text()
    let body: unknown = null

    if (!bodyText.trim()) {
        if (!res.ok) {
            throw new SectionApiError(
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
            throw new SectionApiError(
                `${fallbackMessage} (HTTP ${res.status})`,
                undefined,
                undefined,
                res.status,
            )
        }

        throw new SectionApiError(
            `${fallbackMessage} (invalid JSON, HTTP ${res.status})`,
            undefined,
            undefined,
            res.status,
        )
    }

    if (!res.ok) {
        const wrapped = isWrappedResponse<T>(body) ? body : null
        throw new SectionApiError(
            wrapped?.message ?? `${fallbackMessage} (HTTP ${res.status})`,
            wrapped?.code,
            wrapped?.errorCode,
            res.status,
        )
    }

    if (isWrappedResponse<T>(body)) {
        if (!body.isSuccess) {
            throw new SectionApiError(body.message ?? 'Request failed', body.code, body.errorCode, res.status)
        }
        return body.data
    }

    return body as T
}

export async function fetchSectionMaterials(
    sectionId: number,
    signal?: AbortSignal,
): Promise<SectionMaterialData | null> {
    return fetchSectionResponse<SectionMaterialData>(
        `${API_BASE_URL}/section/${sectionId}/material`,
        {
            method: 'GET',
            headers: buildHeaders(),
            signal,
        },
        'Failed to fetch materials',
    )
}

export async function fetchSectionCards(
    sectionId: number,
    signal?: AbortSignal,
): Promise<SectionCardData | null> {
    return fetchSectionResponse<SectionCardData>(
        `${API_BASE_URL}/section/${sectionId}/card`,
        {
            method: 'GET',
            headers: buildHeaders(),
            signal,
        },
        'Failed to fetch cards',
    )
}

export async function fetchSectionQuestions(
    sectionId: number,
    signal?: AbortSignal,
): Promise<SectionQuestionData | null> {
    return fetchSectionResponse<SectionQuestionData>(
        `${API_BASE_URL}/section/${sectionId}/question`,
        {
            method: 'GET',
            headers: buildHeaders(),
            signal,
        },
        'Failed to fetch questions',
    )
}

export async function checkSectionAnswer(
    sectionId: number,
    payload: SectionCheckAnswerRequest,
): Promise<SectionCheckAnswerData | null> {
    return fetchSectionResponse<SectionCheckAnswerData>(
        `${API_BASE_URL}/section/${sectionId}/questions/check`,
        {
            method: 'POST',
            headers: buildHeaders(),
            body: JSON.stringify(payload),
        },
        'Failed to check answer',
    )
}

export async function saveSectionProgress(
    sectionId: number,
    payload: SaveProgressRequest,
    idempotencyKey?: string,
): Promise<SaveProgressData | null> {
    return fetchSectionResponse<SaveProgressData>(
        `${API_BASE_URL}/section/${sectionId}/progress`,
        {
            method: 'POST',
            headers: buildHeaders(
                idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
            ),
            body: JSON.stringify(payload),
        },
        'Failed to save progress',
    )
}

export function generateIdempotencyKey(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
