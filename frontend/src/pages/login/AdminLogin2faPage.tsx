import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { login, isAuthenticated } from '@/lib/auth'
import styles from './AdminLogin2faPage.module.css'

type LocationState = {
  email?: string
}

export function AdminLogin2faPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? null
  const email = state?.email?.trim() || 'p.orlova@ravnovesie.ru'

  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated()) {
    return null // already authenticated, will redirect below
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!password) {
      setError('Введите пароль')
      return
    }
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/admin/welcome', { replace: true })
    } catch (err) {
      setSubmitting(false)
      if (err instanceof Error) {
        setError(err.message || 'Неверный пароль')
      } else {
        setError('Неверный пароль')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      variant="admin"
      topRight={
        <Link to="/login" className={styles.loginLink}>
          Войти
        </Link>
      }
    >
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <h2 className={styles.title}>Вход администратора</h2>
        <p className={styles.email}>{email}</p>
        <p className={styles.subtitle}>
          Введите пароль от вашего аккаунта администратора клиники.
        </p>

        <label className={styles.field}>
          <span className={styles.label}>Пароль</span>
          <input
            type="password"
            className={styles.codeInput}
            value={password}
            placeholder="••••••••••••"
            autoComplete="current-password"
            autoFocus
            onChange={(e) => {
              setPassword(e.target.value)
              setError(null)
            }}
          />
        </label>

        {error ? <p className={styles.error}>{error}</p> : null}

        <button type="submit" className={styles.primaryBtn} disabled={submitting}>
          {submitting ? 'Вход…' : 'Войти'}
        </button>
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={() => navigate('/login')}
        >
          Другой аккаунт
        </button>
      </form>
    </AuthLayout>
  )
}
