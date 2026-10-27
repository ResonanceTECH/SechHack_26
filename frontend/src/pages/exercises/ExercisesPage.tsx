import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import {
  IconBell,
  IconCalendar,
  IconHeart,
  IconLeaf,
  IconLungs,
  IconNotebook,
  IconTick,
  IconWalk,
} from '@/components/icons/NavIcons'
import {
  assignDefaults,
  assignPatientDefault,
  exerciseFilters,
  exercises,
  exercisesMeta,
} from '@/data/mockExercises'
import { patients } from '@/data/mockPatients'
import type { DoctorOutletContext } from '@/layouts/DoctorLayout'
import type {
  AssignFrequency,
  AssignReminder,
  ExerciseCategory,
  ExerciseIconId,
} from '@/types/doctor'
import styles from './ExercisesPage.module.css'

const frequencyOptions: Array<{ id: AssignFrequency; label: string }> = [
  { id: 'daily', label: 'Ежедневно' },
  { id: 'every_other_day', label: 'Через день' },
  { id: 'weekly', label: 'Еженедельно' },
]

const reminderOptions: Array<{ id: AssignReminder; label: string }> = [
  { id: 'morning', label: 'Утро 09:00' },
  { id: 'evening', label: 'Вечер 21:30' },
  { id: 'daytime', label: 'Днём' },
]

const iconMap: Record<ExerciseIconId, typeof IconLungs> = {
  lungs: IconLungs,
  heart: IconHeart,
  notebook: IconNotebook,
  calendar: IconCalendar,
  leaf: IconLeaf,
  walk: IconWalk,
}

const toneClass: Record<string, string> = {
  blue: styles.toneBlue,
  rose: styles.toneRose,
  amber: styles.toneAmber,
  green: styles.toneGreen,
  teal: styles.toneTeal,
  violet: styles.toneViolet,
}

