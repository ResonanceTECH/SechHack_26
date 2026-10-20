import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import { AuthLayout } from '@/layouts/AuthLayout'
import { setDoctorAuthed } from '@/lib/doctorAuth'
import styles from './ConnectClinicSecurityPage.module.css'

const SETUP_KEY = 'KKCM 7X4Q 9H2D 8P6M'
const DEMO_APP_CODE = '418502'

export function ConnectClinicSecurityPage() {
  const navigate = useNavigate()
  const [appCode, setAppCode] = useState('4 1 8 5 0 2')
  const [codesSaved, setCodesSaved] = useState(false)
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
    if (!codesSaved) {
      setError('Подтвердите, что резервные коды сохранены')
      return
    }
    setDoctorAuthed(true)
    navigate('/admin/welcome', { replace: true })
  }

  return (
    <AuthLayout variant="admin" activeStep={3}>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <h2 className={styles.title}>Защитите аккаунт</h2>
        <p className={styles.subtitle}>
          Для администратора обязательна двухфакторная защита. Она подтверждает
          вход и важные изменения доступа.
        </p>

        <div className={styles.infoBox}>
          <IconShield className={styles.infoIcon} size={18} aria-hidden />
          <div className={styles.infoText}>
            <p className={styles.infoTitle}>
              Подключите приложение-аутентификатор
            </p>
            <p className={styles.infoBody}>
              Добавьте аккаунт по ключу ниже. Затем введите шестизначный код из
              приложения.
            </p>
          </div>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Ключ настройки</span>
          <input
            type="text"
            className={styles.input}
            value={SETUP_KEY}
            readOnly
          />
        </label>

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

        <div className={styles.infoBox}>
          <IconShield className={styles.infoIcon} size={18} aria-hidden />
          <div className={styles.infoText}>
            <p className={styles.infoTitle}>Сохраните резервные коды</p>
            <p className={styles.infoBody}>
              Сохраните одноразовые коды для восстановления входа: KK-84F2 ·
              KK-19A7 · KK-62D8. Затем подтвердите сохранение ниже.
            </p>
          </div>
        </div>

        <label className={styles.checkRow}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={codesSaved}
            onChange={(e) => {
              setCodesSaved(e.target.checked)
              setError(null)
            }}
          />
          <span>Резервные коды сохранены</span>
        </label>

        {error ? <p className={styles.error}>{error}</p> : null}

        <button type="submit" className={styles.primaryBtn}>
          Подтвердить и продолжить
        </button>
      </form>
    </AuthLayout>
  )
}
