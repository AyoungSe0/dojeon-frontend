import type { ApiResponse } from './user.types'

export interface SubscriptionPlan {
  planId: string
  title: string
  priceText: string
  subText: string | null
  hasTrial: boolean
  billingCycleMonths: number
  benefits: string[]
}

export interface SubscriptionPlansData {
  plans: SubscriptionPlan[]
}

export type SubscriptionPlansResponse = ApiResponse<SubscriptionPlansData>
