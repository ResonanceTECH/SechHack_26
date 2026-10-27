import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { login, isAuthenticated } from '@/lib/auth'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  async function onDoctorSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setSubmitting(false)
      if (err instanceof Error) {
        setError(err.message || 'Неверный e-mail или пароль')
      } else {
        setError('Неверный e-mail или пароль')
      }
    } finally {
      if (!error) setSubmitting(false)
    }
  }

  return (
    <AuthLayout showFirstVisitHint activeStep={1}>
      <div className={styles.formWrap}>
        <form className={styles.form} onSubmit={onDoctorSubmit} noValidate>
          <h2 className={styles.title}>Войти в рабочий кабинет</h2>
          <p className={styles.subtitle}>
            Используйте единый аккаунт. Доступ к клинике зависит от назначенных
            вам ролей.
          </p>

          <label className={styles.field}>
            <span className={styles.label}>Рабочий e-mail</span>
            <input
              type="email"
              className={styles.input}
              value={email}
              placeholder="p.orlova@ravnovesie.ru"
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
              autoComplete="username"
              autoFocus
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Пароль</span>
            <input
              type="password"
              className={styles.input}
              value={password}
              placeholder="••••••••••••"
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
              autoComplete="current-password"
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions}>
            <button type="submit" className={styles.primaryBtn} disabled={submitting}>
              {submitting ? "Вход…" : "Войти"}
            </button>
            <button
              type="button"
              className={styles.forgotLink}
              onClick={() =>
                navigate('/login/forgot', {
                  state: { email: email.trim() || undefined },
                })
              }
            >
              Забыли пароль?
            </button>
          </div>
        </form>

        <div className={styles.altDivider} role="separator">
          <span className={styles.altDividerText}>Или продолжить как</span>
        </div>

        <ul className={styles.altList}>
          <li>
            <button
              type="button"
              className={styles.altLink}
              onClick={() => navigate('/register/specialist')}
            >
              Регистрация специалиста
            </button>
          </li>
          <li>
            <button
              type="button"
              className={styles.altLink}
              onClick={() => navigate('/connect-clinic')}
            >
              Подключить клинику
            </button>
          </li>
          <li>
            <button
              type="button"
              className={styles.altLink}
              onClick={() =>
                navigate('/login/admin-2fa', {
                  replace: true,
                  state: { email: email.trim() || undefined },
                })
              }
            >
              Вход для администратора клиники
            </button>
          </li>
        </ul>
      </div>
    </AuthLayout>
  )
}
