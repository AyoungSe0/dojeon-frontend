import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    saveSectionProgress,
    generateIdempotencyKey,
    SectionApiError,
} from '../services/section.service.ts'
import type { SaveProgressData, SaveProgressRequest } from '../types/section,types.ts'

interface SaveProgressVariables {
    sectionId: number
    payload: SaveProgressRequest
    idempotencyKey?: string
}

export function useSaveSectionProgress() {
    const queryClient = useQueryClient()

    return useMutation<SaveProgressData | null, SectionApiError, SaveProgressVariables>({
        mutationFn: ({ sectionId, payload, idempotencyKey }) =>
            saveSectionProgress(sectionId, payload, idempotencyKey ?? generateIdempotencyKey()),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['home'] })
            void queryClient.invalidateQueries({ queryKey: ['learning'] })
            void queryClient.invalidateQueries({ queryKey: ['section'] })
        },
    })
}