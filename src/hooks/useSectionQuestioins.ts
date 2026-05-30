import { useQuery } from '@tanstack/react-query'
import { fetchSectionQuestions, SectionApiError } from '../services/section.service.ts'
import type { SectionQuestionData } from '../types/section,types.ts'

interface UseSectionQuestionsState {
    data: SectionQuestionData | null
    loading: boolean
    error: SectionApiError | null
    refetch: () => Promise<void>
}

export function useSectionQuestions(sectionId: number | null): UseSectionQuestionsState {
    const { data, isPending, isFetching, error, refetch } = useQuery<
        SectionQuestionData | null,
        SectionApiError
    >({
        queryKey: ['section', sectionId, 'questions'],
        queryFn: ({ signal }) => fetchSectionQuestions(sectionId as number, signal),
        enabled: sectionId !== null,
    })

    return {
        data: data ?? null,
        loading: sectionId !== null && (isPending || isFetching),
        error: error ?? null,
        refetch: async () => {
            await refetch()
        },
    }
}