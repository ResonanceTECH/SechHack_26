import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import { AuthLayout } from '@/layouts/AuthLayout'
import styles from './ConnectClinicStatusPage.module.css'

type LocationState = {
  clinicName?: string
  applicationId?: string
  email?: string
}

export function ConnectClinicStatusPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? null
  const clinicName = state?.clinicName?.trim() || 'Клиника «Равновесие»'
  const applicationId = state?.applicationId?.trim() || 'KK-2048'
  const email = state?.email?.trim() || 'p.orlova@ravnovesie.ru'

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
        <h2 className={styles.title}>Заявка на подключение принята</h2>
        <p className={styles.meta}>
          {clinicName} · заявка № {applicationId}
        </p>

        <div className={styles.infoBox}>
          <IconShield className={styles.infoIcon} size={18} aria-hidden />
          <div className={styles.infoText}>
            <p className={styles.infoTitle}>
              Проверяем организацию и представителя
            </p>
            <p className={styles.infoBody}>
              Команда сервиса проверит заявку и свяжется с вами по рабочей
              почте. До подтверждения кабинет клиники недоступен.
            </p>
          </div>
        </div>

        <div className={styles.nextBlock}>
          <h3 className={styles.nextTitle}>Что дальше</h3>
          <p className={styles.nextBody}>
            После проверки первый администратор получит персональное
            приглашение. Создавать повторную заявку не нужно.
          </p>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.primaryBtn}>
            Обновить статус
          </button>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={() => navigate('/login')}
          >
            Вернуться ко входу
          </button>
        </div>

        <div className={styles.prototypeBox}>
          <p className={styles.prototypeLabel}>
            Прототип · следующее внешнее событие
          </p>
          <button
            type="button"
            className={styles.prototypeBtn}
            onClick={() =>
              navigate('/connect-clinic/ready', {
                replace: true,
                state: { clinicName, email },
              })
            }
          >
            Показать ответ команды сервиса
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}
