export type NavItemId =
  | 'dashboard'
  | 'patients'
  | 'alerts'
  | 'medications'
  | 'exercises'

export type AlertPriority = 'mandatory' | 'optional'

export type AppointmentStatus =
  | 'report_ready'
  | 'screening_done'
  | 'has_alert'
  | 'low_data'

export type PatientStatus = 'critical' | 'attention' | 'new' | 'stable'

export type ScoreTrend = 'up' | 'down' | 'same'

export type PatientsFilter =
  | 'all'
  | 'critical'
  | 'attention'
  | 'stable'
  | 'aviandr'

export interface DoctorProfile {
  fullName: string
  shortName: string
  initials: string
  specialty: string
}

export interface StatCardData {
  id: string
  title: string
  value: string
  hint: string
  tone: 'brand' | 'danger' | 'success' | 'warning'
}

export interface AttentionItem {
  id: string
  patientName: string
  age: number
  diagnosis: string
  title: string
  meta: string
  priority: AlertPriority
  tags?: string[]
  critical?: boolean
}

export interface AppointmentItem {
  id: string
  time: string
  patientName: string
  /** Surname in genitive for CTA: «Открыть отчёт Мироновой» */
  reportSurname: string
  kind: string
  format: string
  status: AppointmentStatus
}

export interface ScoreMetric {
  value: number
  previous: number
  trend: ScoreTrend
}

export interface PatientRow {
  id: string
  name: string
  initials: string
  avatarTone: 'rose' | 'amber' | 'blue' | 'green' | 'violet' | 'teal'
  age: number
  diagnosis: string
  status: PatientStatus
  phq9: ScoreMetric
  gad7: ScoreMetric
  diaryPercent: number
  aviandrPercent: number | null
  nextVisit: string
}
