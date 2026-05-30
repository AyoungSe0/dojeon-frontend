import { useQuery } from '@tanstack/react-query'
import { fetchCoursesDashboard, LearningApiError } from '../services/learning.service.ts'
import type { DashboardData } from '../types/dasboard.types.ts'

interface UseCoursesDashboardState {
    data: DashboardData | null
    loading: boolean
    error: LearningApiError | null
    refetch: () => Promise<void>
}

export function useCoursesDashboard(): UseCoursesDashboardState {
    const { data, isPending, error, refetch } = useQuery<DashboardData | null, LearningApiError>({
        queryKey: ['learning', 'courses', 'dashboard'],
        queryFn: ({ signal }) => fetchCoursesDashboard(signal),
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