import { useEffect, useId, useRef, useState, type ClipboardEvent, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { IconClose, IconCopy, IconInfo, IconSend } from '@/components/icons/NavIcons'
import { inviteMeta } from '@/data/mockInvite'
import {
  formatRuPhone,
  isRuPhoneComplete,
  parseRuNationalDigits,
} from '@/lib/ruPhone'
import { InviteQr } from './InviteQr'
import styles from './InvitePatientModal.module.css'

type InviteTab = 'qr' | 'sms'

interface InvitePatientModalProps {
  open: boolean
  onClose: () => void
}

export function InvitePatientModal({ open, onClose }: InvitePatientModalProps) {
  const titleId = useId()
  const [tab, setTab] = useState<InviteTab>('qr')
  /** 10 цифр без кода страны */
  const [phoneDigits, setPhoneDigits] = useState('')
  const [copied, setCopied] = useState(false)
  const [sent, setSent] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setTab('qr')
    setPhoneDigits('')
    setCopied(false)
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

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteMeta.link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
    }
  }

  const applyPhoneRaw = (raw: string) => {
    setPhoneDigits(parseRuNationalDigits(raw))
  }

  const onPhoneInput = (e: FormEvent<HTMLInputElement>) => {
    applyPhoneRaw(e.currentTarget.value)
  }

  const onPhonePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    applyPhoneRaw(e.clipboardData.getData('text'))
  }

  const onPhoneFocus = () => {
    // Каретка после +7, чтобы сразу вводить код
    requestAnimationFrame(() => {
      const el = phoneRef.current
      if (!el) return
      const pos = el.value.length
      el.setSelectionRange(pos, pos)
    })
  }

  const sendSms = () => {
    if (!isRuPhoneComplete(phoneDigits)) return
    setSent(true)
    window.setTimeout(() => setSent(false), 1800)
  }

  const phoneDisplay = formatRuPhone(phoneDigits)
  const phoneReady = isRuPhoneComplete(phoneDigits)

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
            Пригласить пациента
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

        <p className={styles.description}>
          Пациент установит приложение и подключится к вам — по QR-коду на
          приёме или по ссылке в SMS.
        </p>

        <div className={styles.tabs} role="tablist" aria-label="Способ приглашения">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'qr'}
            className={tab === 'qr' ? styles.tabActive : styles.tab}
            onClick={() => setTab('qr')}
          >
            QR-код
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'sms'}
            className={tab === 'sms' ? styles.tabActive : styles.tab}
            onClick={() => setTab('sms')}
          >
            Ссылка в SMS
          </button>
        </div>

        <div className={styles.panel}>
          {tab === 'qr' ? (
            <div className={styles.qrRow}>
              <div className={styles.qrFrame}>
                <InviteQr size={148} />
              </div>
              <div className={styles.qrMeta}>
                <span className={styles.qrLabel}>Код приглашения</span>
                <span className={styles.qrCode}>{inviteMeta.code}</span>
                <span className={styles.qrExpires}>{inviteMeta.expiresLabel}</span>
              </div>
            </div>
          ) : (
            <div className={styles.smsForm}>
              <label>
                <span className={styles.fieldLabel}>Номер телефона пациента</span>
                <input
                  ref={phoneRef}
                  className={styles.input}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={phoneDisplay}
                  onInput={onPhoneInput}
                  onPaste={onPhonePaste}
                  onFocus={onPhoneFocus}
                  aria-invalid={phoneDigits.length > 0 && !phoneReady}
                />
              </label>
              <div className={styles.smsPreview}>{inviteMeta.smsTemplate}</div>
            </div>
          )}
        </div>

        <div className={styles.hint}>
          <span className={styles.hintIcon}>
            <IconInfo aria-hidden />
          </span>
          <span>
            Пациент появится в реестре после подключения и согласия на передачу
            данных.
          </span>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Закрыть
          </button>
          {tab === 'qr' ? (
            <button type="button" className={styles.btnPrimary} onClick={copyLink}>
              <IconCopy aria-hidden />
              {copied ? 'Скопировано' : 'Скопировать ссылку'}
            </button>
          ) : (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={sendSms}
              disabled={!phoneReady}
            >
              <IconSend aria-hidden />
              {sent ? 'Отправлено' : 'Отправить SMS'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
