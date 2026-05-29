export interface ApiResponse<T> {
  isSuccess: boolean
  code: string
  message: string
  data: T
  timestamp: string
  errorCode?: string
}

export interface SendEmailCodeRequest {
  email: string
}

export interface SendEmailCodeData {
  sent: boolean
}

export interface VerifyEmailCodeRequest {
  email: string
  code: string
}

export interface VerifyEmailCodeData {
  verifyToken: string
}

export interface SignupRequest {
  verifyToken: string
  email: string
  password: string
  isTermsAgreed: boolean
  isPrivacyAgreed: boolean
  isAgeVerified: boolean
  isMarketingAgreed: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface GoogleLoginRequest {
  idToken: string
}

export interface AuthTokenData {
  userId: string
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: string
}

export interface GoogleLoginData extends AuthTokenData {
  isNewUser: boolean
}

export interface ReissueTokenRequest {
  refreshToken: string
}

export interface LogoutRequest {
  refreshToken: string
}

export interface LogoutData {
  loggedOut: boolean
}

export interface PasswordResetConfirmRequest {
  email: string
  code: string
  newPassword: string
}

export interface PasswordResetConfirmData {
  reset: boolean
}

export interface NicknameAvailabilityData {
  available: boolean
}

export interface AuthSession extends AuthTokenData {
  email: string
}

export class AuthApiError extends Error {
  status: number
  errorCode?: string
  responseCode?: string

  constructor(message: string, status: number, errorCode?: string, responseCode?: string) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
    this.errorCode = errorCode
    this.responseCode = responseCode
  }
}

const AUTH_SESSION_KEY = 'dojeon:auth.session'
const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ?? ''
const isMockMode =
  ((import.meta.env.VITE_MOCK_AUTH_API as string | undefined) ||
    (import.meta.env.VITE_MOCK_VERIFICATION_API as string | undefined) ||
    '').toLowerCase() === 'true'
const mockDelayMs =
  Number.parseInt(
    (import.meta.env.VITE_MOCK_AUTH_DELAY_MS as string | undefined) ||
      (import.meta.env.VITE_MOCK_VERIFICATION_DELAY_MS as string | undefined) ||
      '500',
    10,
  ) || 500
const mockVerificationCode =
  ((import.meta.env.VITE_MOCK_VERIFICATION_CODE as string | undefined) || '123456').trim() ||
  '123456'

const buildEndpoint = (path: string, envKey?: string) => {
  const override = envKey
    ? ((import.meta.env[envKey as keyof ImportMetaEnv] as string | undefined) ?? '').trim()
    : ''

  if (override) {
    return override
  }

  return baseUrl ? `${baseUrl}${path}` : path
}

