import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  IconLock,
  IconMore,
  IconPencil,
  IconPill,
  IconPlus,
  IconSend,
  IconTick,
} from '@/components/icons/NavIcons'
import { get } from '@/lib/api'
import { getTreatmentPlan } from '@/data/mockTreatmentPlan'
import type { SafetyTone } from '@/types/doctor'
import styles from './TreatmentPlanPage.module.css'

interface CarePlanResponse {
  id: string
  patient_id: string
  title: string
  description: string | null
  status: string
  plan_payload: Record<string, unknown> | null
}

interface CarePlanListResponse {
  items: CarePlanResponse[]
  total: number
}

const safetyToneClass: Record<SafetyTone, string> = {
  critical: styles.safetyCritical,
  warning: styles.safetyWarning,
  caution: styles.safetyCaution,
}

export function TreatmentPlanPage() {
  const navigate = useNavigate()
  const { patientId = '' } = useParams()
  const [realPayload, setRealPayload] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!patientId) { setLoading(false); return }
    let cancelled = false
    get<CarePlanListResponse>(`/api/v1/care-plans?patient_id=${patientId}`)
      .then((data) => {
        if (cancelled) return
        const first = data.items?.[0]
        if (first?.plan_payload) setRealPayload(first.plan_payload)
      })
      .catch(() => { /* keep mock fallback */ })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [patientId])

  const plan = useMemo(() => {
    if (realPayload) return realPayload as any
    return getTreatmentPlan(patientId)
  }, [realPayload, patientId])

  const [consent, setConsent] = useState(false)

  useEffect(() => {
    setConsent((plan as any)?.consentDefault ?? false)
  }, [plan])

  if (loading) return <div className={styles.page}>Загрузка плана…</div>
  if (!plan) {
    return <Navigate to="/patients" replace />
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.avatar} aria-hidden>
            {plan.initials}
          </div>
          <div className={styles.headerInfo}>
            <h2 className={styles.title}>План лечения · {plan.shortName}</h2>
            <div className={styles.badges}>
              <span className={`${styles.badge} ${styles.badgeDraft}`}>
                {plan.draftLabel}
              </span>
              <span className={`${styles.badge} ${styles.badgeVersion}`}>
                {plan.versionLabel}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          className={styles.btnCancel}
          onClick={() => navigate(`/patients/${patientId}`)}
        >
          Отмена
        </button>
      </header>

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          <section className={styles.card} aria-label="Фармакотерапия">
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Фармакотерапия</h3>
              <span className={styles.contourBadge}>
                {plan.drug.contourLabel}
              </span>
            </div>

            <div className={styles.drugBlock}>
              <div className={styles.drugIcon} aria-hidden>
                <IconPill />
              </div>
              <div className={styles.drugBody}>
                <div className={styles.drugTitleRow}>
                  <p className={styles.drugTitle}>{plan.drug.title}</p>
                  <span className={styles.statusActive}>
                    <span className={styles.statusDot} aria-hidden />
                    {plan.drug.statusLabel}
                  </span>
                </div>
                <p className={styles.drugSchedule}>{plan.drug.schedule}</p>
              </div>
            </div>

            <div className={styles.fields}>
              {plan.drug.fields.map((field: any) => (
                <label key={field.id} className={styles.field}>
                  <span className={styles.fieldLabel}>{field.label}</span>
                  <span className={styles.fieldControl}>
                    <span className={styles.fieldValue}>{field.value}</span>
                    {field.lock === 'locked' ? (
                      <span className={styles.fieldIcon} aria-label="Заблокировано">
                        <IconLock aria-hidden />
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={styles.fieldEdit}
                        aria-label="Изменить"
                      >
                        <IconPencil aria-hidden />
                      </button>
                    )}
                  </span>
                </label>
              ))}
            </div>

            <div className={styles.validation}>
              <span className={styles.validationIcon} aria-hidden>
                <IconTick />
              </span>
              <p>{plan.drug.validationNote}</p>
            </div>
          </section>

          <section className={styles.card} aria-label="Упражнения и программа">
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Упражнения и программа</h3>
              <button type="button" className={styles.btnAdd}>
                <IconPlus aria-hidden />
                Добавить из библиотеки
              </button>
            </div>

            <ul className={styles.exerciseList}>
              {plan.exercises.map((item: any) => (
                <li key={item.id} className={styles.exerciseItem}>
                  <span
                    className={`${styles.exerciseDot} ${
                      item.status === 'new'
                        ? styles.exerciseDotNew
                        : styles.exerciseDotActive
                    }`}
                    aria-hidden
                  />
                  <span className={styles.exerciseTitle}>{item.title}</span>
                  <span
                    className={`${styles.exerciseStatus} ${
                      item.status === 'new'
                        ? styles.exerciseStatusNew
                        : styles.exerciseStatusActive
                    }`}
                  >
                    {item.statusLabel}
                  </span>
                  <button
                    type="button"
                    className={styles.moreBtn}
                    aria-label="Ещё"
                  >
                    <IconMore aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.card} aria-label="Рекомендации">
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Рекомендации</h3>
            </div>
            <ul className={styles.recoList}>
              {plan.recommendations.map((text: any) => (
                <li key={text} className={styles.recoItem}>
                  <span className={styles.recoBullet} aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className={styles.sideCol}>
          <section className={styles.sideCard} aria-label="Проверка безопасности">
            <h3 className={styles.sideTitle}>Проверка безопасности</h3>
            <div className={styles.safetyList}>
              {plan.safety.map((item: any) => (
                <article
                  key={item.id}
                  className={`${styles.safetyItem} ${safetyToneClass[item.tone as SafetyTone]}`}
                >
                  <div className={styles.safetyTop}>
                    <span className={styles.safetyPriority}>
                      {item.priorityLabel}
                    </span>
                  </div>
                  <p className={styles.safetyTitle}>{item.title}</p>
                  <div className={styles.safetyHistory}>
                    {item.historyOk ? (
                      <span className={styles.safetyCheck} aria-hidden>
                        <IconTick />
                      </span>
                    ) : null}
                    <span>{item.historyLabel}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.actionsCard}>
            <label className={styles.consent}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>Согласовано с пациентом на приёме</span>
            </label>
            <button type="button" className={styles.btnSave}>
              Сохранить план
            </button>
            <button type="button" className={styles.btnSend}>
              <IconSend aria-hidden />
              Отправить пациенту
            </button>
          </section>
        </aside>
      </div>
    </div>
  )
}
