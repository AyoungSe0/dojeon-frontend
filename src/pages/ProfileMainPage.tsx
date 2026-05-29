import './ProfileMainPage.css'
import homeIcon from '../assets/home.svg'
import editIcon from '../assets/edit.svg'
import fileIcon from '../assets/file.svg'
import bookOpenIcon from '../assets/book-open.svg'
import profileIcon from '../assets/user.svg'
import settingIcon from '../assets/setting_icon.svg'
import { useUserMe } from '../hooks/useUserMe'
import {
  formatAchievementDate,
  type ProfileMainData,
} from '../data/profile'

const tabs = [
  { icon: homeIcon, label: 'HOME' },
  { icon: editIcon, label: 'CLASS' },
  { icon: fileIcon, label: 'PRACTICE' },
  { icon: bookOpenIcon, label: 'NOTEBOOK' },
  { icon: profileIcon, label: 'PROFILE' },
]

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const getCalendarDays = (year: number, month: number) => {
  const firstDayIndex = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const leadingEmptyDays = Array.from({ length: firstDayIndex }, () => null)
  const monthDays = Array.from({ length: daysInMonth }, (_, index) => index + 1)
  const calendarDays = [...leadingEmptyDays, ...monthDays]
  const trailingEmptyDays = Array.from(
    { length: (7 - (calendarDays.length % 7)) % 7 },
    () => null,
  )

  return [...calendarDays, ...trailingEmptyDays]
}

interface ProfileMainPageProps {
  nickname: string
  username: string
  onOpenHome: () => void
  onOpenClass: () => void
  onOpenPractice: () => void
  onOpenNotebook: () => void
  onOpenSetting: () => void
  onOpenAchievements: () => void
}

