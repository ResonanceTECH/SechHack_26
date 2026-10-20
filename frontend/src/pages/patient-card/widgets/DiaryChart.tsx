import type { DiarySeriesPoint } from '@/types/doctor'
import styles from './DiaryChart.module.css'

interface DiaryChartProps {
  points: DiarySeriesPoint[]
  /** overview — линия сна; diary — точки «Сон (плохо)» у оси */
  variant?: 'overview' | 'diary'
}

const W = 640
const H = 220
const PAD = { top: 16, right: 12, bottom: 28, left: 28 }
const Y_MAX = 10

function xAt(i: number, n: number) {
  const inner = W - PAD.left - PAD.right
  return PAD.left + (i / Math.max(n - 1, 1)) * inner
}

function yAt(v: number) {
  const inner = H - PAD.top - PAD.bottom
  return PAD.top + ((Y_MAX - v) / Y_MAX) * inner
}

function pathFor(
  points: DiarySeriesPoint[],
  key: 'mood' | 'anxiety' | 'sleep',
): string {
  let d = ''
  let drawing = false
  points.forEach((p, i) => {
    const v = p[key]
    if (v == null) {
      drawing = false
      return
    }
    const x = xAt(i, points.length)
    const y = yAt(v)
    if (!drawing) {
      d += `M ${x} ${y}`
      drawing = true
    } else {
      d += ` L ${x} ${y}`
    }
  })
  return d
}

export function DiaryChart({ points, variant = 'overview' }: DiaryChartProps) {
  const n = points.length
  const mood = pathFor(points, 'mood')
  const anxiety = pathFor(points, 'anxiety')
  const sleep = pathFor(points, 'sleep')
  const diary = variant === 'diary'
  const sleepBaseline = H - PAD.bottom - 4

  const xLabels = diary
    ? ([[0, '19 сен'], [29, '18 окт']] as const)
    : ([
        [0, '19 сен'],
        [7, '26 сен'],
        [14, '3 окт'],
        [21, '10 окт'],
        [29, '18 окт'],
      ] as const)

  return (
    <div className={styles.wrap}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="График дневника за 30 дней"
      >
        {[2, 4, 6, 8, 10].map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={yAt(v)}
              y2={yAt(v)}
              className={styles.grid}
            />
            <text x={PAD.left - 8} y={yAt(v) + 3} className={styles.axis}>
              {v}
            </text>
          </g>
        ))}

        {points.map((p, i) => {
          if (!p.gap && !p.worsenZone) return null
          const x = xAt(i, n)
          const prev = i > 0 ? xAt(i - 1, n) : x
          const next = i < n - 1 ? xAt(i + 1, n) : x
          const half = (next - prev) / 2
          const barW = Math.max(half * 0.9, 6)
          return (
            <rect
              key={`zone-${p.day}`}
              x={x - barW / 2}
              y={PAD.top}
              width={barW}
              height={H - PAD.top - PAD.bottom}
              className={p.gap ? styles.gap : styles.worsen}
            />
          )
        })}

        {!diary ? (
          <path d={sleep} className={styles.sleep} fill="none" />
        ) : null}

        <path d={anxiety} className={styles.anxiety} fill="none" />
        <path d={mood} className={styles.mood} fill="none" />

        {diary
          ? points.map((p, i) => {
              if (p.sleep == null || p.sleep > 5.5) return null
              return (
                <circle
                  key={`sleep-${p.day}`}
                  cx={xAt(i, n)}
                  cy={sleepBaseline}
                  r={3}
                  className={styles.dotSleep}
                />
              )
            })
          : null}

        {(['mood', 'anxiety'] as const).map((key) => {
          const last = [...points]
            .map((p, i) => ({ p, i }))
            .reverse()
            .find(({ p }) => p[key] != null)
          if (!last || last.p[key] == null) return null
          return (
            <circle
              key={key}
              cx={xAt(last.i, n)}
              cy={yAt(last.p[key]!)}
              r={3.5}
              className={key === 'mood' ? styles.dotMood : styles.dotAnxiety}
            />
          )
        })}

        {xLabels.map(([i, label]) => (
          <text
            key={label}
            x={xAt(i, n)}
            y={H - 8}
            textAnchor={diary ? (i === 0 ? 'start' : 'end') : 'middle'}
            className={styles.axisX}
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  )
}
