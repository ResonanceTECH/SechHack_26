import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { get, patch } from '@/lib/api'
import type { AlertListResponse, AlertResponse } from '@/types/api'
import type { DoctorOutletContext } from '@/layouts/DoctorLayout'
import styles from './AlertsPage.module.css'

const priorityLabel: Record<string, string> = {
  mandatory: 'Обязательный',
  optional: 'Опциональный',
  rx: 'Лекарственный',
}

const statusLabel: Record<string, string> = {
  new: 'Новый',
  in_progress: 'В работе',
  resolved: 'Закрыт',
  dismissed: 'Отклонён',
}

export function AlertsPage() {
  const { setBreadcrumbs } = useOutletContext<DoctorOutletContext>()
  const [alerts, setAlerts] = useState<AlertResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [safetySteps, setSafetySteps] = useState<string[]>([])

  useEffect(() => {
    setBreadcrumbs([{ label: 'Алерты' }])
    return () => setBreadcrumbs(null)
  }, [setBreadcrumbs])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await get<AlertListResponse>('/api/v1/alerts')
      setAlerts(data.alerts ?? [])
      setSelectedId((prev) => prev ?? (data.alerts?.[0]?.id ?? null))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить алерты')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const selected = alerts.find((a) => a.id === selectedId) ?? null

  useEffect(() => {
    if (!selectedId) { setSafetySteps([]); return }
    get<{ alert_id: string; steps: string[] }>(`/api/v1/alerts/${selectedId}/safety-plan`)
      .then((d) => setSafetySteps(d.steps ?? []))
      .catch(() => setSafetySteps([]))
  }, [selectedId])

  async function updateStatus(status: string) {
    if (!selected) return
    setUpdating(true)
    try {
      await patch(`/api/v1/alerts/${selected.id}`, { status })
      setAlerts((prev) =>
        prev.map((a) => (a.id === selected.id ? { ...a, status } : a)),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось обновить статус')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className={styles.page}>Загрузка алертов…</div>
  }
  if (error) {
    return (
      <div className={styles.page}>
        <p>{error}</p>
        <button type="button" onClick={load}>
          Повторить
        </button>
      </div>
    )
  }
  if (alerts.length === 0) {
    return <div className={styles.page}>Алертов нет</div>
  }

  return (
    <div className={styles.page}>
      <aside className={styles.queue} aria-label="Очередь алертов">
        <ul className={styles.list}>
          {alerts.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className={a.id === selectedId ? styles.dialogActive : styles.dialog}
                onClick={() => setSelectedId(a.id)}
              >
                <div className={styles.dialogBody}>
                  <div className={styles.dialogTop}>
                    <span className={styles.dialogName}>{a.title}</span>
                    <span className={styles.dialogTime}>
                      {a.created_at ? new Date(a.created_at).toLocaleString() : ''}
                    </span>
                  </div>
                  <div className={styles.dialogBottom}>
                    <p className={styles.dialogPreview}>{a.summary}</p>
                    <span className={styles.unread}>
                      {priorityLabel[a.priority] ?? a.priority}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className={styles.chat} aria-label="Детали алерта">
        {selected ? (
          <>
            <header className={styles.chatHead}>
              <div className={styles.chatHeadMain}>
                <h3 className={styles.chatName}>{selected.title}</h3>
                <p className={styles.chatSub}>
                  Пациент: {selected.patient_id} · Тип: {selected.type} · Приоритет:{' '}
                  {priorityLabel[selected.priority] ?? selected.priority}
                </p>
              </div>
            </header>
            <div className={styles.feed}>
              <p>{selected.summary}</p>
              <p>
                Статус: {statusLabel[selected.status] ?? selected.status}
                {selected.resolved_at
                  ? ` · закрыт ${new Date(selected.resolved_at).toLocaleString()}`
                  : ''}
              </p>
              {safetySteps.length > 0 ? (
                <div>
                  <strong>План безопасности:</strong>
                  <ul>
                    {safetySteps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className={styles.composer}>
              <div className={styles.inputRow}>
                <button
                  type="button"
                  className={styles.send}
                  disabled={updating || selected.status === 'resolved'}
                  onClick={() => updateStatus('resolved')}
                >
                  Закрыть
                </button>
                <button
                  type="button"
                  className={styles.send}
                  disabled={updating || selected.status === 'in_progress'}
                  onClick={() => updateStatus('in_progress')}
                >
                  В работу
                </button>
                <button
                  type="button"
                  className={styles.send}
                  disabled={updating || selected.status === 'dismissed'}
                  onClick={() => updateStatus('dismissed')}
                >
                  Отклонить
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.placeholder}>Выберите алерт из очереди</div>
        )}
      </section>
    </div>
  )
}