const formatStudyTime = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) {
    return `${minutes}m`
  }

  if (minutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${minutes}m`
}

const getJoinedYear = (createdAt: string) => {
  const parsedDate = new Date(createdAt)

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().getFullYear()
  }

  return parsedDate.getFullYear()
}

function ProfileMainPage({
  onOpenHome,
  onOpenClass,
  onOpenPractice,
  onOpenNotebook,
  onOpenSetting,
  onOpenAchievements,
}: ProfileMainPageProps) {
  const { data: userMe, isError, isLoading, refetch } = useUserMe()
  const bottomNav = (
    <nav className="profile-main-bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          type="button"
          className={`profile-main-tab ${
            tab.label === 'PROFILE' ? 'profile-main-tab-active' : ''
          }`}
          onClick={() => {
            if (tab.label === 'HOME') {
              onOpenHome()
            }

            if (tab.label === 'CLASS') {
              onOpenClass()
            }

            if (tab.label === 'PRACTICE') {
              onOpenPractice()
            }

            if (tab.label === 'NOTEBOOK') {
              onOpenNotebook()
            }
          }}
        >
          <img className="profile-main-tab-icon" src={tab.icon} alt="" aria-hidden="true" />
          <span className="profile-main-tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )

  if (isLoading) {
    return (
      <main className="profile-main-screen">
        <section className="profile-main-status-panel">
          <p className="profile-main-status-text">Loading profile...</p>
        </section>
        {bottomNav}
      </main>
    )
  }

  if (isError || !userMe) {
    return (
      <main className="profile-main-screen">
        <section className="profile-main-status-panel">
          <p className="profile-main-status-text">Unable to load profile.</p>
          <button
            type="button"
            className="profile-main-status-button"
            onClick={() => {
              void refetch()
            }}
          >
            Retry
          </button>
        </section>
        {bottomNav}
      </main>
    )
  }

  const profileData: ProfileMainData = {
    user: {
      userId: Number(userMe.profile.userId),
      email: userMe.profile.email,
      username: userMe.profile.username,
      nickname: userMe.profile.nickname,
      phoneNumber: userMe.profile.phoneNumber,
      birthday: userMe.profile.birthday,
      profileImgUrl: userMe.profile.profileImgUrl,
      joinedYear: getJoinedYear(userMe.profile.createdAt),
      subscriptionTier: userMe.profile.subscriptionTier,
    },
    settings: {
      motherLanguage: userMe.profile.motherLanguage,
      proficiencyLevel: userMe.profile.proficiencyLevel,
      dailyGoalMin: userMe.profile.dailyGoalMin,
      learningGoal: userMe.profile.learningGoal,
      isPushNotificationOn: userMe.profile.isPushNotificationOn,
      isMarketingAgreed: userMe.profile.isMarketingAgreed,
    },
    recentCourse: userMe.recentCourse
      ? {
          courseId: userMe.recentCourse.courseId,
          lessonId: userMe.recentCourse.lessonId,
          sectionId: userMe.recentCourse.sectionId,
          courseTitle: userMe.recentCourse.courseTitle,
          lessonTitle: userMe.recentCourse.lessonTitle,
          sectionSubtitle: userMe.recentCourse.sectionTitle,
        }
      : null,
    stats: userMe.stats,
    attendance: userMe.attendance,
    recentAchievements: userMe.recentAchievements,
  }
  const { user, recentCourse, stats, attendance, recentAchievements } = profileData
  const calendarDays = getCalendarDays(attendance.year, attendance.month)
  const calendarTitle = `${monthNames[attendance.month - 1]} ${attendance.year}`
  const visibleAchievements = recentAchievements.slice(0, 4)
  const subscriptionCopy =
    user.subscriptionTier === 'FREE'
      ? 'Upgrade your plan for more learning features.'
      : `${user.subscriptionTier} plan is active.`

  return (
    <main className="profile-main-screen">
      <section className="profile-main-content">
        <section className="profile-main-hero">
          <button
            type="button"
            className="profile-main-setting-button"
            onClick={onOpenSetting}
            aria-label="설정 열기"
          >
            <img src={settingIcon} alt="" aria-hidden="true" />
          </button>

          <div className="profile-main-identity">
            <div className="profile-main-avatar" aria-hidden="true">
              {user.profileImgUrl ? (
                <img className="profile-main-avatar-image" src={user.profileImgUrl} alt="" />
              ) : null}
            </div>
            <div className="profile-main-copy">
              <h1 className="profile-main-greeting">
                안녕하세요!
                <br />
                {user.nickname}님!
              </h1>
              <p className="profile-main-meta">
                @{user.username} <span aria-hidden="true">·</span> joined {user.joinedYear}
              </p>
            </div>
          </div>
        </section>

        <section className="profile-main-section">
          <h2 className="profile-main-section-title">Course</h2>
          <article className="profile-main-card profile-main-last-lesson">
            <p className="profile-main-card-label">Last lesson</p>
            {recentCourse ? (
              <p className="profile-main-last-copy">
                <span>{`${recentCourse.courseTitle}, ${recentCourse.lessonTitle}`}</span>
                <strong>{recentCourse.sectionSubtitle}</strong>
              </p>
            ) : (
              <p className="profile-main-empty-text">No recent lesson yet</p>
            )}
          </article>

          <div className="profile-main-card-grid">
            <article className="profile-main-card profile-main-stat-card">
              <p className="profile-main-card-label">Total lesson</p>
              <strong>{stats.totalCompletedLessons} lessons</strong>
            </article>
            <article className="profile-main-card profile-main-stat-card">
              <p className="profile-main-card-label">Total time studied</p>
              <strong>{formatStudyTime(stats.totalStudyMin)}</strong>
            </article>
          </div>
        </section>

        <section className="profile-main-section">
          <h2 className="profile-main-section-title">Streak</h2>
          <div className="profile-main-card-grid">
            <article className="profile-main-card profile-main-stat-card">
              <p className="profile-main-card-label">Current Streak</p>
              <strong>{stats.currentStreak}-day</strong>
            </article>
            <article className="profile-main-card profile-main-stat-card">
              <p className="profile-main-card-label">Best Streak</p>
              <strong>{stats.bestStreak}-day</strong>
            </article>
          </div>

          <article className="profile-main-calendar">
            <h3 className="profile-main-calendar-title">{calendarTitle}</h3>
            <div className="profile-main-weekdays" aria-hidden="true">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="profile-main-calendar-grid" aria-label={`${calendarTitle} attendance`}>
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <span key={`empty-${index}`} className="profile-main-calendar-empty" />
                }

                return (
                  <span
                    key={day}
                    className={`profile-main-calendar-day ${
                      attendance.activeDays.includes(day) ? 'profile-main-calendar-day-active' : ''
                    }`}
                  >
                    {day}
                  </span>
                )
              })}
            </div>
          </article>
        </section>

        <section className="profile-main-section">
          <div className="profile-main-section-header">
            <h2 className="profile-main-section-title">Achievements</h2>
            <button
              type="button"
              className="profile-main-section-link"
              onClick={onOpenAchievements}
            >
              see more
            </button>
          </div>
          <div className="profile-main-achievement-row">
            {visibleAchievements.length > 0 ? (
              visibleAchievements.map((achievement) => (
                <article key={achievement.badgeId} className="profile-main-achievement">
                  <div className="profile-main-achievement-medal" aria-hidden="true">
                    {achievement.imageUrl ? (
                      <img
                        className="profile-main-achievement-image"
                        src={achievement.imageUrl}
                        alt=""
                      />
                    ) : null}
                  </div>
                  <p className="profile-main-achievement-date">
                    {formatAchievementDate(achievement.earnedAt)}
                  </p>
                  <p className="profile-main-achievement-title">{achievement.title}</p>
                </article>
              ))
            ) : (
              <article className="profile-main-achievement-empty">
                <p className="profile-main-empty-text">No achievements yet</p>
              </article>
            )}
          </div>
        </section>

        <section className="profile-main-section profile-main-subscription-section">
          <h2 className="profile-main-section-title">Subscriptions</h2>
          <article className="profile-main-subscription-card">
            <p className="profile-main-subscription-placeholder">{subscriptionCopy}</p>
            <button type="button" className="profile-main-subscribe-button">
              {user.subscriptionTier === 'FREE' ? 'Subscribe now' : 'Manage subscription'}
            </button>
          </article>
        </section>
      </section>

      {bottomNav}
    </main>
  )
}

export default ProfileMainPage
