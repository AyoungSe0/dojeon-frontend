import type {
  ApiResponse,
  ChangePasswordData,
  ChangePasswordPayload,
  DeleteUserMeData,
  PatchUserPayload,
  PresignedProfileImagePayload,
  PresignedProfileImageResult,
  UpdateUserMeData,
  UserMe,
} from '../types/user.types'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || ''
const ACCESS_TOKEN_STORAGE_KEY = 'accessToken'

export class UserApiError extends Error {
  readonly code?: string
  readonly status?: number

  constructor(message: string, code?: string, status?: number) {
    super(message)
    this.name = 'UserApiError'
    this.code = code
    this.status = status
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return (
    window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ||
    (import.meta.env.VITE_DEV_ACCESS_TOKEN as string | undefined) ||
    null
  )
}

function createUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

async function parseUserResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T | null> {
  if (!response.ok) {
    throw new UserApiError(fallbackMessage, undefined, response.status)
  }

  const body = (await response.json()) as ApiResponse<T>

  if (!body.isSuccess) {
    throw new UserApiError(body.message ?? 'Request failed', body.code)
  }

  return body.data as T | null
}

async function requestWithAuth<T>(
  path: string,
  init: RequestInit = {},
  fallbackMessage = 'Request failed',
): Promise<T | null> {
  const token = getAuthToken()

  const response = await fetch(createUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  return parseUserResponse<T>(response, fallbackMessage)
}

// GET /user/me - 내 정보 조회
export async function fetchUserMe(
  params?: { year?: number; month?: number },
  signal?: AbortSignal,
): Promise<UserMe | null> {
  const searchParams = new URLSearchParams()

  if (params?.year) {
    searchParams.set('year', String(params.year))
  }

  if (params?.month) {
    searchParams.set('month', String(params.month))
  }

  const query = searchParams.toString()

  return requestWithAuth<UserMe>(
    `/user/me${query ? `?${query}` : ''}`,
    { method: 'GET', signal },
    'Failed to fetch user me',
  )
}

// PATCH /user/me - 내 정보 수정 / 온보딩 정보 저장
export async function updateUserMe(payload: PatchUserPayload): Promise<UpdateUserMeData | null> {
  return requestWithAuth<UpdateUserMeData>(
    '/user/me',
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    'Failed to update user me',
  )
}

// DELETE /user/me - 회원 탈퇴
export async function deleteUserMe(): Promise<DeleteUserMeData | null> {
  return requestWithAuth<DeleteUserMeData>(
    '/user/me',
    {
      method: 'DELETE',
    },
    'Failed to delete user me',
  )
}

// PATCH /user/me/password - 비밀번호 변경 (로그인 상태)
export async function changeUserPassword(
  payload: ChangePasswordPayload,
): Promise<ChangePasswordData | null> {
  return requestWithAuth<ChangePasswordData>(
    '/user/me/password',
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    'Failed to change user password',
  )
}

// POST /user/me/profileImage/presignedUrl - 프로필 이미지 업로드 URL 발급
export async function createProfileImagePresignedUrl(
  payload: PresignedProfileImagePayload,
): Promise<PresignedProfileImageResult | null> {
  return requestWithAuth<PresignedProfileImageResult>(
    '/user/me/profileImage/presignedUrl',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    'Failed to create profile image presigned url',
  )
}
