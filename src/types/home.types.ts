export type SectionType = 'GRAMMAR' | 'VOCAB' | 'LISTENING' | 'SPEAKING' | 'READING'

export interface GoalInfo {
    targetMin: number
    studiedMin: number
}

export interface LastLesson {
    courseId: number
    lessonId: number
    sectionId: number
    lessonTitle: string
    sectionTitle: string
    sectionType: SectionType
    overallProgressPercent: number
    grammarPreview?: string
    vocabPreview?: string
    listeningPreview?: string
    speakingPreview?: string
    readingPreview?: string
}

export interface HomeResumeData {
    userFirstName: string
    dailyStreak: number
    todayGoal: GoalInfo
    weekGoal: GoalInfo
    weeklyAttendance: boolean[]
    lastLesson: LastLesson | null
}

export interface ApiResponse<T> {
    isSuccess: boolean
    code: string
    message: string
    data: T | null
    timestamp: string
}

export type HomeResumeResponse = ApiResponse<HomeResumeData>