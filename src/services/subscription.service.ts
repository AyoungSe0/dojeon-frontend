import type { ApiResponse } from '../types/user.types'
import type { SubscriptionPlansData } from '../types/subscription.types'

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || ''
const AUTH_SESSION_STORAGE_KEY = 'dojeon:auth.session'
const ACCESS_TOKEN_STORAGE_KEY = 'accessToken'
const isMockSubscriptionMode =
  ((import.meta.env.VITE_MOCK_SUBSCRIPTION_API as string | undefined) || '').toLowerCase() ===
  'true'
const mockSubscriptionDelayMs =
  Number.parseInt(
    (import.meta.env.VITE_MOCK_SUBSCRIPTION_DELAY_MS as string | undefined) || '300',
    10,
  ) || 300

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const mockSubscriptionPlans: SubscriptionPlansData = {
  plans: [
    {
      planId: 'free',
      title: 'Free Plan',
      priceText: '$0',
      subText: null,
      hasTrial: false,
      billingCycleMonths: 1,
      benefits: ['Access to selected course classes', 'Limited connectivity'],
    },
    {
      planId: 'pro',
      title: '1 Month',
      priceText: '$15',
      subText: null,
      hasTrial: true,
      billingCycleMonths: 1,
      benefits: [
        'Access to all courses classes',
        'Full access to connectivity',
        'Full access to personal notebook',
        'more coming soon',
      ],
    },
    {
      planId: 'basic',
      title: '3 Months',
      priceText: '$39',
      subText: '($13/mo)',
      hasTrial: false,
      billingCycleMonths: 3,
      benefits: [
        'Access to all courses classes',
        'Full access to connectivity',
        'Full access to personal notebook',
        'more coming soon',
      ],
    },
    {
      planId: 'halfyear',
      title: '6 Months',
      priceText: '$69',
      subText: '($11.5/mo)',
      hasTrial: false,
      billingCycleMonths: 6,
      benefits: [
        'Access to all courses classes',
        'Full access to connectivity',
        'Full access to personal notebook',
        'more coming soon',
      ],
    },
    {
      planId: 'annual',
      title: '1 Year',
      priceText: '$99',
      subText: '($8.25/mo)',
      hasTrial: false,
      billingCycleMonths: 12,
      benefits: [
        'Access to all courses classes',
        'Full access to connectivity',
        'Full access to personal notebook',
        'more coming soon',
      ],
    },
  ],
}

export class SubscriptionApiError extends Error {
  readonly code?: string
  readonly status?: number

  constructor(message: string, code?: string, status?: number) {
    super(message)
    this.name = 'SubscriptionApiError'
    this.code = code
    this.status = status
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  const storedSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)

  if (storedSession) {
    try {
      const parsed = JSON.parse(storedSession) as { accessToken?: unknown }

      if (typeof parsed.accessToken === 'string' && parsed.accessToken.trim()) {
        return parsed.accessToken
      }
    } catch {
      // Fall through to legacy token storage.
    }
  }

  return (
    window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ||
    (import.meta.env.VITE_DEV_ACCESS_TOKEN as string | undefined) ||
    null
  )
}

async function parseSubscriptionResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T | null> {
  if (!response.ok) {
    throw new SubscriptionApiError(fallbackMessage, undefined, response.status)
  }

  const body = (await response.json()) as ApiResponse<T>

  if (!body.isSuccess) {
    throw new SubscriptionApiError(body.message ?? 'Request failed', body.code)
  }

  return body.data as T | null
}

export async function fetchSubscriptionPlans(
  signal?: AbortSignal,
): Promise<SubscriptionPlansData | null> {
  if (isMockSubscriptionMode) {
    await wait(mockSubscriptionDelayMs)
    return mockSubscriptionPlans
  }

  const token = getAuthToken()

  if (!token) {
    throw new SubscriptionApiError('Authentication is required.', 'UNAUTHORIZED', 401)
  }

  const response = await fetch(`${API_BASE_URL}/subscription/plan`, {
    method: 'GET',
    signal,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  return parseSubscriptionResponse<SubscriptionPlansData>(
    response,
    'Failed to fetch subscription plans',
  )
}
