import { useQuery } from '@tanstack/react-query'
import { fetchLessonSections, LearningApiError } from '../services/learning.service.ts'
import type { LessonSectionsData } from '../types/lessons.types.ts'

interface UseLessonSectionsState {
    data: LessonSectionsData | null
    loading: boolean
    error: LearningApiError | null
    refetch: () => Promise<void>
}

export function useLessonSections(lessonId: number | null): UseLessonSectionsState {
    const { data, isPending, isFetching, error, refetch } = useQuery<
        LessonSectionsData | null,
        LearningApiError
    >({
        queryKey: ['learning', 'lessons', lessonId, 'sections'],
        queryFn: ({ signal }) => fetchLessonSections(lessonId as number, signal),
        enabled: lessonId !== null,
    })

    return {
        data: data ?? null,
        loading: lessonId !== null && (isPending || isFetching),
        error: error ?? null,
        refetch: async () => {
            await refetch()
        },
    }
}