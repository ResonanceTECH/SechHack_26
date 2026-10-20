import { Link, useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import { AuthLayout } from '@/layouts/AuthLayout'
import styles from './InviteInvalidPage.module.css'

export function InviteInvalidPage() {
  const navigate = useNavigate()

  return (
    <AuthLayout
      topRight={
        <Link to="/login" className={styles.loginLink}>
          Войти
        </Link>
      }
    >
      <div className={styles.panel}>
        <span className={styles.status}>
          <span className={styles.statusDot} aria-hidden />
          Доступ не выдан
        </span>

        <h2 className={styles.title}>Приглашение недействительно</h2>
        <p className={styles.subtitle}>
          Срок действия ссылки истёк, она уже использована или отозвана
          клиникой.
        </p>

        <div className={styles.infoBox}>
          <IconShield className={styles.infoIcon} size={18} aria-hidden />
          <div className={styles.infoText}>
            <p className={styles.infoTitle}>
              Попросите администратора отправить новую ссылку
            </p>
            <p className={styles.infoBody}>
              Приглашения действуют 72 часа и привязаны к рабочему e-mail.
              Пересланная ссылка не выдаёт права другому аккаунту.
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => navigate('/login')}
        >
          Войти в существующий аккаунт
        </button>
        <button
          type="button"
          className={styles.softBtn}
          onClick={() => navigate('/register/specialist')}
        >
          Подать заявку самостоятельно
        </button>

        <p className={styles.footerNote}>
          Если приглашение уже принято, входите с тем же адресом почты.
          Повторная регистрация не нужна.
        </p>
      </div>
    </AuthLayout>
  )
}
