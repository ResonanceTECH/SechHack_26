import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  IconAlertTriangle,
  IconFile,
  IconNotebook,
  IconPencil,
  IconPill,
  IconPlus,
} from '@/components/icons/NavIcons'
import { getPatientCard } from '@/data/mockPatientCard'
import type { PatientCardTab } from '@/types/doctor'
import { DiaryChart } from './widgets/DiaryChart'
import styles from './PatientCardPage.module.css'

const tabs: Array<{ id: PatientCardTab; label: string }> = [
  { id: 'overview', label: 'Обзор' },
  { id: 'questionnaires', label: 'Опросники' },
  { id: 'diary', label: 'Дневник' },
  { id: 'program', label: 'Программа' },
  { id: 'medications', label: 'Препараты' },
  { id: 'visits', label: 'Визиты и заметки' },
  { id: 'access', label: 'Журнал доступа' },
]

export function PatientCardPage() {
  const navigate = useNavigate()
  const { patientId = '' } = useParams()
  const card = useMemo(() => getPatientCard(patientId), [patientId])
  const [tab, setTab] = useState<PatientCardTab>('overview')

  if (!card) {
    return <Navigate to="/patients" replace />
  }

  return (
    <div className={styles.page}>
      <header className={styles.profile}>
        <div className={styles.profileMain}>
          <div className={styles.avatar} aria-hidden>
            {card.initials}
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.name}>{card.fullName}</h2>
            <p className={styles.meta}>
              {card.age} года · {card.diagnosisCode} · в программе с{' '}
              {card.inProgramSince} · ведущий врач {card.leadDoctor}
            </p>
            <div className={styles.badges}>
              {card.badges.map((badge) => (
                <span
                  key={badge.id}
                  className={`${styles.badge} ${styles[`badge_${badge.tone}`]}`}
                >
                  <span className={styles.badgeDot} aria-hidden />
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnGhost}>
            <IconNotebook size={17} aria-hidden />
            Запросить опросник
          </button>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => navigate(`/exercises/${patientId}`)}
          >
            <IconPlus size={17} aria-hidden />
            Назначить упражнение
          </button>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => navigate(`/patients/${patientId}/report`)}
          >
            <IconFile size={17} aria-hidden />
            Отчёт перед визитом
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => navigate(`/patients/${patientId}/plan`)}
          >
            <IconPencil size={17} aria-hidden />
            План лечения
          </button>
        </div>
      </header>

      <nav className={styles.tabs} aria-label="Разделы карточки">
        {tabs.map((item) => {
          const active = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={active ? styles.tabActive : styles.tab}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          )
        })}
      </nav>

      {tab !== 'overview' ? (
        <div className={styles.placeholder}>
          Раздел «{tabs.find((t) => t.id === tab)?.label}» — в разработке
          <Link to="/patients" className={styles.backLink}>
            ← К списку пациентов
          </Link>
        </div>
      ) : (
        <div className={styles.overview}>
          {card.alert ? (
            <aside className={styles.alert} role="alert">
              <div className={styles.alertIcon} aria-hidden>
                <IconAlertTriangle />
              </div>
              <div className={styles.alertBody}>
                <div className={styles.alertPriority}>
                  {card.alert.priorityLabel}
                </div>
                <div className={styles.alertText}>
                  <strong>{card.alert.title}.</strong> {card.alert.body}
                </div>
              </div>
              <button
                type="button"
                className={styles.alertCta}
                onClick={() => navigate('/alerts')}
              >
                {card.alert.cta}
              </button>
            </aside>
          ) : null}

          <div className={styles.rowTop}>
            <section className={`${styles.card} ${styles.diaryCard}`}>
              <div className={styles.cardHead}>
                <h3 className={styles.cardTitle}>{card.diary.title}</h3>
                <ul className={styles.legend} aria-label="Легенда">
                  <li>
                    <span className={`${styles.legendDot} ${styles.legMood}`} />
                    Настроение
                  </li>
                  <li>
                    <span
                      className={`${styles.legendDot} ${styles.legAnxiety}`}
                    />
                    Тревога
                  </li>
                  <li>
                    <span
                      className={`${styles.legendDot} ${styles.legSleep}`}
                    />
                    Сон
                  </li>
                </ul>
              </div>
              <DiaryChart points={card.diary.points} />
              <p className={styles.footnote}>{card.diary.footnote}</p>
            </section>

            <section className={`${styles.card} ${styles.qCard}`}>
              <h3 className={styles.cardTitle}>Опросники</h3>
              <ul className={styles.qList}>
                {card.questionnaires.map((q) => (
                  <li key={q.id} className={styles.qItem}>
                    <div className={styles.qHead}>
                      <span className={styles.qCode}>{q.code}</span>
                      <span className={styles.qScore}>
                        {q.score}
                        <span className={styles.qMax}>/{q.max}</span>
                      </span>
                    </div>
                    <div className={styles.qBars}>
                      {q.bars.map((value, i) => (
                        <div key={q.dates[i]} className={styles.qBarRow}>
                          <span className={styles.qDate}>{q.dates[i]}</span>
                          <div className={styles.qTrack}>
                            <div
                              className={`${styles.qFill} ${
                                i === 0 ? styles.qFillPrev : styles.qFillCurr
                              }`}
                              style={{
                                width: `${Math.round((value / q.max) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className={styles.qBarVal}>{value}</span>
                        </div>
                      ))}
                    </div>
                    <div
                      className={`${styles.qTrend} ${
                        q.trend === 'down'
                          ? styles.qTrendGood
                          : q.trend === 'up'
                            ? styles.qTrendBad
                            : styles.qTrendSame
                      }`}
                    >
                      {q.trendLabel}
                    </div>
                    {q.note ? (
                      <div className={styles.qNote}>{q.note}</div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className={styles.rowBottom}>
            <section className={`${styles.card} ${styles.programCard}`}>
              <div className={styles.cardHead}>
                <h3 className={styles.cardTitle}>{card.program.title}</h3>
                <span className={styles.weekLabel}>
                  {card.program.weekLabel}
                </span>
              </div>
              <div className={styles.progTrack}>
                <div
                  className={styles.progFill}
                  style={{ width: `${card.program.weekProgress}%` }}
                />
              </div>
              <ul className={styles.taskList}>
                {card.program.tasks.map((task) => (
                  <li key={task.id} className={styles.task}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span
                      className={`${styles.taskStatus} ${
                        styles[`task_${task.status}`]
                      }`}
                    >
                      {task.progressLabel
                        ? `${task.statusLabel} · ${task.progressLabel}`
                        : task.statusLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={`${styles.card} ${styles.medCard}`}>
              <h3 className={styles.cardTitle}>Препараты</h3>
              {card.medication ? (
                <div className={styles.medBody}>
                  <div className={styles.medTop}>
                    <span className={styles.medIcon} aria-hidden>
                      <IconPill />
                    </span>
                    <div>
                      <div className={styles.medName}>
                        {card.medication.name} {card.medication.dose} ·{' '}
                        {card.medication.schedule}
                      </div>
                      <span className={styles.medContour}>
                        {card.medication.contourLabel}
                      </span>
                    </div>
                  </div>
                  <dl className={styles.medStats}>
                    <div>
                      <dt>Приверженность</dt>
                      <dd>{card.medication.adherence}%</dd>
                    </div>
                    <div>
                      <dt>Побочные (пациент)</dt>
                      <dd>{card.medication.sideEffects}</dd>
                    </div>
                    <div>
                      <dt>Предупреждения</dt>
                      <dd>{card.medication.warnings}</dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <p className={styles.emptyMed}>Нет назначений</p>
              )}
            </section>

            <section className={`${styles.card} ${styles.summaryCard}`}>
              <div className={styles.cardHead}>
                <h3 className={styles.cardTitle}>{card.summary.title}</h3>
                <button
                  type="button"
                  className={styles.editBtn}
                  aria-label="Редактировать сводку"
                >
                  <IconPencil aria-hidden />
                </button>
              </div>
              <p className={styles.summaryBody}>{card.summary.body}</p>
              <div className={styles.summaryFoot}>
                <span className={styles.summaryChip}>
                  {card.summary.basedOn}
                </span>
                <span className={styles.summaryDecision}>
                  {card.summary.decisionNote}
                </span>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
