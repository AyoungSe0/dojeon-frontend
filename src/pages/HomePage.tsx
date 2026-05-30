import { useMemo, useState } from 'react'
import './HomePage.css'
import homeIcon from '../assets/home.svg'
import editIcon from '../assets/edit.svg'
import fileIcon from '../assets/file.svg'
import bookOpenIcon from '../assets/book-open.svg'
import profileIcon from '../assets/user.svg'
import type { LastLesson } from '../types/home.types.ts'
import { useHomeResume } from '../hooks/useHomeResume.ts'

const tabs = [
  { icon: homeIcon, label: 'HOME' },
  { icon: editIcon, label: 'CLASS' },
  { icon: fileIcon, label: 'PRACTICE' },
  { icon: bookOpenIcon, label: 'NOTEBOOK' },
  { icon: profileIcon, label: 'PROFILE' },
]

interface HomePageProps {
  userName?: string
  onOpenClass: () => void
  onOpenNotebook: () => void
  onOpenProfile: () => void
  onOpenPractice: () => void
  onOpenGrammarPractice: () => void
  onStartLesson?: (lesson: LastLesson) => void
}

function getLessonPreview(lesson: LastLesson): string {
  switch (lesson.sectionType) {
    case 'GRAMMAR':
      return lesson.grammarPreview ?? ''
    case 'VOCAB':
      return lesson.vocabPreview ?? ''
    case 'LISTENING':
      return lesson.listeningPreview ?? ''
    case 'SPEAKING':
      return lesson.speakingPreview ?? ''
    case 'READING':
      return lesson.readingPreview ?? ''
    default:
      return ''
  }
}

