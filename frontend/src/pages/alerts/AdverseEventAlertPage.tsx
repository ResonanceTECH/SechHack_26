import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import {
  IconCall,
  IconChat,
  IconTick,
  IconUser,
} from '@/components/icons/NavIcons'
import { adverseEventAlert } from '@/data/mockAlerts'
import type { DoctorOutletContext } from '@/layouts/DoctorLayout'
import type { TherapyActionId } from '@/types/doctor'
import styles from './AdverseEventAlertPage.module.css'

const chipClass: Record<string, string> = {
  danger: styles.chipDanger,
  violet: styles.chipViolet,
  muted: styles.chipMuted,
}

const symptomClass: Record<string, string> = {
  rash: styles.tagRash,
  itch: styles.tagItch,
  drowsy: styles.tagDrowsy,
}

const adverseById: Record<string, typeof adverseEventAlert> = {
  [adverseEventAlert.id]: adverseEventAlert,
  'ae-mironova': adverseEventAlert,
}

export function AdverseEventAlertPage() {
  const { alertId = '' } = useParams()
  const navigate = useNavigate()
  const { setBreadcrumbs } = useOutletContext<DoctorOutletContext>()
  const alert = adverseById[alertId]

  const [therapy, setTherapy] = useState<TherapyActionId>(
    adverseEventAlert.therapyDefault,
  )
  const [registerAe, setRegisterAe] = useState(adverseEventAlert.registerDefault)

  useEffect(() => {
    if (!alert) return
    setTherapy(alert.therapyDefault)
    setRegisterAe(alert.registerDefault)
  }, [alert])

  useEffect(() => {
    if (!alert) return
    setBreadcrumbs([
      { label: 'Алерты', to: '/alerts' },
      { label: alert.patientFullName, to: `/patients/${alert.patientId}` },
      { label: alert.crumbKind },
    ])
    return () => setBreadcrumbs(null)
  }, [alert, setBreadcrumbs])

  if (!alert) {
    return <Navigate to="/alerts" replace />
  }

  return (
    <div className={styles.page}>
      <header className={styles.banner}>
        <div className={styles.bannerMain}>
          <div className={styles.chips}>
            {alert.chips.map((chip) => (
              <span
                key={chip.id}
                className={`${styles.chip} ${chipClass[chip.tone]}`}
              >
                <span className={styles.chipDot} aria-hidden />
                {chip.label}
              </span>
            ))}
          </div>
          <h2 className={styles.bannerTitle}>{alert.title}</h2>
          <p className={styles.bannerSub}>{alert.subtitle}</p>
        </div>
        <button
          type="button"
          className={styles.patientBtn}
          onClick={() => navigate(`/patients/${alert.patientId}`)}
        >
          <IconUser aria-hidden />
          Карточка пациента
        </button>
      </header>

      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <article className={styles.card}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Что сообщил пациент</h3>
              <span className={styles.sourceMeta}>{alert.report.sourceLabel}</span>
            </div>

            <div className={styles.reportBody}>
              <div className={styles.photo} aria-hidden />
              <div className={styles.reportMeta}>
                <div className={styles.symptoms}>
                  {alert.report.symptoms.map((tag) => (
                    <span
                      key={tag.id}
                      className={`${styles.symptom} ${symptomClass[tag.tone]}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
                <dl className={styles.fields}>
                  {alert.report.fields.map((field) => (
                    <div key={field.id} className={styles.fieldRow}>
                      <dt>{field.label}</dt>
                      <dd className={field.italic ? styles.fieldItalic : undefined}>
                        {field.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </article>

          <article className={styles.card}>
            <h3 className={styles.cardTitle}>На чём основана оценка системы</h3>
            <ul className={styles.evidence}>
              {alert.evidence.map((item) => (
                <li key={item.id} className={styles.evidenceItem}>
                  <span className={styles.evidenceTag}>{item.tag}</span>
                  <span className={styles.evidenceText}>{item.text}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <aside className={styles.decision} aria-label="Решение врача">
          <h3 className={styles.cardTitle}>Решение врача</h3>

          <div className={styles.suggest}>{alert.suggestion}</div>

          <div className={styles.contactRow}>
            <button type="button" className={styles.btnCall}>
              <IconCall aria-hidden />
              Позвонить
            </button>
            <button
              type="button"
              className={styles.btnChat}
              onClick={() => navigate(`/patients/${alert.patientId}/messages`)}
            >
              <IconChat aria-hidden />
              Ответить в чате
            </button>
          </div>

          <div className={styles.therapyBlock}>
            <div className={styles.therapyLabel}>Действие с терапией</div>
            <div
              className={styles.therapyList}
              role="radiogroup"
              aria-label="Действие с терапией"
            >
              {alert.therapyOptions.map((opt) => {
                const active = therapy === opt.id
                return (
                  <label
                    key={opt.id}
                    className={active ? styles.therapyActive : styles.therapy}
                  >
                    <input
                      type="radio"
                      name="therapy"
                      value={opt.id}
                      checked={active}
                      onChange={() => setTherapy(opt.id)}
                      className={styles.radioInput}
                    />
                    <span
                      className={active ? styles.radioOn : styles.radioOff}
                      aria-hidden
                    />
                    <span className={styles.therapyText}>
                      <span className={styles.therapyTitle}>{opt.title}</span>
                      {opt.subtitle ? (
                        <span className={styles.therapySub}>{opt.subtitle}</span>
                      ) : null}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          <label className={styles.checkRow}>
            <input
              type="checkbox"
              checked={registerAe}
              onChange={(e) => setRegisterAe(e.target.checked)}
              className={styles.checkInput}
            />
            <span
              className={registerAe ? styles.checkOn : styles.checkOff}
              aria-hidden
            >
              {registerAe ? <IconTick size={12} /> : null}
            </span>
            <span>Зарегистрировать нежелательное явление в журнале</span>
          </label>

          <button type="button" className={styles.btnSave}>
            <IconTick aria-hidden />
            Сохранить решение
          </button>
        </aside>
      </div>
    </div>
  )
}
