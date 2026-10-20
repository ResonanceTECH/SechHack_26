import { NavLink } from 'react-router-dom'
import {
  IconAnalytics,
  IconAudit,
  IconClinicSettings,
  IconEmployees,
  IconLogout,
  IconSidebarToggle,
} from '@/components/icons/NavIcons'
import { adminProfile } from '@/data/mockAdmin'
import type { AdminNavItemId } from '@/types/admin'
import styles from './AdminSidebar.module.css'

const navItems: Array<{
  id: AdminNavItemId
  to: string
  label: string
  icon: typeof IconEmployees
}> = [
  {
    id: 'employees',
    to: '/admin/employees',
    label: 'Сотрудники и роли',
    icon: IconEmployees,
  },
  {
    id: 'analytics',
    to: '/admin/analytics',
    label: 'Аналитика клиники',
    icon: IconAnalytics,
  },
  {
    id: 'audit',
    to: '/admin/audit',
    label: 'Журнал аудита',
    icon: IconAudit,
  },
  {
    id: 'settings',
    to: '/admin/settings',
    label: 'Настройки клиники',
    icon: IconClinicSettings,
  },
]

interface AdminSidebarProps {
  open: boolean
  onToggle: () => void
}

export function AdminSidebar({ open, onToggle }: AdminSidebarProps) {
  return (
    <aside
      className={`${styles.sidebar}${open ? '' : ` ${styles.collapsed}`}`}
      aria-label="Меню администратора"
      data-collapsed={!open || undefined}
    >
      <div className={styles.brand}>
        <button
          type="button"
          className={styles.brandToggle}
          onClick={onToggle}
          aria-label={open ? 'Свернуть меню' : 'Развернуть меню'}
          aria-expanded={open}
          title="Переключить боковую панель (⇧⌘S)"
        >
          <img
            className={styles.brandMark}
            src="/brand-logo.png"
            alt=""
            width={40}
            height={40}
            decoding="async"
          />
          <span className={styles.brandToggleIcon} aria-hidden>
            <IconSidebarToggle />
          </span>
        </button>
        <div className={styles.brandText}>
          <span className={styles.brandTitle}>Клинический компас</span>
          <span className={styles.brandSubtitle}>Администратор клиники</span>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Навигация администратора">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.id}
              to={item.to}
              title={item.label}
              aria-label={item.label}
              className={({ isActive }) =>
                `${styles.link}${isActive ? ` ${styles.linkActive}` : ''}`
              }
            >
              <span className={styles.linkIcon}>
                <Icon aria-hidden />
              </span>
              <span className={styles.linkLabel}>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className={styles.footer}>
        <div
          className={styles.avatar}
          aria-hidden
          title={`${adminProfile.shortName} · ${adminProfile.role}`}
        >
          {adminProfile.initials}
        </div>
        <div className={styles.footerMeta}>
          <div className={styles.footerName}>{adminProfile.shortName}</div>
          <div className={styles.footerRole}>{adminProfile.role}</div>
        </div>
        <button
          type="button"
          className={styles.logout}
          aria-label="Выйти"
          title="Выйти"
        >
          <IconLogout aria-hidden />
        </button>
      </div>
    </aside>
  )
}
