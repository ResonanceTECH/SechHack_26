import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import styles from './AdminLogin2faPage.module.css'

const DEMO_APP_CODE = '418502'

type LocationState = {
  email?: string
}

export function AdminLogin2faPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? null
  const email = state?.email?.trim() || 'p.orlova@ravnovesie.ru'

  const [appCode, setAppCode] = useState('4 1 8 5 0 2')
  const [error, setError] = useState<string | null>(null)

  function formatCode(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 6)
    return digits.split('').join(' ')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const digits = appCode.replace(/\D/g, '')
    if (digits.length !== 6) {
      setError('Введите 6-значный код из приложения')
      return
    }
    if (digits !== DEMO_APP_CODE) {
      setError('Неверный код из приложения')
      return
    }
    navigate('/admin/welcome', { replace: true })
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
        <h2 className={styles.title}>Подтвердите вход</h2>
        <p className={styles.email}>{email}</p>
        <p className={styles.subtitle}>
          Введите код из вашего приложения-аутентификатора. Это проверка входа,
          а не выбор или назначение роли.
        </p>

        <label className={styles.field}>
          <span className={styles.label}>Код из приложения</span>
          <input
            type="text"
            className={styles.codeInput}
            value={appCode}
            placeholder="4 1 8 5 0 2"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            onChange={(e) => {
              setAppCode(formatCode(e.target.value))
              setError(null)
            }}
          />
        </label>

        {error ? <p className={styles.error}>{error}</p> : null}

        <button type="submit" className={styles.primaryBtn}>
          Подтвердить вход
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
