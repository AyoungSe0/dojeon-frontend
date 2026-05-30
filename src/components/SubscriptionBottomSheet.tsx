import { useEffect, useRef, useState } from 'react'
import './SubscriptionBottomSheet.css'
import graduationCapIcon from '../assets/graduation-cap_icon.svg'
import groupOutlineIcon from '../assets/group-outline_icon.svg'
import bookLineIcon from '../assets/mingcute_book-6-line_icon.svg'
import sparksIcon from '../assets/sparks_icon.svg'
import closeRoundedIcon from '../assets/close-rounded_icon.svg'
import checkIconGray from '../assets/check_icon_gray.svg'
import { useSubscriptionPlans } from '../hooks/useSubscriptionPlans'
import type { SubscriptionPlan } from '../types/subscription.types'

interface SubscriptionBottomSheetProps {
  currentSubscriptionPlanId: string | null
  currentSubscriptionTier: string
  onClose: () => void
}

type SubscriptionSelectionMode = 'free' | 'trial' | 'pro'

const benefitIcons = [graduationCapIcon, groupOutlineIcon, bookLineIcon, sparksIcon]
const fallbackBenefits = [
  'Access to all courses classes',
  'Full access to connectivity',
  'Full access to personal notebook',
  'more coming soon',
]

const formatPlanDuration = (billingCycleMonths: number) => {
  if (billingCycleMonths === 1) return '1 Month'
  if (billingCycleMonths === 12) return '1 Year'
  return `${billingCycleMonths} Months`
}

const isFreeTier = (tier: string) => tier.trim().toUpperCase() === 'FREE'
const isFreePlan = (plan: SubscriptionPlan) => plan.planId.trim().toLowerCase() === 'free'

const getFocusableElements = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('aria-hidden'))

const getInitialSelectedPlanId = (
  plans: SubscriptionPlan[],
  currentSubscriptionPlanId: string | null,
  currentSubscriptionTier: string,
) => {
  const freePlan = plans.find(isFreePlan)
  const currentPlan = currentSubscriptionPlanId
    ? plans.find((plan) => plan.planId === currentSubscriptionPlanId)
    : undefined
  const trialPlan = plans.find((plan) => !isFreePlan(plan) && plan.hasTrial)
  const firstPaidPlan = plans.find((plan) => !isFreePlan(plan))

  if (currentPlan) return currentPlan.planId
  if (isFreeTier(currentSubscriptionTier)) return freePlan?.planId ?? ''
  return firstPaidPlan?.planId ?? trialPlan?.planId ?? freePlan?.planId ?? ''
}

