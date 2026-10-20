import { useCallback, useMemo, useState } from 'react'
import { AuditEventModal } from '@/components/admin/AuditEventModal'
import { clinicAuditLog } from '@/data/mockAudit'
import type {
  AuditCategory,
  AuditEvent,
  AuditPeriod,
} from '@/types/admin'
import styles from './AuditPage.module.css'

const categories: Array<{ id: AuditCategory; label: string }> = [
  { id: 'all', label: 'Все события' },
  { id: 'access', label: 'Доступ и роли' },
  { id: 'settings', label: 'Настройки клиники' },
]

const periods: Array<{ id: AuditPeriod; label: string }> = [
  { id: 'today', label: 'Сегодня' },
  { id: '7d', label: '7 дней' },
]

const TODAY = '2026-10-18'

function resultLabel(event: AuditEvent): string {
  return event.result === 'success' ? 'Успешно' : event.result
}

export function AuditPage() {
  const [category, setCategory] = useState<AuditCategory>('all')
  const [period, setPeriod] = useState<AuditPeriod>('7d')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { subtitle, rangeLabel, footerNote, immutableNote, events } =
    clinicAuditLog

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (category !== 'all' && e.category !== category) return false
      if (period === 'today' && e.date !== TODAY) return false
      return true
    })
  }, [category, period, events])

  const selected = selectedId
    ? (events.find((e) => e.id === selectedId) ?? null)
    : null

  const closeModal = useCallback(() => setSelectedId(null), [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Журнал аудита</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <span className={styles.viewOnly}>
          <span className={styles.viewOnlyDot} aria-hidden />
          Только просмотр
        </span>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.filters} role="group" aria-label="Категория">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={
                category === c.id ? styles.filterActive : styles.filterBtn
              }
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

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
      </div>

      <section className={styles.card} aria-label="События клиники">
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>События клиники</h2>
          <span className={styles.cardRange}>{rangeLabel}</span>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colTime}>Время</th>
                <th className={styles.colInitiator}>Инициатор</th>
                <th className={styles.colAction}>Действие</th>
                <th className={styles.colObject}>Объект</th>
                <th className={styles.colResult}>Результат</th>
                <th className={styles.colView}>Просмотр</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td className={styles.time}>{row.timeLabel}</td>
                  <td className={styles.initiator}>{row.initiator}</td>
                  <td className={styles.action}>{row.action}</td>
                  <td className={styles.object}>{row.object}</td>
                  <td>
                    <span className={styles.success}>
                      <span className={styles.successDot} aria-hidden />
                      {resultLabel(row)}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.detailsBtn}
                      onClick={() => setSelectedId(row.id)}
                    >
                      Подробнее
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className={styles.footerNote}>{footerNote}</p>

      <AuditEventModal
        event={selected}
        immutableNote={immutableNote}
        onClose={closeModal}
      />
    </div>
  )
}
