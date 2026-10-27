import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get } from '@/lib/api'
import styles from './AuditPage.module.css'

interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  created_at: string | null
}

export function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await get<AuditLog[]>('/api/v1/audit/logs')
      setLogs(Array.isArray(res) ? res : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить журнал')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <div className={styles.page}>Загрузка журнала…</div>
  if (error) return <div className={styles.page}><p>{error}</p><button onClick={load}>Повторить</button></div>

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Журнал аудита</h1>
          <p className={styles.subtitle}>Действия пользователей</p>
        </div>
        <Link to="/admin/employees" className={styles.backBtn}>
          К сотрудникам
        </Link>
      </header>

      <section className={styles.card} aria-label="Журнал аудита">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colTime}>Время</th>
                <th className={styles.colEmployee}>Пользователь</th>
                <th className={styles.colAction}>Действие</th>
                <th className={styles.colInitiator}>Сущность</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className={styles.colTime}>
                    {l.created_at ? new Date(l.created_at).toLocaleString() : ''}
                  </td>
                  <td className={styles.colEmployee}>{l.user_id ?? '—'}</td>
                  <td className={styles.colAction}>{l.action}</td>
                  <td className={styles.colInitiator}>
                    {l.entity_type ?? ''} {l.entity_id ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>Записей нет</p>
            <Link to="/admin/employees" className={styles.emptyBtn}>
              К сотрудникам
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  )
}
