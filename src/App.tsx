import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import './App.css'
import SplashPage from './pages/SplashPage'
import LoginPage from './pages/LoginPage'
import SignupPage, { type SignupSubmission } from './pages/SignupPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import VerifySuccessPage from './pages/VerifySuccessPage'
import OnboardingPage from './pages/OnboardingPage'
import HomePage from './pages/HomePage'
import PracticePage from './pages/PracticePage'
import GrammarPracticePage, { type PracticeStep } from './pages/GrammarPracticePage'
import ClassPage from './pages/ClassPage'
import SettingPage from './pages/SettingPage'
import AccountInfoPage from './pages/AccountInfoPage'
import PreferencesPage from './pages/PreferencesPage'
import NotebookPage from './pages/NotebookPage'
import VocabularyPage from './pages/VocabularyPage'
import GrammarNotebookPage from './pages/GrammarNotebookPage'
import LessonDetailPage from './pages/LessonDetailPage'
import VocabularyLessonPage from './pages/VocabularyLessonPage'
import ProfileMainPage from './pages/ProfileMainPage'
import ProfileAchievementsPage from './pages/ProfileAchievementsPage'
import type { PatchUserRequest } from './types/user.types'
import { isUnauthorizedError } from './services/apiError'
import { useChangeUserPassword } from './hooks/useChangeUserPassword.ts'
import { useUpdateUserMe } from './hooks/useUpdateUserMe.ts'
import { useUserMe } from './hooks/useUserMe.ts'
import {
  buildAuthSession,
  clearStoredAuthSession,
  getStoredAuthSession,
  login,
  logout,
  saveAuthSession,
  signup,
  type AuthSession,
  type AuthTokenData,
} from './services/auth'

const ONBOARDING_COMPLETED_KEY = 'dojeon:onboarding.completed'
const ONBOARDING_USERNAME_KEY = 'dojeon:onboarding.username'
const ACCOUNT_OWNER_EMAIL_KEY = 'dojeon:account.ownerEmail'
const LEGACY_ACCOUNT_EMAIL_KEY = 'dojeon:account.email'
const ACCOUNT_AGE_RANGE_KEY = 'dojeon:account.ageRange'
const ACCOUNT_PHONE_NUMBER_KEY = 'dojeon:account.phoneNumber'
const ACCOUNT_LANGUAGE_KEY = 'dojeon:account.language'
const ACCOUNT_KOREAN_LEVEL_KEY = 'dojeon:account.koreanLevel'
const ACCOUNT_DAILY_GOAL_KEY = 'dojeon:account.dailyGoal'
const ACCOUNT_KOREAN_GOAL_KEY = 'dojeon:account.koreanGoal'

const readLocalStorageItem = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const writeLocalStorageItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // localStorage can fail in private mode or restricted environments.
  }
}

const removeLocalStorageItem = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch {
    // localStorage can fail in private mode or restricted environments.
  }
}

const getOnboardingUsername = () => {
  const stored = readLocalStorageItem(ONBOARDING_USERNAME_KEY)
  return stored && stored.trim().length > 0 ? stored : 'Jinri'
}

const saveOnboardingUsername = (name: string) => {
  writeLocalStorageItem(ONBOARDING_USERNAME_KEY, name)
}

const normalizeStoredEmail = (value: string) => value.trim().toLowerCase()

const clearOnboardingStorage = () => {
  removeLocalStorageItem(ONBOARDING_COMPLETED_KEY)
  removeLocalStorageItem(ONBOARDING_USERNAME_KEY)
  removeLocalStorageItem(ACCOUNT_OWNER_EMAIL_KEY)
  removeLocalStorageItem(LEGACY_ACCOUNT_EMAIL_KEY)
  removeLocalStorageItem(ACCOUNT_AGE_RANGE_KEY)
  removeLocalStorageItem(ACCOUNT_PHONE_NUMBER_KEY)
  removeLocalStorageItem(ACCOUNT_LANGUAGE_KEY)
  removeLocalStorageItem(ACCOUNT_KOREAN_LEVEL_KEY)
  removeLocalStorageItem(ACCOUNT_DAILY_GOAL_KEY)
  removeLocalStorageItem(ACCOUNT_KOREAN_GOAL_KEY)
}

