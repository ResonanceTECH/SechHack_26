import { Link } from 'react-router-dom'
import { IconArrowLeft } from '@/components/icons/NavIcons'
import type { QuestionnaireResultDetail } from '@/types/doctor'
import styles from './QuestionnaireResultView.module.css'

interface QuestionnaireResultViewProps {
  result: QuestionnaireResultDetail
  onBack: () => void
}

export function QuestionnaireResultView({
  result,
  onBack,
}: QuestionnaireResultViewProps) {
  return (
    <div className={styles.root}>
      <button type="button" className={styles.backBtn} onClick={onBack}>
        <IconArrowLeft aria-hidden />
        К истории опросников
      </button>

      <header className={styles.head}>
        <h3 className={styles.title}>Результаты опросников</h3>
        <time className={styles.filledAt}>{result.filledAt}</time>
      </header>

      <div className={styles.scores}>
        {result.scores.map((s) => (
          <section key={s.id} className={styles.scoreCard}>
            <p className={styles.scoreLabel}>{s.label}</p>
            <p className={styles.scoreValue}>{s.value}</p>
            <p className={styles.scoreFoot}>{s.footnote}</p>
          </section>
        ))}
      </div>

      <section className={styles.q9Card} aria-label={result.q9Title}>
        <h4 className={styles.q9Title}>{result.q9Title}</h4>
        <p className={styles.q9Value}>{result.q9Value}</p>

        {result.alert ? (
          <>
            <div className={styles.alertBox} role="status">
              <p className={styles.alertStatus}>{result.alert.statusLabel}</p>
              <p className={styles.alertHint}>{result.alert.hint}</p>
            </div>
            <Link to={result.alert.ctaTo} className={styles.alertCta}>
              {result.alert.cta}
            </Link>
          </>
        ) : null}
      </section>
    </div>
  )
}
