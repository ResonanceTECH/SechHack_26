import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from '@/components/DiscardChangesModal/DiscardChangesModal.module.css'

interface EndSessionsModalProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function EndSessionsModal({
  open,
  onCancel,
  onConfirm,
}: EndSessionsModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onCancel])

  useEffect(() => {
    if (!open) return
    dialogRef.current?.focus()
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <h2 id={titleId} className={styles.title}>
          Завершить другие сеансы?
        </h2>
        <p className={styles.body}>
          На остальных устройствах потребуется войти снова. Текущее устройство
          продолжит работу.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnContinue}
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            type="button"
            className={styles.btnDiscard}
            onClick={onConfirm}
          >
            Завершить сеансы
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
