import { Link } from 'react-router-dom'
import { accessInviteLogMeta } from '@/data/mockAccessInviteLog'
import styles from './AuditPage.module.css'

export function AuditPage() {
  const { title, subtitle, toEmployeesLabel, emptyMessage, columns } =
    accessInviteLogMeta

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
                <th className={styles.colTime}>{columns[0]}</th>
                <th className={styles.colEmployee}>{columns[1]}</th>
                <th className={styles.colAction}>{columns[2]}</th>
                <th className={styles.colInitiator}>{columns[3]}</th>
              </tr>
            </thead>
          </table>
        </div>

        <div className={styles.empty}>
          <p className={styles.emptyText}>{emptyMessage}</p>
          <Link to="/admin/employees" className={styles.emptyBtn}>
            {toEmployeesLabel}
          </Link>
        </div>
      </section>
    </div>
  )
}
