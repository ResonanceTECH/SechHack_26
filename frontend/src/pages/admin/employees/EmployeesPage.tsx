import { useEffect, useState } from 'react'
import { get } from '@/lib/api'
import styles from './EmployeesPage.module.css'

interface StaffMember {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  specialization: string | null
  clinic_id: string | null
  is_active: boolean
  role: string
}

export function EmployeesPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await get<StaffMember[]>('/api/v1/admin/staff')
      setStaff(Array.isArray(res) ? res : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить сотрудников')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <div className={styles.page}>Загрузка сотрудников…</div>
  if (error) return <div className={styles.page}><p>{error}</p><button onClick={load}>Повторить</button></div>

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Сотрудники</h1>
      </header>
      <section className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Имя</th>
                <th>Специализация</th>
                <th>Роль</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td>{s.last_name} {s.first_name}</td>
                  <td>{s.specialization ?? '—'}</td>
                  <td>{s.role}</td>
                  <td>{s.is_active ? 'Активен' : 'Заблокирован'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {staff.length === 0 ? <p>Сотрудников нет</p> : null}
      </section>
    </div>
  )
}
