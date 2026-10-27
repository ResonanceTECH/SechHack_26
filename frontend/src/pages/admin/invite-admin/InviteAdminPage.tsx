import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import { inviteAdminMeta, inviteAdminTips } from '@/data/mockInviteAdmin'
import styles from './InviteAdminPage.module.css'

export function InviteAdminPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(inviteAdminMeta.emailDefault)
  const [confirmed, setConfirmed] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!confirmed) return
    navigate('/admin/invite-sent', {
      replace: true,
      state: { email, kind: 'admin' as const },
    })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{inviteAdminMeta.title}</h1>
          <p className={styles.subtitle}>{inviteAdminMeta.subtitle}</p>
        </div>
        <Link to="/admin/employees" className={styles.backBtn}>
          {inviteAdminMeta.backLabel}
        </Link>
      </header>

      <div className={styles.body}>
        <form
          className={styles.formCard}
          onSubmit={onSubmit}
          aria-label="Приглашение администратора"
        >
          <div className={styles.field}>
            <label className={styles.label} htmlFor="invite-admin-email">
              {inviteAdminMeta.emailLabel}
            </label>
            <input
              id="invite-admin-email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="invite-admin-role">
              {inviteAdminMeta.roleLabel}
            </label>
            <input
              id="invite-admin-role"
              type="text"
              className={styles.input}
              value={inviteAdminMeta.roleValue}
              readOnly
            />
          </div>

          <div className={styles.notice}>
            <span className={styles.noticeIcon} aria-hidden>
              <IconShield />
            </span>
            <div className={styles.noticeMeta}>
              <span className={styles.noticeTitle}>
                {inviteAdminMeta.canDoTitle}
              </span>
              <span className={styles.noticeBody}>
                {inviteAdminMeta.canDoBody}
              </span>
            </div>
          </div>

          <div className={styles.notice}>
            <span className={styles.noticeIcon} aria-hidden>
              <IconShield />
            </span>
            <div className={styles.noticeMeta}>
              <span className={styles.noticeTitle}>
                {inviteAdminMeta.noClinicalTitle}
              </span>
              <span className={styles.noticeBody}>
                {inviteAdminMeta.noClinicalBody}
              </span>
            </div>
          </div>

          <label className={styles.check}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              required
            />
            <span>{inviteAdminMeta.confirmLabel}</span>
          </label>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={!confirmed}
            >
              {inviteAdminMeta.submitLabel}
            </button>
            <Link to="/admin/welcome" className={styles.btnSecondary}>
              {inviteAdminMeta.cancelLabel}
            </Link>
          </div>
        </form>

        <aside className={styles.tips} aria-label="Справка">
          {inviteAdminTips.map((tip) => (
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
