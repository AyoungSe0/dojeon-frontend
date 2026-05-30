import { useQuery } from '@tanstack/react-query'
import { fetchHomeResume, HomeApiError } from '../services/home.service.ts'
import type { HomeResumeData } from '../types/home.types.ts'

interface UseHomeResumeState {
    data: HomeResumeData | null
    loading: boolean
    error: HomeApiError | null
    refetch: () => Promise<void>
}

export function useHomeResume(): UseHomeResumeState {
    const { data, isPending, error, refetch } = useQuery<HomeResumeData | null, HomeApiError>({
        queryKey: ['home', 'resume'],
        queryFn: ({ signal }) => fetchHomeResume(signal),
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