function HomePage({
  userName,
  onOpenClass,
  onOpenNotebook,
  onOpenProfile,
  onOpenPractice,
  onOpenGrammarPractice,
  onStartLesson,
}: HomePageProps) {
  const [selectedGoalType, setSelectedGoalType] = useState<'today' | 'week'>('today')
  const { data, loading, error, refetch } = useHomeResume()

  const displayName = data?.userFirstName ?? userName ?? ''
  const dailyStreak = data?.dailyStreak ?? 0
  const lastLesson = data?.lastLesson ?? null

  const activeGoal = useMemo(() => {
    if (selectedGoalType === 'today') {
      return {
        title: "Today's Goal",
        current: data?.todayGoal.studiedMin ?? 0,
        total: data?.todayGoal.targetMin ?? 0,
      }
    }
    return {
      title: 'Week Goal',
      current: data?.weekGoal.studiedMin ?? 0,
      total: data?.weekGoal.targetMin ?? 0,
    }
  }, [data, selectedGoalType])

  const progressPercent =
    activeGoal.total > 0
      ? Math.min(100, Math.max(0, (activeGoal.current / activeGoal.total) * 100))
      : 0
  const shortFillPercent = progressPercent
  const bubbleLeft = Math.min(98, Math.max(2, progressPercent))

  if (loading && !data) {
    return (
      <main className="home-screen">
        <section className="home-content">
          <p className="home-loading">Loading…</p>
        </section>
      </main>
    )
  }

  if (error && !data) {
    return (
      <main className="home-screen">
        <section className="home-content">
          <p className="home-error">{error.message}</p>
          <button type="button" onClick={() => void refetch()}>
            Retry
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="home-screen">
      <section className="home-content">
        <header className="home-greeting">
          <p className="home-greeting-hi">Hi, {displayName}</p>
          <p className="home-greeting-welcome">Welcome back</p>
        </header>

        <section className="home-card goal-card">
          <div className="goal-segmented" role="tablist" aria-label="Goal period">
            <button
              type="button"
              role="tab"
              aria-selected={selectedGoalType === 'today'}
              className={`goal-tab goal-tab-left ${selectedGoalType === 'today' ? 'selected' : ''}`}
              onClick={() => setSelectedGoalType('today')}
            >
              Today&apos;s Goal
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedGoalType === 'week'}
              className={`goal-tab goal-tab-right ${selectedGoalType === 'week' ? 'selected' : ''}`}
              onClick={() => setSelectedGoalType('week')}
            >
              Week Goal
            </button>
          </div>

          <section className="goal-card-body">
            <section className="goal-progress" aria-label={`${activeGoal.title} 진행 상태`}>
              <div className="goal-progress-row">
                <div className="goal-progress-track-wrap">
                  <div
                    className="goal-progress-bubble"
                    style={{ left: `${bubbleLeft}%` }}
                    aria-hidden="true"
                  >
                    {activeGoal.current}min
                  </div>
                  <div
                    className="goal-progress-track"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progressPercent)}
                  >
                    <div
                      className="goal-progress-fill"
                      style={{ width: `${shortFillPercent}%` }}
                    />
                  </div>
                </div>
                <span className="goal-total">{activeGoal.total}min</span>
              </div>
            </section>
          </section>
        </section>

        <section className="home-card streak-card">
          <h2 className="streak-title">{dailyStreak} days in a row !</h2>
          <div className="streak-indicators" role="region" aria-label="연속 학습 진행 상태">
            <div className="streak-track">
              {Array.from({ length: 20 }).map((_, index) => (
                <span
                  key={index}
                  className={`streak-dot ${index < dailyStreak ? 'filled' : ''}`}
                />
              ))}
            </div>
          </div>
        </section>

        {lastLesson && (
          <section className="home-card lesson-card">
            <div className="lesson-head">
              <h3 className="lesson-title">Today&apos;s lesson</h3>
              <p className="lesson-subtitle">
                Course {lastLesson.courseId} lesson {lastLesson.lessonId}
              </p>
            </div>
            <div className="lesson-body">
              <p className="lesson-sentence primary">{lastLesson.lessonTitle}</p>
              <p className="lesson-sentence secondary">
                <span className="lesson-word">{lastLesson.sectionTitle}</span>
                <span className="lesson-apply">{getLessonPreview(lastLesson)}</span>
              </p>
              <p className="lesson-sentence secondary">
                <span className="lesson-word">Progress</span>
                <span className="lesson-apply">{lastLesson.overallProgressPercent}%</span>
              </p>
            </div>
            <button
              className="start-btn"
              type="button"
              onClick={() => onStartLesson?.(lastLesson)}
            >
              START
            </button>
          </section>
        )}

        <button
          type="button"
          className="home-card practice-card practice-card-button"
          onClick={onOpenGrammarPractice}
        >
          <h3 className="practice-title">Practice</h3>
          <div className="practice-content" role="list">
            <p className="practice-item" role="listitem">Practice 1: Grammar basics</p>
            <p className="practice-item" role="listitem">Practice 2: Sentence ending patterns</p>
            <p className="practice-item" role="listitem">Practice 3: Q&amp;A with honorifics</p>
            <p className="practice-item" role="listitem">Practice 4: Everyday conversation</p>
            <p className="practice-item" role="listitem">Practice 5: Listening check</p>
            <p className="practice-item" role="listitem">Practice 6: Speaking repeats</p>
          </div>
        </button>
      </section>

      <nav className="home-bottom-nav">
        {tabs.map((tab) => (
          <button
            type="button"
            className={`home-tab ${tab.label === 'HOME' ? 'home-tab-active' : ''}`}
            key={tab.label}
            onClick={() => {
              if (tab.label === 'CLASS') onOpenClass()
              if (tab.label === 'PRACTICE') onOpenPractice()
              if (tab.label === 'NOTEBOOK') onOpenNotebook()
              if (tab.label === 'PROFILE') onOpenProfile()
            }}
          >
            <img className="home-tab-icon" src={tab.icon} alt="" aria-hidden="true" />
            <span className="home-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </main>
  )
}

export default HomePage