import { useEffect, useRef, useState } from 'react'
import './SubscriptionBottomSheet.css'
import graduationCapIcon from '../assets/graduation-cap_icon.svg'
import groupOutlineIcon from '../assets/group-outline_icon.svg'
import bookLineIcon from '../assets/mingcute_book-6-line_icon.svg'
import sparksIcon from '../assets/sparks_icon.svg'

interface SubscriptionBottomSheetProps {
  onClose: () => void
}

const subscriptionBenefits = [
  {
    label: 'Access to all courses classes',
    icon: graduationCapIcon,
  },
  {
    label: 'Full access to connectivity',
    icon: groupOutlineIcon,
  },
  {
    label: 'Full access to personal notebook',
    icon: bookLineIcon,
  },
  {
    label: 'more coming soon',
    icon: sparksIcon,
  },
]

const proPlanOptions = [
  { id: '1-month', label: '1 Month', price: '$15' },
  { id: '3-months', label: '3 Months', price: '$39', note: '$13/mo' },
  { id: '6-months', label: '6 Months', price: '$69', note: '$11.5/mo' },
  { id: '1-year', label: '1 Year', price: '$99', note: '$8.25/mo' },
]

function SubscriptionBottomSheet({ onClose }: SubscriptionBottomSheetProps) {
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<
    'free' | 'trial' | 'pro'
  >('trial')
  const [selectedProOptionId, setSelectedProOptionId] = useState(proPlanOptions[0].id)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const selectedProOption =
    proPlanOptions.find((option) => option.id === selectedProOptionId) ?? proPlanOptions[0]
  const subscriptionActionText =
    selectedSubscriptionPlan === 'trial'
      ? 'Start 7-day trial'
      : selectedSubscriptionPlan === 'pro'
        ? `Subscribe ${selectedProOption.label}`
        : 'Continue Free Plan'

  useEffect(() => {
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div className="subscription-sheet-backdrop" role="presentation" onClick={onClose}>
      <section
        className="subscription-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-sheet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="subscription-sheet-close"
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="구독 옵션 닫기"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="subscription-sheet-body">
          <h2 id="subscription-sheet-title" className="subscription-sheet-title">
            What subscription gives you
          </h2>

          <ul className="subscription-benefit-list" aria-label="Subscription benefits">
            {subscriptionBenefits.map((benefit) => (
              <li key={benefit.label} className="subscription-benefit-item">
                <img className="subscription-benefit-icon" src={benefit.icon} alt="" aria-hidden="true" />
                <span>{benefit.label}</span>
              </li>
            ))}
          </ul>

          <div className="subscription-plan-list" aria-label="Subscription plans">
            <button
              type="button"
              className={`subscription-plan-row ${
                selectedSubscriptionPlan === 'free' ? 'subscription-plan-row-selected' : ''
              }`}
              onClick={() => setSelectedSubscriptionPlan('free')}
            >
              <span>Free Plan</span>
            </button>

            <button
              type="button"
              className={`subscription-plan-row ${
                selectedSubscriptionPlan === 'trial' ? 'subscription-plan-row-selected' : ''
              }`}
              onClick={() => setSelectedSubscriptionPlan('trial')}
            >
              <span>7-day Trial</span>
              {selectedSubscriptionPlan === 'trial' && (
                <svg className="subscription-check-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m5 12 4.2 4.2L19 6.5" />
                </svg>
              )}
            </button>

            <section
              className={`subscription-pro-panel ${
                selectedSubscriptionPlan === 'pro' ? 'subscription-pro-panel-open' : ''
              }`}
            >
              <button
                type="button"
                className="subscription-pro-header"
                onClick={() => setSelectedSubscriptionPlan('pro')}
              >
                <span>Pro Plan</span>
              </button>

              {selectedSubscriptionPlan === 'pro' && (
                <div className="subscription-pro-options">
                  {proPlanOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`subscription-pro-option ${
                        selectedProOptionId === option.id ? 'subscription-pro-option-selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="subscription-pro-option"
                        value={option.id}
                        checked={selectedProOptionId === option.id}
                        onChange={() => setSelectedProOptionId(option.id)}
                      />
                      <span className="subscription-radio" aria-hidden="true" />
                      <span className="subscription-pro-option-label">{option.label}</span>
                      <span className="subscription-pro-option-price">
                        <span>{option.price}</span>
                        {option.note ? (
                          <span className="subscription-pro-option-note">({option.note})</span>
                        ) : null}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="subscription-sheet-footer">
          <button type="button" className="subscription-sheet-action" onClick={onClose}>
            {subscriptionActionText}
          </button>
        </div>
      </section>
    </div>
  )
}

export default SubscriptionBottomSheet
