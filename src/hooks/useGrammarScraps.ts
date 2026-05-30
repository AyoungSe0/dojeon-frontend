import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchScrapList, ScrapApiError } from '../services/scrap.service.ts'
import type { GrammarScrapListData, GrammarScrapItem } from '../types/scraps.types.ts'

interface UseGrammarScrapsState {
    items: GrammarScrapItem[]
    loading: boolean
    loadingMore: boolean
    hasMore: boolean
    error: ScrapApiError | null
    fetchNextPage: () => void
    refetch: () => Promise<void>
}

export function useGrammarScraps(limit = 20): UseGrammarScrapsState {
    const {
        data,
        isPending,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['scrap', 'list', 'GRAMMAR', limit] as const,
        queryFn: async ({
                            pageParam,
                            signal,
                        }: {
            pageParam: string | undefined
            signal?: AbortSignal
        }): Promise<GrammarScrapListData | null> => {
            const result = await fetchScrapList(
                {
                    type: 'GRAMMAR',
                    sort: 'recent',
                    cursor: pageParam,
                    limit: String(limit),
                },
                signal,
            )
            return result as GrammarScrapListData | null
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    })

    const items = data?.pages.flatMap((page) => page?.items ?? []) ?? []

    return {
        items,
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