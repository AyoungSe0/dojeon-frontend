export interface ApiResponse<T> {
  isSuccess: boolean
  code: string
  message: string
  data: T | null
  errorCode?: string
  timestamp: string
}

export interface UserProfile {
  userId: string
  email: string
  nickname: string
  username: string
  phoneNumber: string | null
  birthday: string | null
  profileImgUrl: string | null
  motherLanguage: string | null
  proficiencyLevel: string | null
  ageGroup: string | null
  dailyGoalMin: number | null
  learningGoal: string | null
  subscriptionTier: string
  subscriptionPlanId: string | null
  subscriptionExpiresAt: string | null
  isPushNotificationOn: boolean
  isMarketingAgreed: boolean
  createdAt: string
}

export interface UserStats {
  totalStudyMin: number
  currentStreak: number
  bestStreak: number
  totalCompletedLessons: number
}

export interface UserAttendance {
  year: number
  month: number
  activeDays: number[]
}

export interface UserRecentCourse {
  courseId: number
  courseTitle: string
  lessonId: number
  lessonTitle: string
  sectionId: number
  sectionTitle: string
  sectionType: string
  grammarPreview: string | null
  overallProgressPercent: number
}

export interface UserAchievement {
  badgeId: number
  title: string
  imageUrl: string | null
  earnedAt: string
}

export interface UserMe {
  profile: UserProfile
  stats: UserStats
  attendance: UserAttendance
  recentCourse: UserRecentCourse | null
  recentAchievements: UserAchievement[]
}

export type UserMeResponse = ApiResponse<UserMe>

export interface PatchUserPayload {
  nickname?: string
  username?: string
  phoneNumber?: string
  birthday?: string
  motherLanguage?: string
  proficiencyLevel?: string
  ageGroup?: string
  dailyGoalMin?: number
  learningGoal?: string
  isPushNotificationOn?: boolean
  isMarketingAgreed?: boolean
  deviceToken?: string
  profileImgUrl?: string
}

export interface ChangePasswordPayload {
  newPassword: string
}

export interface PresignedProfileImagePayload {
  contentType: string
  fileExtension: 'jpg' | 'jpeg' | 'png' | 'webp'
}

export interface PresignedProfileImageResult {
  uploadUrl: string
  key: string
  fileUrl: string
}

export type UpdateUserMeData = {
  updated: boolean
}

export type DeleteUserMeData = {
  deleted: boolean
}

export type ChangePasswordData = {
  updated: boolean
}
