import { useQuery } from '@tanstack/react-query'
import { fetchPracticeTopics, PracticeApiError } from '../services/practice.service.ts'
import type { PracticeTopicListData } from '../types/practice.types.ts'

interface UsePracticeTopicsState {
    data: PracticeTopicListData | null
    loading: boolean
    error: PracticeApiError | null
    refetch: () => Promise<void>
}

export function usePracticeTopics(): UsePracticeTopicsState {
    const { data, isPending, error, refetch } = useQuery<
        PracticeTopicListData | null,
        PracticeApiError
    >({
        queryKey: ['practice', 'topics'],
        queryFn: ({ signal }) => fetchPracticeTopics(signal),
    })

    return {
        data: data ?? null,
        loading: isPending,
        error: error ?? null,
        refetch: async () => {
            await refetch()
        },
    }
}