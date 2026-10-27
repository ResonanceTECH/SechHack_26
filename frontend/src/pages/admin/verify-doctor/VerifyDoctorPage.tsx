import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconShield, IconShieldCheck } from '@/components/icons/NavIcons'
import {
  verifyDoctorCandidate,
  verifyDoctorMeta,
  verifyDoctorTips,
} from '@/data/mockVerifyDoctor'
import styles from './VerifyDoctorPage.module.css'

export function VerifyDoctorPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState(verifyDoctorCandidate.roleDefault)
  const [identityOk, setIdentityOk] = useState(false)
  const [generalOk, setGeneralOk] = useState(true)
  const [prescriptionOk, setPrescriptionOk] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!identityOk) return
    navigate('/admin/employees', { replace: true })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{verifyDoctorMeta.title}</h1>
          <p className={styles.subtitle}>
            {verifyDoctorCandidate.fullName} · {verifyDoctorCandidate.email}
          </p>
        </div>
      </header>

      <div className={styles.body}>
        <form
          className={styles.formCard}
          onSubmit={onSubmit}
          aria-label="Проверка врача"
        >
          <span className={styles.status}>
            <span className={styles.statusDot} aria-hidden />
            {verifyDoctorMeta.statusLabel}
          </span>

          <div className={styles.credBlock}>
            <p className={styles.specialty}>
              {verifyDoctorCandidate.specialtyLine}
            </p>
            <p className={styles.document}>
              {verifyDoctorCandidate.documentLabel}{' '}
              <a href="#" className={styles.documentLink} onClick={(e) => e.preventDefault()}>
                {verifyDoctorCandidate.documentName}
              </a>
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="verify-role">
              {verifyDoctorMeta.roleLabel}
            </label>
            <input
              id="verify-role"
              type="text"
              className={styles.input}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className={styles.checks}>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={identityOk}
                onChange={(e) => setIdentityOk(e.target.checked)}
              />
              <span>{verifyDoctorMeta.checkIdentity}</span>
            </label>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={generalOk}
                onChange={(e) => setGeneralOk(e.target.checked)}
              />
              <span>{verifyDoctorMeta.checkGeneral}</span>
            </label>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={prescriptionOk}
                onChange={(e) => setPrescriptionOk(e.target.checked)}
                disabled={!identityOk}
              />
              <span>{verifyDoctorMeta.checkPrescription}</span>
            </label>
          </div>

          <div className={styles.notice}>
            <span className={styles.noticeIcon} aria-hidden>
              <IconShieldCheck />
            </span>
            <p className={styles.noticeBody}>{verifyDoctorMeta.notice}</p>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={!identityOk}
            >
              {verifyDoctorMeta.submitLabel}
            </button>
            <Link to="/admin/employees" className={styles.btnSecondary}>
              {verifyDoctorMeta.cancelLabel}
            </Link>
          </div>
        </form>

        <aside className={styles.tips} aria-label="Справка">
          {verifyDoctorTips.map((tip) => (
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
