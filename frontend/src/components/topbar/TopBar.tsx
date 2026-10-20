import { IconBell, IconSearch } from '@/components/icons/NavIcons'
import styles from './TopBar.module.css'

interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className={styles.topbar}>
      <h1 className={styles.title}>{title}</h1>

      <label className={styles.search}>
        <IconSearch aria-hidden />
        <input
          type="search"
          placeholder="Поиск пациента, препарата..."
          aria-label="Поиск пациента, препарата"
        />
      </label>

      <div className={styles.right}>
        <button type="button" className={styles.bell} aria-label="Уведомления">
          <IconBell aria-hidden />
        </button>
        <time className={styles.datetime} dateTime="2025-10-18T11:05">
          Вс, 18 октября · 11:05
        </time>
      </div>
    </header>
  )
}