const syncLocalAccountOwner = (email: string) => {
  const normalizedEmail = normalizeStoredEmail(email)
  const currentOwner = normalizeStoredEmail(
    readLocalStorageItem(ACCOUNT_OWNER_EMAIL_KEY) ??
      readLocalStorageItem(LEGACY_ACCOUNT_EMAIL_KEY) ??
      '',
  )
  const didSwitchAccount = Boolean(currentOwner && currentOwner !== normalizedEmail)

  if (didSwitchAccount) {
    clearOnboardingStorage()
  }

  if (normalizedEmail) {
    writeLocalStorageItem(ACCOUNT_OWNER_EMAIL_KEY, normalizedEmail)
  }

  return didSwitchAccount
}

const getStoredAgeRange = () => {
  return readLocalStorageItem(ACCOUNT_AGE_RANGE_KEY) ?? ''
}

const getStoredPhoneNumber = () => {
  return readLocalStorageItem(ACCOUNT_PHONE_NUMBER_KEY) ?? ''
}

const getStoredLanguage = () => {
  return readLocalStorageItem(ACCOUNT_LANGUAGE_KEY) ?? ''
}

const getStoredKoreanLevel = () => {
  return readLocalStorageItem(ACCOUNT_KOREAN_LEVEL_KEY) ?? ''
}

const getStoredDailyGoal = () => {
  return readLocalStorageItem(ACCOUNT_DAILY_GOAL_KEY) ?? ''
}

const getStoredKoreanGoal = () => {
  return readLocalStorageItem(ACCOUNT_KOREAN_GOAL_KEY) ?? ''
}

const getOptionalString = (value: string) => {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const getOptionalNumber = (value: string) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

const getBirthdayOrAgeGroupPayload = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return {}

  if (/^\d{4}[-.]\d{2}[-.]\d{2}$/.test(trimmed)) {
    return { birthday: trimmed.replaceAll('.', '-') }
  }

  return { ageGroup: trimmed }
}

const normalizeBirthdayForApi = (value: string) => value.trim().replaceAll('.', '-')

const isBirthdayValue = (value: string) => /^\d{4}[-.]\d{2}[-.]\d{2}$/.test(value.trim())

type Screen =
  | 'splash' | 'login' | 'signup' | 'verify-email' | 'verify-success'
  | 'onboarding' | 'home' | 'class' | 'practice' | 'grammar-practice' | 'setting'
  | 'account-info' | 'preferences' | 'notebook' | 'vocabulary' | 'notebook-grammar'
  | 'lesson-detail' | 'vocabulary-lesson' | 'profile-main' | 'profile-achievements'

const devPreviewScreens = new Set<Screen>([
  'splash',
  'login',
  'signup',
  'verify-email',
  'verify-success',
  'onboarding',
  'home',
  'class',
  'practice',
  'grammar-practice',
  'setting',
  'account-info',
  'preferences',
  'notebook',
  'vocabulary',
  'notebook-grammar',
  'lesson-detail',
  'vocabulary-lesson',
  'profile-main',
  'profile-achievements',
])

const devPreviewPracticeSteps = new Set<PracticeStep>([
  'choice',
  'fill-intro',
  'fill',
  'make-intro',
  'make',
  'review',
  'reading',
  'listening',
  'next-grammar',
  'next-grammar-rules',
])

const devPreviewVocabularyViews = new Set(['intro', 'card', 'table', 'flashcards'])

const getDevSearchParams = () => new URLSearchParams(window.location.search)

const getDevPreviewScreen = (): Screen | null => {
  if (!import.meta.env.DEV) {
    return null
  }

  const previewScreen = getDevSearchParams().get('screen') as Screen | null
  return previewScreen && devPreviewScreens.has(previewScreen) ? previewScreen : null
}

const getInitialScreen = (): Screen => {
  return getDevPreviewScreen() ?? 'splash'
}

const getInitialLessonId = () => {
  return getDevPreviewScreen() === 'lesson-detail' ? -105 : null
}

const getInitialPracticeStep = (): PracticeStep => {
  if (getDevPreviewScreen() !== 'grammar-practice') {
    return 'choice'
  }

  const step = getDevSearchParams().get('step') as PracticeStep | null
  return step && devPreviewPracticeSteps.has(step) ? step : 'choice'
}

