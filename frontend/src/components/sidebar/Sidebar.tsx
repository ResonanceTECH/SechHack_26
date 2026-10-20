import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  IconAlerts,
  IconDashboard,
  IconExercises,
  IconLogout,
  IconMedications,
  IconPatients,
  IconSidebarToggle,
} from '@/components/icons/NavIcons'
import { doctorProfile } from '@/data/mockDoctor'
import { setDoctorAuthed } from '@/lib/doctorAuth'
import type { NavItemId } from '@/types/doctor'
import styles from './Sidebar.module.css'

const navItems: Array<{
  id: NavItemId
  to: string
  label: string
  icon: typeof IconDashboard
  badge?: number
}> = [
  { id: 'dashboard', to: '/', label: 'Рабочий стол', icon: IconDashboard },
  { id: 'patients', to: '/patients', label: 'Пациенты', icon: IconPatients },
  {
    id: 'alerts',
    to: '/alerts',
    label: 'Алерты',
    icon: IconAlerts,
    badge: 3,
  },
  {
    id: 'medications',
    to: '/medications',
    label: 'Препараты · ГРЛС',
    icon: IconMedications,
  },
  {
    id: 'exercises',
    to: '/exercises',
    label: 'Упражнения',
    icon: IconExercises,
  },
]

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function logout() {
    setDoctorAuthed(false)
    navigate('/login', { replace: true })
  }

  function isNavActive(id: NavItemId, isActive: boolean) {
    if (
      id === 'dashboard' &&
      (pathname.startsWith('/reports') ||
        /^\/patients\/[^/]+\/report\/?$/.test(pathname))
    ) {
      return true
    }
    return isActive
  }

  return (
    <aside
      className={`${styles.sidebar}${open ? '' : ` ${styles.collapsed}`}`}
      aria-label="Основное меню"
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
          <span className={styles.brandSubtitle}>Кабинет врача</span>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Основная навигация">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.to === '/'}
              title={item.label}
              aria-label={item.label}
              className={({ isActive }) =>
                `${styles.link}${
                  isNavActive(item.id, isActive)
                    ? ` ${styles.linkActive}`
                    : ''
                }`
              }
            >
              <span className={styles.linkIcon}>
                <Icon aria-hidden />
                {item.badge != null ? (
                  <span className={styles.badgeDot} aria-hidden>
                    {open ? null : item.badge}
                  </span>
                ) : null}
              </span>
              <span className={styles.linkLabel}>{item.label}</span>
              {item.badge != null ? (
                <span className={styles.badge}>{item.badge}</span>
              ) : null}
            </NavLink>
          )
        })}
      </nav>

      <div className={styles.footer}>
        <Link
          to="/profile"
          className={styles.footerProfile}
          title={`${doctorProfile.shortName} · ${doctorProfile.specialty}`}
          aria-label={`Личный кабинет · ${doctorProfile.shortName}`}
        >
          <div className={styles.avatar} aria-hidden>
            {doctorProfile.initials}
          </div>
          <div className={styles.footerMeta}>
            <div className={styles.footerName}>{doctorProfile.shortName}</div>
            <div className={styles.footerRole}>{doctorProfile.specialty}</div>
          </div>
        </Link>
        <button
          type="button"
          className={styles.logout}
          aria-label="Выйти"
          title="Выйти"
          onClick={logout}
        >
          <IconLogout aria-hidden />
        </button>
      </div>
    </aside>
  )
}
