import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import {
  DEMO_LOGIN_EMAIL,
  DEMO_LOGIN_PASSWORD,
  isDoctorAuthed,
  setDoctorAuthed,
} from '@/lib/doctorAuth'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (isDoctorAuthed()) {
    return <Navigate to="/" replace />
  }

  function loginAsDoctor() {
    const emailOk = email.trim().toLowerCase() === DEMO_LOGIN_EMAIL
    const passwordOk = password === DEMO_LOGIN_PASSWORD
    if (!emailOk || !passwordOk) {
      setError('Неверный e-mail или пароль')
      return
    }
    setDoctorAuthed(true)
    navigate('/', { replace: true })
  }

  function onDoctorSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    loginAsDoctor()
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
            <button type="submit" className={styles.primaryBtn}>
              Войти
            </button>
            <button type="button" className={styles.forgotLink}>
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
