import { useLocation } from 'react-router-dom'
import styles from './AdminPlaceholderPage.module.css'

const titles: Record<string, string> = {
  '/admin/analytics': 'Аналитика клиники',
  '/admin/audit': 'Журнал аудита',
  '/admin/settings': 'Настройки клиники',
}

export function AdminPlaceholderPage() {
  const { pathname } = useLocation()
  const title = titles[pathname] ?? 'Раздел'

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>Раздел в разработке</p>
    </div>
  )
}
