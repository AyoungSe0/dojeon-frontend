import { useEffect, useState } from 'react'
import './LoginPage.css'

interface LoginPageProps {
  onSignUp: () => void
  onLogin?: (credentials: { email: string; password: string }) => Promise<void>
}

function LoginPage({ onSignUp, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loginError) {
      return
    }

    const timer = window.setTimeout(() => {
      setLoginError('')
    }, 3000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [loginError])

  return (
    <main className="login-screen">
      {loginError ? (
        <div className="login-error-box" role="alert" aria-live="assertive">
          {loginError}
        </div>
      ) : null}

      <div className="login-profile" />

      <form
        className="login-form"
        onSubmit={async (e) => {
          e.preventDefault()

          if (!onLogin || isSubmitting) {
            return
          }

          setIsSubmitting(true)
          setLoginError('')

          try {
            await onLogin({
              email: email.trim(),
              password,
            })
          } catch (error) {
            setLoginError(
              error instanceof Error
                ? error.message
                : '이메일 또는 비밀번호가 올바르지 않습니다.',
            )
          } finally {
            setIsSubmitting(false)
          }
        }}
      >
        <label className="field-wrap">
          <span className="field-label">Email</span>
          <input
            type="email"
            className="field"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setLoginError('')
            }}
            disabled={isSubmitting}
          />
        </label>

        <label className="field-wrap field-wrap-large-gap">
          <span className="field-label">Password</span>
          <input
            type="password"
            className="field"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setLoginError('')
            }}
            disabled={isSubmitting}
          />
        </label>

        <p className="forgot-password">Forget password?</p>

        <button type="submit" className="btn btn-primary login-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>

        <button type="button" className="btn btn-ghost google-btn" disabled={isSubmitting}>
          Log in with Google
        </button>
      </form>

      <p className="signup-copy">
        Don't have account?
        <button type="button" onClick={onSignUp} className="signup-link-btn">
          Sign up
        </button>
      </p>
    </main>
  )
}

export default LoginPage