export function ExercisesPage() {
  const navigate = useNavigate()
  const { patientId } = useParams()
  const { setBreadcrumbs } = useOutletContext<DoctorOutletContext>()

  const patient = useMemo(() => {
    if (!patientId) return assignPatientDefault
    const row = patients.find((p) => p.id === patientId)
    if (!row) return assignPatientDefault
    return {
      id: row.id,
      shortName: row.name,
      initials: row.initials,
      age: row.age,
      programLabel: assignPatientDefault.programLabel,
    }
  }, [patientId])

  /** Как в референсе D06: вкладка «Дыхание» активна, в сетке — вся библиотека кадра */
  const [filter, setFilter] = useState<ExerciseCategory | 'all'>('breathing')
  const [filterApplied, setFilterApplied] = useState(false)
  const [selectedId, setSelectedId] = useState(exercises[0]?.id ?? '')
  const [frequency, setFrequency] = useState<AssignFrequency>(
    assignDefaults.frequency,
  )
  const [reminders, setReminders] = useState<AssignReminder[]>([
    ...assignDefaults.reminders,
  ])
  const [startDate, setStartDate] = useState(assignDefaults.startDate)
  const [endDate, setEndDate] = useState(assignDefaults.endDate)
  const [comment, setComment] = useState(assignDefaults.comment)

  const selected = useMemo(
    () => exercises.find((e) => e.id === selectedId) ?? null,
    [selectedId],
  )

  const visible = useMemo(() => {
    if (!filterApplied || filter === 'all') return exercises
    return exercises.filter((e) => e.category === filter)
  }, [filter, filterApplied])

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Библиотека упражнений', to: '/exercises' },
      { label: `Назначение · ${patient.shortName}` },
    ])
    return () => setBreadcrumbs(null)
  }, [patient.shortName, setBreadcrumbs])

  useEffect(() => {
    if (visible.length === 0) return
    if (!visible.some((e) => e.id === selectedId)) {
      setSelectedId(visible[0].id)
    }
  }, [visible, selectedId])

  function selectFilter(id: ExerciseCategory | 'all') {
    setFilterApplied(true)
    setFilter(id)
  }

  function toggleReminder(id: AssignReminder) {
    setReminders((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    )
  }

  return (
    <div className={styles.page}>
      <section className={styles.library} aria-label="Библиотека упражнений">
        <header className={styles.libHead}>
          <h2 className={styles.libTitle}>Библиотека упражнений</h2>
          <p className={styles.libSub}>{exercisesMeta.subtitle}</p>
        </header>

        <div
          className={styles.filters}
          role="tablist"
          aria-label="Категория упражнений"
        >
          {exerciseFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={filter === f.id ? styles.filterActive : styles.filter}
              onClick={() => selectFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ul className={styles.grid}>
          {visible.map((item) => {
            const Icon = iconMap[item.icon]
            const isSelected = item.id === selectedId
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`${styles.card}${isSelected ? ` ${styles.cardSelected}` : ''}`}
                  onClick={() => setSelectedId(item.id)}
                  aria-pressed={isSelected}
                >
                  <div className={styles.cardTop}>
                    <span
                      className={`${styles.cardIcon} ${toneClass[item.iconTone]}`}
                      aria-hidden
                    >
                      <Icon />
                    </span>
                    {isSelected ? (
                      <span className={styles.selectedBadge}>
                        <span className={styles.selectedDot} aria-hidden />
                        Выбрано
                      </span>
                    ) : null}
                  </div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <div className={styles.cardTags}>
                    <span className={styles.tag}>{item.categoryLabel}</span>
                    <span className={styles.tag}>{item.durationMin} мин</span>
                  </div>
                  <p className={styles.cardDesc}>{item.description}</p>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <aside className={styles.assign} aria-label="Назначение упражнения">
        <h2 className={styles.assignTitle}>Назначение</h2>

        <div className={styles.patientCard}>
          <div className={styles.patientAvatar} aria-hidden>
            {patient.initials}
          </div>
          <div className={styles.patientMeta}>
            <div className={styles.patientName}>{patient.shortName}</div>
            <div className={styles.patientSub}>
              {patient.age} года · {patient.programLabel}
            </div>
          </div>
        </div>

        {selected ? (
          <div className={styles.selectedExercise}>
            <span className={styles.selectedExerciseTitle}>
              {selected.title} · {selected.durationMin} мин
            </span>
          </div>
        ) : null}

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Частота</span>
          <div
            className={styles.pills}
            role="radiogroup"
            aria-label="Частота"
          >
            {frequencyOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={frequency === opt.id}
                className={
                  frequency === opt.id ? styles.pillActive : styles.pill
                }
                onClick={() => setFrequency(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Когда напоминать</span>
          <div className={styles.pills} aria-label="Напоминания">
            {reminderOptions.map((opt) => {
              const on = reminders.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={on}
                  className={on ? styles.pillActive : styles.pill}
                  onClick={() => toggleReminder(opt.id)}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className={styles.dates}>
          <label className={styles.dateField}>
            <span className={styles.fieldLabel}>Начало</span>
            <span className={styles.dateInput}>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                aria-label="Дата начала"
              />
              <IconCalendar aria-hidden />
            </span>
          </label>
          <label className={styles.dateField}>
            <span className={styles.fieldLabel}>Окончание</span>
            <span className={styles.dateInput}>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                aria-label="Дата окончания"
              />
              <IconCalendar aria-hidden />
            </span>
          </label>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="assign-comment">
            Комментарий для пациента
          </label>
          <textarea
            id="assign-comment"
            className={styles.comment}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Кратко опишите, когда и как выполнять…"
          />
        </div>

        <p className={styles.pushNote}>
          <IconBell aria-hidden />
          <span>{assignDefaults.pushNote}</span>
        </p>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={() => navigate(-1)}
          >
            Отмена
          </button>
          <button type="button" className={styles.btnAssign}>
            <IconTick aria-hidden />
            Назначить
          </button>
        </div>
      </aside>
    </div>
  )
}
