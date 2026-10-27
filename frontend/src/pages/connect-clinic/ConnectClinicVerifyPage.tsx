import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import { AuthLayout } from '@/layouts/AuthLayout'
import styles from './ConnectClinicVerifyPage.module.css'

type LocationState = {
  clinicName?: string
  email?: string
  applicationId?: string
}

const DEMO_CODE = '184260'

export function ConnectClinicVerifyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? null
  const email = state?.email?.trim() || 'p.orlova@ravnovesie.ru'
  const clinicName = state?.clinicName?.trim() || 'Клиника «Равновесие»'
  const applicationId = state?.applicationId?.trim() || 'KK-2048'

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [resent, setResent] = useState(false)

  function formatCode(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 6)
    return digits.split('').join(' ')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const digits = code.replace(/\D/g, '')
    if (digits.length !== 6) {
      setError('Введите 6-значный код из письма')
      return
    }
    if (digits !== DEMO_CODE) {
      setError('Неверный код')
      return
    }
    navigate('/connect-clinic/status', {
      replace: true,
      state: { clinicName, applicationId, email },
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
        <h2 className={styles.title}>Подтвердите рабочую почту</h2>
        <p className={styles.subtitle}>
          Мы отправили код на {email}. Он действует 10 минут.
        </p>

        <label className={styles.field}>
          <span className={styles.label}>Код из письма</span>
          <input
            type="text"
            className={styles.input}
            value={code}
            placeholder="1 8 4 2 6 0"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            onChange={(e) => {
              setCode(formatCode(e.target.value))
              setError(null)
              setResent(false)
            }}
          />
        </label>

        {error ? <p className={styles.error}>{error}</p> : null}
        {resent ? (
          <p className={styles.resent}>Новый код отправлен на {email}</p>
        ) : null}

        <button type="submit" className={styles.primaryBtn}>
          Подтвердить и отправить заявку
        </button>

        <div className={styles.secondaryActions}>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={() => {
              setResent(true)
              setError(null)
            }}
          >
            Отправить новый код
          </button>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={() =>
              navigate('/connect-clinic', {
                state: { clinicName, email },
              })
            }
          >
            Изменить e-mail
          </button>
        </div>

        <div className={styles.infoBox}>
          <IconShield className={styles.infoIcon} size={18} aria-hidden />
          <div className={styles.infoText}>
            <p className={styles.infoTitle}>Проверим клинику и полномочия</p>
            <p className={styles.infoBody}>
              Подтверждение почты подтверждает контакт, но само по себе не даёт
              прав администратора.
            </p>
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}
