import { Link } from 'react-router-dom'
import { IconShield, IconShieldCheck } from '@/components/icons/NavIcons'
import styles from './EmployeeCardPage.module.css'

export function EmployeeCardPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Карточка сотрудника</h1>
          <p className={styles.subtitle}>
            Соколова Елена Сергеевна · e.sokolova@ravnovesie.ru
          </p>
        </div>
      </header>

      <div className={styles.body}>
        <section className={styles.card} aria-label="Карточка сотрудника">
          <span className={styles.status}>
            <span className={styles.statusDot} aria-hidden />
            Профиль заполняется
          </span>

          <div className={styles.roleBlock}>
            <span className={styles.roleLabel}>Назначенная роль</span>
            <span className={styles.roleValue}>Врач-психиатр</span>
          </div>

          <div className={styles.notice}>
            <span className={styles.noticeIcon} aria-hidden>
              <IconShieldCheck />
            </span>
            <div className={styles.noticeMeta}>
              <span className={styles.noticeTitle}>
                Контуры и область доступа
              </span>
              <span className={styles.noticeBody}>
                Права появятся после проверки квалификации.
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            <Link to="/admin/verify-doctor" className={styles.btnPrimary}>
              Проверить профиль / изменить права
            </Link>
            <Link to="/admin/employees" className={styles.btnGhost}>
              К сотрудникам
            </Link>
          </div>
        </section>

        <aside className={styles.tips} aria-label="Справка">
          <article className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden>
              <IconShield />
            </span>
            <div className={styles.tipMeta}>
              <h3 className={styles.tipTitle}>
                Роль и статус — разные параметры
              </h3>
              <p className={styles.tipBody}>
                Принятое приглашение ещё не означает активную врачебную роль.
                Клинические права выдаются после отдельной проверки.
              </p>
            </div>
          </article>
        </aside>
      </div>
    </div>
  )
}
