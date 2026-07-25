import { useState } from 'react'
import './PreferencesPage.css'
import { MOTHER_LANGUAGE_OPTIONS } from '../data/contentLanguage.ts'

interface PreferencesPageProps {
  language: string
  koreanLevel: string
  dailyGoal: string
  koreanGoal: string
  onSave: (values: {
    language: string
    koreanLevel: string
    dailyGoal: string
    koreanGoal: string
  }) => void | Promise<void>
  isSaving?: boolean
  saveError?: string | null
  onBack: () => void
}

function PreferencesPage({
  language,
  koreanLevel,
  dailyGoal,
  koreanGoal,
  onSave,
  isSaving = false,
  saveError = null,
  onBack,
}: PreferencesPageProps) {
  const koreanGoalOptions = ['Travel', 'Hobby', 'Study Abroad', 'Career']
  const [draftLanguage, setDraftLanguage] = useState(language)
  const [draftKoreanLevel, setDraftKoreanLevel] = useState(koreanLevel)
  const [draftDailyGoal, setDraftDailyGoal] = useState(dailyGoal)
  const [draftKoreanGoal, setDraftKoreanGoal] = useState(koreanGoal)
  const [editing, setEditing] = useState({
    language: false,
    koreanLevel: false,
    dailyGoal: false,
  })
  const [isKoreanGoalSheetOpen, setIsKoreanGoalSheetOpen] = useState(false)

  const hasPendingChanges =
    draftLanguage !== language ||
    draftKoreanLevel !== koreanLevel ||
    draftDailyGoal !== dailyGoal ||
    draftKoreanGoal !== koreanGoal

  const toggleEditing = (key: 'language' | 'koreanLevel' | 'dailyGoal') => {
    setEditing((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    try {
      await onSave({
        language: draftLanguage,
        koreanLevel: draftKoreanLevel,
        dailyGoal: draftDailyGoal,
        koreanGoal: draftKoreanGoal,
      })
      setEditing({
        language: false,
        koreanLevel: false,
        dailyGoal: false,
      })
    } catch {
      // The parent mutation exposes the error message through saveError.
    }
  }

  const items = [
    {
      label: 'language',
      value: draftLanguage || '-',
      editable: true,
      isEditing: editing.language,
      onEdit: () => toggleEditing('language'),
      onChange: (value: string) => setDraftLanguage(value),
      inputValue: draftLanguage,
      // 학습 컨텐츠 언어와 연결되는 값이라 자유 입력 대신 온보딩과 같은 선택지를 쓴다.
      options: MOTHER_LANGUAGE_OPTIONS,
    },
    {
      label: 'Korean Level',
      value: draftKoreanLevel || '-',
      editable: true,
      isEditing: editing.koreanLevel,
      onEdit: () => toggleEditing('koreanLevel'),
      onChange: (value: string) => setDraftKoreanLevel(value),
      inputValue: draftKoreanLevel,
    },
    {
      label: 'Daily Goal',
      value: draftDailyGoal || '-',
      editable: true,
      isEditing: editing.dailyGoal,
      onEdit: () => toggleEditing('dailyGoal'),
      onChange: (value: string) => setDraftDailyGoal(value),
      inputValue: draftDailyGoal,
    },
    {
      label: 'Korean Goal',
      value: draftKoreanGoal || '-',
      editable: true,
      usesBottomSheet: true,
      onEdit: () => setIsKoreanGoalSheetOpen(true),
    },
  ]

  return (
    <main className="preferences-screen">
      <section className="preferences-content">
        <header className="preferences-header">
          <button
            type="button"
            className="preferences-back"
            onClick={onBack}
            aria-label="Go back"
          >
            <svg
              className="preferences-back-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="preferences-title">Preferences</h1>
        </header>

        <section className="preferences-list" aria-label="preference details">
          {items.map((item) => (
            <article key={item.label} className="preferences-card">
              <div className="preferences-card-header">
                <p className="preferences-label">{item.label}</p>
              </div>
              <div className="preferences-value-row">
                {'editable' in item && item.editable && item.isEditing ? (
                  'options' in item && item.options ? (
                    <select
                      className="preferences-input"
                      value={item.inputValue}
                      onChange={(e) => item.onChange(e.target.value)}
                      autoFocus
                    >
                      <option value="">-</option>
                      {item.options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="preferences-input"
                      value={item.inputValue}
                      onChange={(e) => item.onChange(e.target.value)}
                      autoFocus
                    />
                  )
                ) : (
                  <p className="preferences-value">{item.value}</p>
                )}
                {'editable' in item && item.editable ? (
                  <button
                    type="button"
                    className="preferences-edit-button"
                    onClick={item.onEdit}
                  >
                    EDIT
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        {hasPendingChanges ? (
          <>
            <button
              type="button"
              className="preferences-save-button"
              disabled={isSaving}
              onClick={() => void handleSave()}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            {saveError ? (
              <p className="preferences-save-error" role="alert">
                {saveError}
              </p>
            ) : null}
          </>
        ) : null}
      </section>

      {isKoreanGoalSheetOpen ? (
        <div
          className="preferences-bottom-sheet-overlay"
          onClick={() => setIsKoreanGoalSheetOpen(false)}
          aria-hidden="true"
        >
          <section
            className="preferences-bottom-sheet"
            onClick={(e) => e.stopPropagation()}
            aria-label="Korean Goal options"
          >
            <h2 className="preferences-bottom-sheet-title">Korean Goal</h2>
            <div className="preferences-bottom-sheet-options">
              {koreanGoalOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="preferences-bottom-sheet-option"
                  onClick={() => {
                    setDraftKoreanGoal(option)
                    setIsKoreanGoalSheetOpen(false)
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default PreferencesPage
