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
  }
> = {
  '/admin/employees': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Сотрудники и роли' },
    ],
    searchPlaceholder: 'Поиск сотрудника...',
  },
  '/admin/analytics': {
    crumbs: [
      { label: 'Администрирование' },
      { label: 'Аналитика клиники' },
    ],
    searchPlaceholder: 'Поиск сотрудника...',
  },
  '/admin/audit': {
    crumbs: [{ label: 'Администрирование' }, { label: 'Журнал аудита' }],
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
          />
          <main className={styles.content}>
            <Outlet context={outletContext} />
          </main>
        </div>
      </div>
    </div>
  )
}
