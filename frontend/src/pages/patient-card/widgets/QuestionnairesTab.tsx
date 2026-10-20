import type { PatientQuestionnairesTab } from '@/types/doctor'
import styles from './QuestionnairesTab.module.css'

interface QuestionnairesTabProps {
  data: PatientQuestionnairesTab
}

export function QuestionnairesTab({ data }: QuestionnairesTabProps) {
  return (
    <div className={styles.root}>
      <div className={styles.summaryRow}>
        {data.summary.map((card) => (
          <section key={card.id} className={styles.summaryCard}>
            <p className={styles.summaryLabel}>{card.label}</p>
            <p className={styles.summaryValue}>{card.value}</p>
            <p className={styles.summaryFoot}>{card.footnote}</p>
          </section>
        ))}
      </div>

      <section className={styles.history} aria-label={data.historyTitle}>
        <header className={styles.historyHead}>
          <h3 className={styles.historyTitle}>{data.historyTitle}</h3>
          <p className={styles.historyHint}>{data.historyHint}</p>
        </header>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Дата</th>
                <th scope="col">PHQ-9</th>
                <th scope="col">GAD-7</th>
                <th scope="col">Вопрос 9 PHQ-9</th>
                <th scope="col">
                  <span className={styles.srOnly}>Действия</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.history.map((row) => (
                <tr key={row.id}>
                  <td className={styles.dateCell}>{row.dateLabel}</td>
                  <td className={styles.scoreCell}>{row.phq9}</td>
                  <td className={styles.scoreCell}>{row.gad7}</td>
                  <td
                    className={
                      row.q9Danger ? styles.q9Danger : styles.q9Normal
                    }
                  >
                    {row.q9Label}
                  </td>
                  <td className={styles.actionCell}>
                    <button type="button" className={styles.openBtn}>
                      Открыть
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
