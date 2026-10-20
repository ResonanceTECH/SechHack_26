import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import { AuthLayout } from '@/layouts/AuthLayout'
import { setDoctorAuthed } from '@/lib/doctorAuth'
import styles from './DoctorPendingPage.module.css'

type LocationState = {
  email?: string
  fullName?: string
  clinicName?: string
}

export function DoctorPendingPage() {
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
          Доступ ещё не активен
        </span>

        <h2 className={styles.title}>Профиль ожидает проверки</h2>
        <p className={styles.meta}>
          {fullName} · {clinicName}
        </p>

        <div className={styles.infoBox}>
          <IconShield className={styles.infoIcon} size={18} aria-hidden />
          <div className={styles.infoText}>
            <p className={styles.infoTitle}>Данные направлены администратору</p>
            <p className={styles.infoBody}>
              Клиника проверит документы и подтвердит роль. До этого пациенты,
              дневники и назначения недоступны.
            </p>
          </div>
        </div>

        <p className={styles.note}>
          О результате сообщим на {email}. Если данные потребуется уточнить, вы
          сможете их исправить.
        </p>

        <div className={styles.row}>
          <button type="button" className={styles.btnPrimary}>
            Обновить статус
          </button>
          <Link
            to="/invite/doctor/qualification"
            state={{ email, fullName }}
            className={styles.btnSoft}
          >
            Исправить профиль
          </Link>
        </div>

        <button type="button" className={styles.btnGhost} onClick={logout}>
          Выйти
        </button>
      </div>
    </AuthLayout>
  )
}
