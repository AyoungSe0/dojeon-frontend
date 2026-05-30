import { useQuery } from '@tanstack/react-query'
import { fetchSectionMaterials, SectionApiError } from '../services/section.service.ts'
import type { SectionMaterialData } from '../types/section,types.ts'

interface UseSectionMaterialsState {
    data: SectionMaterialData | null
    loading: boolean
    error: SectionApiError | null
    refetch: () => Promise<void>
}

export function useSectionMaterials(sectionId: number | null): UseSectionMaterialsState {
    const { data, isPending, isFetching, error, refetch } = useQuery<
        SectionMaterialData | null,
        SectionApiError
    >({
        queryKey: ['section', sectionId, 'materials'],
        queryFn: ({ signal }) => fetchSectionMaterials(sectionId as number, signal),
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