import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import { AuthLayout } from '@/layouts/AuthLayout'
import styles from './ConnectClinicReadyPage.module.css'

type LocationState = {
  clinicName?: string
  email?: string
  fullName?: string
}

export function ConnectClinicReadyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? null
  const clinicName = state?.clinicName?.trim() || 'Клиника «Равновесие»'
  const email = state?.email?.trim() || 'p.orlova@ravnovesie.ru'
  const fullName = state?.fullName?.trim() || 'Орлова Полина Андреевна'

  return (
    <AuthLayout
      variant="admin"
      activeStep={3}
      topRight={
        <Link to="/login" className={styles.loginLink}>
          Войти
        </Link>
      }
    >
      <div className={styles.panel}>
        <h2 className={styles.title}>Клиника готова к подключению</h2>
        <p className={styles.meta}>
          Приглашение для {email} от команды «Клинического компаса».
        </p>

        <div className={styles.infoBox}>
          <IconShield className={styles.infoIcon} size={18} aria-hidden />
          <div className={styles.infoText}>
            <p className={styles.infoTitle}>Первый администратор</p>
            <p className={styles.infoBody}>
              {clinicName} · {fullName}. Вы будете управлять командой, доступом
              и настройками.
            </p>
          </div>
        </div>

        <div className={styles.infoBox}>
          <IconShield className={styles.infoIcon} size={18} aria-hidden />
          <div className={styles.infoText}>
            <p className={styles.infoTitle}>
              Доступ к клиническим данным не включён
            </p>
            <p className={styles.infoBody}>
              Административная роль не позволяет читать дневники, менять
              лечение или назначать препараты.
            </p>
          </div>
        </div>

        <p className={styles.expiry}>
          Приглашение персональное и действует 72 часа.
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() =>
              navigate('/connect-clinic/activate', {
                replace: true,
                state: { clinicName, email, fullName },
              })
            }
          >
            Активировать аккаунт
          </button>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={() => navigate('/login')}
          >
            Другой аккаунт
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}
