import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import styles from './SpecialistRegisterPage.module.css'

type LocationState = {
  email?: string
  fullName?: string
}

export function SpecialistRegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? null
  const [fullName, setFullName] = useState(state?.fullName?.trim() || '')
  const [email, setEmail] = useState(state?.email?.trim() || '')
  const [password, setPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) {
      setError('Укажите ФИО')
      return
    }
    if (!email.trim()) {
      setError('Укажите рабочий e-mail')
      return
    }
    if (password.replace(/\s/g, '').length < 8) {
      setError('Введите пароль')
      return
    }
    if (!accepted) {
      setError('Примите условия и политику обработки данных')
      return
    }
    navigate('/register/specialist/confirm-email', {
      replace: true,
      state: {
        email: email.trim(),
        fullName: fullName.trim(),
      },
    })
  }

  return (
    <AuthLayout
      activeStep={1}
      topRight={
        <Link to="/login" className={styles.loginLink}>
          Войти
        </Link>
      }
    >
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <h2 className={styles.title}>Регистрация специалиста</h2>
        <p className={styles.subtitle}>
          Создайте аккаунт, затем подайте заявку в вашу клинику. Роль подтвердит
          её администратор.
        </p>

        <label className={styles.field}>
          <span className={styles.label}>ФИО</span>
          <input
            type="text"
            className={styles.input}
            value={fullName}
            placeholder="Соколова Елена Сергеевна"
            onChange={(e) => {
              setFullName(e.target.value)
              setError(null)
            }}
            autoComplete="name"
            autoFocus
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Рабочий e-mail</span>
          <input
            type="email"
            className={styles.input}
            value={email}
            placeholder="e.sokolova@ravnovesie.ru"
            onChange={(e) => {
              setEmail(e.target.value)
              setError(null)
            }}
            autoComplete="email"
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
            autoComplete="new-password"
          />
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

        <p className={styles.footerNote}>
          Есть приглашение? Используйте ссылку из письма: клиника и роль уже
          будут заполнены.
        </p>
      </form>
    </AuthLayout>
  )
}
