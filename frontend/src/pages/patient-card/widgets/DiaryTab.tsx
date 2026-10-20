import { useNavigate } from 'react-router-dom'
import type { PatientDiaryTab } from '@/types/doctor'
import { DiaryChart } from './DiaryChart'
import styles from './DiaryTab.module.css'

interface DiaryTabProps {
  data: PatientDiaryTab
  patientId: string
}

export function DiaryTab({ data, patientId }: DiaryTabProps) {
  const navigate = useNavigate()

  return (
    <div className={styles.root}>
      <div className={styles.left}>
        <section className={styles.card}>
          <div className={styles.chartHead}>
            <h3 className={styles.cardTitle}>{data.chartTitle}</h3>
            <ul className={styles.legend} aria-label="Легенда">
              <li>
                <span className={`${styles.legendDot} ${styles.legMood}`} />
                Настроение
              </li>
              <li>
                <span className={`${styles.legendDot} ${styles.legAnxiety}`} />
                Тревога
              </li>
              <li>
                <span className={`${styles.legendDot} ${styles.legSleep}`} />
                Сон (плохо)
              </li>
            </ul>
          </div>
          <DiaryChart points={data.points} variant="diary" />
          <p className={styles.footnote}>{data.chartFootnote}</p>
        </section>

        <section className={styles.card}>
          <div className={styles.lastHead}>
            <h3 className={styles.cardTitle}>{data.lastEntry.title}</h3>
            <span className={styles.sourceBadge}>
              {data.lastEntry.sourceBadge}
            </span>
          </div>
          <ul className={styles.metrics}>
            {data.lastEntry.metrics.map((m) => (
              <li key={m.id} className={styles.metric}>
                <span className={styles.metricLabel}>{m.label}</span>
                <span className={styles.metricValue}>{m.value}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className={styles.right}>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>{data.fill.title}</h3>
          <p className={styles.fillPercent}>{data.fill.percent}</p>
          <p className={styles.fillDetail}>{data.fill.detail}</p>
          <p className={styles.fillNote}>{data.fill.weekNote}</p>
        </section>

        <aside className={styles.messageCard}>
          <span className={styles.messageStatus}>
            {data.message.statusLabel}
          </span>
          <h3 className={styles.messageTitle}>{data.message.title}</h3>
          <p className={styles.messageBody}>{data.message.body}</p>
          <button
            type="button"
            className={styles.messageCta}
            onClick={() => navigate(`/patients/${patientId}/messages`)}
          >
            {data.message.cta}
          </button>
        </aside>
      </div>
    </div>
  )
}
