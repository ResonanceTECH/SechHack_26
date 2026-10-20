import { useState } from 'react'
import { IconDownload } from '@/components/icons/NavIcons'
import { clinicAnalytics } from '@/data/mockAnalytics'
import type {
  AlertPriorityTone,
  AnalyticsPeriod,
  KpiBarTone,
  KpiDeltaTone,
} from '@/types/admin'
import styles from './AnalyticsPage.module.css'

const periods: Array<{ id: AnalyticsPeriod; label: string }> = [
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'quarter', label: 'Квартал' },
]

const deltaClass: Record<KpiDeltaTone, string> = {
  up: styles.deltaUp,
  down: styles.deltaDown,
  warn: styles.deltaWarn,
}

const barClass: Record<KpiBarTone, string> = {
  brand: styles.barBrand,
  warning: styles.barWarning,
}

const priorityClass: Record<AlertPriorityTone, string> = {
  mandatory: styles.tagMandatory,
  optional: styles.tagOptional,
  rx: styles.tagRx,
}

const { subtitle, kpis, activity, activityMax, alerts } = clinicAnalytics

export function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('month')

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Аналитика клиники</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.period} role="group" aria-label="Период">
            {periods.map((p) => (
              <button
                key={p.id}
                type="button"
                className={
                  period === p.id ? styles.periodActive : styles.periodBtn
                }
                onClick={() => setPeriod(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button type="button" className={styles.btnCsv}>
            <IconDownload aria-hidden />
            CSV
          </button>
          <button type="button" className={styles.btnPdf}>
            <IconDownload aria-hidden />
            PDF для руководства
          </button>
        </div>
      </header>

      <section className={styles.kpiGrid} aria-label="Ключевые показатели">
        {kpis.map((kpi) => (
          <article key={kpi.id} className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <h2 className={styles.kpiTitle}>{kpi.title}</h2>
              <span className={`${styles.delta} ${deltaClass[kpi.deltaTone]}`}>
                {kpi.delta}
              </span>
            </div>
            <div className={styles.kpiValue}>{kpi.value}</div>
            <div className={styles.progressTrack} aria-hidden>
              <div
                className={`${styles.progressFill} ${barClass[kpi.barTone]}`}
                style={{ width: `${kpi.progress}%` }}
              />
            </div>
            <p className={styles.kpiHint}>{kpi.hint}</p>
          </article>
        ))}
      </section>

      <div className={styles.bottom}>
        <section className={styles.chartCard} aria-label="Активность по неделям">
          <div className={styles.chartHead}>
            <h2 className={styles.cardTitle}>Активность по неделям</h2>
            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={`${styles.legendSwatch} ${styles.swatchPatients}`} />
                Активные пациенты
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.legendSwatch} ${styles.swatchDoctors}`} />
                Активные врачи ×5
              </span>
            </div>
          </div>

          <div className={styles.chart}>
            <div className={styles.yAxis} aria-hidden>
              <span>{activityMax}</span>
              <span>{Math.round(activityMax / 2)}</span>
              <span>0</span>
            </div>
            <div className={styles.chartPlot}>
              <div className={styles.gridLines} aria-hidden>
                <span />
                <span />
                <span />
              </div>
              <div className={styles.bars}>
                {activity.map((w) => (
                  <div key={w.id} className={styles.barGroup}>
                    <div className={styles.barPair}>
                      <div
                        className={`${styles.bar} ${styles.barPatients}`}
                        style={{
                          height: `${(w.patients / activityMax) * 100}%`,
                        }}
                        title={`Пациенты: ${w.patients}`}
                      />
                      <div
                        className={`${styles.bar} ${styles.barDoctors}`}
                        style={{
                          height: `${((w.doctors * 5) / activityMax) * 100}%`,
                        }}
                        title={`Врачи ×5: ${w.doctors * 5}`}
                      />
                    </div>
                    <span className={styles.barLabel}>{w.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.alertsCard} aria-label="Алерты за месяц">
          <h2 className={styles.cardTitle}>Алерты за месяц</h2>
          <table className={styles.alertsTable}>
            <thead>
              <tr>
                <th>Тип</th>
                <th className={styles.colCount}>Кол-во</th>
                <th className={styles.colReaction}>Реакция</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className={styles.alertType}>
                      <span className={styles.alertName}>{row.type}</span>
                      <span
                        className={`${styles.tag} ${priorityClass[row.priorityTone]}`}
                      >
                        {row.priorityLabel}
                      </span>
                    </div>
                  </td>
                  <td className={styles.colCount}>{row.count}</td>
                  <td className={styles.colReaction}>{row.reaction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
