import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconPlus, IconShieldCheck } from '@/components/icons/NavIcons'
import {
  applicationsEmptyHero,
  applicationsEmptyTips,
  applicationsMeta,
} from '@/data/mockApplications'
import styles from './ApplicationsPage.module.css'

export function ApplicationsPage() {
  const [inviteOpen, setInviteOpen] = useState(false)
  const inviteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!inviteOpen) return
    function onPointerDown(e: PointerEvent) {
      if (!inviteRef.current?.contains(e.target as Node)) {
        setInviteOpen(false)
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setInviteOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [inviteOpen])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{applicationsMeta.title}</h1>
          <p className={styles.subtitle}>{applicationsMeta.emptySubtitle}</p>
        </div>
        <div className={styles.inviteWrap} ref={inviteRef}>
          <button
            type="button"
            className={styles.addBtn}
            aria-expanded={inviteOpen}
            aria-haspopup="menu"
            onClick={() => setInviteOpen((v) => !v)}
          >
            <IconPlus aria-hidden />
            {applicationsMeta.inviteLabel}
          </button>
          {inviteOpen ? (
            <div className={styles.inviteMenu} role="menu">
              <Link
                to="/admin/invite-doctor"
                role="menuitem"
                className={styles.inviteItem}
                onClick={() => setInviteOpen(false)}
              >
                {applicationsMeta.inviteDoctorLabel}
              </Link>
              <Link
                to="/admin/invite-admin"
                role="menuitem"
                className={styles.inviteItem}
                onClick={() => setInviteOpen(false)}
              >
                {applicationsMeta.inviteAdminLabel}
              </Link>
            </div>
          ) : null}
        </div>
      </header>

      <div className={styles.body}>
        <article className={styles.heroCard}>
          <span className={styles.cardIcon} aria-hidden>
            <IconShieldCheck />
          </span>
          <div className={styles.cardMeta}>
            <h2 className={styles.heroTitle}>{applicationsEmptyHero.title}</h2>
            <p className={styles.heroBody}>{applicationsEmptyHero.body}</p>
          </div>
        </article>

        <aside className={styles.tips} aria-label="Справка">
          {applicationsEmptyTips.map((tip) => (
            <article key={tip.id} className={styles.tipCard}>
              <span className={styles.cardIcon} aria-hidden>
                <IconShieldCheck />
              </span>
              <div className={styles.cardMeta}>
                <h3 className={styles.tipTitle}>{tip.title}</h3>
                <p className={styles.tipBody}>{tip.body}</p>
              </div>
            </article>
          ))}
        </aside>
      </div>
    </div>
  )
}
