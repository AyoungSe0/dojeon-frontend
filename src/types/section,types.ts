// GET /section/{sectionId}/progress가 지금 비어 있다

export interface MaterialExplanation {
    lang: string;
    text: string;
}

export interface DialogueLine {
    speaker: string;
    ko: string;
    en: string;
    he: string;
}

export interface Dialogue {
    lines: DialogueLine[];
}

export interface MaterialContentText {
    title: string;
    explanations: MaterialExplanation[];
    imageUrl: string;
    dialogues: Dialogue[];
}

export interface SectionMaterial {
    id: number;
    type: string;
    sequence: number;
    isExtra: boolean;
    contentText: MaterialContentText;
}

export interface SectionMaterialData {
    sectionId: number;
    courseId: number;
    lessonId: number;
    materials: SectionMaterial[];
}

export interface SectionMaterialResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    data: SectionMaterialData | null;
    errorCode?: string;
    timestamp: string;
}

export interface SectionCard {
    id: number;
    wordFront: string;
    wordBack: string;
    notes?: string;
    locales?: Record<string, { back: string; notes?: string }>;
    audioUrl: string | null;
    sequence: number;
    isScraped: boolean;
    scrapId: string | null;
}

export interface SectionCardData {
    sectionId: number;
    cards: SectionCard[];
}

export interface SectionCardResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    data: SectionCardData | null;
    timestamp: string;
}


export interface SectionQuestion {
    id: number;
    type: string;
    questionText: string;
    options: string[];
    explanation: string | null;
}

export interface SectionQuestionData {
    sectionId: number;
    questions: SectionQuestion[];
}

export interface SectionQuestionResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    data: SectionQuestionData | null;
    timestamp: string;
}

export interface SectionCheckAnswerRequest {
    questionId: number;
    userAnswer: string;
}

export interface SectionCheckAnswerData {
    correct: boolean;
    correctAnswer?: string;
    explanation?: string | null;
}

export interface SectionCheckAnswerResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    data: SectionCheckAnswerData | null;
    errorCode?: string;
    timestamp: string;
}


export interface SaveProgressRequest {
    currentPage: number;
    stayTimeSeconds: number;
    forceComplete: boolean;
    difficulty: string;
}

export interface ProgressLog {
    currentPage: number;
    stayTimeSeconds: number;
    isCompleted: boolean;
    difficulty: string | null;
}

export interface NextSection {
    courseId: number;
    lessonId: number;
    sectionId: number;
    type: string;
    title: string;
}

export interface SaveProgressData {
    sectionId: number;
    log: ProgressLog;
    nextSection: NextSection | null;
}

export interface SaveProgressResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    data: SaveProgressData | null;
    errorCode?: string;
    timestamp: string;
}