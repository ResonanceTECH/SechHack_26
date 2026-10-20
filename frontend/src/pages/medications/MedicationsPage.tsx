import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  IconCancel,
  IconExternalLink,
  IconInfo,
  IconPill,
  IconPlus,
  IconSearch,
  IconTick,
} from '@/components/icons/NavIcons'
import { findMedications } from '@/data/mockMedications'
import type { DoctorOutletContext } from '@/layouts/DoctorLayout'
import type { GrlsMedication, MedicationBadgeTone } from '@/types/doctor'
import styles from './MedicationsPage.module.css'

const badgeClass: Record<MedicationBadgeTone, string> = {
  rx: styles.badgeRx,
  monitor: styles.badgeMonitor,
  grls: styles.badgeGrls,
}

function DrugResult({ drug }: { drug: GrlsMedication }) {
  return (
    <article className={styles.result}>
      <header className={styles.hero}>
        <div className={styles.heroMain}>
          <div className={styles.pillIcon} aria-hidden>
            <IconPill size={22} color="#FFFFFF" />
          </div>
          <div className={styles.heroText}>
            <h2 className={styles.tradeName}>{drug.tradeName}</h2>
            <p className={styles.innLine}>{drug.innLine}</p>
            <p className={styles.category}>{drug.category}</p>
            <div className={styles.badges}>
              {drug.badges.map((b) => (
                <span
                  key={b.id}
                  className={`${styles.badge} ${badgeClass[b.tone]}`}
                >
                  <span className={styles.badgeDot} aria-hidden />
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.heroActions}>
          <a
            className={styles.btnGhost}
            href={drug.grlsUrl}
            target="_blank"
            rel="noreferrer"
          >
            <IconExternalLink aria-hidden />
            Открыть в ГРЛС
          </a>
          <button type="button" className={styles.btnPrimary}>
            <IconPlus aria-hidden />
            Добавить в план пациента
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.col}>
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Показания</h3>
            <ul className={styles.checkList}>
              {drug.indications.map((item) => (
                <li key={item} className={styles.checkItem}>
                  <span className={styles.checkIcon} aria-hidden>
                    <IconTick size={14} color="currentColor" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className={styles.cardFoot}>{drug.indicationsFooter}</p>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h3 className={styles.cardTitle}>Противопоказания</h3>
              <span className={styles.chipMandatory}>
                <span className={styles.chipDot} aria-hidden />
                Обязательно
              </span>
            </div>
            <ul className={styles.crossList}>
              {drug.contraindications.map((item) => (
                <li key={item} className={styles.crossItem}>
                  <span className={styles.crossIcon} aria-hidden>
                    <IconCancel />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className={styles.col}>
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Режим дозирования</h3>
            <dl className={styles.kvList}>
              {drug.dosage.map((row) => (
                <div key={row.id} className={styles.kvRow}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Нежелательные реакции</h3>
            <dl className={styles.adverseList}>
              {drug.adverse.map((row) => (
                <div key={row.id} className={styles.adverseRow}>
                  <dt>{row.label}</dt>
                  <dd
                    className={
                      row.valueTone === 'warn'
                        ? styles.adverseWarn
                        : styles.adverseInk
                    }
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className={styles.cardFoot}>{drug.adverseNote}</p>
          </section>
        </div>

        <section className={`${styles.card} ${styles.interactions}`}>
          <h3 className={styles.cardTitle}>Взаимодействия</h3>
          <div className={styles.ixStack}>
            {drug.interactions.map((ix) => (
              <div
                key={ix.id}
                className={
                  ix.severity === 'mandatory' ? styles.ixMandatory : styles.ixWarn
                }
              >
                <div className={styles.ixHead}>
                  <span className={styles.ixDot} aria-hidden />
                  {ix.severityLabel}
                </div>
                <p className={styles.ixBody}>{ix.body}</p>
                <div className={styles.ixFoot}>
                  <IconInfo aria-hidden />
                  {ix.footer}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  )
}

export function MedicationsPage() {
  const { setBreadcrumbs } = useOutletContext<DoctorOutletContext>()
  const [query, setQuery] = useState('Авиандр')

  const results = useMemo(() => findMedications(query), [query])
  const active = results[0]

  useEffect(() => {
    const crumbs = [
      { label: 'Препараты · ГРЛС', to: '/medications' },
      ...(active ? [{ label: active.shortName }] : []),
    ]
    setBreadcrumbs(crumbs)
    return () => setBreadcrumbs(null)
  }, [active, setBreadcrumbs])

  const countLabel =
    results.length === 1
      ? '1 препарат · по названию или МНН'
      : `${results.length} препаратов · по названию или МНН`

  return (
    <div className={styles.page}>
      <div className={styles.searchRow}>
        <label className={styles.search}>
          <IconSearch aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или МНН"
            aria-label="Поиск препарата по названию или МНН"
          />
        </label>
        <span className={styles.searchMeta}>{countLabel}</span>
      </div>

      {results.length === 0 ? (
        <div className={styles.empty}>Ничего не найдено по запросу «{query}»</div>
      ) : (
        results.map((drug) => <DrugResult key={drug.id} drug={drug} />)
      )}
    </div>
  )
}
