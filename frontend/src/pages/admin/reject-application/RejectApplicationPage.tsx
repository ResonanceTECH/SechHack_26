import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconShield, IconShieldCheck } from '@/components/icons/NavIcons'
import {
  rejectApplicationEmployee,
  rejectApplicationMeta,
  rejectApplicationTips,
} from '@/data/mockRejectApplication'
import styles from './RejectApplicationPage.module.css'

export function RejectApplicationPage() {
  const navigate = useNavigate()
  const [reason, setReason] = useState(rejectApplicationMeta.reasonDefault)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) return
    navigate('/admin/applications', { replace: true })
  }

  const { fullName, roleLine } = rejectApplicationEmployee

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{rejectApplicationMeta.title}</h1>
          <p className={styles.subtitle}>
            {fullName} · {roleLine}
          </p>
        </div>
      </header>

      <div className={styles.body}>
        <form
          className={styles.formCard}
          onSubmit={onSubmit}
          aria-label="Отклонение заявки"
        >
          <span className={styles.status}>
            <span className={styles.statusDot} aria-hidden />
            {rejectApplicationMeta.statusLabel}
          </span>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reject-reason">
              {rejectApplicationMeta.reasonLabel}
            </label>
            <textarea
              id="reject-reason"
              className={styles.textarea}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className={styles.notice}>
            <span className={styles.noticeIcon} aria-hidden>
              <IconShieldCheck />
            </span>
            <div className={styles.noticeMeta}>
              <span className={styles.noticeTitle}>
                {rejectApplicationMeta.noticeTitle}
              </span>
              <span className={styles.noticeBody}>
                {rejectApplicationMeta.noticeBody}
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.btnDanger}
              disabled={!reason.trim()}
            >
              {rejectApplicationMeta.submitLabel}
            </button>
            <Link to="/admin/verify-doctor" className={styles.btnSecondary}>
              {rejectApplicationMeta.cancelLabel}
            </Link>
          </div>
        </form>

        <aside className={styles.tips} aria-label="Справка">
          {rejectApplicationTips.map((tip) => (
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
