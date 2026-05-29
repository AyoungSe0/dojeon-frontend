import { useEffect, useState } from 'react'
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

const markOnboardingComplete = () => {
  writeLocalStorageItem(ONBOARDING_COMPLETED_KEY, 'true')
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

function App() {
  const [screen, setScreen] = useState<
    'splash' | 'login' | 'signup' | 'verify-email' | 'verify-success'
    | 'onboarding' | 'home' | 'class' | 'practice' | 'grammar-practice' | 'setting'
    | 'account-info' | 'preferences' | 'notebook' | 'vocabulary' | 'notebook-grammar'
    | 'lesson-detail' | 'vocabulary-lesson' | 'profile-main'
  >('splash')
  const [authSession, setAuthSession] = useState<AuthSession | null>(getStoredAuthSession)
  const [pendingSignup, setPendingSignup] = useState<SignupSubmission | null>(null)
  const [userName, setUserName] = useState(getOnboardingUsername)
  const [ageRange, setAgeRange] = useState(getStoredAgeRange)
  const [phoneNumber, setPhoneNumber] = useState(getStoredPhoneNumber)
  const [language, setLanguage] = useState(getStoredLanguage)
  const [koreanLevel, setKoreanLevel] = useState(getStoredKoreanLevel)
  const [dailyGoal, setDailyGoal] = useState(getStoredDailyGoal)
  const [koreanGoal, setKoreanGoal] = useState(getStoredKoreanGoal)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [selectedLessonNumericId, setSelectedLessonNumericId] = useState<number | null>(null)
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null)
  const [grammarPracticeInitialStep, setGrammarPracticeInitialStep] = useState<PracticeStep>(
    'choice',
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

  const currentEmail = authSession?.email ?? pendingSignup?.email ?? ''
  const currentUsername = currentEmail ? currentEmail.split('@')[0] : userName

  const resetLocalProfileState = () => {
    setUserName('Jinri')
    setAgeRange('')
    setPhoneNumber('')
    setLanguage('')
    setKoreanLevel('')
    setDailyGoal('')
    setKoreanGoal('')
  }

  const hasCompletedOnboarding =
    readLocalStorageItem(ONBOARDING_COMPLETED_KEY) === 'true'

  const handleEnterAfterAuth = () => {
    if (hasCompletedOnboarding) {
      setScreen('home')
      return
    }

    setScreen('onboarding')
  }

  const persistAuthSession = (email: string, tokenData: AuthTokenData) => {
    const didSwitchAccount = syncLocalAccountOwner(email)

    if (didSwitchAccount) {
      resetLocalProfileState()
    }

    const nextSession = buildAuthSession(email, tokenData)
    saveAuthSession(nextSession)
    setAuthSession(nextSession)
  }

  useEffect(() => {
    if (screen !== 'splash') {
      return
    }

    const timer = window.setTimeout(() => {
      if (authSession) {
        setScreen(hasCompletedOnboarding ? 'home' : 'onboarding')
        return
      }

      setScreen('login')
    }, 1200)

    return () => {
      window.clearTimeout(timer)
    }
  }, [authSession, hasCompletedOnboarding, screen])

  useEffect(() => {
    if (!authSession?.email) {
      return
    }

    const didSwitchAccount = syncLocalAccountOwner(authSession.email)

    if (didSwitchAccount) {
      resetLocalProfileState()
    }
  }, [authSession?.email])

  const handleLogout = async () => {
    setIsSigningOut(true)

    try {
      if (authSession?.refreshToken) {
        await logout({ refreshToken: authSession.refreshToken })
      }
    } catch {
      // Local sign-out still proceeds when the logout request fails.
    } finally {
      clearStoredAuthSession()
      setAuthSession(null)
      setPendingSignup(null)
      setSettingBackScreen('home')
      setScreen('login')
      setIsSigningOut(false)
    }
  }

  const handleOpenSection = (
    sectionId: number,
    sectionType: string,
    backScreen: 'class' | 'lesson-detail',
  ) => {
    setSelectedSectionId(sectionId)
    if (sectionType === 'VOCAB') {
      setVocabularyLessonBackScreen(backScreen)
      setScreen('vocabulary-lesson')
      return
    }
    setGrammarPracticeBackScreen(backScreen)
    if (sectionType === 'GRAMMAR') {
      setGrammarPracticeInitialStep('next-grammar')
    } else if (sectionType === 'READING') {
      setGrammarPracticeInitialStep('reading')
    } else {
      setGrammarPracticeInitialStep('listening')
    }
    setScreen('grammar-practice')
  }

  return (
    <div className="app-root">
      {import.meta.env.DEV ? (
        <button
          type="button"
          style={{
            position: 'fixed',
            top: 12,
            right: 12,
            zIndex: 9999,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #d0d0d0',
            background: '#fff',
            color: '#111',
            fontSize: 12,
          }}
          onClick={() => {
            clearOnboardingStorage()
            clearStoredAuthSession()
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

      {screen === 'splash' ? (
        <SplashPage />
      ) : screen === 'signup' ? (
        <SignupPage
          onBack={() => setScreen('login')}
          onSignupSuccess={(payload) => {
            setPendingSignup(payload)
            setScreen('verify-email')
          }}
        />
      ) : screen === 'verify-email' ? (
        <VerifyEmailPage
          email={pendingSignup?.email ?? ''}
          onBack={() => setScreen('signup')}
          onVerifySuccess={async (verifyToken) => {
            if (!pendingSignup) {
              throw new Error('회원가입 정보가 없습니다. 다시 시도해 주세요.')
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
      ) : screen === 'verify-success' ? (
        <VerifySuccessPage
          onStartLearning={() => {
            handleEnterAfterAuth()
          }}
        />
      ) : screen === 'onboarding' ? (
        <OnboardingPage
          onBack={() => setScreen('login')}
          onComplete={(values) => {
            const savedName = values.name?.trim() || 'Jinri'
            const savedAgeRange = values.ageRange ?? ''
            const savedLanguage = values.motherLanguage ?? ''
            const savedKoreanLevel = values.koreanLevel ?? ''
            const savedDailyGoal = values.dailyStudyTime ?? ''
            const savedKoreanGoal = values.goal ?? ''
            setUserName(savedName)
            setAgeRange(savedAgeRange)
            setLanguage(savedLanguage)
            setKoreanLevel(savedKoreanLevel)
            setDailyGoal(savedDailyGoal)
            setKoreanGoal(savedKoreanGoal)
            saveOnboardingUsername(savedName)
            writeLocalStorageItem(ACCOUNT_AGE_RANGE_KEY, savedAgeRange)
            writeLocalStorageItem(ACCOUNT_LANGUAGE_KEY, savedLanguage)
            writeLocalStorageItem(ACCOUNT_KOREAN_LEVEL_KEY, savedKoreanLevel)
            writeLocalStorageItem(ACCOUNT_DAILY_GOAL_KEY, savedDailyGoal)
            writeLocalStorageItem(ACCOUNT_KOREAN_GOAL_KEY, savedKoreanGoal)
            markOnboardingComplete()
            setScreen('home')
          }}
        />
      ) : screen === 'home' ? (
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
          onOpenGrammarPractice={() => {
            setGrammarPracticeInitialStep('choice')
            setGrammarPracticeBackScreen('home')
            setScreen('grammar-practice')
          }}
          onStartLesson={(lesson) => {
            setSelectedLessonNumericId(lesson.lessonId)
            handleOpenSection(lesson.sectionId, lesson.sectionType, 'class')
          }}
        />
      ) : screen === 'class' ? (
        <ClassPage
          onOpenHome={() => {
            setScreen('home')
          }}
          onOpenPractice={() => {
            setScreen('practice')
          }}
          onOpenProfile={() => {
            setScreen('profile-main')
          }}
          onOpenCurrentLesson={(sectionId, sectionType) => {
            handleOpenSection(sectionId, sectionType, 'class')
          }}
          onOpenLesson={(_courseId, lessonId) => {
            setSelectedLessonNumericId(lessonId)
            setScreen('lesson-detail')
          }}
        />
      ) : screen === 'lesson-detail' ? (
        <LessonDetailPage
          key={selectedLessonNumericId ?? 'none'}
          lessonId={selectedLessonNumericId}
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
      ) : screen === 'practice' ? (
        <PracticePage
          onBack={() => {
            setScreen('home')
          }}
        />
      ) : screen === 'setting' ? (
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
          onSignOut={() => {
            void handleLogout()
          }}
          isSigningOut={isSigningOut}
        />
      ) : screen === 'account-info' ? (
        <AccountInfoPage
          email={authSession?.email ?? ''}
          username={currentUsername}
          nickname={userName}
          phoneNumber={phoneNumber}
          ageGroupOrBirthday={ageRange}
          onSave={(values) => {
            const nextNickname = values.nickname.trim() || 'Jinri'
            const nextPhoneNumber = values.phoneNumber.trim()
            const nextAgeGroupOrBirthday = values.ageGroupOrBirthday.trim()

            setUserName(nextNickname)
            setPhoneNumber(nextPhoneNumber)
            setAgeRange(nextAgeGroupOrBirthday)

            saveOnboardingUsername(nextNickname)
            writeLocalStorageItem(ACCOUNT_PHONE_NUMBER_KEY, nextPhoneNumber)
            writeLocalStorageItem(ACCOUNT_AGE_RANGE_KEY, nextAgeGroupOrBirthday)
          }}
          onBack={() => {
            setScreen('setting')
          }}
        />
      ) : screen === 'preferences' ? (
        <PreferencesPage
          language={language}
          koreanLevel={koreanLevel}
          dailyGoal={dailyGoal}
          koreanGoal={koreanGoal}
          onSave={(values) => {
            setLanguage(values.language)
            setDailyGoal(values.dailyGoal)
            setKoreanGoal(values.koreanGoal)
            writeLocalStorageItem(ACCOUNT_LANGUAGE_KEY, values.language)
            writeLocalStorageItem(ACCOUNT_DAILY_GOAL_KEY, values.dailyGoal)
            writeLocalStorageItem(ACCOUNT_KOREAN_GOAL_KEY, values.koreanGoal)
          }}
          onBack={() => {
            setScreen('setting')
          }}
        />
      ) : screen === 'notebook' ? (
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
      ) : screen === 'vocabulary' ? (
        <VocabularyPage
          onBack={() => {
            setScreen('notebook')
          }}
        />
      ) : screen === 'vocabulary-lesson' ? (
        <VocabularyLessonPage
          sectionId={selectedSectionId}
          onBack={() => {
            setScreen(vocabularyLessonBackScreen)
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
          onOpenNotebook={() => {
            setScreen('notebook')
          }}
          onOpenProfile={() => {
            setScreen('profile-main')
          }}
          onOpenNextGrammar={() => {
            setGrammarPracticeInitialStep('next-grammar')
            setGrammarPracticeBackScreen('lesson-detail')
            setScreen('grammar-practice')
          }}
        />
      ) : screen === 'notebook-grammar' ? (
        <GrammarNotebookPage
          onBack={() => {
            setScreen('notebook')
          }}
        />
      ) : screen === 'profile-main' ? (
        <ProfileMainPage
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
            setSettingBackScreen('profile-main')
            setScreen('setting')
          }}
        />
      ) : screen === 'grammar-practice' ? (
        <GrammarPracticePage
          initialPracticeStep={grammarPracticeInitialStep}
          language={language}
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
            handleEnterAfterAuth()
          }}
        />
      )}
    </div>
  )
}

export default App
