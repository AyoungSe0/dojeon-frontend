import { useMutation } from '@tanstack/react-query'
import { checkPracticeAnswer, PracticeApiError } from '../services/practice.service.ts'
import type { CheckAnswerData, CheckAnswerRequest } from '../types/practice.types.ts'

interface CheckAnswerVariables {
    topicId: number
    payload: CheckAnswerRequest
}

export function useCheckAnswer() {
    return useMutation<CheckAnswerData | null, PracticeApiError, CheckAnswerVariables>({
        mutationFn: ({ topicId, payload }) => checkPracticeAnswer(topicId, payload),
    })
}