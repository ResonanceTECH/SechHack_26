import { useEffect, useMemo, useState } from 'react'
import {
  Navigate,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom'
import { IconCall, IconSend } from '@/components/icons/NavIcons'
import {
  dialogList,
  getChatThread,
  getDialogByPatientId,
} from '@/data/mockMessages'
import type { DoctorOutletContext } from '@/layouts/DoctorLayout'
import styles from './MessagesPage.module.css'

const avatarClass: Record<string, string> = {
  rose: styles.avRose,
  amber: styles.avAmber,
  blue: styles.avBlue,
  green: styles.avGreen,
  violet: styles.avViolet,
  teal: styles.avTeal,
}

export function MessagesPage() {
  const { patientId = '' } = useParams()
  const navigate = useNavigate()
  const { setBreadcrumbs } = useOutletContext<DoctorOutletContext>()
  const [draft, setDraft] = useState('')

  const dialog = useMemo(() => getDialogByPatientId(patientId), [patientId])
  const thread = useMemo(() => getChatThread(patientId), [patientId])

  useEffect(() => {
    if (!thread) return
    setBreadcrumbs([
      { label: 'Пациенты', to: '/patients' },
      { label: thread.patientFullName, to: `/patients/${patientId}` },
      { label: 'Сообщения' },
    ])
    return () => setBreadcrumbs(null)
  }, [thread, patientId, setBreadcrumbs])

  useEffect(() => {
    setDraft('')
  }, [patientId])

  if (!patientId || !dialog || !thread) {
    return <Navigate to={`/patients/${dialogList[0]?.patientId}/messages`} replace />
  }

  return (
    <div className={styles.page}>
      <aside className={styles.dialogs} aria-label="Диалоги">
        <h2 className={styles.dialogsTitle}>Диалоги</h2>
        <ul className={styles.dialogList}>
          {dialogList.map((item) => {
            const active = item.patientId === patientId
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={active ? styles.dialogActive : styles.dialog}
                  onClick={() => navigate(`/patients/${item.patientId}/messages`)}
                >
                  <div
                    className={`${styles.avatar} ${avatarClass[item.avatarTone]}`}
                    aria-hidden
                  >
                    {item.initials}
                  </div>
                  <div className={styles.dialogBody}>
                    <div className={styles.dialogTop}>
                      <span className={styles.dialogName}>
                        {item.patientShortName}
                      </span>
                      <span className={styles.dialogTime}>{item.timeLabel}</span>
                    </div>
                    <div className={styles.dialogBottom}>
                      <p className={styles.dialogPreview}>{item.preview}</p>
                      {item.unread ? (
                        <span className={styles.unread}>{item.unread}</span>
                      ) : null}
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      <section className={styles.chat} aria-label="Переписка">
        <header className={styles.chatHead}>
          <div className={styles.chatHeadMain}>
            <h3 className={styles.chatName}>{thread.patientFullName}</h3>
            <p className={styles.chatSub}>{thread.subtitle}</p>
          </div>
          <div className={styles.chatActions}>
            <button type="button" className={styles.btnGhost}>
              Запросить опросник
            </button>
            <button type="button" className={styles.btnCall}>
              <IconCall aria-hidden />
              Позвонить
            </button>
          </div>
        </header>

        <div className={styles.feed}>
          {thread.messages.map((msg) => {
            if (msg.kind === 'system') {
              return (
                <div key={msg.id} className={styles.systemCard}>
                  <p className={styles.systemText}>{msg.text}</p>
                  <button
                    type="button"
                    className={styles.systemCta}
                    onClick={() => navigate(msg.ctaTo)}
                  >
                    {msg.ctaLabel}
                  </button>
                </div>
              )
            }

            if (msg.kind === 'incoming') {
              return (
                <div key={msg.id} className={styles.incomingBlock}>
                  <div className={styles.bubbleIn}>{msg.text}</div>
                  {msg.photo ? (
                    <div className={styles.photo} aria-label="Фото вложения" />
                  ) : null}
                </div>
              )
            }

            return (
              <div key={msg.id} className={styles.outgoingBlock}>
                <div className={styles.bubbleOut}>{msg.text}</div>
              </div>
            )
          })}
        </div>

        <div className={styles.composer}>
          <div className={styles.quickRow}>
            {thread.quickReplies.map((label) => (
              <button
                key={label}
                type="button"
                className={styles.quick}
                onClick={() => setDraft(label)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className={styles.inputRow}>
            <input
              type="text"
              className={styles.input}
              placeholder="Ответ пациенту..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Ответ пациенту"
            />
            <button
              type="button"
              className={styles.send}
              aria-label="Отправить"
              disabled={!draft.trim()}
            >
              <IconSend aria-hidden />
            </button>
          </div>

          <p className={styles.footerNote}>{thread.footerNote}</p>
        </div>
      </section>
    </div>
  )
}
