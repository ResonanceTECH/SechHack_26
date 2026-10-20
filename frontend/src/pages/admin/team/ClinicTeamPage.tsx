import { Link } from 'react-router-dom'
import { IconShieldCheck } from '@/components/icons/NavIcons'
import { clinicTeamMeta, clinicTeamRows } from '@/data/mockClinicTeam'
import styles from './ClinicTeamPage.module.css'

export function ClinicTeamPage() {
  const {
    title,
    subtitle,
    checkAppsLabel,
    inviteDoctorLabel,
    inviteAdminLabel,
    sectionTitle,
    noticeTitle,
    noticeBody,
  } = clinicTeamMeta

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <Link to="/admin/applications" className={styles.checkBtn}>
          {checkAppsLabel}
        </Link>
      </header>

      <section className={styles.card} aria-label={title}>
        <div className={styles.inviteRow}>
          <Link to="/admin/invite-doctor" className={styles.btnPrimary}>
            {inviteDoctorLabel}
          </Link>
          <Link to="/admin/invite-admin" className={styles.btnSoft}>
            {inviteAdminLabel}
          </Link>
        </div>

        <h2 className={styles.sectionTitle}>{sectionTitle}</h2>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Сотрудник</th>
                <th>Рабочий e-mail</th>
                <th>Роль</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {clinicTeamRows.map((row) => (
                <tr key={row.id}>
                  <td className={styles.name}>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.role}</td>
                  <td>
                    <span className={styles.status}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.notice}>
          <span className={styles.noticeIcon} aria-hidden>
            <IconShieldCheck />
          </span>
          <div className={styles.noticeMeta}>
            <span className={styles.noticeTitle}>{noticeTitle}</span>
            <span className={styles.noticeBody}>{noticeBody}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
