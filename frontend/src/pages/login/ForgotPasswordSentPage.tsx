import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import { AuthLayout } from '@/layouts/AuthLayout'
import styles from './ForgotPassword.module.css'

type LocationState = {
  email?: string
}

export function ForgotPasswordSentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? null
  const email = state?.email?.trim() || 'p.orlova@ravnovesie.ru'
  const [resent, setResent] = useState(false)

  return (
    <AuthLayout
      topRight={
        <Link to="/login" className={styles.loginLink}>
          Войти
        </Link>
      }
    >
      <div className={styles.form}>
        <span className={styles.statusOk}>
          <span className={styles.statusOkDot} aria-hidden />
          Запрос принят
        </span>

        <h2 className={styles.title}>Проверьте вашу почту</h2>
        <p className={styles.subtitle}>
          Если аккаунт с указанным e-mail существует, письмо для восстановления
          уже отправлено.
        </p>

        <div className={styles.infoBox}>
          <IconShield className={styles.infoIcon} size={18} aria-hidden />
          <div className={styles.infoText}>
            <p className={styles.infoTitle}>Используйте ссылку из письма</p>
            <p className={styles.infoBody}>
              Одноразовая ссылка действует 30 минут. Не передавайте её другим
              людям.
            </p>
          </div>
        </div>

        <p className={styles.note}>
          Проверьте папку «Спам». При повторном запросе используйте самое новое
          письмо.
        </p>

        {resent ? (
          <p className={styles.resent}>Новое письмо отправлено на {email}</p>
        ) : null}

        <div className={styles.stackActions}>
          <button
            type="button"
            className={styles.softBtn}
            onClick={() => setResent(true)}
          >
            Повторить отправку
          </button>
          <Link to="/login" className={styles.ghostBtnWide}>
            Вернуться ко входу
          </Link>
        </div>

        <div className={styles.protoBox}>
          <p className={styles.protoLabel}>Прототип · письмо вне приложения</p>
          <button
            type="button"
            className={styles.protoBtn}
            onClick={() =>
              navigate('/login/forgot/reset', {
                state: { email },
              })
            }
          >
            Открыть письмо восстановления
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}
