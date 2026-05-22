import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUserMe, UserApiError } from '../services/user.service'
import type { PatchUserPayload, UpdateUserMeData } from '../types/user.types'

export function useUpdateUserMe() {
  const queryClient = useQueryClient()

  return useMutation<UpdateUserMeData | null, UserApiError, PatchUserPayload>({
    // PATCH /user/me
    mutationFn: (payload) => updateUserMe(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
    },
  })
}
