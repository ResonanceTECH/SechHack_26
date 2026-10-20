import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type {
  ClinicSettings,
  ClinicWorkHoursId,
  ClinicWorkSettingsDraft,
} from '@/types/admin'
import styles from './ClinicSettingsModal.module.css'

interface ClinicSettingsModalProps {
  open: boolean
  settings: ClinicSettings
  initial: ClinicWorkSettingsDraft
  onClose: () => void
  onSave: (draft: ClinicWorkSettingsDraft) => void
}

export function ClinicSettingsModal({
  open,
  settings,
  initial,
  onClose,
  onSave,
}: ClinicSettingsModalProps) {
  const titleId = useId()
  const emailId = useId()
  const phoneId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState(initial.email)
  const [phone, setPhone] = useState(initial.phone)
  const [hoursId, setHoursId] = useState<ClinicWorkHoursId>(initial.hoursId)
  const [seed, setSeed] = useState(initial)

  if (open && seed !== initial) {
    setSeed(initial)
    setEmail(initial.email)
    setPhone(initial.phone)
    setHoursId(initial.hoursId)
  }

  const dirty =
    email !== initial.email ||
    phone !== initial.phone ||
    hoursId !== initial.hoursId

  useEffect(() => {
    if (!open) return

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    dialogRef.current?.focus()
  }, [open])

  if (!open) return null

  const { workForm, contacts } = settings

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className={styles.head}>
          <h2 id={titleId} className={styles.title}>
            {workForm.title}
          </h2>
          <p className={styles.subtitle}>{workForm.subtitle}</p>
        </header>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={emailId}>
            Рабочий e-mail <span className={styles.optional}>· необязательно</span>
          </label>
          <input
            id={emailId}
            className={styles.input}
            type="email"
            placeholder="Не указан"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={phoneId}>
            Телефон клиники{' '}
            <span className={styles.optional}>· необязательно</span>
          </label>
          <input
            id={phoneId}
            className={styles.input}
            type="tel"
            placeholder="Не указан"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>

        <div className={styles.timezone}>
          <span className={styles.tzLabel}>{contacts.timezone.label}</span>
          <span className={styles.tzValue}>{contacts.timezone.value}</span>
        </div>

        <div className={styles.hoursBlock}>
          <span className={styles.hoursLabel}>
            Рабочее время <span className={styles.optional}>· понедельник — пятница</span>
          </span>
          <div className={styles.hoursRow} role="group" aria-label="Рабочее время">
            {workForm.hoursOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={
                  hoursId === opt.id ? styles.hoursActive : styles.hoursBtn
                }
                onClick={() => setHoursId(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className={styles.hoursNote}>{workForm.hoursNote}</p>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>
            Отмена
          </button>
          <button
            type="button"
            className={dirty ? styles.btnSaveActive : styles.btnSave}
            disabled={!dirty}
            onClick={() => onSave({ email, phone, hoursId })}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
