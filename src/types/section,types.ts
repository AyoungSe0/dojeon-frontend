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

// GET /section/{id}/material -> data: { materials: [...] }
// material 식별자는 materialId 로 오고, contentText 는 자료 종류마다 채워지는 필드가 다르다.
// (문법표는 description + table, 지문/대본은 dialogues 등)
export interface MaterialContentText {
    title: string;
    description?: string | null;
    table?: unknown;
    explanations?: MaterialExplanation[];
    imageUrl?: string;
    dialogues?: Dialogue[];
}

export interface SectionMaterial {
    id: number;
    type: string;
    sequence: number;
    isExtra: boolean;
    contentText: MaterialContentText;
}

export interface SectionMaterialData {
    sectionId?: number;
    courseId?: number;
    lessonId?: number;
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

export type CardLocales = Record<string, { back?: string; notes?: string }> | null;

// GET /section/{id}/card -> data: [{ cardId, wordFront, wordBack, audioUrl }]
// notes/locales/isScraped/scrapId 는 응답에 없을 수 있어 모두 옵션으로 둔다.
export interface SectionCard {
    id: number;
    wordFront: string;
    wordBack: string;
    notes?: string;
    locales?: CardLocales;
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
    // 서버가 정답을 함께 내려주면 채점 API 없이 앱에서 바로 채점한다.
    answer: string | null;
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


// POST /section/{id}/progress
// currentPage / isCompleted / stayTimeSeconds 는 필수, difficulty 는 완료 평가 시에만 보낸다.
export interface SaveProgressRequest {
    currentPage: number;
    isCompleted: boolean;
    stayTimeSeconds: number;
    difficulty?: 'EASY' | 'NORMAL' | 'HARD';
}

export interface NextSection {
    courseId: number;
    lessonId: number;
    sectionId: number;
    type: string;
    title: string;
}

// 코스의 마지막 섹션이면 nextSection 이 null 로 온다.
export interface SaveProgressData {
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
