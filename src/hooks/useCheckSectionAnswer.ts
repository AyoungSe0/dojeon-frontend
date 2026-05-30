import { useMutation } from '@tanstack/react-query'
import { checkSectionAnswer, SectionApiError } from '../services/section.service.ts'
import type {
    SectionCheckAnswerData,
    SectionCheckAnswerRequest,
} from '../types/section,types.ts'

interface CheckAnswerVariables {
    sectionId: number
    payload: SectionCheckAnswerRequest
}

export function useCheckSectionAnswer() {
    return useMutation<
        SectionCheckAnswerData | null,
        SectionApiError,
        CheckAnswerVariables
    >({
        mutationFn: ({ sectionId, payload }) => checkSectionAnswer(sectionId, payload),
    })
}