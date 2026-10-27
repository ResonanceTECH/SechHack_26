import { Link } from 'react-router-dom'
import {
  IconShield,
  IconShieldCheck,
} from '@/components/icons/NavIcons'
import {
  welcomeClinic,
  welcomeSteps,
  welcomeTips,
} from '@/data/mockWelcome'
import styles from './WelcomePage.module.css'

export function WelcomePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{welcomeClinic.title}</h1>
          <p className={styles.subtitle}>{welcomeClinic.subtitle}</p>
        </div>
        <Link to="/admin/applications" className={styles.appsBtn}>
          {welcomeClinic.applicationsLabel}
        </Link>
      </header>

      <div className={styles.body}>
        <section className={styles.mainCard} aria-label="Подключение команды">
          <span className={styles.status}>
            <span className={styles.statusDot} aria-hidden />
            {welcomeClinic.statusLabel}
          </span>

          <h2 className={styles.cardTitle}>{welcomeClinic.cardTitle}</h2>
          <p className={styles.cardBody}>{welcomeClinic.cardBody}</p>

          <ul className={styles.steps}>
            {welcomeSteps.map((step) => (
              <li key={step.id} className={styles.step}>
                <span className={styles.stepIcon} aria-hidden>
                  <IconShieldCheck />
                </span>
                <div className={styles.stepMeta}>
                  <span className={styles.stepTitle}>{step.title}</span>
                  <span className={styles.stepBody}>{step.body}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Link to="/admin/invite-doctor" className={styles.btnPrimary}>
              {welcomeClinic.inviteDoctorLabel}
            </Link>
            <Link to="/admin/invite-admin" className={styles.btnSecondary}>
              {welcomeClinic.inviteAdminLabel}
            </Link>
          </div>
        </section>

        <aside className={styles.tips} aria-label="Справка">
          {welcomeTips.map((tip) => (
            <article key={tip.id} className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden>
                <IconShield />
              </span>
              <div className={styles.tipMeta}>
                <h3 className={styles.tipTitle}>{tip.title}</h3>
                <p className={styles.tipBody}>{tip.body}</p>
              </div>
            </article>
          ))}
        </aside>
      </div>
    </div>
  )
}
