import { Link } from 'react-router-dom'
import { IconSearch } from '@/components/icons/NavIcons'
import styles from './TopBar.module.css'

export type BreadcrumbItem = {
  label: string
  to?: string
}

interface TopBarProps {
  title?: string
  breadcrumbs?: BreadcrumbItem[]
}

export function TopBar({ title, breadcrumbs }: TopBarProps) {
  const hasCrumbs = breadcrumbs != null && breadcrumbs.length > 0

  return (
    <header className={styles.topbar}>
      {hasCrumbs ? (
        <nav className={styles.crumbs} aria-label="Навигация">
          {breadcrumbs.map((item, i) => {
            const last = i === breadcrumbs.length - 1
            return (
              <span key={`${item.label}-${i}`} className={styles.crumb}>
                {i > 0 ? (
                  <span className={styles.crumbSep} aria-hidden>
                    /
                  </span>
                ) : null}
                {item.to && !last ? (
                  <Link to={item.to} className={styles.crumbLink}>
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={last ? styles.crumbCurrent : styles.crumbMuted}
                  >
                    {item.label}
                  </span>
                )}
              </span>
            )
          })}
        </nav>
      ) : (
        <h1 className={styles.title}>{title ?? 'Кабинет врача'}</h1>
      )}

      <label className={styles.search}>
        <IconSearch aria-hidden />
        <input
          type="search"
          placeholder="Поиск пациента, препарата..."
          aria-label="Поиск пациента, препарата"
        />
      </label>

      <time className={styles.datetime} dateTime="2025-10-18T11:05">
        Вс, 18 октября · 11:05
      </time>
    </header>
  )
}
