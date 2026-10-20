import { useNavigate } from 'react-router-dom'
import type { PatientProgramTab, ProgramTabTaskStatus } from '@/types/doctor'
import styles from './ProgramTab.module.css'

interface ProgramTabProps {
  data: PatientProgramTab
  patientId: string
}

const statusClass: Record<ProgramTabTaskStatus, string> = {
  in_progress: styles.statusProgress,
  done: styles.statusDone,
  not_started: styles.statusIdle,
}

export function ProgramTab({ data, patientId }: ProgramTabProps) {
  const navigate = useNavigate()

  return (
    <div className={styles.root}>
      <section className={styles.tasksCard} aria-label={data.tasksTitle}>
        <header className={styles.tasksHead}>
          <h3 className={styles.tasksTitle}>{data.tasksTitle}</h3>
          <span className={styles.weekBadge}>
            <span className={styles.weekDot} aria-hidden />
            {data.weekBadge}
          </span>
        </header>

        <ul className={styles.taskList}>
          {data.tasks.map((task) => (
            <li key={task.id} className={styles.task}>
              <div className={styles.taskMain}>
                <div className={styles.taskTitleRow}>
                  <span className={styles.taskTitle}>{task.title}</span>
                  <span
                    className={`${styles.status} ${statusClass[task.status]}`}
                  >
                    <span className={styles.statusDot} aria-hidden />
                    {task.statusLabel}
                  </span>
                </div>
                <p className={styles.taskSub}>{task.subtitle}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.side}>
        <section className={styles.sideCard}>
          <h3 className={styles.sideTitle}>{data.observation.title}</h3>
          <p className={styles.sideBody}>{data.observation.body}</p>
          <button
            type="button"
            className={styles.btnSoft}
            onClick={() => navigate(`/patients/${patientId}/plan`)}
          >
            {data.observation.cta}
          </button>
        </section>

        <section className={styles.sideCard}>
          <h3 className={styles.sideTitle}>{data.addTask.title}</h3>
          <p className={styles.sideBody}>{data.addTask.body}</p>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => navigate(`/exercises/${patientId}`)}
          >
            {data.addTask.cta}
          </button>
        </section>
      </div>
    </div>
  )
}
