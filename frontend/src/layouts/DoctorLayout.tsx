import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import { Sidebar } from '@/components/sidebar/Sidebar'
import {
  TopBar,
  type BreadcrumbItem,
  type TopBarAction,
} from '@/components/topbar/TopBar'
import { get } from '@/lib/api'
import styles from './DoctorLayout.module.css'

const STORAGE_KEY = 'kk-sidebar-open'

const titles: Record<string, string> = {
  '/': 'Рабочий стол',
  '/patients': 'Пациенты',
  '/alerts': 'Алерты',
  '/medications': 'Препараты · ГРЛС',
  '/exercises': 'Упражнения',
}

export interface DoctorOutletContext {
  setBreadcrumbs: (crumbs: BreadcrumbItem[] | null) => void
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

export function DoctorLayout() {
  const { pathname } = useLocation()
  const { patientId } = useParams()
  const [open, setOpen] = useState(readOpen)
  const [pageCrumbs, setPageCrumbs] = useState<BreadcrumbItem[] | null>(null)
  const [patientNames, setPatientNames] = useState<Record<string, string>>({})

  const setBreadcrumbs = useCallback((crumbs: BreadcrumbItem[] | null) => {
    setPageCrumbs(crumbs)
  }, [])

  useEffect(() => {
    if (!patientId || patientNames[patientId]) return
    get<{ short_name?: string | null; full_name?: string | null; first_name?: string | null; last_name?: string | null }>(
      `/api/v1/patients/${patientId}`,
    )
      .then((data) => {
        const name =
          data.short_name ??
          data.full_name ??
          [data.last_name, data.first_name].filter(Boolean).join(' ') ??
          'Пациент'
        setPatientNames((prev) => ({ ...prev, [patientId]: name }))
      })
      .catch(() => {
        setPatientNames((prev) => ({ ...prev, [patientId]: 'Пациент' }))
      })
  }, [patientId, patientNames])

  const shortNameFor = (id: string) => patientNames[id] ?? 'Пациент'

  const topBar = useMemo((): {
    title?: string
    breadcrumbs?: BreadcrumbItem[]
    action?: TopBarAction
    hideSearch?: boolean
    rightMeta?: string
  } => {
    if (pathname === '/profile' || pathname.startsWith('/profile/')) {
      return {
        breadcrumbs:
          pageCrumbs && pageCrumbs.length > 0
            ? pageCrumbs
            : [
                { label: 'Кабинет врача', to: '/' },
                { label: 'Личный кабинет' },
              ],
        action: { label: 'Вернуться к работе', to: '/' },
        hideSearch: true,
      }
    }

    if (pageCrumbs && pageCrumbs.length > 0) {
      return { breadcrumbs: pageCrumbs, hideSearch: true }
    }

    const reportMatch = pathname.match(/^\/patients\/([^/]+)\/report\/?$/)
    if (reportMatch) {
      const id = patientId ?? reportMatch[1]
      const shortName = shortNameFor(id)
      return {
        breadcrumbs: [
          { label: 'Пациенты', to: '/patients' },
          { label: shortName, to: `/patients/${id}` },
          { label: 'Отчёт перед визитом' },
        ],
      }
    }

    const planMatch = pathname.match(/^\/patients\/([^/]+)\/plan\/?$/)
    if (planMatch) {
      const id = patientId ?? planMatch[1]
      const shortName = shortNameFor(id)
      return {
        breadcrumbs: [
          { label: 'Пациенты', to: '/patients' },
          { label: shortName, to: `/patients/${id}` },
          { label: 'План лечения' },
        ],
      }
    }

    const messagesMatch = pathname.match(/^\/patients\/([^/]+)\/messages\/?$/)
    if (messagesMatch) {
      const id = patientId ?? messagesMatch[1]
      const shortName = shortNameFor(id)
      return {
        breadcrumbs: [
          { label: 'Пациенты', to: '/patients' },
          { label: shortName, to: `/patients/${id}` },
          { label: 'Сообщения' },
        ],
      }
    }

    const match = pathname.match(/^\/patients\/([^/]+)/)
    if (match) {
      const id = patientId ?? match[1]
      const shortName = shortNameFor(id)
      return {
        breadcrumbs: [
          { label: 'Пациенты', to: '/patients' },
          { label: shortName },
        ],
      }
    }

    if (pathname === '/patients' || pathname === '/patients/') {
      return {
        breadcrumbs: [
          { label: 'Кабинет врача', to: '/' },
          { label: 'Мои пациенты' },
        ],
        hideSearch: true,
        rightMeta: 'Клиника «Равновесие»',
      }
    }

    if (pathname === '/alerts' || pathname.startsWith('/alerts/')) {
      return { title: titles['/alerts'] }
    }

    return { title: titles[pathname] ?? 'Кабинет врача' }
  }, [pathname, patientId, pageCrumbs, patientNames])

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

  const outletContext = useMemo<DoctorOutletContext>(
    () => ({ setBreadcrumbs }),
    [setBreadcrumbs],
  )

  return (
    <div className={styles.frame}>
      <div className={styles.app}>
        <Sidebar open={open} onToggle={() => setOpen((v) => !v)} />
        <div className={styles.main}>
          <TopBar
            title={topBar.title}
            breadcrumbs={topBar.breadcrumbs}
            action={topBar.action}
            hideSearch={topBar.hideSearch}
            rightMeta={topBar.rightMeta}
          />
          <main className={styles.content}>
            <Outlet context={outletContext} />
          </main>
        </div>
      </div>
    </div>
  )
}
