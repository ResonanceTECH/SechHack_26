import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import styles from './ConnectClinicPage.module.css'

type LocationState = {
  clinicName?: string
  email?: string
}

export function ConnectClinicPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const incoming = (location.state as LocationState | null) ?? null
  const [clinicName, setClinicName] = useState(incoming?.clinicName ?? '')
  const [inn, setInn] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState(incoming?.email ?? '')
  const [accepted, setAccepted] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!accepted) return
    navigate('/connect-clinic/verify', {
      replace: true,
      state: {
        clinicName: clinicName.trim() || 'Клиника «Равновесие»',
        email: email.trim() || 'p.orlova@ravnovesie.ru',
        applicationId: 'KK-2048',
      },
    })
  }

  return (
    <AuthLayout
      activeStep={2}
      topRight={
        <Link to="/login" className={styles.loginLink}>
          Войти
        </Link>
      }
    >
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <h2 className={styles.title}>Подключить клинику</h2>
        <p className={styles.subtitle}>
          Оставьте заявку от организации. Первый администратор получит
          приглашение после проверки клиники.
        </p>

        <label className={styles.field}>
          <span className={styles.label}>Название клиники</span>
          <input
            type="text"
            className={styles.input}
            value={clinicName}
            placeholder="Клиника «Равновесие»"
            onChange={(e) => setClinicName(e.target.value)}
            autoComplete="organization"
            autoFocus
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>ИНН организации</span>
          <input
            type="text"
            className={styles.input}
            value={inn}
            placeholder="7701234567"
            inputMode="numeric"
            onChange={(e) => setInn(e.target.value)}
            autoComplete="off"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>ФИО представителя</span>
          <input
            type="text"
            className={styles.input}
            value={fullName}
            placeholder="Орлова Полина Андреевна"
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Рабочий e-mail</span>
          <input
            type="email"
            className={styles.input}
            value={email}
            placeholder="p.orlova@ravnovesie.ru"
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label className={styles.checkRow}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span>Принимаю условия и политику обработки данных</span>
        </label>

        <button type="submit" className={styles.primaryBtn}>
          Подтвердить e-mail
        </button>

        <p className={styles.hint}>
          Если клиника уже подключена, запросите приглашение у её
          администратора.
        </p>
      </form>
    </AuthLayout>
  )
}
