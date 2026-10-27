import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import { AuthLayout } from '@/layouts/AuthLayout'
import styles from './SpecialistConfirmEmailPage.module.css'

const DEMO_CODE = '746192'

type LocationState = {
  email?: string
  fullName?: string
}

export function SpecialistConfirmEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? null
  const email = state?.email?.trim() || 'e.sokolova@ravnovesie.ru'
  const fullName = state?.fullName?.trim() || 'Соколова Елена Сергеевна'

  const [code, setCode] = useState('7 4 6 1 9 2')
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
    navigate('/invite/doctor/qualification', {
      replace: true,
      state: { email, fullName, selfRegister: true },
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
        <h2 className={styles.title}>Подтвердите e-mail</h2>
        <p className={styles.subtitle}>
          Введите код из письма на {email}. Он действует 10 минут.
        </p>

        <label className={styles.field}>
          <span className={styles.label}>Код из письма</span>
          <input
            type="text"
            className={styles.codeInput}
            value={code}
            placeholder="7 4 6 1 9 2"
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
          Подтвердить e-mail
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
              navigate('/register/specialist', {
                state: { email, fullName },
              })
            }
          >
            Изменить e-mail
          </button>
        </div>

        <div className={styles.infoBox}>
          <IconShield className={styles.infoIcon} size={18} aria-hidden />
          <div className={styles.infoText}>
            <p className={styles.infoTitle}>
              Аккаунт ещё не даёт доступа к пациентам
            </p>
            <p className={styles.infoBody}>
              После подтверждения почты выберите клинику и заполните профиль
              специалиста.
            </p>
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}
