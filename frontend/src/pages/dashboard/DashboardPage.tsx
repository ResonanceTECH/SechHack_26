import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InvitePatientButton } from '@/components/InvitePatientButton/InvitePatientButton'
import {
  IconAlerts,
  IconDashboard,
  IconFile,
  IconPatients,
} from '@/components/icons/NavIcons'
import {
  appointmentsToday,
  attentionItems,
  dashboardStats,
  doctorProfile,
} from '@/data/mockDoctor'
import type { AlertPriority, AppointmentStatus } from '@/types/doctor'
import styles from './DashboardPage.module.css'

type AttentionFilter = 'all' | AlertPriority

const statusLabel: Record<AppointmentStatus, string> = {
  report_ready: 'Отчёт готов',
  screening_done: 'Скрининг пройден',
  has_alert: 'Есть алерт',
  low_data: 'Мало данных',
}

const statusClass: Record<AppointmentStatus, string> = {
  report_ready: styles.statusReport,
  screening_done: styles.statusScreening,
  has_alert: styles.statusAlert,
  low_data: styles.statusLow,
}

const toneClass = {
  brand: styles.toneBrand,
  danger: styles.toneDanger,
  success: styles.toneSuccess,
  warning: styles.toneWarning,
} as const

const toneIcon = {
  brand: IconPatients,
  danger: IconAlerts,
  success: IconDashboard,
  warning: IconFile,
} as const

export function DashboardPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<AttentionFilter>('all')
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null)

  const filteredAttention = useMemo(() => {
    if (filter === 'all') return attentionItems
    return attentionItems.filter((item) => item.priority === filter)
  }, [filter])

  const selectedAppointment = useMemo(
    () =>
      appointmentsToday.find((appt) => appt.id === selectedAppointmentId) ??
      null,
    [selectedAppointmentId],
  )

  const counts = useMemo(
    () => ({
      all: attentionItems.length,
      mandatory: attentionItems.filter((i) => i.priority === 'mandatory')
        .length,
      optional: attentionItems.filter((i) => i.priority === 'optional').length,
    }),
    [],
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.greeting}>
            Добрый день, {doctorProfile.firstName}{' '}
            {doctorProfile.middleName}
          </h2>
          <p className={styles.summary}>
            3 обязательных алерта · 5 приёмов сегодня
          </p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => navigate('/reports')}
          >
            <IconFile aria-hidden />
            Отчёты перед визитами
          </button>
          <InvitePatientButton />
        </div>
      </div>

      <section className={styles.stats} aria-label="Ключевые показатели">
        {dashboardStats.map((stat) => {
          const Icon = toneIcon[stat.tone]
          return (
            <article key={stat.id} className={styles.statCard}>
              <div className={`${styles.statIcon} ${toneClass[stat.tone]}`}>
                <Icon width={16} height={16} aria-hidden />
              </div>
              <div className={styles.statTitle}>{stat.title}</div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statHint}>{stat.hint}</div>
            </article>
          )
        })}
      </section>

      <div className={styles.grid}>
        <section className={styles.panel} aria-label="Требуют внимания">
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Требуют внимания</h3>
            <div className={styles.tabs} role="tablist">
              {(
                [
                  ['all', `Все · ${counts.all}`],
                  ['mandatory', `Обязательно · ${counts.mandatory}`],
                  ['optional', `Желательно · ${counts.optional}`],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={filter === key}
                  className={filter === key ? styles.tabActive : styles.tab}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.list}>
            {filteredAttention.map((item) => (
              <article
                key={item.id}
                className={[
                  styles.attentionItem,
                  item.critical ? styles.attentionCritical : '',
                  item.priority === 'optional' ? styles.attentionOptional : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div
                  className={`${styles.rail} ${
                    item.priority === 'optional'
                      ? styles.railOptional
                      : styles.railMandatory
                  }`}
                  aria-hidden
                />
                <div className={styles.attentionBody}>
                  <div className={styles.attentionTop}>
                    <span className={styles.patientName}>
                      {item.patientName}
                    </span>
                    <span className={styles.patientMeta}>
                      {item.age} лет · {item.diagnosis}
                    </span>
                    <span
                      className={`${styles.chip} ${
                        item.priority === 'optional'
                          ? styles.chipOptional
                          : styles.chipMandatory
                      }`}
                    >
                      {item.priority === 'optional'
                        ? 'Желательно'
                        : 'Обязательно'}
                    </span>
                    {item.tags?.map((tag) => (
                      <span
                        key={tag}
                        className={`${styles.chip} ${styles.chipTag}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className={styles.attentionTitle}>{item.title}</div>
                  <div className={styles.attentionTime}>{item.meta}</div>
                </div>
                {item.critical ? (
                  <button type="button" className={styles.btnOpen}>
                    Открыть
                  </button>
                ) : (
                  <button type="button" className={styles.btnView}>
                    Посмотреть
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel} aria-label="Приёмы сегодня">
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Приёмы сегодня</h3>
          </div>
          <div className={styles.appointments} role="listbox" aria-label="Список приёмов">
            {appointmentsToday.map((appt) => {
              const selected = appt.id === selectedAppointmentId
              return (
                <button
                  key={appt.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`${styles.appointment}${
                    selected ? ` ${styles.appointmentSelected}` : ''
                  }`}
                  onClick={() =>
                    setSelectedAppointmentId((current) =>
                      current === appt.id ? null : appt.id,
                    )
                  }
                >
                  <div className={styles.time}>{appt.time}</div>
                  <div className={styles.apptInfo}>
                    <div className={styles.apptName}>{appt.patientName}</div>
                    <div className={styles.apptMeta}>
                      {appt.kind} · {appt.format}
                    </div>
                  </div>
                  <span
                    className={`${styles.status} ${statusClass[appt.status]}`}
                  >
                    {statusLabel[appt.status]}
                  </span>
                </button>
              )
            })}
          </div>
          {selectedAppointment ? (
            <button type="button" className={styles.reportCta}>
              Открыть отчёт {selectedAppointment.reportSurname}
            </button>
          ) : null}
        </section>
      </div>
    </div>
  )
}
