import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import { AuthLayout } from '@/layouts/AuthLayout'
import { setDoctorAuthed } from '@/lib/doctorAuth'
import styles from './DoctorRejectedPage.module.css'

type LocationState = {
  email?: string
  fullName?: string
  clinicName?: string
}

export function DoctorRejectedPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? null

  const fullName = state?.fullName?.trim() || 'Соколова Елена Сергеевна'
  const clinicName = state?.clinicName?.trim() || 'клиника «Равновесие»'
  const email = state?.email?.trim() || 'e.sokolova@ravnovesie.ru'

  function logout() {
    setDoctorAuthed(false)
    navigate('/login', { replace: true })
  }

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
          Заявка отклонена
        </span>

        <h2 className={styles.title}>Клиника не подтвердила профиль</h2>
        <p className={styles.meta}>
          {fullName} · {clinicName}
        </p>

        <div className={styles.infoBox}>
          <IconShield className={styles.infoIcon} size={18} aria-hidden />
          <div className={styles.infoText}>
            <p className={styles.infoTitle}>Причина решения</p>
            <p className={styles.infoBody}>
              Проверьте замечания администратора и исправьте профиль.
            </p>
          </div>
        </div>

        <p className={styles.note}>
          Вы можете исправить сведения и отправить профиль на повторную
          проверку. До нового решения рабочий доступ закрыт.
        </p>

        <Link
          to="/invite/doctor/qualification"
          state={{ email, fullName }}
          className={styles.btnSoft}
        >
          Исправить профиль
        </Link>
        <button type="button" className={styles.btnGhost} onClick={logout}>
          Выйти
        </button>
      </div>
    </AuthLayout>
  )
}
