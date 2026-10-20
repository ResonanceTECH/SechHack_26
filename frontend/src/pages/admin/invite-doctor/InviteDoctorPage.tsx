import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import {
  inviteDoctorDepartments,
  inviteDoctorMeta,
  inviteDoctorRoles,
  inviteDoctorTips,
} from '@/data/mockInviteDoctor'
import styles from './InviteDoctorPage.module.css'

export function InviteDoctorPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(inviteDoctorMeta.emailDefault)
  const [roleId, setRoleId] = useState<string>(inviteDoctorRoles[0].id)
  const [departmentId, setDepartmentId] = useState<string>(
    inviteDoctorDepartments[0].id,
  )

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    navigate('/admin/invite-sent', {
      replace: true,
      state: { email, kind: 'doctor' as const },
    })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{inviteDoctorMeta.title}</h1>
          <p className={styles.subtitle}>{inviteDoctorMeta.subtitle}</p>
        </div>
        <Link to="/admin/employees" className={styles.backBtn}>
          {inviteDoctorMeta.backLabel}
        </Link>
      </header>

      <div className={styles.body}>
        <form
          className={styles.formCard}
          onSubmit={onSubmit}
          aria-label="Приглашение врача"
        >
          <div className={styles.field}>
            <label className={styles.label} htmlFor="invite-email">
              {inviteDoctorMeta.emailLabel}
            </label>
            <input
              id="invite-email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="invite-role">
              {inviteDoctorMeta.roleLabel}
            </label>
            <div className={styles.selectWrap}>
              <select
                id="invite-role"
                className={styles.select}
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
              >
                {inviteDoctorRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="invite-dept">
              {inviteDoctorMeta.departmentLabel}
            </label>
            <div className={styles.selectWrap}>
              <select
                id="invite-dept"
                className={styles.select}
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                {inviteDoctorDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.notice}>
            <span className={styles.noticeIcon} aria-hidden>
              <IconShield />
            </span>
            <div className={styles.noticeMeta}>
              <span className={styles.noticeTitle}>
                {inviteDoctorMeta.rightsTitle}
              </span>
              <span className={styles.noticeBody}>
                {inviteDoctorMeta.rightsBody}
              </span>
            </div>
          </div>

          <p className={styles.footerNote}>{inviteDoctorMeta.footerNote}</p>

          <div className={styles.actions}>
            <button type="submit" className={styles.btnPrimary}>
              {inviteDoctorMeta.submitLabel}
            </button>
            <Link to="/admin/welcome" className={styles.btnSecondary}>
              {inviteDoctorMeta.cancelLabel}
            </Link>
          </div>
        </form>

        <aside className={styles.tips} aria-label="Справка">
          {inviteDoctorTips.map((tip) => (
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
