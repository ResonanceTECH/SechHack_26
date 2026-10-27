import {
  scenarioCards,
  scenarioLinks,
  scenariosMeta,
} from '@/data/mockScenarios'
import styles from './ScenariosPage.module.css'

export function ScenariosPage() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.badge}>
            <span className={styles.badgeDot} aria-hidden />
            {scenariosMeta.badge}
          </span>
          <h1 className={styles.title}>{scenariosMeta.title}</h1>
          <p className={styles.subtitle}>{scenariosMeta.subtitle}</p>
        </header>

        <div className={styles.grid}>
          {scenarioCards.map((card) => (
            <article key={card.id} className={styles.card}>
              <h2 className={styles.cardTitle}>{card.title}</h2>
              <p className={styles.cardFlow}>{card.flow}</p>
              <button type="button" className={styles.cardCta}>
                {card.cta}
              </button>
            </article>
          ))}
        </div>

        <nav className={styles.links} aria-label="Дополнительные экраны">
          {scenarioLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              className={
                link.variant === 'outline' ? styles.linkOutline : styles.linkSoft
              }
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
