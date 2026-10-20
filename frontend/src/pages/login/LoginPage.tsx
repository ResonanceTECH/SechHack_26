import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { IconShield } from '@/components/icons/NavIcons'
import {
  DEMO_LOGIN_EMAIL,
  DEMO_LOGIN_PASSWORD,
  isDoctorAuthed,
  setDoctorAuthed,
} from '@/lib/doctorAuth'
import styles from './LoginPage.module.css'

type RoleTab = 'specialist' | 'clinic'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [roleTab, setRoleTab] = useState<RoleTab>('specialist')

  if (isDoctorAuthed()) {
    return <Navigate to="/" replace />
  }

  function loginAsDoctor() {
    const emailOk = email.trim().toLowerCase() === DEMO_LOGIN_EMAIL
    const passwordOk = password === DEMO_LOGIN_PASSWORD
    if (!emailOk || !passwordOk) {
      setError('Неверный e-mail или пароль')
      return
    }
    setDoctorAuthed(true)
    navigate('/', { replace: true })
  }

  function onAdminSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    navigate('/admin', { replace: true })
  }

  function onSpecialistLogin() {
    setError(null)
    loginAsDoctor()
  }

  return (
    <div className={styles.frame}>
      <div className={styles.canvas}>
        <aside className={styles.aside} aria-label="О продукте">
          <div className={styles.asideTop}>
            <div className={styles.brand}>
              <img
                className={styles.brandMark}
                src="/brand-logo.png"
                alt=""
                width={32}
                height={32}
                decoding="async"
              />
              <span className={styles.brandName}>Клинический компас</span>
            </div>

            <h1 className={styles.asideTitle}>
              Доступ начинается с подтверждения
            </h1>
            <p className={styles.asideSubtitle}>
              Одно рабочее пространство для вашей команды и заботы о пациентах.
            </p>

            <ol className={styles.steps}>
              <li>
                <span className={styles.stepNum}>01</span>
                <span>Подтвердите аккаунт</span>
              </li>
              <li>
                <span className={styles.stepNum}>02</span>
                <span>Присоединитесь к клинике</span>
              </li>
              <li>
                <span className={styles.stepNum}>03</span>
                <span>Получите рабочие права</span>
              </li>
            </ol>
          </div>

          <div className={styles.asideBottom}>
            <p className={styles.asideDisclaimer}>
              Клинические данные доступны только после проверки роли и
              назначения пациентов.
            </p>
            <button type="button" className={styles.demoBtn}>
              Демо · карта сценариев
            </button>
          </div>
        </aside>

        <section className={styles.main}>
          <p className={styles.eyebrow}>Для специалистов и клиник</p>

          <div className={styles.formWrap}>
            <form className={styles.form} onSubmit={onAdminSubmit} noValidate>
              <h2 className={styles.title}>Войти в рабочий кабинет</h2>
              <p className={styles.subtitle}>
                Используйте единый аккаунт. Доступ к клинике зависит от
                назначенных вам ролей.
              </p>

              <label className={styles.field}>
                <span className={styles.label}>Рабочий e-mail</span>
                <input
                  type="email"
                  className={styles.input}
                  value={email}
                  placeholder="p.orlova@ravnovesie.ru"
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(null)
                  }}
                  autoComplete="username"
                  autoFocus
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Пароль</span>
                <input
                  type="password"
                  className={styles.input}
                  value={password}
                  placeholder="••••••••••••"
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(null)
                  }}
                  autoComplete="current-password"
                />
              </label>

              {error ? <p className={styles.error}>{error}</p> : null}

              <div className={styles.actions}>
                <button type="submit" className={styles.primaryBtn}>
                  Войти как администратор
                </button>
                <button type="button" className={styles.ghostBtn}>
                  Забыли пароль?
                </button>
              </div>
            </form>

            <div className={styles.infoBox}>
              <IconShield className={styles.infoIcon} size={18} aria-hidden />
              <div className={styles.infoText}>
                <p className={styles.infoTitle}>
                  Впервые в «Клиническом компасе»?
                </p>
                <p className={styles.infoBody}>
                  Врач может подать заявку в клинику. Представитель клиники —
                  запросить подключение.
                </p>
              </div>
            </div>

            <div className={styles.roleTabs} role="tablist" aria-label="Роль">
              <button
                type="button"
                role="tab"
                aria-selected={roleTab === 'specialist'}
                className={
                  roleTab === 'specialist' ? styles.roleTabActive : styles.roleTab
                }
                onClick={() => setRoleTab('specialist')}
              >
                Я специалист
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={roleTab === 'clinic'}
                className={
                  roleTab === 'clinic' ? styles.roleTabActive : styles.roleTab
                }
                onClick={() => setRoleTab('clinic')}
              >
                Подключить клинику
              </button>
            </div>

            <button
              type="button"
              className={styles.specialistBtn}
              onClick={onSpecialistLogin}
            >
              Вход специалиста
            </button>
          </div>

          <p className={styles.help}>
            Нужна помощь? Обратитесь к администратору вашей клиники.
          </p>
        </section>
      </div>
    </div>
  )
}
