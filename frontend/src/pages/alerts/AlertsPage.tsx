import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import {
  IconCall,
  IconChat,
  IconTick,
  IconUser,
} from '@/components/icons/NavIcons'
import { alertDetails, alertQueue } from '@/data/mockAlerts'
import type { DoctorOutletContext } from '@/layouts/DoctorLayout'
import type {
  AlertQueueTab,
  AlertRiskLevel,
  AlertRoutingId,
} from '@/types/doctor'
import styles from './AlertsPage.module.css'

const alertsCrumb = { label: 'Алерты', to: '/alerts' }

const tabs: Array<{ id: AlertQueueTab; label: string }> = [
  { id: 'new', label: 'Новые' },
  { id: 'in_progress', label: 'В работе' },
  { id: 'closed', label: 'Закрытые' },
]

const riskOptions: Array<{ id: AlertRiskLevel; label: string }> = [
  { id: 'low', label: 'Низкий' },
  { id: 'medium', label: 'Средний' },
  { id: 'high', label: 'Высокий' },
]

const avatarClass: Record<string, string> = {
  rose: styles.avRose,
  amber: styles.avAmber,
  blue: styles.avBlue,
  green: styles.avGreen,
  violet: styles.avViolet,
  teal: styles.avTeal,
}

const valueToneClass: Record<string, string> = {
  danger: styles.valDanger,
  warning: styles.valWarning,
  brand: styles.valBrand,
  muted: styles.valMuted,
}

