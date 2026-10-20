import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  IconCalendar,
  IconClose,
  IconInfo,
  IconSend,
  IconTick,
} from '@/components/icons/NavIcons'
import {
  requestQuestionnaireMeta,
  requestQuestionnaireOptions,
} from '@/data/mockRequestQuestionnaires'
import styles from './RequestQuestionnaireModal.module.css'

interface RequestQuestionnaireModalProps {
  open: boolean
  onClose: () => void
  patientName: string
  patientInitials: string
  lastCompletedLabel?: string
}

function defaultSelected(): Set<string> {
  return new Set(
    requestQuestionnaireOptions
      .filter((o) => o.defaultChecked)
      .map((o) => o.id),
  )
}

function pluralQuestionnaires(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'опросник'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'опросника'
  }
  return 'опросников'
}

export function RequestQuestionnaireModal({
  open,
  onClose,
  patientName,
  patientInitials,
  lastCompletedLabel = requestQuestionnaireMeta.lastCompletedLabel,
}: RequestQuestionnaireModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<Set<string>>(defaultSelected)
  const [sent, setSent] = useState(false)
  const dueLabel = requestQuestionnaireMeta.dueLabel

  const showRiskNote = useMemo(
    () =>
      requestQuestionnaireOptions.some(
        (opt) => opt.riskNote && selected.has(opt.id),
      ),
    [selected],
  )

  const selectedCount = selected.size

  useEffect(() => {
    if (!open) return

    setSelected(defaultSelected())
    setSent(false)

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

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const send = () => {
    if (selectedCount === 0) return
    setSent(true)
    window.setTimeout(() => {
      setSent(false)
      onClose()
    }, 900)
  }

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
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            Запросить опросники
          </h2>
          <button
            type="button"
            className={styles.close}
            aria-label="Закрыть"
            onClick={onClose}
          >
            <IconClose aria-hidden />
          </button>
        </div>

        <div className={styles.patientBar}>
          <div className={styles.patientAvatar} aria-hidden>
            {patientInitials}
          </div>
          <div className={styles.patientMeta}>
            <span className={styles.patientName}>{patientName}</span>
            <span className={styles.patientLast}>{lastCompletedLabel}</span>
          </div>
        </div>

        <ul className={styles.list} role="list">
          {requestQuestionnaireOptions.map((opt) => {
            const checked = selected.has(opt.id)

            return (
              <li key={opt.id}>
                <label
                  className={`${styles.item} ${checked ? styles.itemChecked : ''}`}
                >
                  <input
                    type="checkbox"
                    className={styles.checkInput}
                    checked={checked}
                    onChange={() => toggle(opt.id)}
                  />
                  <span
                    className={checked ? styles.checkOn : styles.checkOff}
                    aria-hidden
                  >
                    {checked ? <IconTick size={12} /> : null}
                  </span>
                  <span className={styles.itemLabel}>
                    <span className={styles.itemCode}>{opt.code}</span>
                    {opt.title ? (
                      <span className={styles.itemMuted}>
                        {` — ${opt.title} (${opt.questionsLabel})`}
                      </span>
                    ) : (
                      <span className={styles.itemMuted}>
                        {` (${opt.questionsLabel})`}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>

        {showRiskNote ? (
          <div className={styles.info} role="note">
            <span className={styles.infoIcon}>
              <IconInfo size={16} aria-hidden />
            </span>
            <span>{requestQuestionnaireMeta.infoText}</span>
          </div>
        ) : null}

        <div className={styles.dueRow}>
          <span className={styles.dueLabel}>Пройти до</span>
          <button
            type="button"
            className={styles.dueField}
            aria-label={`Срок: ${dueLabel}`}
          >
            <span className={styles.dueIcon} aria-hidden>
              <IconCalendar size={18} />
            </span>
            <span>{dueLabel}</span>
          </button>
        </div>

        <p className={styles.footerNote}>{requestQuestionnaireMeta.footerText}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={send}
            disabled={selectedCount === 0 || sent}
          >
            <IconSend aria-hidden />
            {sent
              ? 'Отправлено'
              : `Отправить ${selectedCount} ${pluralQuestionnaires(selectedCount)}`}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
