import { useQuery } from '@tanstack/react-query'
import { fetchScrapDashboard, ScrapApiError } from '../services/scrap.service.ts'
import type { ScrapDashboardData } from '../types/scraps.types.ts'

interface UseScrapDashboardState {
    data: ScrapDashboardData | null
    loading: boolean
    error: ScrapApiError | null
    refetch: () => Promise<void>
}

export function useScrapDashboard(): UseScrapDashboardState {
    const { data, isPending, isFetching, error, refetch } = useQuery<
        ScrapDashboardData | null,
        ScrapApiError
    >({
        queryKey: ['scrap', 'dashboard'],
        queryFn: ({ signal }) => fetchScrapDashboard(signal),
    })

    return {
        data: data ?? null,
        loading: isPending || isFetching,
        error: error ?? null,
        refetch: async () => {
            await refetch()
        },
    }
}