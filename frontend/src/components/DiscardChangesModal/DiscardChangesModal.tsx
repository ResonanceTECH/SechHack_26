import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './DiscardChangesModal.module.css'

interface DiscardChangesModalProps {
  open: boolean
  onContinue: () => void
  onDiscard: () => void
}

export function DiscardChangesModal({
  open,
  onContinue,
  onDiscard,
}: DiscardChangesModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onContinue()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onContinue])

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
        if (e.target === e.currentTarget) onContinue()
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
          Не сохранять изменения?
        </h2>
        <p className={styles.body}>
          Вы изменили данные, но ещё не сохранили их. Можно продолжить
          редактирование или уйти без сохранения.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnContinue}
            onClick={onContinue}
          >
            Продолжить редактирование
          </button>
          <button
            type="button"
            className={styles.btnDiscard}
            onClick={onDiscard}
          >
            Не сохранять
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
