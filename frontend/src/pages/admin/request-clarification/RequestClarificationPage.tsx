import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconShield, IconShieldCheck } from '@/components/icons/NavIcons'
import {
  requestClarificationEmployee,
  requestClarificationMeta,
  requestClarificationTips,
} from '@/data/mockRequestClarification'
import styles from './RequestClarificationPage.module.css'

export function RequestClarificationPage() {
  const navigate = useNavigate()
  const [note, setNote] = useState(requestClarificationMeta.noteDefault)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    navigate('/admin/applications', { replace: true })
  }

  const { fullName, roleLabel } = requestClarificationEmployee

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{requestClarificationMeta.title}</h1>
          <p className={styles.subtitle}>
            {fullName} · {roleLabel}
          </p>
        </div>
      </header>

      <div className={styles.body}>
        <form
          className={styles.formCard}
          onSubmit={onSubmit}
          aria-label="Запрос уточнения профиля"
        >
          <div className={styles.field}>
            <label className={styles.label} htmlFor="clarify-note">
              {requestClarificationMeta.noteLabel}
            </label>
            <textarea
              id="clarify-note"
              className={styles.textarea}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>

          <div className={styles.notice}>
            <span className={styles.noticeIcon} aria-hidden>
              <IconShieldCheck />
            </span>
            <div className={styles.noticeMeta}>
              <span className={styles.noticeTitle}>
                {requestClarificationMeta.noticeTitle}
              </span>
              <span className={styles.noticeBody}>
                {requestClarificationMeta.noticeBody}
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={!note.trim()}
            >
              {requestClarificationMeta.submitLabel}
            </button>
            <Link to="/admin/verify-doctor" className={styles.btnSecondary}>
              {requestClarificationMeta.cancelLabel}
            </Link>
          </div>
        </form>

        <aside className={styles.tips} aria-label="Справка">
          {requestClarificationTips.map((tip) => (
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