const endpoints = {
  sendEmailCode: buildEndpoint('/auth/email/send', 'VITE_AUTH_EMAIL_SEND_URL'),
  verifyEmailCode: buildEndpoint('/auth/email/verify', 'VITE_AUTH_EMAIL_VERIFY_URL'),
  signup: buildEndpoint('/auth/signup', 'VITE_AUTH_SIGNUP_URL'),
  login: buildEndpoint('/auth/login', 'VITE_AUTH_LOGIN_URL'),
  googleLogin: buildEndpoint('/auth/google', 'VITE_AUTH_GOOGLE_URL'),
  reissue: buildEndpoint('/auth/reissue', 'VITE_AUTH_REISSUE_URL'),
  logout: buildEndpoint('/auth/logout', 'VITE_AUTH_LOGOUT_URL'),
  requestPasswordReset: buildEndpoint(
    '/auth/password/reset-request',
    'VITE_AUTH_PASSWORD_RESET_REQUEST_URL',
  ),
  confirmPasswordReset: buildEndpoint(
    '/auth/password/reset-confirm',
    'VITE_AUTH_PASSWORD_RESET_CONFIRM_URL',
  ),
  checkNickname: buildEndpoint('/auth/check-nickname', 'VITE_AUTH_CHECK_NICKNAME_URL'),
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const createMockToken = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`

const createMockAuthTokenData = (email: string): AuthTokenData => ({
  userId: normalizeEmail(email) || 'mock-user',
  accessToken: createMockToken('mock-access'),
  refreshToken: createMockToken('mock-refresh'),
  tokenType: 'Bearer',
  expiresIn: '30m',
})

const readStorageItem = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const writeStorageItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Ignore storage failures in restricted environments.
  }
}

const removeStorageItem = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore storage failures in restricted environments.
  }
}

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

const getErrorMessage = (payload: ApiResponse<null> | null, response: Response) => {
  if (payload?.message) {
    return payload.message
  }

  return `요청 실패: ${response.status} ${response.statusText}`
}

const unwrapApiResponse = async <T>(response: Response): Promise<T> => {
  const payload = await parseJsonSafely<ApiResponse<T | null>>(response)

  if (!response.ok || !payload?.isSuccess) {
    throw new AuthApiError(
      getErrorMessage(payload as ApiResponse<null> | null, response),
      response.status,
      payload?.errorCode,
      payload?.code,
    )
  }

  return payload.data as T
}

const fetchJson = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> => {
  let response: Response

  try {
    response = await fetch(input, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init?.headers ?? {}),
      },
    })
  } catch {
    throw new AuthApiError('네트워크 요청에 실패했습니다. 서버 연결을 확인해 주세요.', 0)
  }

  return unwrapApiResponse<T>(response)
}

export const getStoredAuthSession = (): AuthSession | null => {
  const raw = readStorageItem(AUTH_SESSION_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession
    if (
      !parsed ||
      typeof parsed.email !== 'string' ||
      typeof parsed.userId !== 'string' ||
      typeof parsed.accessToken !== 'string' ||
      typeof parsed.refreshToken !== 'string'
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export const saveAuthSession = (session: AuthSession) => {
  writeStorageItem(AUTH_SESSION_KEY, JSON.stringify(session))
}

export const clearStoredAuthSession = () => {
  removeStorageItem(AUTH_SESSION_KEY)
}

export const buildAuthSession = (
  email: string,
  tokenData: AuthTokenData,
): AuthSession => ({
  email: normalizeEmail(email),
  ...tokenData,
})

export const getSendEmailCodeEndpoint = () => endpoints.sendEmailCode
export const getVerifyEmailCodeEndpoint = () => endpoints.verifyEmailCode
export const getSignupEndpoint = () => endpoints.signup
export const getLoginEndpoint = () => endpoints.login
export const getReissueEndpoint = () => endpoints.reissue
export const getLogoutEndpoint = () => endpoints.logout

export async function requestEmailVerificationCode(email: string): Promise<SendEmailCodeData> {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    throw new AuthApiError('이메일을 입력해 주세요.', 400)
  }

  if (isMockMode) {
    await wait(mockDelayMs)
    return { sent: true }
  }

  return fetchJson<SendEmailCodeData>(endpoints.sendEmailCode, {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail } as SendEmailCodeRequest),
  })
}

export async function verifyEmailCode(email: string, code: string): Promise<VerifyEmailCodeData> {
  const normalizedEmail = normalizeEmail(email)
  const trimmedCode = code.trim()

  if (!trimmedCode) {
    throw new AuthApiError('인증번호를 입력해 주세요.', 400)
  }

  if (trimmedCode.length !== 6) {
    throw new AuthApiError('인증번호 6자리를 모두 입력해 주세요.', 400)
  }

  if (isMockMode) {
    await wait(mockDelayMs)
    if (trimmedCode !== mockVerificationCode) {
      throw new AuthApiError('인증 코드가 올바르지 않거나 만료되었습니다.', 400, 'INVALID_CODE')
    }

    return {
      verifyToken: `mock-verify-${normalizeEmail(email)}`,
    }
  }

  return fetchJson<VerifyEmailCodeData>(endpoints.verifyEmailCode, {
    method: 'POST',
    body: JSON.stringify({
      email: normalizedEmail,
      code: trimmedCode,
    } as VerifyEmailCodeRequest),
  })
}

export async function signup(payload: SignupRequest): Promise<AuthTokenData> {
  const normalizedEmail = normalizeEmail(payload.email)

  if (isMockMode) {
    await wait(mockDelayMs)
    return createMockAuthTokenData(normalizedEmail)
  }

  return fetchJson<AuthTokenData>(endpoints.signup, {
    method: 'POST',
    headers: {
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify({
      ...payload,
      email: normalizedEmail,
    } satisfies SignupRequest),
  })
}

export async function login(payload: LoginRequest): Promise<AuthTokenData> {
  const normalizedEmail = normalizeEmail(payload.email)

  if (isMockMode) {
    await wait(mockDelayMs)

    if (!normalizedEmail || !payload.password) {
      throw new AuthApiError(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
        401,
        'INVALID_CREDENTIALS',
      )
    }

    return createMockAuthTokenData(normalizedEmail)
  }

  return fetchJson<AuthTokenData>(endpoints.login, {
    method: 'POST',
    body: JSON.stringify({
      email: normalizedEmail,
      password: payload.password,
    } satisfies LoginRequest),
  })
}

export async function loginWithGoogle(payload: GoogleLoginRequest): Promise<GoogleLoginData> {
  if (isMockMode) {
    await wait(mockDelayMs)
    return {
      ...createMockAuthTokenData('google-user@dojeon.ai'),
      isNewUser: false,
    }
  }

  return fetchJson<GoogleLoginData>(endpoints.googleLogin, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function reissueTokens(payload: ReissueTokenRequest): Promise<AuthTokenData> {
  if (isMockMode) {
    await wait(mockDelayMs)
    return {
      ...createMockAuthTokenData('reissued-user@dojeon.ai'),
      refreshToken: payload.refreshToken || createMockToken('mock-refresh'),
    }
  }

  return fetchJson<AuthTokenData>(endpoints.reissue, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function logout(payload: LogoutRequest): Promise<LogoutData> {
  if (isMockMode) {
    await wait(mockDelayMs)
    return { loggedOut: true }
  }

  return fetchJson<LogoutData>(endpoints.logout, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function requestPasswordReset(email: string): Promise<SendEmailCodeData> {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    throw new AuthApiError('이메일을 입력해 주세요.', 400)
  }

  if (isMockMode) {
    await wait(mockDelayMs)
    return { sent: true }
  }

  return fetchJson<SendEmailCodeData>(endpoints.requestPasswordReset, {
    method: 'POST',
    body: JSON.stringify({ email: normalizedEmail } as SendEmailCodeRequest),
  })
}

export async function confirmPasswordReset(
  payload: PasswordResetConfirmRequest,
): Promise<PasswordResetConfirmData> {
  if (isMockMode) {
    await wait(mockDelayMs)

    if (payload.code.trim() !== mockVerificationCode) {
      throw new AuthApiError('인증 코드가 올바르지 않거나 만료되었습니다.', 400, 'INVALID_CODE')
    }

    return { reset: true }
  }

  return fetchJson<PasswordResetConfirmData>(endpoints.confirmPasswordReset, {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      email: normalizeEmail(payload.email),
      code: payload.code.trim(),
    } satisfies PasswordResetConfirmRequest),
  })
}

export async function checkNicknameAvailability(
  nickname: string,
): Promise<NicknameAvailabilityData> {
  const trimmedNickname = nickname.trim()

  if (!trimmedNickname) {
    throw new AuthApiError('닉네임을 입력해 주세요.', 400)
  }

  if (isMockMode) {
    await wait(mockDelayMs)
    return { available: trimmedNickname.toLowerCase() !== 'admin' }
  }

  const url = new URL(endpoints.checkNickname, window.location.origin)
  url.searchParams.set('nickname', trimmedNickname)

  return fetchJson<NicknameAvailabilityData>(url.toString(), {
    method: 'GET',
  })
}
