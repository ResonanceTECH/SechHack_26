import { Link } from 'react-router-dom'
import { IconBell, IconSearch } from '@/components/icons/NavIcons'
import { clinicInfo } from '@/data/mockAdmin'
import styles from './AdminTopBar.module.css'

export type AdminBreadcrumbItem = {
  label: string
  to?: string
}

interface AdminTopBarProps {
  breadcrumbs?: AdminBreadcrumbItem[]
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  /** Hide search + bell — matches audit/settings refs */
  compact?: boolean
}

export function AdminTopBar({
  breadcrumbs,
  searchPlaceholder = 'Поиск сотрудника...',
  searchValue,
  onSearchChange,
  compact = false,
}: AdminTopBarProps) {
  const hasCrumbs = breadcrumbs != null && breadcrumbs.length > 0

  return (
    <header
      className={`${styles.topbar}${compact ? ` ${styles.topbarCompact}` : ''}`}
    >
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
        <h1 className={styles.title}>Администрирование</h1>
      )}

      {!compact ? (
        <label className={styles.search}>
          <IconSearch aria-hidden />
          <input
            type="search"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </label>
      ) : null}

      <div className={styles.right}>
        {!compact ? (
          <button
            type="button"
            className={styles.bell}
            aria-label="Уведомления"
            title="Уведомления"
          >
            <IconBell aria-hidden />
          </button>
        ) : null}
        <span className={styles.clinic}>{clinicInfo.name}</span>
      </div>
    </header>
  )
}
