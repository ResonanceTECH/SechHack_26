import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import { AuthLayout } from '@/layouts/AuthLayout'
import styles from './DoctorClarifyPage.module.css'

type LocationState = {
  email?: string
  fullName?: string
  clinicName?: string
}

export function DoctorClarifyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? null

  const email = state?.email?.trim() || 'e.sokolova@ravnovesie.ru'
  const fullName = state?.fullName?.trim() || 'Соколова Елена Сергеевна'
  const clinicName = state?.clinicName?.trim() || 'Клиника «Равновесие»'

  return (
    <AuthLayout
      activeStep={3}
      topRight={
        <Link to="/login" className={styles.loginLink}>
          Войти
        </Link>
      }
    >
      <div className={styles.panel}>
        <span className={styles.status}>
          <span className={styles.statusDot} aria-hidden />
          Запрошено уточнение
        </span>

        <h2 className={styles.title}>Уточните профессиональные данные</h2>
        <p className={styles.subtitle}>
          {clinicName} проверила ваш профиль и просит дополнить сведения.
        </p>

        <div className={styles.infoBox}>
          <IconShield className={styles.infoIcon} size={18} aria-hidden />
          <div className={styles.infoText}>
            <p className={styles.infoTitle}>Комментарий администратора</p>
            <p className={styles.infoBody}>
              Проверьте замечания администратора и исправьте профиль.
            </p>
          </div>
        </div>

        <p className={styles.note}>
          После исправления отправьте профиль повторно. До подтверждения рабочий
          доступ закрыт.
        </p>

        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() =>
            navigate('/invite/doctor/qualification', {
              state: { email, fullName },
            })
          }
        >
          Исправить и отправить заново
        </button>
        <Link to="/login" className={styles.ghostBtn}>
          Вернуться ко входу
        </Link>
      </div>
    </AuthLayout>
  )
}
