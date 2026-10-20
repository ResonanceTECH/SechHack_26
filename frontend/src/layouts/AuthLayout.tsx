import type { ReactNode } from 'react'
import { IconShield } from '@/components/icons/NavIcons'
import styles from './AuthLayout.module.css'

const DEFAULT_STEPS = [
  'Подтвердите аккаунт',
  'Присоединитесь к клинике',
  'Получите рабочие права',
] as const

/** Admin activation — different labels from doctor join flow */
export const ADMIN_AUTH_STEPS = [
  'Подтвердите приглашение',
  'Создайте аккаунт',
  'Получите рабочие права',
] as const

type AuthLayoutProps = {
  children: ReactNode
  topRight?: ReactNode
  /** Show first-visit hint in the dark aside (login) */
  showFirstVisitHint?: boolean
  /** 1-based active step in the left rail */
  activeStep?: 1 | 2 | 3
  /** Admin activation flow — aside copy for clinic administrator */
  variant?: 'default' | 'admin'
  /** Override step labels */
  steps?: readonly [string, string, string]
}

export function AuthLayout({
  children,
  topRight,
  showFirstVisitHint = false,
  activeStep,
  variant = 'default',
  steps,
}: AuthLayoutProps) {
  const isAdmin = variant === 'admin'
  const asideSteps = steps ?? (isAdmin ? ADMIN_AUTH_STEPS : DEFAULT_STEPS)

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
              {isAdmin
                ? 'Доступ администратора клиники'
                : 'Доступ начинается с подтверждения'}
            </h1>
            <p className={styles.asideSubtitle}>
              {isAdmin
                ? 'Приглашение закрепляет роль и клинику. Остаётся создать аккаунт и включить защиту.'
                : 'Одно рабочее пространство для вашей команды и заботы о пациентах.'}
            </p>

            <ol className={styles.steps}>
              {asideSteps.map((label, i) => {
                const n = (i + 1) as 1 | 2 | 3
                const active = activeStep === n
                const done = activeStep != null && n < activeStep
                return (
                  <li key={label} className={styles.stepItem}>
                    {i > 0 ? (
                      <span
                        className={
                          done || active ? styles.stepRailActive : styles.stepRail
                        }
                        aria-hidden
                      />
                    ) : null}
                    <span
                      className={
                        active
                          ? styles.stepCircleActive
                          : done
                            ? styles.stepCircleDone
                            : styles.stepCircle
                      }
                      aria-current={active ? 'step' : undefined}
                    >
                      {n}
                    </span>
                    <span
                      className={
                        active ? styles.stepLabelActive : styles.stepLabel
                      }
                    >
                      {label}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>

          {showFirstVisitHint ? (
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
          ) : null}
        </aside>

        <section className={styles.main}>
          <div className={styles.topBar}>
            <p className={styles.eyebrow}>Для специалистов и клиник</p>
            {topRight}
          </div>

          <div className={styles.content}>{children}</div>

          <p className={styles.help}>
            Нужна помощь? Обратитесь к администратору вашей клиники.
          </p>
        </section>
      </div>
    </div>
  )
}
