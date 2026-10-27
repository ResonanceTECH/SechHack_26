import type { PatientAccessTab } from '@/types/doctor'
import styles from './AccessTab.module.css'

interface AccessTabProps {
  data: PatientAccessTab
}

export function AccessTab({ data }: AccessTabProps) {
  const { viewer } = data

  return (
    <div className={styles.root}>
      <section className={styles.logCard} aria-label={data.title}>
        <header className={styles.logHead}>
          <div className={styles.logHeadText}>
            <h3 className={styles.logTitle}>{data.title}</h3>
            <p className={styles.logSubtitle}>{data.subtitle}</p>
          </div>
          <span className={styles.viewOnly}>
            <span className={styles.viewOnlyDot} aria-hidden />
            {data.viewOnlyBadge}
          </span>
        </header>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Время</th>
                <th scope="col">Кто</th>
                <th scope="col">Действие</th>
                <th scope="col">Основание</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.id}>
                  <td className={styles.time}>{row.time}</td>
                  <td>{row.who}</td>
                  <td>{row.action}</td>
                  <td className={styles.basis}>{row.basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.viewerCard} aria-label="Права доступа">
        <div className={styles.viewerRow}>
          <div className={styles.viewerMain}>
            <div className={styles.avatar} aria-hidden>
              {viewer.initials}
            </div>
            <div className={styles.viewerInfo}>
              <p className={styles.viewerName}>{viewer.fullName}</p>
              <p className={styles.viewerRole}>{viewer.roleLine}</p>
            </div>
          </div>
          <span className={styles.accessBadge}>
            <span className={styles.accessDot} aria-hidden />
            {viewer.accessBadge}
          </span>
        </div>
        <p className={styles.viewerNote}>{viewer.footerNote}</p>
      </section>
    </div>
  )
}
