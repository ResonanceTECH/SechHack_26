import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import { AuthLayout } from '@/layouts/AuthLayout'
import styles from './ForgotPassword.module.css'

type LocationState = {
  email?: string
}

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? null
  const [email, setEmail] = useState(state?.email?.trim() || '')
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Укажите рабочий e-mail')
      return
    }
    navigate('/login/forgot/sent', {
      replace: true,
      state: { email: email.trim() },
    })
  }

  return (
    <AuthLayout
      topRight={
        <Link to="/login" className={styles.loginLink}>
          Войти
        </Link>
      }
    >
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <h2 className={styles.title}>Восстановить пароль</h2>
        <p className={styles.subtitle}>
          Укажите e-mail аккаунта. Если он зарегистрирован, мы отправим письмо с
          дальнейшими действиями.
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
            autoComplete="email"
            autoFocus
          />
        </label>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.actions}>
          <button type="submit" className={styles.primaryBtn}>
            Отправить письмо
          </button>
          <Link to="/login" className={styles.ghostBtn}>
            Назад ко входу
          </Link>
        </div>

        <div className={styles.infoBox}>
          <IconShield className={styles.infoIcon} size={18} aria-hidden />
          <div className={styles.infoText}>
            <p className={styles.infoTitle}>Роли и права сохраняются</p>
            <p className={styles.infoBody}>
              Смена пароля не создаёт новый аккаунт и не открывает доступ к
              другой клинике.
            </p>
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}
