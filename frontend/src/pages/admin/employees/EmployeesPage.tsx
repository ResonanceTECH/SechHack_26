import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  IconCancel,
  IconLink,
  IconLock,
  IconPlus,
  IconShield,
  IconTick,
} from '@/components/icons/NavIcons'
import {
  clinicInfo,
  defaultSelectedEmployeeId,
  employees,
  roleOptions,
} from '@/data/mockAdmin'
import type { AdminOutletContext } from '@/layouts/AdminLayout'
import type {
  ContourAccess,
  EmployeeRow,
  EmployeeRoleId,
  PrescriptionAccess,
} from '@/types/admin'
import styles from './EmployeesPage.module.css'

function statusLabel(row: EmployeeRow): string {
  if (row.status === 'blocked') return 'Заблокирован'
  return row.statusGender === 'f' ? 'Активна' : 'Активен'
}

function generalCell(access: ContourAccess) {
  if (access === 'full') {
    return (
      <span className={styles.accessYes}>
        <span className={styles.checkIcon} aria-hidden>
          <IconTick size={14} />
        </span>
        Есть
      </span>
    )
  }
  if (access === 'settings') {
    return <span className={styles.accessMuted}>настройки</span>
  }
  return <span className={styles.accessDash}>—</span>
}

function prescriptionCell(access: PrescriptionAccess) {
  if (access === 'prescriptions') {
    return <span className={styles.rxPill}>Назначения</span>
  }
  return <span className={styles.accessDash}>—</span>
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`${styles.toggle}${checked ? ` ${styles.toggleOn}` : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.toggleThumb} />
    </button>
  )
}

export function EmployeesPage() {
  const { searchQuery } = useOutletContext<AdminOutletContext>()
  const [selectedId, setSelectedId] = useState(defaultSelectedEmployeeId)
  const [inviteOpen, setInviteOpen] = useState(false)
  const inviteRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState<EmployeeRow | null>(() => {
    const row = employees.find((e) => e.id === defaultSelectedEmployeeId)
    return row ? { ...row } : null
  })

  useEffect(() => {
    if (!inviteOpen) return
    function onPointerDown(e: PointerEvent) {
      if (!inviteRef.current?.contains(e.target as Node)) {
        setInviteOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setInviteOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [inviteOpen])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return employees
    return employees.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.shortName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.roleLabel.toLowerCase().includes(q),
    )
  }, [searchQuery])

  function selectEmployee(id: string) {
    setSelectedId(id)
    const row = employees.find((e) => e.id === id)
    setDraft(row ? { ...row } : null)
  }

  function updateDraft(patch: Partial<EmployeeRow>) {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  function onRoleChange(roleId: EmployeeRoleId) {
    const opt = roleOptions.find((r) => r.id === roleId)
    if (!opt || !draft) return
    updateDraft({
      roleId,
      roleLabel: opt.label,
      roleDescription: opt.description,
    })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Сотрудники и роли</h1>
          <p className={styles.subtitle}>
            {clinicInfo.name} · {clinicInfo.employeeCount} сотрудников ·{' '}
            {clinicInfo.contourCount} контура доступа
          </p>
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
            Пригласить сотрудника
          </button>
          {inviteOpen ? (
            <div className={styles.inviteMenu} role="menu">
              <Link
                to="/admin/invite-doctor"
                role="menuitem"
                className={styles.inviteItem}
                onClick={() => setInviteOpen(false)}
              >
                Пригласить врача
              </Link>
              <Link
                to="/admin/invite-admin"
                role="menuitem"
                className={styles.inviteItem}
                onClick={() => setInviteOpen(false)}
              >
                Пригласить администратора
              </Link>
            </div>
          ) : null}
        </div>
      </header>

      <div className={styles.body}>
        <section className={styles.tableCard} aria-label="Список сотрудников">
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colEmployee}>Сотрудник</th>
                <th className={styles.colRole}>Роль</th>
                <th className={styles.colGeneral}>Общий контур</th>
                <th className={styles.colRx}>Рецептурный контур</th>
                <th className={styles.colStatus}>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const isSelected = row.id === selectedId
                return (
                  <tr
                    key={row.id}
                    className={isSelected ? styles.rowSelected : undefined}
                    onClick={() => selectEmployee(row.id)}
                    aria-selected={isSelected}
                  >
                    <td>
                      <div className={styles.person}>
                        <span
                          className={`${styles.avatar} ${styles[`tone_${row.avatarTone}`]}`}
                          aria-hidden
                        >
                          {row.initials}
                        </span>
                        <div className={styles.personMeta}>
                          <span className={styles.personName}>
                            {row.shortName}
                          </span>
                          <span className={styles.personEmail}>{row.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.role}>{row.roleLabel}</span>
                    </td>
                    <td>{generalCell(row.generalContour)}</td>
                    <td>{prescriptionCell(row.prescriptionContour)}</td>
                    <td>
                      <span
                        className={`${styles.status}${
                          row.status === 'blocked' ? ` ${styles.statusBlocked}` : ''
                        }`}
                      >
                        <span className={styles.statusDot} aria-hidden />
                        {statusLabel(row)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        {draft ? (
          <aside className={styles.panel} aria-label="Карточка сотрудника">
            <div className={styles.panelHead}>
              <span
                className={`${styles.panelAvatar} ${styles[`tone_${draft.avatarTone}`]}`}
                aria-hidden
              >
                {draft.initials}
              </span>
              <div className={styles.panelHeadMeta}>
                <h2 className={styles.panelName}>{draft.fullName}</h2>
                <p className={styles.panelEmail}>{draft.email}</p>
                <p className={styles.panelSince}>
                  в клинике с {draft.inClinicSince}
                </p>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel} htmlFor="employee-role">
                Роль
              </label>
              <div className={styles.selectWrap}>
                <select
                  id="employee-role"
                  className={styles.select}
                  value={draft.roleId}
                  onChange={(e) =>
                    onRoleChange(e.target.value as EmployeeRoleId)
                  }
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className={styles.fieldHint}>{draft.roleDescription}</p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Доступ к контурам</h3>

              <div className={styles.contourCard}>
                <div className={`${styles.contourIcon} ${styles.contourGeneral}`}>
                  <IconShield aria-hidden />
                </div>
                <div className={styles.contourMeta}>
                  <span className={styles.contourTitle}>Общий контур</span>
                  <span className={styles.contourDesc}>
                    дневники · опросники · программы · алерты
                  </span>
                </div>
                <Toggle
                  checked={draft.generalEnabled}
                  onChange={(v) => updateDraft({ generalEnabled: v })}
                  label="Общий контур"
                />
              </div>

              <div className={styles.contourCard}>
                <div className={`${styles.contourIcon} ${styles.contourRx}`}>
                  <IconLink aria-hidden />
                </div>
                <div className={styles.contourMeta}>
                  <span className={styles.contourTitle}>Рецептурный контур</span>
                  <span className={styles.contourDesc}>
                    только для ролей с правом назначения
                  </span>
                </div>
                <Toggle
                  checked={draft.prescriptionEnabled}
                  onChange={(v) => updateDraft({ prescriptionEnabled: v })}
                  label="Рецептурный контур"
                />
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Права роли</h3>
              <ul className={styles.perms}>
                {draft.permissions.map((p) => (
                  <li key={p.id} className={styles.perm}>
                    <span
                      className={
                        p.allowed ? styles.permOk : styles.permNo
                      }
                      aria-hidden
                    >
                      {p.allowed ? (
                        <IconTick size={14} />
                      ) : (
                        <IconCancel size={14} />
                      )}
                    </span>
                    <span>{p.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.btnSecondary}>
                <IconLock aria-hidden />
                Отправить сброс
              </button>
              <button type="button" className={styles.btnPrimary}>
                <IconTick aria-hidden />
                Изменить роли
              </button>
            </div>

            <p className={styles.legal}>
              Изменения ролей и доступов фиксируются в журнале аудита
              согласно 152-ФЗ.
            </p>
          </aside>
        ) : null}
      </div>
    </div>
  )
}
