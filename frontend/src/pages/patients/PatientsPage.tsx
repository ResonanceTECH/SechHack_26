import { useMemo, useState } from 'react'
import { InvitePatientButton } from '@/components/InvitePatientButton/InvitePatientButton'
import {
  IconFilter,
  IconTrendDown,
  IconTrendSame,
  IconTrendUp,
} from '@/components/icons/NavIcons'
import {
  patientFilterCounts,
  patients,
  patientsMeta,
} from '@/data/mockPatients'
import type {
  PatientRow,
  PatientStatus,
  PatientsFilter,
  ScoreMetric,
  ScoreTrend,
} from '@/types/doctor'
import styles from './PatientsPage.module.css'

const statusLabel: Record<PatientStatus, string> = {
  critical: 'Критично',
  attention: 'Внимание',
  new: 'Новый',
  stable: 'Стабильно',
}

const filters: Array<{ id: PatientsFilter; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'critical', label: 'Критично' },
  { id: 'attention', label: 'Требуют внимания' },
  { id: 'stable', label: 'Стабильно' },
  { id: 'aviandr', label: 'Принимают Авиандр' },
]

const trendIcon: Record<ScoreTrend, typeof IconTrendUp> = {
  up: IconTrendUp,
  down: IconTrendDown,
  same: IconTrendSame,
}

const trendWord: Record<ScoreTrend, string> = {
  up: 'с',
  down: 'с',
  same: '',
}

function matchesFilter(patient: PatientRow, filter: PatientsFilter): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'critical':
      return patient.status === 'critical'
    case 'attention':
      return patient.status === 'attention'
    case 'stable':
      return patient.status === 'stable'
    case 'aviandr':
      return patient.aviandrPercent != null
  }
}

function ScoreCell({ metric }: { metric: ScoreMetric }) {
  const Trend = trendIcon[metric.trend]
  const isSame = metric.trend === 'same'

  return (
    <div className={styles.score}>
      <span className={styles.scoreValue}>{metric.value}</span>
      <span
        className={`${styles.scoreDelta} ${
          metric.trend === 'up'
            ? styles.deltaUp
            : metric.trend === 'down'
              ? styles.deltaDown
              : styles.deltaSame
        }`}
      >
        <Trend aria-hidden />
        {isSame ? metric.previous : `${trendWord[metric.trend]} ${metric.previous}`}
      </span>
    </div>
  )
}

function diaryBarClass(percent: number): string {
  if (percent < 50) return styles.barWarn
  if (percent < 75) return styles.barMid
  return styles.barOk
}

function aviandrDotClass(percent: number): string {
  if (percent < 70) return styles.dotWarn
  if (percent < 85) return styles.dotMid
  return styles.dotOk
}

export function PatientsPage() {
  const [filter, setFilter] = useState<PatientsFilter>('all')

  const rows = useMemo(
    () => patients.filter((p) => matchesFilter(p, filter)),
    [filter],
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Мои пациенты</h2>
          <p className={styles.subtitle}>
            {patientsMeta.activeCount} активных · данные обновлены{' '}
            {patientsMeta.updatedAgo}
          </p>
        </div>
        <InvitePatientButton />
      </div>

      <div className={styles.toolbar}>
        <div className={styles.chips} role="tablist" aria-label="Фильтр статуса">
          {filters.map((item) => {
            const active = filter === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={active ? styles.chipActive : styles.chip}
                onClick={() => setFilter(item.id)}
              >
                {item.label} · {patientFilterCounts[item.id]}
              </button>
            )
          })}
        </div>
        <button type="button" className={styles.filtersBtn}>
          <IconFilter aria-hidden />
          Фильтры
        </button>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Пациент</th>
              <th>Статус</th>
              <th>PHQ-9</th>
              <th>GAD-7</th>
              <th>Дневник за 14 дней</th>
              <th>Авиандр</th>
              <th>Следующий приём</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((patient) => (
              <tr
                key={patient.id}
                className={
                  patient.status === 'critical' ? styles.rowCritical : undefined
                }
              >
                <td>
                  <div className={styles.patient}>
                    <span
                      className={`${styles.avatar} ${styles[patient.avatarTone]}`}
                      aria-hidden
                    >
                      {patient.initials}
                    </span>
                    <div className={styles.patientMeta}>
                      <div className={styles.patientName}>{patient.name}</div>
                      <div className={styles.patientSub}>
                        {patient.age} · {patient.diagnosis}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={`${styles.status} ${styles[`status_${patient.status}`]}`}
                  >
                    <span className={styles.statusDot} aria-hidden />
                    {statusLabel[patient.status]}
                  </span>
                </td>
                <td>
                  <ScoreCell metric={patient.phq9} />
                </td>
                <td>
                  <ScoreCell metric={patient.gad7} />
                </td>
                <td>
                  <div className={styles.diary}>
                    <div className={styles.diaryTrack}>
                      <div
                        className={`${styles.diaryFill} ${diaryBarClass(patient.diaryPercent)}`}
                        style={{ width: `${patient.diaryPercent}%` }}
                      />
                    </div>
                    <span className={styles.diaryValue}>
                      {patient.diaryPercent}%
                    </span>
                  </div>
                </td>
                <td>
                  {patient.aviandrPercent == null ? (
                    <span className={styles.empty}>—</span>
                  ) : (
                    <span className={styles.aviandr}>
                      <span
                        className={`${styles.aviandrDot} ${aviandrDotClass(patient.aviandrPercent)}`}
                        aria-hidden
                      />
                      {patient.aviandrPercent}%
                    </span>
                  )}
                </td>
                <td>
                  <span className={styles.nextVisit}>{patient.nextVisit}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
