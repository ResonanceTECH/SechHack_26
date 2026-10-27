import { useNavigate } from 'react-router-dom'
import type { PatientVisitsTab } from '@/types/doctor'
import styles from './VisitsTab.module.css'

interface VisitsTabProps {
  data: PatientVisitsTab
  patientId: string
  onOpenQuestionnaires: () => void
}

export function VisitsTab({
  data,
  patientId,
  onOpenQuestionnaires,
}: VisitsTabProps) {
  const navigate = useNavigate()
  const { appointment: appt, note, historyTitle, history } = data

  return (
    <div className={styles.root}>
      <div className={styles.top}>
        <section className={styles.card} aria-label="Ближайший приём">
          <span className={styles.statusBadge}>
            <span className={styles.statusDot} aria-hidden />
            {appt.statusLabel}
          </span>
          <h3 className={styles.datetime}>{appt.datetime}</h3>
          <p className={styles.kind}>{appt.kindLine}</p>
          <p className={styles.doctor}>{appt.doctorLine}</p>

          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => navigate(`/patients/${patientId}/report`)}
          >
            {appt.reportCta}
          </button>

          <div className={styles.transferBox}>
            <p className={styles.transferTitle}>{appt.transferTitle}</p>
            <p className={styles.transferBody}>{appt.transferBody}</p>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => navigate('/alerts')}
            >
              {appt.alertCta}
            </button>
          </div>
        </section>

        <section className={styles.card} aria-label={note.title}>
          <h3 className={styles.noteTitle}>{note.title}</h3>
          <p className={styles.noteBody}>{note.body}</p>
          <p className={styles.noteDisclaimer}>{note.disclaimer}</p>
          <button type="button" className={styles.btnSoft}>
            {note.editCta}
          </button>
        </section>
      </div>

      <section className={styles.historyCard} aria-label={historyTitle}>
        <h3 className={styles.historyTitle}>{historyTitle}</h3>
        <ul className={styles.historyList}>
          {history.map((row) => (
            <li key={row.id} className={styles.historyRow}>
              <span className={styles.historyDate}>{row.dateLabel}</span>
              <span className={styles.historyText}>{row.text}</span>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => {
                  if (row.action === 'plan') {
                    navigate(`/patients/${patientId}/plan`)
                  } else {
                    onOpenQuestionnaires()
                  }
                }}
              >
                {row.actionLabel}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
