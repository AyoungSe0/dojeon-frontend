import { useMemo, useState } from 'react'
import './ClassPage.css'
import homeIcon from '../assets/home.svg'
import editIcon from '../assets/edit.svg'
import fileIcon from '../assets/file.svg'
import bookOpenIcon from '../assets/book-open.svg'
import profileIcon from '../assets/user.svg'
import { useCoursesDashboard } from '../hooks/useCoursesDashboard.ts'

const tabs = [
  { icon: homeIcon, label: 'HOME' },
  { icon: editIcon, label: 'CLASS' },
  { icon: fileIcon, label: 'PRACTICE' },
  { icon: bookOpenIcon, label: 'NOTEBOOK' },
  { icon: profileIcon, label: 'PROFILE' },
]

const progressDotCount = 5
const progressDotInset = 10
const trialTargetDays = 7
const trialLabel = `${trialTargetDays}-day Trial available`

interface ClassPageProps {
  onOpenHome: () => void
  onOpenPractice: () => void
  onOpenProfile: () => void
  onOpenCurrentLesson: (sectionId: number) => void
  onOpenLesson: (courseId: number, lessonId: number) => void
}

function ClassPage({
  onOpenHome,
  onOpenPractice,
  onOpenProfile,
  onOpenCurrentLesson,
  onOpenLesson,
}: ClassPageProps) {
  const { data, loading, error, refetch } = useCoursesDashboard()
  const [isBottomLessonVisible, setIsBottomLessonVisible] = useState(true)
  const [manuallyToggled, setManuallyToggled] = useState<Map<number, boolean>>(new Map())

  const resumeBanner = data?.resumeBanner ?? null
  const courses = useMemo(() => data?.courses ?? [], [data])

  const progressPercent = useMemo(() => {
    if (!resumeBanner) return 0
    const activeCourse = courses.find((c) => c.courseId === resumeBanner.courseId)
    return activeCourse?.overallProgressPercent ?? resumeBanner.overallProgressPercent ?? 0
  }, [courses, resumeBanner])

  const progressFillPercent = Math.min(100, progressPercent + 4)

  const openCourseIds = useMemo(() => {
    const open = new Set<number>()
    if (resumeBanner) open.add(resumeBanner.courseId)
    for (const [courseId, isOpen] of manuallyToggled) {
      if (isOpen) open.add(courseId)
      else open.delete(courseId)
    }
    return open
  }, [resumeBanner, manuallyToggled])

  const toggleCourse = (courseId: number) => {
    const currentlyOpen = openCourseIds.has(courseId)
    setManuallyToggled((prev) => {
      const next = new Map(prev)
      next.set(courseId, !currentlyOpen)
      return next
    })
  }

  if (loading) {
    return (
      <main className="class-screen">
        <section className="class-content">
          <p className="class-status">Loading…</p>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="class-screen">
        <section className="class-content">
          <p className="class-status">{error.message}</p>
          <button type="button" onClick={() => void refetch()}>
            Retry
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="class-screen">
      <section className="class-content">
        <section className="class-progress-card">
          <h1 className="class-page-title">My progress</h1>
          <p className="class-progress-complete">{progressPercent}% complete</p>
          <div className="class-progress-bar" role="list" aria-label="class progress">
            <span className="class-progress-track" aria-hidden="true" />
            <span
              className="class-progress-fill"
              style={{ width: `${progressFillPercent}%` }}
              aria-hidden="true"
            />
            {Array.from({ length: progressDotCount }).map((_, index) => (
              <span
                key={index}
                className={`class-progress-dot ${
                  index === 0 ? 'class-progress-dot-past' : 'class-progress-dot-upcoming'
                }`}
                style={{
                  left: `calc(${progressDotInset}px + ((100% - ${progressDotInset * 2}px) / ${
                    progressDotCount - 1
                  }) * ${index})`,
                }}
                role="listitem"
              />
            ))}
          </div>
        </section>

        <section className="class-course-list" aria-label="courses">
          {courses.map((course) => {
            const isOpen = openCourseIds.has(course.courseId)
            const courseLabel = course.title

            return (
              <article key={course.courseId} className="class-course-item">
                <button
                  type="button"
                  className="class-course-toggle"
                  aria-expanded={isOpen}
                  aria-controls={`course-${course.courseId}-lessons`}
                  onClick={() => toggleCourse(course.courseId)}
                >
                  <span className="class-course-toggle-label">{courseLabel}</span>
                  <svg
                    className={`class-course-arrow ${
                      isOpen ? 'class-course-arrow-open' : 'class-course-arrow-closed'
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
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isOpen ? (
                  <div
                    id={`course-${course.courseId}-lessons`}
                    className="class-course-lessons"
                  >
                    {course.lessons.map((lesson) => (
                      <button
                        key={`${course.courseId}-${lesson.lessonId}`}
                        type="button"
                        className="class-lesson-card"
                        onClick={() => onOpenLesson(course.courseId, lesson.lessonId)}
                        aria-label={`Open ${courseLabel}, ${lesson.title}`}
                      >
                        <span className="class-lesson-main">
                          <span
                            className="class-lesson-progress"
                            aria-label={`${lesson.progressPercent}% progress`}
                            style={{
                              background: `conic-gradient(from 0deg, #5f5f5f 0deg ${
                                lesson.progressPercent * 3.6
                              }deg, #bdbdbd ${lesson.progressPercent * 3.6}deg 360deg)`,
                            }}
                          >
                            <span className="class-lesson-progress-text">
                              <span className="class-lesson-progress-number">
                                {lesson.progressPercent}
                              </span>
                              <span className="class-lesson-progress-unit">%</span>
                            </span>
                          </span>

                          <span className="class-lesson-copy">
                            <span className="class-lesson-chip">
                              Lesson {lesson.orderNum}
                            </span>
                            <span className="class-lesson-title">{lesson.title}</span>
                          </span>
                        </span>

                        <svg
                          className="class-lesson-arrow"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M7 4L12 9L7 14"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                ) : null}
              </article>
            )
          })}
        </section>
      </section>

      {resumeBanner && (
        <button
          type="button"
          className={`class-trial-toggle ${
            isBottomLessonVisible ? 'class-trial-toggle-expanded' : 'class-trial-toggle-collapsed'
          }`}
          onClick={() => setIsBottomLessonVisible((current) => !current)}
          aria-expanded={isBottomLessonVisible}
          aria-label={trialLabel}
        >
          <span className="class-trial-toggle-text">{trialLabel}</span>
        </button>
      )}

      {resumeBanner && isBottomLessonVisible ? (
        <>
          <button
            type="button"
            className="class-current-lesson-card"
            onClick={() => onOpenCurrentLesson(resumeBanner.sectionId)}
            aria-label={`Open ${resumeBanner.courseTitle}, ${resumeBanner.lessonTitle}`}
          >
            <span className="class-current-lesson-copy">
              <span className="class-current-lesson-kicker">
                {`${resumeBanner.courseTitle}, ${resumeBanner.lessonTitle}`}
              </span>
              <span className="class-current-lesson-title">{resumeBanner.sectionTitle}</span>
            </span>
            <svg
              className="class-current-lesson-arrow"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 4L12 9L7 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="class-current-lesson-progress-bar" aria-hidden="true">
            <span
              className="class-current-lesson-progress-fill"
              style={{ width: `${resumeBanner.overallProgressPercent}%` }}
            />
          </div>
        </>
      ) : null}

      <nav className="class-bottom-nav">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={`class-tab ${tab.label === 'CLASS' ? 'class-tab-active' : ''}`}
            onClick={() => {
              if (tab.label === 'HOME') onOpenHome()
              if (tab.label === 'PRACTICE') onOpenPractice()
              if (tab.label === 'PROFILE') onOpenProfile()
            }}
          >
            <img className="class-tab-icon" src={tab.icon} alt="" aria-hidden="true" />
            <span className="class-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </main>
  )
}

export default ClassPage