import { useEffect, useRef, useState } from 'react'
import './SubscriptionBottomSheet.css'

interface SubscriptionBottomSheetProps {
  onClose: () => void
}

const subscriptionBenefits = [
  {
    label: 'Access to all courses classes',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4 3 8l9 4 9-4-9-4Z" />
        <path d="M7 10.5v4.2c0 1.3 2.2 2.8 5 2.8s5-1.5 5-2.8v-4.2" />
      </svg>
    ),
  },
  {
    label: 'Full access to connectivity',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M3 19c.4-3.1 2.2-5 5-5s4.6 1.9 5 5" />
        <path d="M12 14.4c1-.4 2.1-.4 3.4-.1 2 .6 3.2 2.2 3.6 4.7" />
      </svg>
    ),
  },
  {
    label: 'Full access to personal notebook',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5.5c2.3-1 4.6-.9 7 .4v14c-2.4-1.3-4.7-1.4-7-.4v-14Z" />
        <path d="M20 5.5c-2.3-1-4.6-.9-7 .4v14c2.4-1.3 4.7-1.4 7-.4v-14Z" />
      </svg>
    ),
  },
  {
    label: 'more coming soon',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 3 1.2 3.2L16.5 7l-3.3 1L12 11l-1.2-3L7.5 7l3.3-.8L12 3Z" />
        <path d="m6 12 .9 2.1L9 15l-2.1.9L6 18l-.9-2.1L3 15l2.1-.9L6 12Z" />
        <path d="m16.5 13 1.1 2.8 2.9.7-2.9.8-1.1 2.7-1.1-2.7-2.9-.8 2.9-.7 1.1-2.8Z" />
      </svg>
    ),
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

        <h2 id="subscription-sheet-title" className="subscription-sheet-title">
          What subscription gives you
        </h2>

        <div className="subscription-sheet-body">
          <ul className="subscription-benefit-list" aria-label="Subscription benefits">
            {subscriptionBenefits.map((benefit) => (
              <li key={benefit.label} className="subscription-benefit-item">
                <span className="subscription-benefit-icon">{benefit.icon}</span>
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
                        {option.price}
                        {option.note ? <small> ({option.note})</small> : null}
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