function SubscriptionBottomSheet({
  currentSubscriptionPlanId,
  currentSubscriptionTier,
  onClose,
}: SubscriptionBottomSheetProps) {
  const { data: subscriptionPlansData, isError, isLoading, refetch } = useSubscriptionPlans()
  const [selectedPlanIdOverride, setSelectedPlanIdOverride] = useState('')
  const [selectedModeOverride, setSelectedModeOverride] =
    useState<SubscriptionSelectionMode | null>(null)
  const sheetRef = useRef<HTMLElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null)
  const plans = subscriptionPlansData?.plans ?? []
  const freePlan = plans.find(isFreePlan)
  const paidPlans = plans.filter((plan) => !isFreePlan(plan))
  const trialPlan = paidPlans.find((plan) => plan.hasTrial)
  const defaultPaidPlanId =
    paidPlans.find((plan) => plan.planId === currentSubscriptionPlanId)?.planId ??
    paidPlans[0]?.planId ??
    ''
  const selectedPlanId = plans.some((plan) => plan.planId === selectedPlanIdOverride)
    ? selectedPlanIdOverride
    : getInitialSelectedPlanId(plans, currentSubscriptionPlanId, currentSubscriptionTier)
  const selectedBackendPlan = plans.find((plan) => plan.planId === selectedPlanId)
  const defaultMode: SubscriptionSelectionMode =
    selectedBackendPlan && isFreePlan(selectedBackendPlan)
      ? 'free'
      : selectedBackendPlan && !isFreeTier(currentSubscriptionTier)
      ? 'pro'
      : freePlan
        ? 'free'
        : trialPlan
          ? 'trial'
          : 'pro'
  const selectedMode: SubscriptionSelectionMode =
    selectedModeOverride ?? defaultMode
  const isProOptionsVisible = selectedMode === 'pro'
  const benefitsPlan = selectedBackendPlan ?? trialPlan ?? freePlan
  const displayBenefits = benefitsPlan ? benefitsPlan.benefits : fallbackBenefits
  const subscriptionActionText =
    selectedMode === 'trial'
      ? 'Start 7-day trial'
      : selectedMode === 'free'
        ? 'Continue Free Plan'
        : `Subscribe ${formatPlanDuration(selectedBackendPlan?.billingCycleMonths ?? 1)}`

  useEffect(() => {
    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !sheetRef.current) {
        return
      }

      const focusableElements = getFocusableElements(sheetRef.current)

      if (focusableElements.length === 0) {
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
        return
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedElementRef.current?.focus()
    }
  }, [onClose])

  return (
    <div className="subscription-sheet-backdrop" role="presentation" onClick={onClose}>
      <section
        className="subscription-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-sheet-title"
        ref={sheetRef}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="subscription-sheet-close"
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="구독 옵션 닫기"
        >
          <img src={closeRoundedIcon} alt="" aria-hidden="true" />
        </button>

        <div className="subscription-sheet-body">
          <h2 id="subscription-sheet-title" className="subscription-sheet-title">
            What subscription gives you
          </h2>

          {isLoading ? (
            <p className="subscription-sheet-status">Loading plans...</p>
          ) : isError ? (
            <div className="subscription-sheet-status" role="status">
              <p>Unable to load plans.</p>
              <button
                type="button"
                className="subscription-sheet-retry"
                onClick={() => {
                  void refetch()
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <ul className="subscription-benefit-list" aria-label="Subscription benefits">
                {displayBenefits.map((benefit, index) => (
                  <li key={benefit} className="subscription-benefit-item">
                    <img
                      className="subscription-benefit-icon"
                      src={benefitIcons[index % benefitIcons.length]}
                      alt=""
                      aria-hidden="true"
                    />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <fieldset className="subscription-plan-list">
                <legend className="subscription-plan-legend">Subscription plans</legend>
                {freePlan ? (
                  <label
                    className={`subscription-plan-row ${
                      selectedMode === 'free' ? 'subscription-plan-row-selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="subscription-plan"
                      value={freePlan.planId}
                      checked={selectedMode === 'free'}
                      onChange={() => {
                        setSelectedPlanIdOverride(freePlan.planId)
                        setSelectedModeOverride('free')
                      }}
                    />
                    <span>{freePlan.title}</span>
                    {selectedMode === 'free' && (
                      <img className="subscription-check-icon" src={checkIconGray} alt="" aria-hidden="true" />
                    )}
                  </label>
                ) : null}

                {trialPlan ? (
                  <label
                    className={`subscription-plan-row ${
                      selectedMode === 'trial' ? 'subscription-plan-row-selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="subscription-plan"
                      value={`${trialPlan.planId}:trial`}
                      checked={selectedMode === 'trial'}
                      onChange={() => {
                        setSelectedPlanIdOverride(trialPlan.planId)
                        setSelectedModeOverride('trial')
                      }}
                    />
                    <span>7-day Trial</span>
                    {selectedMode === 'trial' && (
                      <img className="subscription-check-icon" src={checkIconGray} alt="" aria-hidden="true" />
                    )}
                  </label>
                ) : null}

                {paidPlans.length > 0 ? (
                  <section
                    className={`subscription-pro-panel ${
                      selectedMode === 'pro' ? 'subscription-plan-row-selected' : ''
                    } ${isProOptionsVisible ? 'subscription-pro-panel-open' : ''}`}
                  >
                    <button
                      type="button"
                      className="subscription-pro-header"
                      onClick={() => {
                        setSelectedPlanIdOverride(defaultPaidPlanId)
                        setSelectedModeOverride('pro')
                      }}
                      aria-expanded={isProOptionsVisible}
                      aria-controls="subscription-pro-options"
                    >
                      <span>Pro Plan</span>
                      {selectedMode === 'pro' && !isProOptionsVisible ? (
                        <img className="subscription-check-icon" src={checkIconGray} alt="" aria-hidden="true" />
                      ) : null}
                    </button>

                    {isProOptionsVisible ? (
                      <div id="subscription-pro-options" className="subscription-pro-options">
                        {paidPlans.map((option) => (
                          <label
                            key={option.planId}
                            className={`subscription-pro-option ${
                              selectedPlanId === option.planId ? 'subscription-pro-option-selected' : ''
                            }`}
                          >
                            <input
                              type="radio"
                              name="subscription-plan"
                              value={option.planId}
                              checked={selectedPlanId === option.planId}
                              onChange={() => {
                                setSelectedPlanIdOverride(option.planId)
                                setSelectedModeOverride('pro')
                              }}
                            />
                            <span className="subscription-radio" aria-hidden="true" />
                              <span className="subscription-pro-option-label">
                              {option.title}
                            </span>
                            <span className="subscription-pro-option-price">
                              <span>{option.priceText}</span>
                              {option.subText ? (
                                <span className="subscription-pro-option-note">
                                  {option.subText}
                                </span>
                              ) : null}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : null}
                  </section>
                ) : null}
              </fieldset>
            </>
          )}
        </div>

        <div className="subscription-sheet-footer">
          <button
            type="button"
            className="subscription-sheet-action"
            disabled={isLoading || isError || (selectedMode !== 'free' && !selectedBackendPlan)}
            onClick={onClose}
          >
            {subscriptionActionText}
          </button>
        </div>
      </section>
    </div>
  )
}

export default SubscriptionBottomSheet
