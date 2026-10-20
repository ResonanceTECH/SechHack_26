import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import {
  AdminTopBar,
  type AdminBreadcrumbItem,
} from '@/components/admin/AdminTopBar'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import styles from './AdminLayout.module.css'

const STORAGE_KEY = 'kk-admin-sidebar-open'

const pageMeta: Record<
  string,
  {
    crumbs: AdminBreadcrumbItem[]
    searchPlaceholder: string
    compactTopBar?: boolean
    action?: { label: string; to: string }
  }
> = {
  '/admin/welcome': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Добро пожаловать в клинику' },
    ],
    searchPlaceholder: 'Поиск...',
    compactTopBar: true,
  },
  '/admin/invite-doctor': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Пригласить врача' },
    ],
    searchPlaceholder: 'Поиск...',
    compactTopBar: true,
  },
  '/admin/invite-admin': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Пригласить администратора' },
    ],
    searchPlaceholder: 'Поиск...',
    compactTopBar: true,
  },
  '/admin/invite-sent': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Приглашение отправлено' },
    ],
    searchPlaceholder: 'Поиск...',
    compactTopBar: true,
  },
  '/admin/applications': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Заявки и проверка сотрудников' },
    ],
    searchPlaceholder: 'Поиск...',
    compactTopBar: true,
  },
  '/admin/verify-doctor': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Проверка врача и назначение роли' },
    ],
    searchPlaceholder: 'Поиск...',
    compactTopBar: true,
  },
  '/admin/request-clarification': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Запросить уточнение профиля' },
    ],
    searchPlaceholder: 'Поиск...',
    compactTopBar: true,
  },
  '/admin/reject-application': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Отклонить заявку сотрудника' },
    ],
    searchPlaceholder: 'Поиск...',
    compactTopBar: true,
  },
  '/admin/confirm-role': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Подтвердите изменение роли' },
    ],
    searchPlaceholder: 'Поиск...',
    compactTopBar: true,
  },
  '/admin/suspend-access': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Приостановить доступ сотрудника' },
    ],
    searchPlaceholder: 'Поиск...',
    compactTopBar: true,
  },
  '/admin/roles': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Роли и границы доступа' },
    ],
    searchPlaceholder: 'Поиск...',
    compactTopBar: true,
  },
  '/admin/employees': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Сотрудники и роли' },
    ],
    searchPlaceholder: 'Поиск сотрудника...',
  },
  '/admin/employee-card': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Карточка сотрудника' },
    ],
    searchPlaceholder: 'Поиск...',
    compactTopBar: true,
  },
  '/admin/team': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Команда клиники' },
    ],
    searchPlaceholder: 'Поиск...',
    compactTopBar: true,
  },
  '/admin/analytics': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Аналитика клиники' },
    ],
    searchPlaceholder: 'Поиск сотрудника...',
  },
  '/admin/audit': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Журнал доступа и приглашений' },
    ],
    searchPlaceholder: 'Поиск по журналу...',
    compactTopBar: true,
  },
  '/admin/settings': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Настройки клиники' },
    ],
    searchPlaceholder: 'Поиск...',
    compactTopBar: true,
  },
  '/admin/profile': {
    crumbs: [
      { label: 'Администрирование', to: '/admin/employees' },
      { label: 'Личный кабинет' },
    ],
    searchPlaceholder: 'Поиск...',
    compactTopBar: true,
    action: { label: 'Вернуться к работе', to: '/admin/employees' },
  },
}

export interface AdminOutletContext {
  searchQuery: string
  setSearchQuery: (value: string) => void
}

function readOpen(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw == null) return true
    return raw === '1'
  } catch {
    return true
  }
}

export function AdminLayout() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(readOpen)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchPath, setSearchPath] = useState(pathname)

  if (pathname !== searchPath) {
    setSearchPath(pathname)
    setSearchQuery('')
  }

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, open ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [open])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 's') return
      if (!(e.metaKey || e.ctrlKey) || !e.shiftKey) return
      e.preventDefault()
      setOpen((v) => !v)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const meta = pageMeta[pathname] ?? {
    crumbs: [{ label: 'Администрирование' }],
    searchPlaceholder: 'Поиск...',
  }

  const outletContext = useMemo<AdminOutletContext>(
    () => ({ searchQuery, setSearchQuery }),
    [searchQuery],
  )

  return (
    <div className={styles.frame}>
      <div className={styles.app}>
        <AdminSidebar open={open} onToggle={() => setOpen((v) => !v)} />
        <div className={styles.main}>
          <AdminTopBar
            breadcrumbs={meta.crumbs}
            searchPlaceholder={meta.searchPlaceholder}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            compact={meta.compactTopBar}
            action={meta.action}
          />
          <main className={styles.content}>
            <Outlet context={outletContext} />
          </main>
        </div>
      </div>
    </div>
  )
}
