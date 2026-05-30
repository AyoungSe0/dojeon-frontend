export interface ResumeBanner {
    courseId: number;
    courseTitle: string;
    lessonId: number;
    lessonTitle: string;
    sectionId: number;
    sectionTitle: string;
    sectionType: string;
    grammarPreview: string;
    overallProgressPercent: number;
}

export interface DashboardLesson {
    lessonId: number;
    title: string;
    subtitle: string | null;
    orderNum: number;
    sectionCount: number;
    completedSectionCount: number;
    progressPercent: number;
    isCompleted: boolean;
}

export interface DashboardCourse {
    courseId: number;
    title: string;
    description: string;
    orderNum: number;
    isActive: boolean;
    totalSections: number;
    completedSections: number;
    overallProgressPercent: number;
    totalStaySeconds: number;
    lessons: DashboardLesson[];
}

export interface DashboardData {
    resumeBanner: ResumeBanner | null;
    courses: DashboardCourse[];
}

export interface DashboardResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    data: DashboardData | null;
    timestamp: string;
}