const getInitialVocabularyLessonView = () => {
  if (getDevPreviewScreen() !== 'vocabulary-lesson') {
    return undefined
  }

  const view = getDevSearchParams().get('view')
  return view && devPreviewVocabularyViews.has(view) ? view as 'intro' | 'card' | 'table' | 'flashcards' : undefined
}

const getInitialVocabularyCardIndex = () => {
  if (getDevPreviewScreen() !== 'vocabulary-lesson') {
    return undefined
  }

  const card = Number.parseInt(getDevSearchParams().get('card') ?? '', 10)
  return Number.isFinite(card) ? Math.max(0, card - 1) : undefined
}

const getDevPreviewCourseOrder = () => {
  if (getDevPreviewScreen() !== 'class') {
    return undefined
  }

  const course = Number.parseInt(getDevSearchParams().get('course') ?? '', 10)
  return Number.isFinite(course) ? Math.max(1, course) : undefined
}

const getDevPreviewLessonModuleOrder = () => {
  if (getDevPreviewScreen() !== 'lesson-detail') {
    return undefined
  }

  const module = Number.parseInt(getDevSearchParams().get('module') ?? '', 10)
  return Number.isFinite(module) ? Math.max(1, module) : undefined
}

interface ProfileSyncValues {
  name: string
  phoneNumber?: string
  ageRange: string
  ageGroup?: string
  birthday?: string
  language: string
  koreanLevel: string
  dailyGoal: string
  koreanGoal: string
}

