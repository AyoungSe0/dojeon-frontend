import { useState } from 'react'
import './AccountInfoPage.css'

interface AccountInfoPageProps {
  email: string
  username: string
  nickname: string
  phoneNumber: string
  ageGroupOrBirthday: string
  onSave: (values: {
    nickname: string
    phoneNumber: string
    ageGroupOrBirthday: string
    passwordChange?: {
      newPassword: string
    }
  }) => void
  onBack: () => void
}

function AccountInfoPage({
  email,
  username,
  nickname,
  phoneNumber,
  ageGroupOrBirthday,
  onSave,
  onBack,
}: AccountInfoPageProps) {
  const [draftNickname, setDraftNickname] = useState(nickname)
  const [newPassword, setNewPassword] = useState('')
  const [draftPhoneNumber, setDraftPhoneNumber] = useState(phoneNumber)
  const [draftAgeGroupOrBirthday, setDraftAgeGroupOrBirthday] = useState(ageGroupOrBirthday)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [editing, setEditing] = useState({
    nickname: false,
    password: false,
    phoneNumber: false,
    ageGroupOrBirthday: false,
  })
  const isPasswordChangeReady = newPassword.trim().length > 0
  const hasPendingChanges =
    draftNickname !== nickname ||
    isPasswordChangeReady ||
    draftPhoneNumber !== phoneNumber ||
    draftAgeGroupOrBirthday !== ageGroupOrBirthday
  const toggleEditing = (
    key: 'nickname' | 'password' | 'phoneNumber' | 'ageGroupOrBirthday',
  ) => {
    if (key === 'password') {
      setPasswordMessage('')
    }

    setEditing((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const items = [
    { label: 'Email', value: email || '-' },
    { label: 'Username', value: username || '-' },
    {
      label: 'Nickname',
      value: draftNickname || '-',
      editable: true,
      isEditing: editing.nickname,
      onEdit: () => toggleEditing('nickname'),
      onChange: (value: string) => setDraftNickname(value),
      inputType: 'text',
      inputValue: draftNickname,
    },
    {
      label: 'Password',
      value: '**********',
      editable: true,
      isEditing: editing.password,
      onEdit: () => toggleEditing('password'),
      usesPasswordFields: true,
    },
    {
      label: 'Phone number',
      value: draftPhoneNumber || '-',
      editable: true,
      isEditing: editing.phoneNumber,
      onEdit: () => toggleEditing('phoneNumber'),
      onChange: (value: string) => setDraftPhoneNumber(value),
      inputType: 'text',
      inputValue: draftPhoneNumber,
    },
    {
      label: 'Age group / Birthday',
      value: draftAgeGroupOrBirthday || '-',
      editable: true,
      isEditing: editing.ageGroupOrBirthday,
      onEdit: () => toggleEditing('ageGroupOrBirthday'),
      onChange: (value: string) => setDraftAgeGroupOrBirthday(value),
      inputType: 'text',
      inputValue: draftAgeGroupOrBirthday,
    },
  ]

  return (
    <main className="account-info-screen">
      <section className="account-info-content">
        <header className="account-info-header">
          <button
            type="button"
            className="account-info-back"
            onClick={onBack}
            aria-label="뒤로 가기"
          >
            <svg
              className="account-info-back-icon"
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
          <h1 className="account-info-title">Account Info</h1>
        </header>

        <section className="account-info-list" aria-label="account details">
          {items.map((item) => (
            <article key={item.label} className="account-info-card">
              <div className="account-info-card-header">
                <p className="account-info-label">{item.label}</p>
              </div>
              <div className="account-info-value-row">
                {'editable' in item && item.editable && item.isEditing ? (
                  'usesPasswordFields' in item && item.usesPasswordFields ? (
                    <div className="account-info-password-fields">
                      <input
                        type="password"
                        className="account-info-input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="account-info-input"
                      value={'inputValue' in item ? item.inputValue : ''}
                      onChange={(e) => {
                        if ('onChange' in item && item.onChange) {
                          item.onChange(e.target.value)
                        }
                      }}
                      autoFocus
                    />
                  )
                ) : (
                  <p className="account-info-value">{item.value}</p>
                )}
                {'editable' in item && item.editable ? (
                  <button
                    type="button"
                    className="account-info-edit-button"
                    onClick={item.onEdit}
                  >
                    EDIT
                  </button>
                ) : null}
              </div>
              {item.label === 'Password' && passwordMessage ? (
                <p className="account-info-message">{passwordMessage}</p>
              ) : null}
            </article>
          ))}
        </section>

        {hasPendingChanges ? (
          <button
            type="button"
            className="account-info-save-button"
            onClick={() => {
              if (editing.password && !isPasswordChangeReady) {
                setPasswordMessage('Enter a new password.')
                return
              }

              onSave({
                nickname: draftNickname,
                phoneNumber: draftPhoneNumber,
                ageGroupOrBirthday: draftAgeGroupOrBirthday,
                passwordChange: isPasswordChangeReady
                  ? {
                      newPassword: newPassword.trim(),
                    }
                  : undefined,
              })
              setNewPassword('')
              setPasswordMessage('')
              setEditing({
                nickname: false,
                password: false,
                phoneNumber: false,
                ageGroupOrBirthday: false,
              })
            }}
          >
            Save
          </button>
        ) : null}
      </section>
    </main>
  )
}

export default AccountInfoPage
