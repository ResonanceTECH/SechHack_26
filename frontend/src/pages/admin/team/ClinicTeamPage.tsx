import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get } from '@/lib/api'
import { IconShieldCheck } from '@/components/icons/NavIcons'
import styles from './ClinicTeamPage.module.css'

interface StaffMember {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  specialization: string | null
  clinic_id: string
  is_active: boolean
  role: string
}

export function ClinicTeamPage() {
  const [rows, setRows] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await get<StaffMember[]>('/api/v1/admin/staff')
      setRows(Array.isArray(res) ? res : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить команду')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <div className={styles.page}>Загрузка команды…</div>
  if (error) return <div className={styles.page}><p>{error}</p><button onClick={load}>Повторить</button></div>

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Команда клиники</h1>
          <p className={styles.subtitle}>Сотрудники клиники</p>
        </div>
        <Link to="/admin/applications" className={styles.checkBtn}>
          Заявки
        </Link>
      </header>

      <section className={styles.card} aria-label="Команда">
        <div className={styles.inviteRow}>
          <Link to="/admin/invite-doctor" className={styles.btnPrimary}>
            Пригласить врача
          </Link>
          <Link to="/admin/invite-admin" className={styles.btnSoft}>
            Пригласить администратора
          </Link>
        </div>

        <h2 className={styles.sectionTitle}>Сотрудники</h2>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Сотрудник</th>
                <th>Специализация</th>
                <th>Роль</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className={styles.name}>
                    {(row.last_name ?? '') + ' ' + (row.first_name ?? '')}
                  </td>
                  <td>{row.specialization ?? '—'}</td>
                  <td>{row.role}</td>
                  <td>
                    <span className={styles.status}>
                      {row.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 ? (
          <div className={styles.notice}>
            <span className={styles.noticeIcon} aria-hidden>
              <IconShieldCheck />
            </span>
            <div className={styles.noticeMeta}>
              <span className={styles.noticeTitle}>Команда пуста</span>
              <span className={styles.noticeBody}>Пригласите первого сотрудника.</span>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
