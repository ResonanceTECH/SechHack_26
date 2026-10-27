import { useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import { AuthLayout } from '@/layouts/AuthLayout'
import styles from './AdminInvitePage.module.css'

const INVITE = {
  clinicName: 'Клиника «Равновесие»',
  inviteeName: 'Анну Романову',
  email: 'a.romanova@ravnovesie.ru',
  fullName: 'Романова Анна',
} as const

export function AdminInvitePage() {
  const navigate = useNavigate()

  return (
    <AuthLayout variant="admin" activeStep={1}>
      <div className={styles.panel}>
        <span className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden />
          Администратор · без клинических прав
        </span>

        <h2 className={styles.title}>Приглашение администратора</h2>
        <p className={styles.subtitle}>
          {INVITE.clinicName} приглашает {INVITE.inviteeName} управлять командой
          и настройками.
        </p>

        <div className={styles.infoBox}>
          <IconShield className={styles.infoIcon} size={18} aria-hidden />
          <div className={styles.infoText}>
            <p className={styles.infoTitle}>
              Приглашение для {INVITE.email}
            </p>
            <p className={styles.infoBody}>
              Администратор может приглашать сотрудников и управлять доступом.
              Пациенты, дневники и назначения не открываются автоматически.
            </p>
          </div>
        </div>

        <p className={styles.note}>
          Приглашение персональное и действует 72 часа. Для административной
          роли обязателен второй фактор.
        </p>

        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() =>
            navigate('/connect-clinic/activate', {
              replace: true,
              state: {
                clinicName: INVITE.clinicName,
                email: INVITE.email,
                fullName: INVITE.fullName,
              },
            })
          }
        >
          Создать аккаунт администратора
        </button>
        <button
          type="button"
          className={styles.softBtn}
          onClick={() => navigate('/login')}
        >
          Уже есть аккаунт — войти
        </button>
      </div>
    </AuthLayout>
  )
}
