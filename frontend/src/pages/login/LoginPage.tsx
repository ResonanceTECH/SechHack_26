import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  DEMO_LOGIN_EMAIL,
  DEMO_LOGIN_PASSWORD,
  isDoctorAuthed,
  setDoctorAuthed,
} from '@/lib/doctorAuth'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(DEMO_LOGIN_EMAIL)
  const [password, setPassword] = useState(DEMO_LOGIN_PASSWORD)
  const [error, setError] = useState<string | null>(null)

  if (isDoctorAuthed()) {
    return <Navigate to="/" replace />
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const emailOk = email.trim().toLowerCase() === DEMO_LOGIN_EMAIL
    const passwordOk = password === DEMO_LOGIN_PASSWORD
    if (!emailOk || !passwordOk) {
      setError('Неверный e-mail или пароль')
      return
    }
    setDoctorAuthed(true)
    navigate('/', { replace: true })
  }

  return (
    <div className={styles.frame}>
      <div className={styles.canvas}>
        <form className={styles.card} onSubmit={onSubmit} noValidate>
          <div className={styles.brand}>
            <img
              className={styles.brandMark}
              src="/brand-logo.png"
              alt=""
              width={28}
              height={28}
              decoding="async"
            />
            <span className={styles.brandName}>Клинический компас</span>
          </div>

          <h1 className={styles.title}>Вход в кабинет врача</h1>
          <p className={styles.subtitle}>
            Подтвердите вход в существующий аккаунт.
          </p>

          <label className={styles.field}>
            <span className={styles.label}>E-mail</span>
            <input
              type="email"
              className={styles.input}
              value={email}
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
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
              autoComplete="current-password"
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" className={styles.submit}>
            Войти
          </button>

          <p className={styles.help}>
            Если не удаётся войти, обратитесь к администратору клиники.
          </p>
        </form>
      </div>
    </div>
  )
}
