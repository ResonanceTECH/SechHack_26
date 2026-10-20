import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom'
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCalendar,
  IconChat,
  IconDownload,
  IconPill,
  IconTrendChart,
} from '@/components/icons/NavIcons'
import { getPatientCard } from '@/data/mockPatientCard'
import { getPreVisitReport } from '@/data/mockPreVisitReport'
import type { DoctorOutletContext } from '@/layouts/DoctorLayout'
import type { AttentionIcon } from '@/types/doctor'
import styles from './PreVisitReportPage.module.css'

const attentionIcon: Record<AttentionIcon, typeof IconTrendChart> = {
  trend: IconTrendChart,
  alert: IconAlertTriangle,
  pill: IconPill,
  calendar: IconCalendar,
}

const priorityLabel = {
  mandatory: 'Обязательно',
  optional: 'Желательно',
} as const

export function PreVisitReportPage() {
  const { patientId = '' } = useParams()
  const { setBreadcrumbs } = useOutletContext<DoctorOutletContext>()
  const report = useMemo(() => getPreVisitReport(patientId), [patientId])
  const card = useMemo(() => getPatientCard(patientId), [patientId])
  const [notes, setNotes] = useState(report?.notes ?? '')

  useEffect(() => {
    if (!report) return
    const shortName = report.shortName
    setBreadcrumbs([
      { label: 'Пациенты', to: '/patients' },
      { label: shortName, to: `/patients/${patientId}` },
      { label: 'Отчёт перед визитом' },
    ])
    return () => setBreadcrumbs(null)
  }, [patientId, report, setBreadcrumbs])

  useEffect(() => {
    if (report) setNotes(report.notes)
  }, [report])

  if (!report) {
    return <Navigate to={patientId ? `/patients/${patientId}` : '/patients'} replace />
  }

  const displayName = card?.shortName ?? report.shortName

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.avatar} aria-hidden>
            {report.initials}
          </div>
          <div className={styles.headerInfo}>
            <h2 className={styles.title}>
              Отчёт перед визитом · {displayName}
            </h2>
            <p className={styles.subtitle}>
              {report.periodLabel} · {report.appointmentLabel} ·{' '}
              {report.generatedLabel}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Link to={`/patients/${patientId}`} className={styles.btnGhost}>
            <IconArrowLeft aria-hidden />
            К карточке
          </Link>
          <button type="button" className={styles.btnPrimary}>
            <IconDownload aria-hidden />
            Сформировать PDF
          </button>
        </div>
      </header>

      <section className={styles.metrics} aria-label="Ключевые показатели">
        {report.metrics.map((m) => (
          <article key={m.id} className={styles.metric}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>{m.label}</span>
              <span
                className={`${styles.metricBadge} ${styles[`badge_${m.badgeTone}`]}`}
              >
                {m.badge}
              </span>
            </div>
            <div className={styles.metricValue}>{m.value}</div>
            <div className={styles.metricFoot}>{m.footnote}</div>
          </article>
        ))}
      </section>

      <div className={styles.grid}>
        <div className={styles.colMain}>
          <section className={styles.attention}>
            <div className={styles.attentionHead}>
              <h3 className={styles.cardTitle}>На что обратить внимание</h3>
              <span className={styles.hintBadge}>
                Подсказка системы — не диагноз
              </span>
            </div>
            <ul className={styles.attentionList}>
              {report.attention.map((item) => {
                const Icon = attentionIcon[item.icon]
                return (
                  <li key={item.id} className={styles.attentionItem}>
                    <span
                      className={`${styles.attentionIcon} ${styles[`att_${item.icon}`]}`}
                      aria-hidden
                    >
                      <Icon />
                    </span>
                    <div className={styles.attentionBody}>
                      {item.meta ? (
                        <div className={styles.attentionMeta}>{item.meta}</div>
                      ) : null}
                      <div className={styles.attentionText}>{item.text}</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitle}>{report.sleep.title}</h3>
            <div className={styles.sleepStrip} aria-hidden>
              {report.sleep.days.map((day) => (
                <span
                  key={day.id}
                  className={`${styles.sleepCell} ${styles[`sleep_${day.tone}`]}`}
                />
              ))}
            </div>
            <ul className={styles.sleepLegend}>
              <li>
                <span className={`${styles.legDot} ${styles.sleep_ok}`} />
                нормально
              </li>
              <li>
                <span className={`${styles.legDot} ${styles.sleep_bad}`} />
                плохо
              </li>
              <li>
                <span className={`${styles.legDot} ${styles.sleep_hard}`} />
                трудно уснуть
              </li>
              <li>
                <span className={`${styles.legDot} ${styles.sleep_empty}`} />
                нет отметки
              </li>
            </ul>
          </section>
        </div>

        <div className={styles.colSide}>
          <section className={styles.card}>
            <div className={styles.sideHead}>
              <h3 className={styles.cardTitle}>Вопросы пациента</h3>
              <span className={styles.newBadge}>
                {report.questions.length} новых
              </span>
            </div>
            <ul className={styles.qList}>
              {report.questions.map((q) => (
                <li key={q.id} className={styles.qItem}>
                  <span className={styles.qIcon} aria-hidden>
                    <IconChat />
                  </span>
                  <span className={styles.qText}>{q.text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Алерты за период</h3>
            <ul className={styles.alertList}>
              {report.alerts.map((a) => (
                <li key={a.id} className={styles.alertItem}>
                  <span
                    className={`${styles.alertDot} ${
                      a.priority === 'mandatory'
                        ? styles.dotMandatory
                        : styles.dotOptional
                    }`}
                    aria-hidden
                  />
                  <div className={styles.alertBody}>
                    <div className={styles.alertTitle}>
                      <span
                        className={
                          a.priority === 'mandatory'
                            ? styles.prioMandatory
                            : styles.prioOptional
                        }
                      >
                        {priorityLabel[a.priority]}
                      </span>
                      {' · '}
                      {a.title}
                    </div>
                    <div className={styles.alertWhen}>{a.when}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Мои заметки к приёму</h3>
            <textarea
              className={styles.notes}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              aria-label="Заметки к приёму"
            />
          </section>
        </div>
      </div>
    </div>
  )
}
