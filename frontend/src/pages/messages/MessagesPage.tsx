import { useEffect, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { get, patch, post } from '@/lib/api'
import type { DoctorOutletContext } from '@/layouts/DoctorLayout'
import type { MessageResponse } from '@/types/api'
import styles from './MessagesPage.module.css'

interface MessageListResponse {
  items: MessageResponse[]
  total: number
}

export function MessagesPage() {
  const { patientId = '' } = useParams()
  const { setBreadcrumbs } = useOutletContext<DoctorOutletContext>()
  const [messages, setMessages] = useState<MessageResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recipientId, setRecipientId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: 'Сообщения' }])
    return () => setBreadcrumbs(null)
  }, [setBreadcrumbs])

  async function load() {
    if (!patientId) return
    setLoading(true)
    setError(null)
    try {
      const [msgData, patientData] = await Promise.all([
        get<MessageListResponse>(`/api/v1/messages?patient_id=${patientId}`),
        get<{ user_id?: string }>(`/api/v1/patients/${patientId}`),
      ])
      setMessages(msgData.items ?? [])
      setRecipientId(patientData.user_id ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить сообщения')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [patientId])

  async function markRead(id: string) {
    try {
      await patch(`/api/v1/messages/${id}/read`)
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)))
    } catch {
      // ignore
    }
  }

  async function send() {
    if (!recipientId || !draft.trim()) return
    setSending(true)
    try {
      const res = await post<{ id: string; body: string; created_at?: string | null; is_read: boolean; sender_id: string; recipient_id: string; patient_id?: string | null }>(
        '/api/v1/messages',
        { recipient_id: recipientId, patient_id: patientId, body: draft.trim() },
      )
      setMessages((prev) => [...prev, res as unknown as MessageResponse])
      setDraft('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось отправить сообщение')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div className={styles.page}>Загрузка сообщений…</div>
  if (error) return <div className={styles.page}><p>{error}</p><button onClick={load}>Повторить</button></div>
  if (messages.length === 0) return <div className={styles.page}>Сообщений нет</div>

  return (
    <div className={styles.page}>
      <section className={styles.chat} aria-label="Переписка">
        <div className={styles.feed}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={m.is_read ? styles.incomingBlock : styles.outgoingBlock}
              onClick={() => !m.is_read && markRead(m.id)}
            >
              <div className={m.is_read ? styles.bubbleIn : styles.bubbleOut}>{m.body}</div>
              <small>{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</small>
            </div>
          ))}
        </div>
        <div className={styles.composer}>
          <div className={styles.inputRow}>
            <input
              type="text"
              className={styles.input}
              placeholder="Сообщение пациенту..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Сообщение пациенту"
            />
            <button
              type="button"
              className={styles.send}
              disabled={sending || !draft.trim() || !recipientId}
              onClick={send}
            >
              Отправить
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
