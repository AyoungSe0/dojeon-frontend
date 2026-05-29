import type {
  ApiResponse,
  ChangePasswordData,
  ChangePasswordPayload,
  DeleteUserMeData,
  PatchUserPayload,
  PresignedProfileImagePayload,
  PresignedProfileImageResult,
  UserAchievementsData,
  UpdateUserMeData,
  UserMe,
} from '../types/user.types'

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || ''
const AUTH_SESSION_STORAGE_KEY = 'dojeon:auth.session'
const ACCESS_TOKEN_STORAGE_KEY = 'accessToken'
const isMockUserMode =
  ((import.meta.env.VITE_MOCK_USER_API as string | undefined) || '').toLowerCase() === 'true'
const mockUserDelayMs =
  Number.parseInt((import.meta.env.VITE_MOCK_USER_DELAY_MS as string | undefined) || '300', 10) ||
  300

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const mockUserAchievements: UserAchievementsData = {
  totalEarned: 2,
  badges: [
    {
      badgeId: 1,
      title: 'First step',
      description: 'Completed the first section',
      imageUrl: null,
      isEarned: true,
      earnedAt: '2026-03-28',
    },
    {
      badgeId: 2,
      title: 'Daily streak',
      description: 'Studied for three days in a row',
      imageUrl: null,
      isEarned: true,
      earnedAt: '2026-03-30',
    },
    {
      badgeId: 3,
      title: '7-day streak',
      description: 'Study for seven days in a row',
      imageUrl: null,
      isEarned: false,
      earnedAt: null,
    },
  ],
}

let mockUserMe: UserMe = {
  profile: {
    userId: '100',
    email: 'example@email.com',
    hasPassword: true,
    nickname: 'Jinri',
    username: 'jinri',
    phoneNumber: '010-0000-0000',
    birthday: null,
    profileImgUrl: null,
    motherLanguage: 'English',
    proficiencyLevel: 'Intermediate',
    ageGroup: '18-24',
    dailyGoalMin: 15,
    learningGoal: 'Tourism',
    subscriptionTier: 'FREE',
    subscriptionPlanId: null,
    subscriptionExpiresAt: null,
    isPushNotificationOn: true,
    isMarketingAgreed: false,
    isOnboarded: false,
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  stats: {
    totalStudyMin: 80,
    currentStreak: 3,
    bestStreak: 7,
    totalCompletedLessons: 24,
  },
  attendance: {
    year: 2026,
    month: 3,
    activeDays: [1, 2, 3],
  },
  recentCourse: {
    courseId: 1,
    courseTitle: 'Course 1',
    lessonId: 105,
    lessonTitle: 'lesson 5',
    sectionId: 505,
    sectionTitle: 'Grammar 3 을까요? 1)',
    sectionType: 'GRAMMAR',
    grammarPreview: '동사 + 을까요?',
    overallProgressPercent: 60,
  },
  recentAchievements: mockUserAchievements.badges.filter((achievement) => achievement.isEarned),
}

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
  if (isMockUserMode) {
    await wait(mockUserDelayMs)
    return mockUserMe
  }

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
  if (isMockUserMode) {
    await wait(mockUserDelayMs)
    mockUserMe = {
      ...mockUserMe,
      profile: {
        ...mockUserMe.profile,
        nickname: payload.nickname ?? mockUserMe.profile.nickname,
        username: payload.username ?? mockUserMe.profile.username,
        phoneNumber: payload.phoneNumber ?? mockUserMe.profile.phoneNumber,
        birthday: payload.birthday ?? mockUserMe.profile.birthday,
        motherLanguage: payload.motherLanguage ?? mockUserMe.profile.motherLanguage,
        proficiencyLevel: payload.proficiencyLevel ?? mockUserMe.profile.proficiencyLevel,
        ageGroup: payload.ageGroup ?? mockUserMe.profile.ageGroup,
        dailyGoalMin: payload.dailyGoalMin ?? mockUserMe.profile.dailyGoalMin,
        learningGoal: payload.learningGoal ?? mockUserMe.profile.learningGoal,
        isPushNotificationOn:
          payload.isPushNotificationOn ?? mockUserMe.profile.isPushNotificationOn,
        isMarketingAgreed: payload.isMarketingAgreed ?? mockUserMe.profile.isMarketingAgreed,
        profileImgUrl: payload.profileImgUrl ?? mockUserMe.profile.profileImgUrl,
        isOnboarded: payload.isOnboarded ?? mockUserMe.profile.isOnboarded,
      },
    }
    return { updated: true }
  }

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
  if (isMockUserMode) {
    await wait(mockUserDelayMs)
    return { deleted: true }
  }

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
  if (isMockUserMode) {
    await wait(mockUserDelayMs)
    return { updated: true }
  }

  return requestWithAuth<ChangePasswordData>(
    '/user/me/password',
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    'Failed to change user password',
  )
}

// GET /user/me/achievement - 업적(뱃지) 목록 조회
export async function fetchUserAchievements(
  signal?: AbortSignal,
): Promise<UserAchievementsData | null> {
  if (isMockUserMode) {
    await wait(mockUserDelayMs)
    return mockUserAchievements
  }

  return requestWithAuth<UserAchievementsData>(
    '/user/me/achievement',
    { method: 'GET', signal },
    'Failed to fetch user achievements',
  )
}

// POST /user/me/profileImage/presignedUrl - 프로필 이미지 업로드 URL 발급
export async function createProfileImagePresignedUrl(
  payload: PresignedProfileImagePayload,
): Promise<PresignedProfileImageResult | null> {
  if (isMockUserMode) {
    await wait(mockUserDelayMs)
    return {
      uploadUrl: '',
      key: `mock/profile-image.${payload.fileExtension}`,
      fileUrl: '',
    }
  }

  return requestWithAuth<PresignedProfileImageResult>(
    '/user/me/profileImage/presignedUrl',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    'Failed to create profile image presigned url',
  )
}
