export interface VocabularyPreviewGroup {
    courseId: number;
    courseTitle: string;
    words: string[];
}

export interface VocabularyPreview {
    groups: VocabularyPreviewGroup[];
}

export interface GrammarPreviewItem {
    scrapId: string;
    courseTitle: string;
    lessonTitle: string;
    grammarPoint: string;
}

export interface ScrapDashboardData {
    userName: string;
    vocabularyPreview: VocabularyPreview;
    grammarPreview: GrammarPreviewItem[];
}

export interface ScrapDashboardResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    data: ScrapDashboardData | null;
    timestamp: string;
}


export interface ScrapListParams {
    type: string;
    sort?: string;
    cursor?: string;
    limit?: string;
}

export interface GrammarScrapItem {
    scrapId: string;
    sectionId: number;
    targetType: string;
    courseTitle: string;
    lessonTitle: string;
    grammarPoint: string;
    createdAt: string;
}

export interface GrammarScrapListData {
    targetType: string;
    items: GrammarScrapItem[];
    nextCursor: string | null;
}

export interface VocabScrapCardData {
    id: number;
    wordFront: string;
    wordBack: string;
    notes?: string;
    locales?: Record<string, { back: string; notes?: string }>;
    audioUrl: string | null;
    sequence: number;
}

export interface VocabScrapItem {
    scrapId: string;
    cardId: number;
    createdAt: string;
    card: VocabScrapCardData | null;
}

export interface VocabScrapGroup {
    courseId: number;
    courseTitle: string;
    items: VocabScrapItem[];
}

export interface VocabScrapListData {
    targetType: string;
    groups: VocabScrapGroup[];
    nextCursor: string | null;
}

export interface ScrapListResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    data: GrammarScrapListData | VocabScrapListData | null;
    errorCode?: string;
    timestamp: string;
}


export interface CreateScrapRequest {
    type: string;
    cardId?: number;
    materialId?: number;
    sectionId: number;
}

export interface ScrapCard {
    id: number;
    wordFront: string;
    wordBack: string;
    audioUrl: string | null;
}

export interface CreateScrapData {
    id: string;
    userId: string;
    sectionId: number;
    type: string;
    cardId: number | null;
    materialId: number | null;
    createdAt: string;
    card: ScrapCard | null;
}

export interface CreateScrapResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    data: CreateScrapData | null;
    errorCode?: string;
    timestamp: string;
}


export interface DeleteScrapData {
    deleted: boolean;
}

export interface DeleteScrapResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    data: DeleteScrapData | null;
    errorCode?: string;
    timestamp: string;
}