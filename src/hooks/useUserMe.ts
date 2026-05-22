import { useQuery } from '@tanstack/react-query'
import { fetchUserMe, UserApiError } from '../services/user.service'
import type { UserMe } from '../types/user.types'

export function useUserMe() {
  return useQuery<UserMe | null, UserApiError>({
    queryKey: ['user', 'me'],
    // GET /user/me
    queryFn: ({ signal }) => fetchUserMe(undefined, signal),
  })
}
