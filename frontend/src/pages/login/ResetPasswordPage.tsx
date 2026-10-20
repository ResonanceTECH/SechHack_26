import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import { AuthLayout } from '@/layouts/AuthLayout'
import { setDoctorAuthed } from '@/lib/doctorAuth'
import styles from './ForgotPassword.module.css'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.replace(/\s/g, '').length < 8) {
      setError('Пароль должен быть не короче 8 символов')
      return
    }
    if (password !== confirm) {
      setError('Пароли не совпадают')
      return
    }
    setDoctorAuthed(true)
    navigate('/', { replace: true })
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
        <h2 className={styles.title}>Установите новый пароль</h2>
        <p className={styles.subtitle}>
          Ссылка восстановления проверена. Создайте новый уникальный пароль для
          вашего аккаунта.
        </p>

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
            autoFocus
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Повторите новый пароль</span>
          <input
            type="password"
            className={styles.input}
            value={confirm}
            placeholder="••••••••••••"
            onChange={(e) => {
              setConfirm(e.target.value)
              setError(null)
            }}
            autoComplete="new-password"
          />
        </label>

        <div className={styles.infoBox}>
          <IconShield className={styles.infoIcon} size={18} aria-hidden />
          <div className={styles.infoText}>
            <p className={styles.infoTitle}>После смены пароля войдите снова</p>
            <p className={styles.infoBody}>
              Предыдущие сеансы завершатся. Для администратора сохранится
              проверка второго фактора.
            </p>
          </div>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        <button type="submit" className={styles.primaryBtnWide}>
          Сохранить пароль и войти
        </button>
      </form>
    </AuthLayout>
  )
}