export function AlertsPage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useOutletContext<DoctorOutletContext>()
  const [tab, setTab] = useState<AlertQueueTab>('new')
  const [selectedId, setSelectedId] = useState(alertQueue[0]?.id ?? '')

  const selected = useMemo(
    () => alertQueue.find((a) => a.id === selectedId) ?? null,
    [selectedId],
  )

  const detail = selected ? (alertDetails[selected.id] ?? null) : null

  const [risk, setRisk] = useState<AlertRiskLevel>('medium')
  const [routing, setRouting] = useState<AlertRoutingId>('earlier_visit')
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!detail) return
    setRisk(detail.riskDefault)
    setRouting(detail.routingDefault)
    setComment(detail.commentDefault)
  }, [detail])

  useEffect(() => {
    if (selected) {
      setBreadcrumbs([alertsCrumb, { label: selected.patientFullName }])
    } else {
      setBreadcrumbs([alertsCrumb])
    }
    return () => setBreadcrumbs(null)
  }, [selected, setBreadcrumbs])

  const filtered = useMemo(
    () => alertQueue.filter((item) => item.tab === tab),
    [tab],
  )

  const newCount = useMemo(
    () => alertQueue.filter((i) => i.tab === 'new').length,
    [],
  )

  return (
    <div className={styles.page}>
      <aside className={styles.queue} aria-label="Очередь алертов">
        <div className={styles.queueHead}>
          <h2 className={styles.queueTitle}>Очередь</h2>
          <span className={styles.queueCount}>{newCount} новых</span>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Статус очереди">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? styles.tabActive : styles.tab}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <ul className={styles.list}>
          {filtered.map((item) => {
            const isActive = item.id === selectedId
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`${styles.card}${isActive ? ` ${styles.cardActive}` : ''}${
                    isActive && item.selectedTone === 'critical'
                      ? ` ${styles.cardCritical}`
                      : ''
                  }`}
                  onClick={() => {
                    if (item.detailRoute) {
                      navigate(item.detailRoute)
                      return
                    }
                    setSelectedId(item.id)
                  }}
                >
                  <div
                    className={`${styles.avatar} ${avatarClass[item.avatarTone]}`}
                    aria-hidden
                  >
                    {item.initials}
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <span className={styles.cardName}>
                        {item.patientShortName}
                      </span>
                      <span className={styles.cardTime}>{item.timeLabel}</span>
                    </div>
                    <p className={styles.cardSummary}>{item.summary}</p>
                    <span
                      className={
                        item.priority === 'mandatory'
                          ? styles.badgeMandatory
                          : styles.badgeOptional
                      }
                    >
                      <span className={styles.badgeDot} aria-hidden />
                      {item.priority === 'mandatory'
                        ? 'Обязательно'
                        : 'Желательно'}
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
          {filtered.length === 0 ? (
            <li className={styles.empty}>Нет алертов в этой вкладке</li>
          ) : null}
        </ul>
      </aside>

      {selected && detail ? (
        <section className={styles.workspace} aria-label="Карточка алерта">
          <header className={styles.alertHead}>
            <div className={styles.alertHeadMain}>
              <div className={styles.chips}>
                <span
                  className={
                    detail.priority === 'mandatory'
                      ? styles.badgeMandatory
                      : styles.badgeOptional
                  }
                >
                  <span className={styles.badgeDot} aria-hidden />
                  {detail.priority === 'mandatory'
                    ? 'Обязательно'
                    : 'Желательно'}
                </span>
                <span className={styles.statusChip}>{detail.statusChip}</span>
              </div>
              <h3 className={styles.alertTitle}>{detail.title}</h3>
              <p className={styles.alertMeta}>{detail.meta}</p>
            </div>
            <button
              type="button"
              className={styles.patientBtn}
              onClick={() =>
                navigate(`/patients/${selected.patientId}`)
              }
            >
              <IconUser aria-hidden />
              Карточка пациента
            </button>
          </header>

          <div className={styles.workspaceBody}>
            <div className={styles.leftCol}>
              <article className={styles.panel}>
                <h4 className={styles.panelTitle}>Данные, вызвавшие алерт</h4>
                <ul className={styles.dataList}>
                  {detail.dataRows.map((row) => (
                    <li key={row.id} className={styles.dataRow}>
                      <span className={styles.dataLabel}>{row.label}</span>
                      <span
                        className={`${styles.dataValue}${
                          row.valueTone
                            ? ` ${valueToneClass[row.valueTone]}`
                            : ''
                        }`}
                      >
                        {row.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className={styles.panel}>
                <h4 className={styles.panelTitle}>Что уже сделала система</h4>
                <ol className={styles.timeline}>
                  {detail.timeline.map((step, i) => (
                    <li
                      key={step.id}
                      className={`${styles.tlItem}${
                        step.tone === 'pending' ? ` ${styles.tlPending}` : ''
                      }`}
                    >
                      <span
                        className={
                          step.tone === 'pending' ? styles.tlDotWarn : styles.tlDot
                        }
                        aria-hidden
                      />
                      {i < detail.timeline.length - 1 ? (
                        <span className={styles.tlLine} aria-hidden />
                      ) : null}
                      <div className={styles.tlBody}>
                        {step.time ? (
                          <span className={styles.tlTime}>{step.time}</span>
                        ) : null}
                        <span className={styles.tlText}>{step.text}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            </div>

            <aside className={styles.actions} aria-label="Действия врача">
              <h4 className={styles.panelTitle}>Действия врача</h4>

              <div className={styles.step}>
                <div className={styles.stepLabel}>
                  <span className={styles.stepNum}>1</span>
                  Связаться с пациентом
                </div>
                <div className={styles.contactRow}>
                  <button type="button" className={styles.btnPrimary}>
                    <IconCall aria-hidden />
                    Позвонить
                  </button>
                  <button
                    type="button"
                    className={styles.btnGhost}
                    onClick={() =>
                      navigate(`/patients/${selected.patientId}/messages`)
                    }
                  >
                    <IconChat aria-hidden />
                    Написать
                  </button>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepLabel}>
                  <span className={styles.stepNum}>2</span>
                  Оценка риска
                </div>
                <div
                  className={styles.segment}
                  role="radiogroup"
                  aria-label="Оценка риска"
                >
                  {riskOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={risk === opt.id}
                      className={
                        risk === opt.id ? styles.segActive : styles.seg
                      }
                      onClick={() => setRisk(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepLabel}>
                  <span className={styles.stepNum}>3</span>
                  Маршрутизация
                </div>
                <div
                  className={styles.routing}
                  role="radiogroup"
                  aria-label="Маршрутизация"
                >
                  {detail.routing.map((opt) => {
                    const active = routing === opt.id
                    return (
                      <label
                        key={opt.id}
                        className={
                          active ? styles.routeActive : styles.route
                        }
                      >
                        <input
                          type="radio"
                          name="routing"
                          value={opt.id}
                          checked={active}
                          onChange={() => setRouting(opt.id)}
                          className={styles.routeInput}
                        />
                        <span
                          className={
                            active ? styles.radioOn : styles.radioOff
                          }
                          aria-hidden
                        />
                        <span className={styles.routeText}>
                          <span className={styles.routeTitle}>{opt.title}</span>
                          {opt.subtitle ? (
                            <span className={styles.routeSub}>
                              {opt.subtitle}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className={styles.step}>
                <label className={styles.commentLabel} htmlFor="alert-comment">
                  Комментарий
                </label>
                <textarea
                  id="alert-comment"
                  className={styles.comment}
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Кратко зафиксируйте контакт и решение…"
                />
              </div>

              <div className={styles.footerActions}>
                <button type="button" className={styles.btnSoft}>
                  Принять в работу
                </button>
                <button type="button" className={styles.btnSolid}>
                  <IconTick aria-hidden />
                  Закрыть с решением
                </button>
              </div>
            </aside>
          </div>
        </section>
      ) : (
        <div className={styles.placeholder}>Выберите алерт из очереди</div>
      )}
    </div>
  )
}
