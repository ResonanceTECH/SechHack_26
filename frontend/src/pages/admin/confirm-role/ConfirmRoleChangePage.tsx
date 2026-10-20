import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconShield, IconShieldCheck } from '@/components/icons/NavIcons'
import {
  CONFIRM_ROLE_DEMO_CODE,
  confirmRoleChangeEmployee,
  confirmRoleChangeMeta,
  confirmRoleChangeTips,
} from '@/data/mockConfirmRoleChange'
import styles from './ConfirmRoleChangePage.module.css'

export function ConfirmRoleChangePage() {
  const navigate = useNavigate()
  const [reason, setReason] = useState(confirmRoleChangeMeta.reasonDefault)
  const [code, setCode] = useState(confirmRoleChangeMeta.codeDefault)
  const [error, setError] = useState<string | null>(null)

  function formatCode(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 6)
    return digits.split('').join(' ')
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const digits = code.replace(/\D/g, '')
    if (digits.length !== 6) {
      setError('Введите 6-значный код из приложения')
      return
    }
    if (digits !== CONFIRM_ROLE_DEMO_CODE) {
      setError('Неверный код администратора')
      return
    }
    navigate('/admin/employees', { replace: true })
  }

  const { fullName, roleLabel, clinicName } = confirmRoleChangeEmployee

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{confirmRoleChangeMeta.title}</h1>
          <p className={styles.subtitle}>
            {fullName} · {roleLabel} · {clinicName}
          </p>
        </div>
      </header>

      <div className={styles.body}>
        <form
          className={styles.formCard}
          onSubmit={onSubmit}
          aria-label="Подтверждение изменения роли"
        >
          <div className={styles.notice}>
            <span className={styles.noticeIcon} aria-hidden>
              <IconShieldCheck />
            </span>
            <div className={styles.noticeMeta}>
              <span className={styles.noticeTitle}>
                {confirmRoleChangeMeta.changeTitle}
              </span>
              <span className={styles.noticeBody}>
                {confirmRoleChangeMeta.changeBody}
              </span>
            </div>
          </div>

          <div className={styles.notice}>
            <span className={styles.noticeIcon} aria-hidden>
              <IconShieldCheck />
            </span>
            <div className={styles.noticeMeta}>
              <span className={styles.noticeTitle}>
                {confirmRoleChangeMeta.keepTitle}
              </span>
              <span className={styles.noticeBody}>
                {confirmRoleChangeMeta.keepBody}
              </span>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="role-reason">
              {confirmRoleChangeMeta.reasonLabel}
            </label>
            <input
              id="role-reason"
              type="text"
              className={styles.input}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="role-code">
              {confirmRoleChangeMeta.codeLabel}
            </label>
            <input
              id="role-code"
              type="text"
              className={styles.codeInput}
              value={code}
              placeholder="4 1 8 5 0 2"
              inputMode="numeric"
              autoComplete="one-time-code"
              onChange={(e) => {
                setCode(formatCode(e.target.value))
                setError(null)
              }}
            />
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions}>
            <button type="submit" className={styles.btnPrimary}>
              {confirmRoleChangeMeta.submitLabel}
            </button>
            <Link to="/admin/employees" className={styles.btnSecondary}>
              {confirmRoleChangeMeta.cancelLabel}
            </Link>
          </div>
        </form>

        <aside className={styles.tips} aria-label="Справка">
          {confirmRoleChangeTips.map((tip) => (
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
