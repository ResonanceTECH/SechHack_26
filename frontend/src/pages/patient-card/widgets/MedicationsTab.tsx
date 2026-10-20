import { Link, useNavigate } from 'react-router-dom'
import type { PatientMedicationsTab } from '@/types/doctor'
import styles from './MedicationsTab.module.css'

interface MedicationsTabProps {
  data: PatientMedicationsTab
  patientId: string
}

export function MedicationsTab({ data, patientId }: MedicationsTabProps) {
  const navigate = useNavigate()
  const { drug, alert, plan } = data

  return (
    <div className={styles.root}>
      <section className={styles.drugCard} aria-label={drug.title}>
        <header className={styles.drugHead}>
          <div className={styles.drugTitleRow}>
            <h3 className={styles.drugTitle}>{drug.title}</h3>
            <span className={styles.contourBadge}>
              <span className={styles.contourDot} aria-hidden />
              {drug.contourBadge}
            </span>
          </div>
          <p className={styles.schedule}>{drug.schedule}</p>
          <p className={styles.metaLine}>{drug.courseLine}</p>
          <p className={styles.metaLine}>{drug.planLine}</p>
        </header>

        <div className={styles.adherenceRow}>
          <div className={styles.adherenceBox}>
            <span className={styles.adherenceLabel}>{drug.adherenceLabel}</span>
            <span className={styles.adherencePercent}>
              {drug.adherencePercent}
            </span>
            <span className={styles.adherenceDoses}>{drug.adherenceDoses}</span>
          </div>
          <p className={styles.adherenceNote}>{drug.adherenceNote}</p>
        </div>

        <Link to={drug.grlsTo} className={styles.grlsBtn}>
          {drug.grlsCta}
        </Link>
      </section>

      <div className={styles.side}>
        <aside className={styles.sideCard}>
          <span className={styles.alertBadge}>
            <span className={styles.alertDot} aria-hidden />
            {alert.statusLabel}
          </span>
          <h3 className={styles.sideTitle}>{alert.title}</h3>
          <p className={styles.sideBody}>{alert.body}</p>
          <button
            type="button"
            className={styles.btnSoft}
            onClick={() => navigate('/alerts')}
          >
            {alert.cta}
          </button>
        </aside>

        <section className={styles.sideCard}>
          <h3 className={styles.sideTitle}>{plan.title}</h3>
          <p className={styles.sideBody}>{plan.body}</p>
          <button
            type="button"
            className={styles.btnSoft}
            onClick={() => navigate(`/patients/${patientId}/plan`)}
          >
            {plan.cta}
          </button>
        </section>
      </div>
    </div>
  )
}
