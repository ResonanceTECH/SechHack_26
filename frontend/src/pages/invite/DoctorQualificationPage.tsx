import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import styles from './DoctorQualificationPage.module.css'

type LocationState = {
  email?: string
  fullName?: string
}

export function DoctorQualificationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState | null) ?? null

  const [fullName, setFullName] = useState(
    state?.fullName?.trim() || 'Соколова Елена Сергеевна',
  )
  const [specialty, setSpecialty] = useState('Психиатрия')
  const [accreditation, setAccreditation] = useState(
    '7725 004812 · до 20.10.2030',
  )
  const [documentName] = useState('Аккредитация_Соколова.pdf · 1,4 МБ')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    navigate('/invite/doctor/pending', {
      replace: true,
      state: {
        email: state?.email?.trim() || 'e.sokolova@ravnovesie.ru',
        fullName,
        clinicName: 'клиника «Равновесие»',
      },
    })
  }

  return (
    <AuthLayout
      activeStep={3}
      topRight={
        <Link to="/login" className={styles.loginLink}>
          Войти
        </Link>
      }
    >
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <h2 className={styles.title}>Подтвердите квалификацию</h2>
        <p className={styles.subtitle}>
          Эти данные проверит администратор клиники. Специальность и роль должны
          соответствовать документам.
        </p>

        <label className={styles.field}>
          <span className={styles.label}>ФИО по документам</span>
          <input
            type="text"
            className={styles.input}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            autoFocus
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Специальность</span>
          <input
            type="text"
            className={styles.input}
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            Номер и срок действия аккредитации
          </span>
          <input
            type="text"
            className={styles.input}
            value={accreditation}
            onChange={(e) => setAccreditation(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Документ о квалификации</span>
          <div className={styles.fileField}>
            <span className={styles.fileName}>{documentName}</span>
            <button type="button" className={styles.fileBtn}>
              Заменить
            </button>
          </div>
          <span className={styles.hint}>
            Документ видят только уполномоченные сотрудники клиники
          </span>
        </label>

        <button type="submit" className={styles.primaryBtn}>
          Отправить на проверку
        </button>
      </form>
    </AuthLayout>
  )
}
