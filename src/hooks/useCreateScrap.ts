import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createScrap, ScrapApiError } from '../services/scrap.service.ts'
import type { CreateScrapData, CreateScrapRequest } from '../types/scraps.types.ts'

export function useCreateScrap() {
    const queryClient = useQueryClient()

    return useMutation<CreateScrapData | null, ScrapApiError, CreateScrapRequest>({
        mutationFn: (payload) => createScrap(payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['scrap'] })
        },
    })
}