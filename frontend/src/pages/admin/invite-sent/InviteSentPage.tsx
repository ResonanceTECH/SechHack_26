import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import { inviteSentMeta, inviteSentTips } from '@/data/mockInviteSent'
import styles from './InviteSentPage.module.css'

type LocationState = {
  email?: string
  kind?: 'doctor' | 'admin'
}

export function InviteSentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? null
  const email = state?.email?.trim() || inviteSentMeta.defaultEmail
  const inviteMoreTo =
    state?.kind === 'admin' ? '/admin/invite-admin' : '/admin/invite-doctor'

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{inviteSentMeta.title}</h1>
          <p className={styles.subtitle}>{inviteSentMeta.subtitle}</p>
        </div>
      </header>

      <div className={styles.body}>
        <section className={styles.card} aria-label="Статус приглашения">
          <span className={styles.status}>
            <span className={styles.statusDot} aria-hidden />
            {inviteSentMeta.statusLabel}
          </span>

          <div className={styles.notice}>
            <span className={styles.noticeIcon} aria-hidden>
              <IconShield />
            </span>
            <div className={styles.noticeMeta}>
              <span className={styles.noticeTitle}>
                {inviteSentMeta.mailTitle}
              </span>
              <span className={styles.noticeBody}>
                {inviteSentMeta.mailBody}
              </span>
            </div>
          </div>

          <p className={styles.disclaimer}>{inviteSentMeta.disclaimer}</p>

          <h2 className={styles.manageTitle}>{inviteSentMeta.manageTitle}</h2>

          <div className={styles.row}>
            <button type="button" className={styles.btnSoft}>
              {inviteSentMeta.resendLabel}
            </button>
            <button type="button" className={styles.btnOutline}>
              {inviteSentMeta.revokeLabel}
            </button>
          </div>

          <div className={styles.row}>
            <Link to="/admin/employees" className={styles.btnPrimary}>
              {inviteSentMeta.toEmployeesLabel}
            </Link>
            <Link to={inviteMoreTo} className={styles.btnSoft}>
              {inviteSentMeta.inviteMoreLabel}
            </Link>
          </div>

          <p className={styles.email}>{email}</p>

          <div className={styles.prototype}>
            <span className={styles.prototypeLabel}>
              {inviteSentMeta.prototypeLabel}
            </span>
            <button
              type="button"
              className={styles.prototypeLink}
              onClick={() =>
                navigate(
                  state?.kind === 'admin'
                    ? '/invite/admin'
                    : '/invite/doctor',
                  { state: { email } },
                )
              }
            >
              {inviteSentMeta.openLetterLabel}
            </button>
          </div>
        </section>

        <aside className={styles.tips} aria-label="Справка">
          {inviteSentTips.map((tip) => (
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
