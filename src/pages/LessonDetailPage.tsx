import { useState } from 'react'
import './LessonDetailPage.css'
import { useLessonSections } from '../hooks/useLessonSections.ts'
import { useSaveSectionProgress } from '../hooks/useSaveSectionProgress.ts'

type LessonPathId = 'vocab' | 'grammar' | 'reading' | 'listening'

const lessonPathOptions: { id: LessonPathId; label: string }[] = [
  { id: 'vocab', label: 'Vocab' },
  { id: 'grammar', label: 'Grammar' },
  { id: 'reading', label: 'Reading' },
  { id: 'listening', label: 'Listening' },
]

const minimumModuleFillPercent = 6
const lessonProgressDotSize = 6

function sectionTypeFromPathId(pathId: LessonPathId): string {
  switch (pathId) {
    case 'vocab': return 'VOCAB'
    case 'grammar': return 'GRAMMAR'
    case 'reading': return 'READING'
    case 'listening': return 'LISTENING'
  }
}

interface LessonDetailPageProps {
  lessonId: number | null
  onSelectLesson: (lessonId: number) => void
  onStartLesson: (sectionId: number, sectionType: string) => void
  onBack: () => void
}

function LessonDetailPage({
  lessonId,
  onSelectLesson,
  onStartLesson,
  onBack,
}: LessonDetailPageProps) {
  const { data, loading, error } = useLessonSections(lessonId)
  const saveProgress = useSaveSectionProgress()

  const [isLessonPickerOpen, setIsLessonPickerOpen] = useState(false)
  const [selectedPathId, setSelectedPathId] = useState<LessonPathId>('vocab')
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)

  const sections = data?.sections ?? []
  const overallProgress = data?.overallProgressPercent ?? 0
  const siblingLessons = data?.siblingLessons ?? []
  const lessonTitle = data?.title ?? ''

  const moduleProgressDisplayValues = sections.map((s) =>
    s.progressPercent >= 100 ? 100 : Math.max(s.progressPercent, minimumModuleFillPercent),
  )

  const handleStartLesson = () => {
    if (!sections.length) return
    const targetType = sectionTypeFromPathId(selectedPathId)
    const section = sections.find((s) => s.type === targetType)
    const fallback = sections.find((s) => !s.isCompleted) ?? sections[0]
    const target = section ?? fallback
    if (target) {
      onStartLesson(target.sectionId, target.type)
    }
  }

  const handleMarkComplete = async () => {
    if (selectedModuleId === null) return
    const section = sections.find((s) => s.sectionId === selectedModuleId)
    if (!section) return

    await saveProgress.mutateAsync({
      sectionId: selectedModuleId,
      payload: {
        currentPage: section.totalPages || 1,
        stayTimeSeconds: 0,
        forceComplete: true,
        difficulty: 'NORMAL',
      },
    })
    setSelectedModuleId(null)
  }

  if (loading) {
    return (
      <main className="lesson-detail-screen">
        <section className="lesson-detail-content">
          <div className="lesson-detail-header-area">
            <header className="lesson-detail-header">
              <button type="button" className="lesson-detail-back" onClick={onBack} aria-label="뒤로 가기">
                <svg className="lesson-detail-back-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </header>
          </div>
          <p className="lesson-detail-status">Loading…</p>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="lesson-detail-screen">
        <section className="lesson-detail-content">
          <div className="lesson-detail-header-area">
            <header className="lesson-detail-header">
              <button type="button" className="lesson-detail-back" onClick={onBack} aria-label="뒤로 가기">
                <svg className="lesson-detail-back-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </header>
          </div>
          <p className="lesson-detail-status">{error.message}</p>
        </section>
      </main>
    )
  }

  return (
    <main className="lesson-detail-screen">
      <section className="lesson-detail-content">
        <div className="lesson-detail-header-area">
          <header className="lesson-detail-header">
            <button
              type="button"
              className="lesson-detail-back"
              onClick={onBack}
              aria-label="뒤로 가기"
            >
              <svg
                className="lesson-detail-back-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              className="lesson-detail-picker-toggle"
              aria-expanded={isLessonPickerOpen}
              aria-controls="lesson-detail-picker-panel"
              onClick={() => setIsLessonPickerOpen((current) => !current)}
            >
              <h1 className="lesson-detail-title">{lessonTitle}</h1>
              <svg
                className={`lesson-detail-picker-icon ${
                  isLessonPickerOpen
                    ? 'lesson-detail-picker-icon-open'
                    : 'lesson-detail-picker-icon-closed'
                }`}
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4.5 6.75L9 11.25L13.5 6.75"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </header>

          {isLessonPickerOpen ? (
            <section id="lesson-detail-picker-panel" className="lesson-detail-picker-panel">
              {siblingLessons.map((lesson) => {
                const isCurrent = lesson.lessonId === lessonId

                return (
                  <button
                    key={lesson.lessonId}
                    type="button"
                    className={`lesson-detail-picker-option ${
                      isCurrent ? 'lesson-detail-picker-option-current' : ''
                    }`}
                    onClick={() => {
                      onSelectLesson(lesson.lessonId)
                      setIsLessonPickerOpen(false)
                    }}
                  >
                    {lesson.title}
                  </button>
                )
              })}
            </section>
          ) : null}
        </div>

        <section className="lesson-detail-path-section" aria-label="Choose path">
          <div className="lesson-detail-path-head">
            <h2 className="lesson-detail-path-title">Choose path</h2>
            <button
              type="button"
              className="lesson-detail-path-info"
              aria-label="Path information"
            >
              <svg
                className="lesson-detail-path-info-icon"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="9" cy="9" r="7.25" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M9 7.2V11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="9" cy="5.1" r="0.9" fill="currentColor" />
              </svg>
            </button>
          </div>

          <div className="lesson-detail-path-list">
            {lessonPathOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className="lesson-detail-path-item"
                onClick={() => setSelectedPathId(option.id)}
              >
                <span
                  className={`lesson-detail-path-box ${
                    selectedPathId === option.id ? 'lesson-detail-path-box-selected' : ''
                  }`}
                  aria-hidden="true"
                />
                <span className="lesson-detail-path-label">{option.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="lesson-detail-progress-section" aria-label="My Progress">
          <h2 className="lesson-detail-progress-title">My Progress</h2>
          <p className="lesson-detail-progress-copy">{`${Math.round(overallProgress)}% complete`}</p>

          <div className="lesson-detail-progress-bar" role="list" aria-label="lesson progress">
            <span className="lesson-detail-progress-track" aria-hidden="true" />
            <span
              className="lesson-detail-progress-fill"
              style={{ width: `${overallProgress}%` }}
              aria-hidden="true"
            />
            {sections.map((_, index) => (
              <span
                key={index}
                className={`lesson-detail-progress-dot ${
                  overallProgress > 0 &&
                  index <= Math.floor((overallProgress / 100) * (sections.length - 1))
                    ? 'lesson-detail-progress-dot-past'
                    : 'lesson-detail-progress-dot-upcoming'
                }`}
                style={{
                  left: `calc((((100% - ${sections.length * lessonProgressDotSize}px) / ${
                    sections.length + 1
                  }) * ${index + 1}) + ${lessonProgressDotSize * index + lessonProgressDotSize / 2}px)`,
                }}
                role="listitem"
              />
            ))}
          </div>

          <div className="lesson-detail-module-grid">
            {sections.map((section, index) => {
              const isCompleted = section.isCompleted

              return (
                <button
                  key={section.sectionId}
                  type="button"
                  className={`lesson-detail-module-card ${
                    selectedModuleId === section.sectionId || isCompleted
                      ? 'lesson-detail-module-card-selected'
                      : ''
                  }`}
                  onClick={() => {
                    if (isCompleted) return
                    setSelectedModuleId((current) =>
                      current === section.sectionId ? null : section.sectionId,
                    )
                  }}
                >
                  <h3 className="lesson-detail-module-title">{section.title}</h3>
                  <span className="lesson-detail-module-progress">
                    <span
                      className="lesson-detail-module-progress-fill"
                      style={{ width: `${moduleProgressDisplayValues[index]}%` }}
                    />
                  </span>
                </button>
              )
            })}
          </div>

          <div className="lesson-detail-action-row">
            {selectedModuleId !== null ? (
              <div className="lesson-detail-complete-wrap">
                <span className="lesson-detail-complete-bubble">Mark as complete</span>
                <button
                  type="button"
                  className="lesson-detail-complete-button"
                  aria-label="Mark as complete"
                  disabled={saveProgress.isPending}
                  onClick={() => void handleMarkComplete()}
                >
                  <svg
                    className="lesson-detail-complete-icon"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M7.25 6.25V15.75L14.75 11L7.25 6.25Z" fill="currentColor" />
                    <path
                      d="M16.75 6.25V15.75"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            ) : null}

            <button
              type="button"
              className="lesson-detail-start-button"
              onClick={handleStartLesson}
            >
              START LESSON
            </button>
          </div>
        </section>
      </section>
    </main>
  )
}

export default LessonDetailPage
