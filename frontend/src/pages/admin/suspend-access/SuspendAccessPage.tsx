import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconShield, IconShieldCheck } from '@/components/icons/NavIcons'
import {
  suspendAccessEmployee,
  suspendAccessMeta,
  suspendAccessTips,
  suspendAlertOptions,
  suspendPatientOptions,
  suspendReasonOptions,
} from '@/data/mockSuspendAccess'
import styles from './SuspendAccessPage.module.css'

export function SuspendAccessPage() {
  const navigate = useNavigate()
  const [patientId, setPatientId] = useState<string>(suspendPatientOptions[0].id)
  const [alertId, setAlertId] = useState<string>(suspendAlertOptions[0].id)
  const [reasonId, setReasonId] = useState<string>(suspendReasonOptions[0].id)
  const [confirmed, setConfirmed] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!confirmed) return
    navigate('/admin/employees', { replace: true })
  }

  const { fullName, roleLabel, clinicName } = suspendAccessEmployee

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{suspendAccessMeta.title}</h1>
          <p className={styles.subtitle}>
            {fullName} · {roleLabel} · {clinicName}
          </p>
        </div>
      </header>

      <div className={styles.body}>
        <form
          className={styles.formCard}
          onSubmit={onSubmit}
          aria-label="Приостановка доступа"
        >
          <div className={styles.warning}>
            <span className={styles.warningBadge}>
              <span className={styles.warningDot} aria-hidden />
              {suspendAccessMeta.warningBadge}
            </span>
            <div className={styles.warningRow}>
              <span className={styles.warningIcon} aria-hidden>
                <IconShieldCheck />
              </span>
              <div className={styles.warningMeta}>
                <span className={styles.warningTitle}>
                  {suspendAccessMeta.warningTitle}
                </span>
                <span className={styles.warningBody}>
                  {suspendAccessMeta.warningBody}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="suspend-patients">
              {suspendAccessMeta.patientsLabel}
            </label>
            <div className={styles.selectWrap}>
              <select
                id="suspend-patients"
                className={styles.select}
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                {suspendPatientOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="suspend-alerts">
              {suspendAccessMeta.alertsLabel}
            </label>
            <div className={styles.selectWrap}>
              <select
                id="suspend-alerts"
                className={styles.select}
                value={alertId}
                onChange={(e) => setAlertId(e.target.value)}
              >
                {suspendAlertOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="suspend-reason">
              {suspendAccessMeta.reasonLabel}
            </label>
            <div className={styles.selectWrap}>
              <select
                id="suspend-reason"
                className={styles.select}
                value={reasonId}
                onChange={(e) => setReasonId(e.target.value)}
              >
                {suspendReasonOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className={styles.check}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>{suspendAccessMeta.confirmLabel}</span>
          </label>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.btnDanger}
              disabled={!confirmed}
            >
              {suspendAccessMeta.submitLabel}
            </button>
            <Link to="/admin/employees" className={styles.btnSecondary}>
              {suspendAccessMeta.cancelLabel}
            </Link>
          </div>
        </form>

        <aside className={styles.tips} aria-label="Справка">
          {suspendAccessTips.map((tip) => (
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
