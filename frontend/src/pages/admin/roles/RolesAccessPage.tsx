import { Link } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import {
  rolesAccessMeta,
  rolesAccessRows,
  rolesAccessTips,
} from '@/data/mockRolesAccess'
import styles from './RolesAccessPage.module.css'

export function RolesAccessPage() {
  const {
    title,
    subtitle,
    toEmployeesLabel,
    inviteDoctorLabel,
    addAdminLabel,
  } = rolesAccessMeta

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <Link to="/admin/employees" className={styles.backBtn}>
          {toEmployeesLabel}
        </Link>
      </header>

      <section className={styles.card} aria-label={title}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colRole}>Роль</th>
                <th className={styles.colGeneral}>Общий контур</th>
                <th className={styles.colRx}>Рецептурный контур</th>
                <th className={styles.colClinic}>Управление клиникой</th>
              </tr>
            </thead>
            <tbody>
              {rolesAccessRows.map((row) => (
                <tr key={row.id}>
                  <td className={styles.role}>{row.role}</td>
                  <td>{row.general}</td>
                  <td>{row.prescription}</td>
                  <td>{row.clinic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className={styles.tips}>
        {rolesAccessTips.map((tip) => (
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
      </div>

      <div className={styles.actions}>
        <Link to="/admin/invite-doctor" className={styles.btnPrimary}>
          {inviteDoctorLabel}
        </Link>
        <Link to="/admin/invite-admin" className={styles.btnSecondary}>
          {addAdminLabel}
        </Link>
      </div>
    </div>
  )
}