function App() {
  const queryClient = useQueryClient()
  const updateUserMe = useUpdateUserMe()
  const changeUserPassword = useChangeUserPassword()
  const [screen, setScreen] = useState<Screen>(getInitialScreen)
  const [authSession, setAuthSession] = useState<AuthSession | null>(getStoredAuthSession)
  const [pendingSignup, setPendingSignup] = useState<SignupSubmission | null>(null)
  const [userName, setUserName] = useState(getOnboardingUsername)
  const [, setAgeRange] = useState(getStoredAgeRange)
  const [accountAgeGroup, setAccountAgeGroup] = useState('')
  const [accountBirthday, setAccountBirthday] = useState('')
  const [phoneNumber, setPhoneNumber] = useState(getStoredPhoneNumber)
  const [language, setLanguage] = useState(getStoredLanguage)
  const [koreanLevel, setKoreanLevel] = useState(getStoredKoreanLevel)
  const [dailyGoal, setDailyGoal] = useState(getStoredDailyGoal)
  const [koreanGoal, setKoreanGoal] = useState(getStoredKoreanGoal)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [minSplashElapsed, setMinSplashElapsed] = useState(false)
  const [onboardingSaveError, setOnboardingSaveError] = useState('')
  const [selectedLessonNumericId, setSelectedLessonNumericId] = useState<number | null>(
    getInitialLessonId,
  )
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null)
  const [grammarPracticeInitialStep, setGrammarPracticeInitialStep] = useState<PracticeStep>(
    getInitialPracticeStep,
  )
  const [grammarPracticeBackScreen, setGrammarPracticeBackScreen] = useState<
    'home' | 'class' | 'lesson-detail'
  >('home')
  const [vocabularyLessonBackScreen, setVocabularyLessonBackScreen] = useState<
    'class' | 'lesson-detail'
  >(
    'class',
  )
  const [settingBackScreen, setSettingBackScreen] = useState<'home' | 'profile-main'>('home')
  const {
    data: userMeData,
    error: userMeError,
    loaded: isUserMeLoaded,
    loading: isUserMeLoading,
  } = useUserMe(Boolean(authSession))

  const currentEmail = authSession?.email ?? pendingSignup?.email ?? ''
  const currentUsername =
    userMeData?.profile.username?.trim() ||
    (currentEmail ? currentEmail.split('@')[0] : userName)
  const isPushNotificationOn = userMeData?.profile.isPushNotificationOn ?? true
  const isDevPreview = getDevPreviewScreen() !== null

  const resetLocalProfileState = () => {
    setUserName('Jinri')
    setAgeRange('')
    setAccountAgeGroup('')
    setAccountBirthday('')
    setPhoneNumber('')
    setLanguage('')
    setKoreanLevel('')
    setDailyGoal('')
    setKoreanGoal('')
  }

  const clearAccountScopedQueries = useCallback(() => {
    queryClient.removeQueries({ queryKey: ['user', 'me'] })
    queryClient.removeQueries({ queryKey: ['home'] })
    queryClient.removeQueries({ queryKey: ['learning'] })
    queryClient.removeQueries({ queryKey: ['section'] })
    queryClient.removeQueries({ queryKey: ['scrap'] })
    queryClient.removeQueries({ queryKey: ['subscription'] })
    queryClient.removeQueries({ queryKey: ['user', 'me', 'achievement'] })
  }, [queryClient])

  const handleUnauthorized = useCallback(() => {
    clearStoredAuthSession()
    clearAccountScopedQueries()
    updateUserMe.reset()
    changeUserPassword.reset()
    setAuthSession(null)
    setPendingSignup(null)
    setSettingBackScreen('home')
    setScreen('login')
  }, [changeUserPassword, clearAccountScopedQueries, updateUserMe])

  const hasCompletedOnboarding = isUserMeLoaded && userMeData?.profile.isOnboarded === true
  const shouldWaitForUserMe =
    Boolean(authSession) && !userMeError && (!isUserMeLoaded || isUserMeLoading)
  const shouldClearAuthForUserMeError =
    isUnauthorizedError(userMeError)
  const isSettingScreen =
    screen === 'setting' || screen === 'account-info' || screen === 'preferences'
  const settingUnauthorizedError = [
    userMeError,
    updateUserMe.error,
    changeUserPassword.error,
  ].find(isUnauthorizedError)
  const visibleScreen = screen === 'splash' && minSplashElapsed && !authSession ? 'login' : screen

  const showSplash = () => {
    setMinSplashElapsed(false)
    setScreen('splash')
  }

  const persistAuthSession = (email: string, tokenData: AuthTokenData) => {
    const didSwitchAccount = syncLocalAccountOwner(email)

    if (didSwitchAccount) {
      clearAccountScopedQueries()
      resetLocalProfileState()
    }

    const nextSession = buildAuthSession(email, tokenData)
    saveAuthSession(nextSession)
    setAuthSession(nextSession)
  }

  const syncProfileState = useCallback((values: ProfileSyncValues) => {
    saveOnboardingUsername(values.name)
    writeLocalStorageItem(ACCOUNT_AGE_RANGE_KEY, values.ageRange)
    writeLocalStorageItem(ACCOUNT_LANGUAGE_KEY, values.language)
    writeLocalStorageItem(ACCOUNT_KOREAN_LEVEL_KEY, values.koreanLevel)
    writeLocalStorageItem(ACCOUNT_DAILY_GOAL_KEY, values.dailyGoal)
    writeLocalStorageItem(ACCOUNT_KOREAN_GOAL_KEY, values.koreanGoal)

    if (values.phoneNumber !== undefined) {
      writeLocalStorageItem(ACCOUNT_PHONE_NUMBER_KEY, values.phoneNumber)
      setPhoneNumber(values.phoneNumber)
    }

    setUserName(values.name)
    setAgeRange(values.ageRange)
    setAccountAgeGroup(
      values.ageGroup ?? (!values.birthday && !isBirthdayValue(values.ageRange) ? values.ageRange : ''),
    )
    setAccountBirthday(values.birthday ?? (isBirthdayValue(values.ageRange) ? values.ageRange : ''))
    setLanguage(values.language)
    setKoreanLevel(values.koreanLevel)
    setDailyGoal(values.dailyGoal)
    setKoreanGoal(values.koreanGoal)
  }, [])

  useEffect(() => {
    if (!authSession || !isSettingScreen || !settingUnauthorizedError) {
      return
    }

    const timer = window.setTimeout(handleUnauthorized, 0)
    return () => window.clearTimeout(timer)
  }, [authSession, handleUnauthorized, isSettingScreen, settingUnauthorizedError])

  useEffect(() => {
    if (screen !== 'splash') {
      return
    }

    if (minSplashElapsed) {
      return
    }

    const timer = window.setTimeout(() => {
      setMinSplashElapsed(true)
    }, 1200)

    return () => {
      window.clearTimeout(timer)
    }
  }, [minSplashElapsed, screen])

  useEffect(() => {
    if (screen !== 'splash' || !minSplashElapsed) {
      return
    }

    if (shouldWaitForUserMe) {
      return
    }

    if (userMeError) {
      if (shouldClearAuthForUserMeError) {
        const timer = window.setTimeout(handleUnauthorized, 0)
        return () => window.clearTimeout(timer)
      }

      return
    }

    const timer = window.setTimeout(
      () => setScreen(hasCompletedOnboarding ? 'home' : 'onboarding'),
      0,
    )
    return () => window.clearTimeout(timer)
  }, [
    authSession,
    handleUnauthorized,
    hasCompletedOnboarding,
    minSplashElapsed,
    screen,
    shouldClearAuthForUserMeError,
    shouldWaitForUserMe,
    userMeError,
  ])

  useEffect(() => {
    if (!authSession?.email) {
      return
    }

    const didSwitchAccount = syncLocalAccountOwner(authSession.email)

    if (didSwitchAccount) {
      const timer = window.setTimeout(() => {
        clearAccountScopedQueries()
        resetLocalProfileState()
      }, 0)

      return () => {
        window.clearTimeout(timer)
      }
    }
  }, [authSession?.email, clearAccountScopedQueries])

  useEffect(() => {
    if (!authSession || !userMeData) {
      return
    }

    const nextName = userMeData.profile.nickname?.trim() || getOnboardingUsername()
    const nextPhoneNumber = userMeData.profile.phoneNumber ?? ''
    const nextAgeGroup = userMeData.profile.ageGroup ?? ''
    const nextBirthday = userMeData.profile.birthday ?? ''
    const nextAgeRange = nextBirthday || nextAgeGroup
    // 서버에 mother language가 아직 없으면 온보딩에서 고른 값을 덮어쓰지 않는다.
    const nextLanguage = userMeData.profile.motherLanguage ?? getStoredLanguage()
    const nextKoreanLevel = userMeData.profile.proficiencyLevel ?? ''
    const nextDailyGoal = userMeData.profile.dailyGoalMin?.toString() ?? ''
    const nextKoreanGoal = userMeData.profile.learningGoal ?? ''

    const timer = window.setTimeout(() => {
      syncProfileState({
        name: nextName,
        phoneNumber: nextPhoneNumber,
        ageRange: nextAgeRange,
        ageGroup: nextAgeGroup,
        birthday: nextBirthday,
        language: nextLanguage,
        koreanLevel: nextKoreanLevel,
        dailyGoal: nextDailyGoal,
        koreanGoal: nextKoreanGoal,
      })
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [authSession, syncProfileState, userMeData])

  const handleLogout = async () => {
    setIsSigningOut(true)

    try {
      if (authSession?.refreshToken) {
        await logout({ refreshToken: authSession.refreshToken })
      }
    } catch {
      // Local sign-out still proceeds when the logout request fails.
    } finally {
      handleUnauthorized()
      setIsSigningOut(false)
    }
  }

  const clearAccountInfoSaveError = useCallback(() => {
    updateUserMe.reset()
    changeUserPassword.reset()
  }, [changeUserPassword, updateUserMe])

  const handleOpenSection = (
    sectionId: number,
    sectionType: string,
    backScreen: 'class' | 'lesson-detail',
  ) => {
    if (sectionType === 'VOCAB') {
      setSelectedSectionId(sectionId)
      setVocabularyLessonBackScreen(backScreen)
      setScreen('vocabulary-lesson')
      return
    }

    if (sectionType === 'GRAMMAR') {
      setGrammarPracticeInitialStep('next-grammar')
    } else if (sectionType === 'READING') {
      setGrammarPracticeInitialStep('reading')
    } else if (sectionType === 'LISTENING') {
      setGrammarPracticeInitialStep('listening')
    } else {
      console.warn(`Unsupported section type: ${sectionType}`)
      return
    }

    setSelectedSectionId(sectionId)
    setGrammarPracticeBackScreen(backScreen)
    setScreen('grammar-practice')
  }

  return (
    <div className="app-root">
      {import.meta.env.DEV && !isDevPreview ? (
        <button
          type="button"
          className="app-dev-reset-button"
          onClick={() => {
            clearOnboardingStorage()
            clearStoredAuthSession()
            clearAccountScopedQueries()
            setAuthSession(null)
            setPendingSignup(null)
            setUserName('Jinri')
            setAgeRange('')
            setPhoneNumber('')
            setLanguage('')
            setKoreanLevel('')
            setDailyGoal('')
            setKoreanGoal('')
            setScreen('login')
          }}
        >
          Reset onboarding state
        </button>
      ) : null}

      {visibleScreen === 'splash' ? (
        <SplashPage />
      ) : visibleScreen === 'signup' ? (
        <SignupPage
          onBack={() => setScreen('login')}
          onSignupSuccess={(payload) => {
            setPendingSignup(payload)
            setScreen('verify-email')
          }}
        />
      ) : visibleScreen === 'verify-email' ? (
        <VerifyEmailPage
          email={pendingSignup?.email ?? ''}
          onBack={() => setScreen('signup')}
          onVerifySuccess={async (verifyToken) => {
            if (!pendingSignup) {
              throw new Error('Sign-up information is missing. Please try again.')
            }

            const tokenData = await signup({
              verifyToken,
              ...pendingSignup,
            })

            persistAuthSession(pendingSignup.email, tokenData)
            setPendingSignup(null)
            setScreen('verify-success')
          }}
        />
      ) : visibleScreen === 'verify-success' ? (
        <VerifySuccessPage
          onStartLearning={() => {
            showSplash()
          }}
        />
      ) : visibleScreen === 'onboarding' ? (
        <OnboardingPage
          onBack={() => setScreen('login')}
          isSaving={updateUserMe.isPending}
          saveError={onboardingSaveError}
          onComplete={async (values) => {
            const savedName = values.name?.trim() || 'Jinri'
            const savedAgeRange = values.ageRange ?? ''
            const savedLanguage = values.motherLanguage ?? ''
            const savedKoreanLevel = values.koreanLevel ?? ''
            const savedDailyGoal = values.dailyStudyTime ?? ''
            const savedKoreanGoal = values.goal ?? ''
            setOnboardingSaveError('')

            try {
              await updateUserMe.mutateAsync({
                nickname: savedName,
                motherLanguage: getOptionalString(savedLanguage),
                proficiencyLevel: getOptionalString(savedKoreanLevel),
                dailyGoalMin: getOptionalNumber(savedDailyGoal),
                learningGoal: getOptionalString(savedKoreanGoal),
                ...getBirthdayOrAgeGroupPayload(savedAgeRange),
                isOnboarded: true,
              })
            } catch (error) {
              setOnboardingSaveError(
                error instanceof Error ? error.message : 'Failed to save onboarding.',
              )
              return
            }

            syncProfileState({
              name: savedName,
              ageRange: savedAgeRange,
              ageGroup: isBirthdayValue(savedAgeRange) ? '' : savedAgeRange,
              birthday: isBirthdayValue(savedAgeRange) ? normalizeBirthdayForApi(savedAgeRange) : '',
              language: savedLanguage,
              koreanLevel: savedKoreanLevel,
              dailyGoal: savedDailyGoal,
              koreanGoal: savedKoreanGoal,
            })
            setScreen('home')
          }}
        />
      ) : visibleScreen === 'home' ? (
        <HomePage
          userName={userName}
          onOpenClass={() => {
            setScreen('class')
          }}
          onOpenNotebook={() => {
            setScreen('notebook')
          }}
          onOpenProfile={() => {
            setScreen('profile-main')
          }}
          onOpenPractice={() => {
            setScreen('practice')
          }}
          onStartLesson={(lesson) => {
            setSelectedLessonNumericId(lesson.lessonId)
            handleOpenSection(lesson.sectionId, lesson.sectionType, 'class')
          }}
        />
      ) : visibleScreen === 'class' ? (
        <ClassPage
          preferFallbackContent={isDevPreview}
          defaultOpenCourseOrder={getDevPreviewCourseOrder()}
          onUnauthorized={handleUnauthorized}
          onOpenHome={() => {
            setScreen('home')
          }}
          onOpenPractice={() => {
            setScreen('practice')
          }}
          onOpenNotebook={() => {
            setScreen('notebook')
          }}
          onOpenProfile={() => {
            setScreen('profile-main')
          }}
          onOpenLesson={(_courseId, lessonId) => {
            setSelectedLessonNumericId(lessonId)
            setScreen('lesson-detail')
          }}
        />
      ) : visibleScreen === 'lesson-detail' ? (
        <LessonDetailPage
          key={selectedLessonNumericId ?? 'none'}
          lessonId={selectedLessonNumericId}
          initialSelectedModuleOrder={getDevPreviewLessonModuleOrder()}
          onSelectLesson={(lessonId) => {
            setSelectedLessonNumericId(lessonId)
          }}
          onStartLesson={(sectionId, sectionType) => {
            handleOpenSection(sectionId, sectionType, 'lesson-detail')
          }}
          onBack={() => {
            setScreen('class')
          }}
        />
      ) : visibleScreen === 'practice' ? (
        <PracticePage
          onBack={() => {
            setScreen('home')
          }}
          onOpenHome={() => {
            setScreen('home')
          }}
          onOpenClass={() => {
            setScreen('class')
          }}
          onOpenNotebook={() => {
            setScreen('notebook')
          }}
          onOpenProfile={() => {
            setScreen('profile-main')
          }}
        />
      ) : visibleScreen === 'setting' ? (
        <SettingPage
          onBack={() => {
            setScreen(settingBackScreen)
          }}
          onOpenAccountInfo={() => {
            setScreen('account-info')
          }}
          onOpenPreferences={() => {
            setScreen('preferences')
          }}
          isPushNotificationOn={isPushNotificationOn}
          onTogglePushNotifications={async () => {
            await updateUserMe.mutateAsync({
              isPushNotificationOn: !isPushNotificationOn,
            })
          }}
          onSignOut={() => {
            void handleLogout()
          }}
          isSigningOut={isSigningOut}
          isSavingNotification={updateUserMe.isPending}
          notificationError={
            isUnauthorizedError(updateUserMe.error) ? null : updateUserMe.error?.message ?? null
          }
          onClearNotificationError={() => updateUserMe.reset()}
        />
      ) : visibleScreen === 'account-info' ? (
        <AccountInfoPage
          email={authSession?.email ?? ''}
          username={currentUsername}
          nickname={userName}
          hasPassword={userMeData?.profile.hasPassword ?? true}
          phoneNumber={phoneNumber}
          ageGroup={accountAgeGroup}
          birthday={accountBirthday}
          onSave={async (values) => {
            const userPatch: PatchUserRequest = {}

            if (values.nickname !== undefined) {
              const nextNickname = values.nickname.trim() || 'Jinri'
              userPatch.nickname = nextNickname
            }

            if (values.phoneNumber !== undefined) {
              const nextPhoneNumber = values.phoneNumber.trim()
              userPatch.phoneNumber = getOptionalString(nextPhoneNumber)
            }

            if (values.ageGroup !== undefined) {
              userPatch.ageGroup = getOptionalString(values.ageGroup.trim())
            }

            if (values.birthday !== undefined) {
              userPatch.birthday = getOptionalString(normalizeBirthdayForApi(values.birthday))
            }

            if (Object.keys(userPatch).length > 0) {
              await updateUserMe.mutateAsync(userPatch)
            }

            if (values.nickname !== undefined) {
              const nextNickname = values.nickname.trim() || 'Jinri'
              setUserName(nextNickname)
              saveOnboardingUsername(nextNickname)
            }

            if (values.phoneNumber !== undefined) {
              const nextPhoneNumber = values.phoneNumber.trim()
              setPhoneNumber(nextPhoneNumber)
              writeLocalStorageItem(ACCOUNT_PHONE_NUMBER_KEY, nextPhoneNumber)
            }

            if (values.ageGroup !== undefined || values.birthday !== undefined) {
              await queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
            }

            if (values.passwordChange) {
              await changeUserPassword.mutateAsync(values.passwordChange)
            }
          }}
          isSaving={updateUserMe.isPending || changeUserPassword.isPending}
          saveError={
            isUnauthorizedError(updateUserMe.error) || isUnauthorizedError(changeUserPassword.error)
              ? null
              : updateUserMe.error?.message ?? changeUserPassword.error?.message ?? null
          }
          onClearSaveError={clearAccountInfoSaveError}
          onBack={() => {
            setScreen('setting')
          }}
        />
      ) : visibleScreen === 'preferences' ? (
        <PreferencesPage
          language={language}
          koreanLevel={koreanLevel}
          dailyGoal={dailyGoal}
          koreanGoal={koreanGoal}
          onSave={async (values) => {
            await updateUserMe.mutateAsync({
              motherLanguage: getOptionalString(values.language),
              proficiencyLevel: getOptionalString(values.koreanLevel),
              dailyGoalMin: getOptionalNumber(values.dailyGoal),
              learningGoal: getOptionalString(values.koreanGoal),
            })

            setLanguage(values.language)
            setKoreanLevel(values.koreanLevel)
            setDailyGoal(values.dailyGoal)
            setKoreanGoal(values.koreanGoal)
            writeLocalStorageItem(ACCOUNT_LANGUAGE_KEY, values.language)
            writeLocalStorageItem(ACCOUNT_KOREAN_LEVEL_KEY, values.koreanLevel)
            writeLocalStorageItem(ACCOUNT_DAILY_GOAL_KEY, values.dailyGoal)
            writeLocalStorageItem(ACCOUNT_KOREAN_GOAL_KEY, values.koreanGoal)
          }}
          isSaving={updateUserMe.isPending}
          saveError={isUnauthorizedError(updateUserMe.error) ? null : updateUserMe.error?.message ?? null}
          onClearSaveError={clearAccountInfoSaveError}
          onBack={() => {
            setScreen('setting')
          }}
        />
      ) : visibleScreen === 'notebook' ? (
        <NotebookPage
          userName={userName}
          onOpenGrammarNotebook={() => {
            setScreen('notebook-grammar')
          }}
          onOpenVocabulary={() => {
            setScreen('vocabulary')
          }}
          onOpenHome={() => {
            setScreen('home')
          }}
          onOpenClass={() => {
            setScreen('class')
          }}
          onOpenPractice={() => {
            setScreen('practice')
          }}
          onOpenProfile={() => {
            setScreen('profile-main')
          }}
        />
      ) : visibleScreen === 'vocabulary' ? (
        <VocabularyPage
          language={language}
          onBack={() => {
            setScreen('notebook')
          }}
        />
      ) : visibleScreen === 'vocabulary-lesson' ? (
        <VocabularyLessonPage
          language={language}
          sectionId={selectedSectionId}
          initialView={getInitialVocabularyLessonView()}
          initialCardIndex={getInitialVocabularyCardIndex()}
          onBack={() => {
            setScreen(vocabularyLessonBackScreen)
          }}
          onOpenNextGrammar={(nextSectionId) => {
            if (nextSectionId === null) {
              setSelectedSectionId(null)
            } else if (nextSectionId !== undefined) {
              setSelectedSectionId(nextSectionId)
            }
            setGrammarPracticeInitialStep('next-grammar')
            setGrammarPracticeBackScreen('lesson-detail')
            setScreen('grammar-practice')
          }}
        />
      ) : visibleScreen === 'notebook-grammar' ? (
        <GrammarNotebookPage
          language={language}
          onBack={() => {
            setScreen('notebook')
          }}
        />
      ) : visibleScreen === 'profile-main' ? (
        <ProfileMainPage
          preferFallbackContent={isDevPreview}
          nickname={userName}
          username={currentUsername}
          onOpenHome={() => {
            setScreen('home')
          }}
          onOpenClass={() => {
            setScreen('class')
          }}
          onOpenPractice={() => {
            setScreen('practice')
          }}
          onOpenNotebook={() => {
            setScreen('notebook')
          }}
          onOpenSetting={() => {
            clearAccountInfoSaveError()
            setSettingBackScreen('profile-main')
            setScreen('setting')
          }}
          onOpenAchievements={() => {
            setScreen('profile-achievements')
          }}
          onUnauthorized={handleUnauthorized}
        />
      ) : visibleScreen === 'profile-achievements' ? (
        <ProfileAchievementsPage
          onBack={() => {
            setScreen('profile-main')
          }}
          onUnauthorized={handleUnauthorized}
        />
      ) : visibleScreen === 'grammar-practice' ? (
        <GrammarPracticePage
          initialPracticeStep={grammarPracticeInitialStep}
          language={language}
          sectionId={selectedSectionId!}
          onBack={() => {
            setScreen(grammarPracticeBackScreen)
          }}
        />
      ) : (
        <LoginPage
          onSignUp={() => setScreen('signup')}
          onLogin={async (credentials) => {
            const tokenData = await login(credentials)
            persistAuthSession(credentials.email, tokenData)
            setPendingSignup(null)
            showSplash()
          }}
        />
      )}
    </div>
  )
}

export default App
