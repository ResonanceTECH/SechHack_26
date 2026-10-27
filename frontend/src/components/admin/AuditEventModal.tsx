import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { AuditEvent } from '@/types/admin'
import styles from './AuditEventModal.module.css'

interface AuditEventModalProps {
  event: AuditEvent | null
  immutableNote: string
  onClose: () => void
}

function resultLabel(event: AuditEvent): string {
  return event.result === 'success' ? 'Успешно' : event.result
}

export function AuditEventModal({
  event,
  immutableNote,
  onClose,
}: AuditEventModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const open = event != null

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

  if (!event) return null

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
            Событие аудита
          </h2>
          <p className={styles.metaLine}>Событие № {event.number}</p>
          <p className={styles.metaLine}>{event.datetimeLabel}</p>
        </header>

        <dl className={styles.grid}>
          <div>
            <dt>Инициатор</dt>
            <dd>{event.initiator}</dd>
          </div>
          <div>
            <dt>Объект</dt>
            <dd>{event.objectFull}</dd>
          </div>
        </dl>

        <div className={styles.body}>
          <h3 className={styles.action}>{event.action}</h3>
          <p className={styles.detail}>{event.detail}</p>
          <span className={styles.success}>
            <span className={styles.successDot} aria-hidden />
            {resultLabel(event)}
          </span>
        </div>

        <p className={styles.note}>{immutableNote}</p>

        <button type="button" className={styles.closeBtn} onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>,
    document.body,
  )
}
