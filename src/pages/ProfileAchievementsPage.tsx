import './ProfileAchievementsPage.css'
import {
  formatAchievementDate,
  profileMainMockData,
  type ProfileAchievement,
} from '../data/profile'

interface ProfileAchievementsPageProps {
  onBack: () => void
}

function AchievementItem({ achievement }: { achievement: ProfileAchievement }) {
  return (
    <article className="profile-achievements-item">
      <div className="profile-achievements-medal" aria-hidden="true">
        {achievement.imageUrl ? (
          <img className="profile-achievements-image" src={achievement.imageUrl} alt="" />
        ) : null}
      </div>
      <p className="profile-achievements-date">{formatAchievementDate(achievement.earnedAt)}</p>
      <p className="profile-achievements-name">{achievement.title}</p>
    </article>
  )
}

function ProfileAchievementsPage({ onBack }: ProfileAchievementsPageProps) {
  const achievements = profileMainMockData.recentAchievements

  return (
    <main className="profile-achievements-screen">
      <section className="profile-achievements-content">
        <header className="profile-achievements-header">
          <button
            type="button"
            className="profile-achievements-back"
            onClick={onBack}
            aria-label="뒤로 가기"
          >
            <svg
              className="profile-achievements-back-icon"
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
          <h1 className="profile-achievements-title">Achievements</h1>
        </header>

        {achievements.length > 0 ? (
          <section className="profile-achievements-grid" aria-label="Achievements">
            {achievements.map((achievement) => (
              <AchievementItem key={achievement.badgeId} achievement={achievement} />
            ))}
          </section>
        ) : null}
      </section>
    </main>
  )
}

export default ProfileAchievementsPage
