import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { preVisitReportsList } from '@/data/mockPreVisitReports'
import type { DoctorOutletContext } from '@/layouts/DoctorLayout'
import type {
  PreVisitListRange,
  ReportAttentionTone,
  ReportReadiness,
} from '@/types/doctor'
import styles from './PreVisitReportsPage.module.css'

const readinessClass: Record<ReportReadiness, string> = {
  ready: styles.readyOk,
  low_data: styles.readyLow,
}

const attentionClass: Record<ReportAttentionTone, string> = {
  danger: styles.attDanger,
  warning: styles.attWarn,
  plain: styles.attPlain,
  none: styles.attNone,
}

const TODAY = '2026-10-18'

export function PreVisitReportsPage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useOutletContext<DoctorOutletContext>()
  const [range, setRange] = useState<PreVisitListRange>('week')
  const data = preVisitReportsList

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Кабинет врача', to: '/' },
      { label: 'Отчёты перед визитами' },
    ])
    return () => setBreadcrumbs(null)
  }, [setBreadcrumbs])

  const rows = useMemo(() => {
    if (range === 'today') {
      return data.rows.filter((r) => r.visitDate === TODAY)
    }
    return data.rows
  }, [data.rows, range])

  const rangeLabel =
    range === 'today' ? data.todayRangeLabel : data.weekRangeLabel

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.title}>{data.title}</h2>
        <p className={styles.subtitle}>{data.subtitle}</p>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.segment} role="tablist" aria-label="Период">
          <button
            type="button"
            role="tab"
            aria-selected={range === 'today'}
            className={
              range === 'today' ? styles.segActive : styles.segBtn
            }
            onClick={() => setRange('today')}
          >
            Сегодня
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={range === 'week'}
            className={range === 'week' ? styles.segActive : styles.segBtn}
            onClick={() => setRange('week')}
          >
            7 дней
          </button>
        </div>
        <span className={styles.rangeMeta}>{rangeLabel}</span>
      </div>

      <section className={styles.card} aria-label="Список визитов">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Пациент</th>
                <th scope="col">Дата визита</th>
                <th scope="col">Готовность отчёта</th>
                <th scope="col">Требует внимания</th>
                <th scope="col">
                  <span className={styles.srOnly}>Действие</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className={styles.patientName}>{row.patientName}</div>
                    <div className={styles.patientKind}>{row.visitKind}</div>
                  </td>
                  <td className={styles.dateCell}>{row.visitAt}</td>
                  <td>
                    <span
                      className={`${styles.ready} ${readinessClass[row.readiness]}`}
                    >
                      <span className={styles.readyDot} aria-hidden />
                      {row.readinessLabel}
                    </span>
                  </td>
                  <td>
                    {row.attention.tone === 'none' ? (
                      <span className={styles.attNone}>—</span>
                    ) : row.attention.tone === 'plain' ? (
                      <span className={styles.attPlain}>
                        {row.attention.label}
                      </span>
                    ) : (
                      <span
                        className={`${styles.attChip} ${attentionClass[row.attention.tone]}`}
                      >
                        {row.attention.label}
                      </span>
                    )}
                  </td>
                  <td className={styles.actionCell}>
                    <button
                      type="button"
                      className={styles.openBtn}
                      onClick={() =>
                        navigate(`/patients/${row.patientId}/report`)
                      }
                    >
                      Открыть отчёт
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className={styles.footer}>{data.footer}</p>
    </div>
  )
}
