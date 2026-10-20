import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { TopBar } from '@/components/topbar/TopBar'
import styles from './DoctorLayout.module.css'

const STORAGE_KEY = 'kk-sidebar-open'

const titles: Record<string, string> = {
  '/': 'Рабочий стол',
  '/patients': 'Пациенты',
  '/alerts': 'Алерты',
  '/medications': 'Препараты · ГРЛС',
  '/exercises': 'Упражнения',
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
  const title = titles[pathname] ?? 'Кабинет врача'
  const [open, setOpen] = useState(readOpen)

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

  return (
    <div className={styles.frame}>
      <div className={styles.app}>
        <Sidebar open={open} onToggle={() => setOpen((v) => !v)} />
        <div className={styles.main}>
          <TopBar title={title} />
          <main className={styles.content}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
