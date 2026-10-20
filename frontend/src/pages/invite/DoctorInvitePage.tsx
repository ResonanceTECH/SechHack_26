import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import { AuthLayout } from '@/layouts/AuthLayout'
import styles from './DoctorInvitePage.module.css'

const INVITE = {
  clinicName: 'Клиника «Равновесие»',
  doctorName: 'Елену Соколову',
  role: 'врач-психиатр',
  email: 'e.sokolova@ravnovesie.ru',
} as const

export function DoctorInvitePage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!accepted) {
      setError('Примите условия и политику обработки данных')
      return
    }
    if (password.length < 8) {
      setError('Введите пароль')
      return
    }
    navigate('/invite/doctor/qualification', {
      replace: true,
      state: { email: INVITE.email, fullName: 'Соколова Елена Сергеевна' },
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
        <h2 className={styles.title}>Вас пригласили в клинику</h2>
        <p className={styles.subtitle}>
          {INVITE.clinicName} приглашает {INVITE.doctorName} присоединиться к
          команде.
        </p>

        <div className={styles.infoBox}>
          <IconShield className={styles.infoIcon} size={18} aria-hidden />
          <div className={styles.infoText}>
            <p className={styles.infoTitle}>Роль: {INVITE.role}</p>
            <p className={styles.infoBody}>
              Роль назначена администратором. Доступ к пациентам появится после
              проверки профессиональных данных.
            </p>
          </div>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Рабочий e-mail · из приглашения</span>
          <input
            type="email"
            className={styles.input}
            value={INVITE.email}
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
            autoFocus
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
          Создать аккаунт и продолжить
        </button>

        <button
          type="button"
          className={styles.ghostBtn}
          onClick={() => navigate('/login')}
        >
          Уже есть аккаунт? Войти
        </button>
      </form>
    </AuthLayout>
  )
}
