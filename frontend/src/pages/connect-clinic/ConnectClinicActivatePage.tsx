import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import styles from './ConnectClinicActivatePage.module.css'

type LocationState = {
  clinicName?: string
  email?: string
  fullName?: string
}

export function ConnectClinicActivatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? null

  const [fullName, setFullName] = useState(
    state?.fullName?.trim() || 'Орлова Полина Андреевна',
  )
  const [email] = useState(
    state?.email?.trim() || 'p.orlova@ravnovesie.ru',
  )
  const [password, setPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!accepted) {
      setError('Примите условия и политику обработки данных')
      return
    }
    if (password.replace(/\s/g, '').length < 12) {
      setError('Пароль должен быть не короче 12 символов')
      return
    }
    navigate('/connect-clinic/security', { replace: true })
  }

  return (
    <AuthLayout variant="admin" activeStep={3}>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <h2 className={styles.title}>Создайте аккаунт администратора</h2>
        <p className={styles.subtitle}>
          Приглашение подтверждает ваш e-mail. Роль и клиника уже назначены —
          менять их при регистрации нельзя.
        </p>

        <label className={styles.field}>
          <span className={styles.label}>ФИО</span>
          <input
            type="text"
            className={styles.input}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            autoFocus
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Рабочий e-mail · из приглашения</span>
          <input
            type="email"
            className={styles.input}
            value={email}
            readOnly
            autoComplete="email"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Новый пароль</span>
          <input
            type="password"
            className={styles.input}
            value={password}
            placeholder="••••••••••••"
            onChange={(e) => {
              setPassword(e.target.value)
              setError(null)
            }}
            autoComplete="new-password"
          />
          <span className={styles.hint}>
            Не менее 12 символов. Используйте уникальный пароль.
          </span>
        </label>

        <label className={styles.checkRow}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={accepted}
            onChange={(e) => {
              setAccepted(e.target.checked)
              setError(null)
            }}
          />
          <span>Принимаю условия и политику обработки данных</span>
        </label>

        {error ? <p className={styles.error}>{error}</p> : null}

        <button type="submit" className={styles.primaryBtn}>
          Создать аккаунт
        </button>

        <p className={styles.already}>
          Уже зарегистрированы? Войдите тем же e-mail, чтобы принять
          приглашение.
        </p>

        <button
          type="button"
          className={styles.ghostBtn}
          onClick={() => navigate('/login')}
        >
          Уже есть аккаунт — войти
        </button>
      </form>
    </AuthLayout>
  )
}
