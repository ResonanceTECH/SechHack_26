import { useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { get } from '@/lib/api'
import type { DoctorOutletContext } from '@/layouts/DoctorLayout'
import type { PreVisitSummaryReport } from '@/types/doctor'
import styles from './PreVisitReportPage.module.css'

interface BackendPreVisitReport {
  patient: { id: string; first_name: string; last_name: string; middle_name?: string | null }
  diagnoses: Array<{ code?: string; title?: string; status?: string }>
  care_plans: Array<{ title?: string; status?: string }>
  appointments: Array<{ scheduled_at?: string | null; status?: string; reason?: string | null }>
  recent_screenings: Array<{ questionnaire_type?: string; score?: number | null; severity?: string | null }>
  diary_summary: { entries?: number; avg_mood?: number | null; avg_anxiety?: number | null; avg_energy?: number | null; avg_sleep_hours?: number | null }
}

function toShortName(p: BackendPreVisitReport['patient']): string {
  const last = p.last_name ?? ''
  const first = p.first_name ? p.first_name.charAt(0) + '.' : ''
  const middle = p.middle_name ? p.middle_name.charAt(0) + '.' : ''
  return `${last} ${first}${middle}`.trim()
}

function buildSummary(patientId: string, raw: BackendPreVisitReport): PreVisitSummaryReport {
  const d = raw.diary_summary ?? {}
  const metrics: PreVisitSummaryReport['metrics'] = [
    { id: 'diary-entries', label: 'Записей дневника (14 дн.)', value: String(d.entries ?? 0), footnote: 'Реальные данные пациента' },
    { id: 'mood', label: 'Среднее настроение', value: d.avg_mood != null ? d.avg_mood.toFixed(1) : '—', footnote: 'шкала 1–10' },
    { id: 'anxiety', label: 'Средняя тревога', value: d.avg_anxiety != null ? d.avg_anxiety.toFixed(1) : '—', footnote: 'шкала 1–10' },
    { id: 'sleep', label: 'Средний сон (ч)', value: d.avg_sleep_hours != null ? d.avg_sleep_hours.toFixed(1) : '—', footnote: 'за 14 дней' },
    { id: 'screenings', label: 'Скринингов', value: String(raw.recent_screenings?.length ?? 0), footnote: 'последние 10' },
    { id: 'diagnoses', label: 'Диагнозов', value: String(raw.diagnoses?.length ?? 0), footnote: 'в карточке' },
  ]
  const lastAppt = raw.appointments?.[0]
  const visitLine = lastAppt?.scheduled_at
    ? `Визит: ${new Date(lastAppt.scheduled_at).toLocaleString('ru-RU')}`
    : 'Визит не запланирован'
  return {
    layout: 'summary',
    patientId,
    shortName: toShortName(raw.patient),
    visitLine,
    statusLabel: 'Отчёт сформирован по реальным данным',
    metrics,
    considerTitle: 'Что учесть перед визитом',
    considerBody: raw.diagnoses?.length
      ? `Основные диагнозы: ${raw.diagnoses.slice(0, 3).map((x) => x.code || x.title).filter(Boolean).join(', ')}.`
      : 'Диагнозы не заведены. Рекомендуется уточнить клиническую картину.',
    dataFooter: `Источники: дневник, скрининги, диагнозы, планы лечения, записи на приём. Планов лечения: ${raw.care_plans?.length ?? 0}.`,
  }
}

function SummaryReportView({ report }: { report: PreVisitSummaryReport }) {
  return (
    <div className={styles.page}>
      <div className={styles.summaryTop}>
        <Link to="/reports" className={styles.backBtn}>{'<-'} К списку отчётов</Link>
      </div>
      <header className={styles.summaryHeader}>
        <h2 className={styles.summaryTitle}>Отчёт перед визитом</h2>
        <p className={styles.summaryName}>{report.shortName}</p>
        <p className={styles.summaryVisit}>{report.visitLine}</p>
        <p className={styles.summaryStatus}>{report.statusLabel}</p>
      </header>
      <section className={styles.summaryMetrics} aria-label="Показатели">
        {report.metrics.map((m) => (
          <article key={m.id} className={styles.summaryMetric}>
            <span className={styles.summaryMetricLabel}>{m.label}</span>
            <span className={styles.summaryMetricValue}>{m.value}</span>
            <span className={styles.summaryMetricFoot}>{m.footnote}</span>
          </article>
        ))}
      </section>
      <section className={styles.considerCard} aria-label={report.considerTitle}>
        <h3 className={styles.considerTitle}>{report.considerTitle}</h3>
        <p className={styles.considerBody}>{report.considerBody}</p>
        <p className={styles.considerFoot}>{report.dataFooter}</p>
      </section>
    </div>
  )
}

export function PreVisitReportPage() {
  const { patientId = '' } = useParams()
  const { setBreadcrumbs } = useOutletContext<DoctorOutletContext>()
  const [report, setReport] = useState<PreVisitSummaryReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!patientId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    get<BackendPreVisitReport>(`/api/v1/reports/pre-visit/${patientId}`)
      .then((data) => { if (!cancelled) setReport(buildSummary(patientId, data)) })
      .catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Не удалось загрузить отчёт') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [patientId])

  useEffect(() => {
    if (!report) return
    setBreadcrumbs([{ label: 'Отчёты перед визитами', to: '/reports' }, { label: report.shortName }])
    return () => setBreadcrumbs(null)
  }, [report, setBreadcrumbs])

  if (loading) return <div className={styles.page}>Загрузка отчёта…</div>
  if (error || !report) {
    return (
      <div className={styles.page}>
        <p>{error ?? 'Отчёт недоступен'}</p>
        <Link to={patientId ? `/patients/${patientId}` : '/reports'}>Вернуться</Link>
      </div>
    )
  }
  return <SummaryReportView report={report} />
}
