export interface PracticeTopic {
    id: number;
    titleEn: string;
    isActive: boolean;
}

export interface PracticeTopicListData {
    topics: PracticeTopic[];
}

export interface PracticeTopicListResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    data: PracticeTopicListData | null;
    timestamp: string;
}


export interface PracticeQuestion {
    id: number;
    type: string;
    questionText: string;
    options: string[];
    explanation: string | null;
}

export interface PracticeQuestionsData {
    topicId: number;
    questions: PracticeQuestion[];
}

export interface PracticeQuestionsResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    data: PracticeQuestionsData | null;
    errorCode?: string;
    timestamp: string;
}

export interface CheckAnswerRequest {
    questionId: number;
    userAnswer: string;
}

export interface CheckAnswerData {
    correct: boolean;
    correctAnswer?: string;
    explanation?: string | null;
}

export interface CheckAnswerResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    data: CheckAnswerData | null;
    errorCode?: string;
    timestamp: string;
}