import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ReportPreview } from '@/types/doctor'
import styles from './ReportPreviewModal.module.css'

interface ReportPreviewModalProps {
  open: boolean
  onClose: () => void
  preview: ReportPreview
}

export function ReportPreviewModal({
  open,
  onClose,
  preview,
}: ReportPreviewModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    dialogRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

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
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            Предпросмотр отчёта
          </h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Закрыть
          </button>
        </header>

        <div className={styles.body}>
          <h3 className={styles.patientName}>{preview.fullName}</h3>
          <p className={styles.meta}>{preview.periodLine}</p>
          <p className={styles.meta}>{preview.visitLine}</p>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Показатель</th>
                  <th scope="col">Текущее значение</th>
                  <th scope="col">Предыдущее</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => (
                  <tr key={row.id}>
                    <td className={styles.indicator}>{row.indicator}</td>
                    <td>{row.current}</td>
                    <td className={styles.previous}>{row.previous}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {preview.alert ? (
            <div className={styles.alertBox} role="status">
              <p className={styles.alertTitle}>{preview.alert.title}</p>
              <p className={styles.alertBody}>{preview.alert.body}</p>
            </div>
          ) : null}

          <p className={styles.footerNote}>{preview.footerNote}</p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
