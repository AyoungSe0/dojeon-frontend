import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchScrapList, ScrapApiError } from '../services/scrap.service.ts'
import type { VocabScrapListData, VocabScrapGroup } from '../types/scraps.types.ts'

interface UseVocabScrapsState {
    groups: VocabScrapGroup[]
    loading: boolean
    loadingMore: boolean
    hasMore: boolean
    error: ScrapApiError | null
    fetchNextPage: () => void
    refetch: () => Promise<void>
}

export function useVocabScraps(limit = 20): UseVocabScrapsState {
    const {
        data,
        isPending,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['scrap', 'list', 'VOCAB', limit] as const,
        queryFn: async ({
            pageParam,
            signal,
        }: {
            pageParam: string | undefined
            signal?: AbortSignal
        }): Promise<VocabScrapListData | null> => {
            const result = await fetchScrapList(
                {
                    type: 'VOCAB',
                    sort: 'recent',
                    cursor: pageParam,
                    limit: String(limit),
                },
                signal,
            )
            return result as VocabScrapListData | null
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    })

    const groups = data?.pages.flatMap((page) => page?.groups ?? []) ?? []

    return {
        groups,
        loading: isPending,
        loadingMore: isFetchingNextPage,
        hasMore: hasNextPage ?? false,
        error: (error as ScrapApiError | null) ?? null,
        fetchNextPage: () => {
            void fetchNextPage()
        },
        refetch: async () => {
            await refetch()
        },
    }
}