import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClinicSettingsModal } from '@/components/admin/ClinicSettingsModal'
import { clinicSettings } from '@/data/mockSettings'
import type { ClinicWorkSettingsDraft } from '@/types/admin'
import styles from './SettingsPage.module.css'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{value}</span>
    </div>
  )
}

function displayOrEmpty(value: string): string {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : 'Не указан'
}

export function SettingsPage() {
  const { subtitle, organization, contacts, team, audit, workForm } =
    clinicSettings

  const [editOpen, setEditOpen] = useState(false)
  const [draft, setDraft] = useState<ClinicWorkSettingsDraft>({
    email: '',
    phone: '',
    hoursId: workForm.defaultHoursId,
  })

  const hoursDisplay = useMemo(() => {
    const opt = workForm.hoursOptions.find((o) => o.id === draft.hoursId)
    return opt?.displayValue ?? contacts.hours.value
  }, [draft.hoursId, workForm.hoursOptions, contacts.hours.value])

  const closeModal = useCallback(() => setEditOpen(false), [])

  const saveDraft = useCallback((next: ClinicWorkSettingsDraft) => {
    setDraft(next)
    setEditOpen(false)
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Настройки клиники</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <button
          type="button"
          className={styles.editBtn}
          onClick={() => setEditOpen(true)}
        >
          Изменить настройки
        </button>
      </header>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <section className={styles.card} aria-label="Данные клиники">
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>Данные клиники</h2>
              {organization.confirmed ? (
                <span className={styles.confirmed}>
                  <span className={styles.confirmedDot} aria-hidden />
                  {organization.confirmedLabel}
                </span>
              ) : null}
            </div>

            <div className={styles.fieldsRow}>
              <Field
                label={organization.name.label}
                value={organization.name.value}
              />
              <Field
                label={organization.inn.label}
                value={organization.inn.value}
              />
            </div>

            <p className={styles.note}>{organization.note}</p>
          </section>

          <section
            className={styles.card}
            aria-label="Контакты и рабочее время"
          >
            <h2 className={styles.cardTitle}>Контакты и рабочее время</h2>

            <div className={styles.fieldsRow}>
              <Field
                label={contacts.email.label}
                value={displayOrEmpty(draft.email)}
              />
              <Field
                label={contacts.phone.label}
                value={displayOrEmpty(draft.phone)}
              />
            </div>

            <div className={styles.divider} />

            <div className={styles.fieldsRow}>
              <Field
                label={contacts.timezone.label}
                value={contacts.timezone.value}
              />
              <Field label={contacts.hours.label} value={hoursDisplay} />
            </div>

            <p className={styles.note}>{contacts.note}</p>
          </section>
        </div>

        <aside className={styles.sideCol}>
          <section className={styles.card} aria-label="Команда и доступ">
            <h2 className={styles.cardTitle}>Команда и доступ</h2>
            <p className={styles.cardDesc}>{team.description}</p>

            <div className={styles.linkStack}>
              <Link to="/admin/employees" className={styles.linkBtn}>
                Сотрудники и роли
              </Link>
              <Link to="/admin/employees" className={styles.linkBtn}>
                Роли и границы доступа
              </Link>
            </div>

            <div className={styles.divider} />
            <p className={styles.note}>{team.note}</p>
          </section>

          <section
            className={styles.card}
            aria-label="Изменения под контролем"
          >
            <h2 className={styles.cardTitle}>Изменения под контролем</h2>
            <p className={styles.cardDesc}>{audit.description}</p>
            <Link to="/admin/audit" className={styles.linkBtn}>
              Открыть журнал
            </Link>
          </section>
        </aside>
      </div>

      <ClinicSettingsModal
        open={editOpen}
        settings={clinicSettings}
        initial={draft}
        onClose={closeModal}
        onSave={saveDraft}
      />
    </div>
  )
}
