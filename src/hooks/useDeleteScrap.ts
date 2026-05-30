import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteScrap, ScrapApiError } from '../services/scrap.service.ts'
import type { DeleteScrapData } from '../types/scraps.types.ts'


export function useDeleteScrap() {
    const queryClient = useQueryClient()

    return useMutation<DeleteScrapData | null, ScrapApiError, string>({
        mutationFn: (scrapId: string) => deleteScrap(scrapId),
        onSuccess: () => {
            // Refresh both the paginated list and the dashboard preview.
            void queryClient.invalidateQueries({ queryKey: ['scrap'] })
        },
    })
}