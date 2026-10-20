export type NavItemId =
  | 'dashboard'
  | 'patients'
  | 'alerts'
  | 'medications'
  | 'exercises'

export type AlertPriority = 'mandatory' | 'optional'

export type AlertQueueTab = 'new' | 'in_progress' | 'closed'

export type AlertRiskLevel = 'low' | 'medium' | 'high'

export type AlertRoutingId = 'earlier_visit' | 'emergency' | 'observe'

export type AlertTimelineTone = 'done' | 'pending'

export interface AlertQueueItem {
  id: string
  patientId: string
  patientShortName: string
  patientFullName: string
  patientAge: number
  initials: string
  avatarTone: 'rose' | 'amber' | 'blue' | 'green' | 'violet' | 'teal'
  timeLabel: string
  summary: string
  priority: AlertPriority
  tab: AlertQueueTab
  /** Если задан — клик ведёт на отдельный экран */
  detailRoute?: string
  selectedTone?: 'critical'
}

export interface AlertDataRow {
  id: string
  label: string
  value: string
  valueTone?: 'danger' | 'warning' | 'brand' | 'muted'
}

export interface AlertTimelineStep {
  id: string
  time?: string
  text: string
  tone: AlertTimelineTone
}

export interface AlertRoutingOption {
  id: AlertRoutingId
  title: string
  subtitle?: string
}

export interface AlertDetail {
  id: string
  priority: AlertPriority
  statusChip: string
  title: string
  meta: string
  dataRows: AlertDataRow[]
  timeline: AlertTimelineStep[]
  routing: AlertRoutingOption[]
  commentDefault: string
  riskDefault: AlertRiskLevel
  routingDefault: AlertRoutingId
}

export type AlertChipTone = 'danger' | 'violet' | 'muted'

export type AlertSymptomTone = 'rash' | 'itch' | 'drowsy'

export type TherapyActionId = 'suspend' | 'continue' | 'replace'

export interface AlertChip {
  id: string
  label: string
  tone: AlertChipTone
}

export interface AlertSymptomTag {
  id: string
  label: string
  tone: AlertSymptomTone
}

export interface AlertReportField {
  id: string
  label: string
  value: string
  italic?: boolean
}

export interface AlertEvidenceItem {
  id: string
  tag: string
  text: string
}

export interface TherapyActionOption {
  id: TherapyActionId
  title: string
  subtitle?: string
}

/** Карточка нежелательного явления (экран алертов) */
export interface AdverseEventAlert {
  id: string
  patientId: string
  patientFullName: string
  patientAge: number
  crumbKind: string
  chips: AlertChip[]
  title: string
  subtitle: string
  report: {
    sourceLabel: string
    symptoms: AlertSymptomTag[]
    fields: AlertReportField[]
  }
  evidence: AlertEvidenceItem[]
  suggestion: string
  therapyOptions: TherapyActionOption[]
  therapyDefault: TherapyActionId
  registerDefault: boolean
}

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

export type ProfileTabId = 'personal' | 'security' | 'notifications'

export interface DoctorProfile {
  fullName: string
  shortName: string
  initials: string
  specialty: string
  lastName: string
  firstName: string
  middleName: string
  about: string
  email: string
  phone: string
  clinicName: string
  specialtyLabel: string
  accreditationUntil: string
  verifiedByClinic: boolean
  prescriptionContourConfirmed: boolean
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

export type PatientCardTab =
  | 'overview'
  | 'questionnaires'
  | 'diary'
  | 'program'
  | 'medications'
  | 'visits'
  | 'access'

export type MessageAvatarTone =
  | 'rose'
  | 'amber'
  | 'blue'
  | 'green'
  | 'violet'
  | 'teal'

export type ChatMessageKind = 'incoming' | 'outgoing' | 'system'

export interface DialogListItem {
  id: string
  patientId: string
  patientShortName: string
  patientFullName: string
  initials: string
  avatarTone: MessageAvatarTone
  preview: string
  timeLabel: string
  unread?: number
}

export interface ChatTextMessage {
  id: string
  kind: 'incoming' | 'outgoing'
  text: string
  /** CSS placeholder for attached photo (incoming) */
  photo?: boolean
}

export interface ChatSystemCard {
  id: string
  kind: 'system'
  text: string
  ctaLabel: string
  ctaTo: string
}

export type ChatMessage = ChatTextMessage | ChatSystemCard

export interface ChatThread {
  patientId: string
  patientFullName: string
  subtitle: string
  messages: ChatMessage[]
  quickReplies: string[]
  footerNote: string
}

export type ProgramTaskStatus = 'not_started' | 'in_progress' | 'done'

export interface PatientBadge {
  id: string
  label: string
  tone: 'critical' | 'aviandr' | 'info' | 'appointment'
  /** Показать иконку календаря (бейдж приёма) */
  withCalendar?: boolean
}

export interface PatientAlertBanner {
  id: string
  priorityLabel: string
  title: string
  body: string
  cta: string
}

export interface DiarySeriesPoint {
  day: number
  mood: number | null
  anxiety: number | null
  sleep: number | null
  gap?: boolean
  worsenZone?: boolean
}

export interface QuestionnaireSnapshot {
  id: string
  code: string
  score: number
  max: number
  previous: number
  trend: ScoreTrend
  trendLabel: string
  dates: [string, string]
  bars: [number, number]
  note?: string
}

/** Вкладка «Опросники» в карточке пациента */
export interface QuestionnaireSummaryCard {
  id: string
  label: string
  value: string
  footnote: string
}

export interface QuestionnaireHistoryRow {
  id: string
  dateLabel: string
  phq9: number
  gad7: number
  q9Label: string
  q9Danger?: boolean
}

export interface PatientQuestionnairesTab {
  summary: QuestionnaireSummaryCard[]
  historyTitle: string
  historyHint: string
  history: QuestionnaireHistoryRow[]
}

/** Вкладка «Дневник» в карточке пациента */
export interface DiaryLastEntryMetric {
  id: string
  label: string
  value: string
}

export interface DiaryLastEntry {
  title: string
  sourceBadge: string
  metrics: DiaryLastEntryMetric[]
}

export interface DiaryFillCard {
  title: string
  percent: string
  detail: string
  weekNote: string
}

export interface DiaryMessageCard {
  statusLabel: string
  title: string
  body: string
  cta: string
}

export interface PatientDiaryTab {
  chartTitle: string
  chartFootnote: string
  points: DiarySeriesPoint[]
  lastEntry: DiaryLastEntry
  fill: DiaryFillCard
  message: DiaryMessageCard
}

export type ProgramTabTaskStatus = 'in_progress' | 'done' | 'not_started'

export interface ProgramTabTask {
  id: string
  title: string
  subtitle: string
  status: ProgramTabTaskStatus
  statusLabel: string
}

export interface ProgramSideCard {
  title: string
  body: string
  cta: string
  ctaTone: 'soft' | 'primary'
}

export interface PatientProgramTab {
  tasksTitle: string
  weekBadge: string
  tasks: ProgramTabTask[]
  observation: ProgramSideCard
  addTask: ProgramSideCard
}

/** Вкладка «Препараты» в карточке пациента */
export interface PatientMedDrug {
  title: string
  contourBadge: string
  schedule: string
  courseLine: string
  planLine: string
  adherenceLabel: string
  adherencePercent: string
  adherenceDoses: string
  adherenceNote: string
  grlsCta: string
  grlsTo: string
}

export interface PatientMedAlertCard {
  statusLabel: string
  title: string
  body: string
  cta: string
}

export interface PatientMedPlanCard {
  title: string
  body: string
  cta: string
}

export interface PatientMedicationsTab {
  drug: PatientMedDrug
  alert: PatientMedAlertCard
  plan: PatientMedPlanCard
}

/** Вкладка «Визиты и заметки» */
export interface VisitAppointment {
  statusLabel: string
  datetime: string
  kindLine: string
  doctorLine: string
  reportCta: string
  transferTitle: string
  transferBody: string
  alertCta: string
}

export interface VisitNote {
  title: string
  body: string
  disclaimer: string
  editCta: string
}

export type VisitHistoryAction = 'plan' | 'questionnaires'

export interface VisitHistoryRow {
  id: string
  dateLabel: string
  text: string
  actionLabel: string
  action: VisitHistoryAction
}

export interface PatientVisitsTab {
  appointment: VisitAppointment
  note: VisitNote
  historyTitle: string
  history: VisitHistoryRow[]
}

export interface ProgramTask {
  id: string
  title: string
  status: ProgramTaskStatus
  statusLabel: string
  progressLabel?: string
}

export interface MedicationCard {
  id: string
  name: string
  dose: string
  schedule: string
  adherence: number
  sideEffects: string
  warnings: string
  contourLabel: string
}

export interface SystemSummary {
  title: string
  body: string
  basedOn: string
  decisionNote: string
}

export interface PatientCard {
  id: string
  fullName: string
  shortName: string
  initials: string
  age: number
  diagnosisCode: string
  inProgramSince: string
  leadDoctor: string
  badges: PatientBadge[]
  alert: PatientAlertBanner | null
  diary: {
    title: string
    footnote: string
    points: DiarySeriesPoint[]
  }
  questionnaires: QuestionnaireSnapshot[]
  program: {
    title: string
    weekProgress: number
    weekLabel: string
    tasks: ProgramTask[]
  }
  medication: MedicationCard | null
  summary: SystemSummary
}

export type MetricBadgeTone =
  | 'success'
  | 'muted'
  | 'info'
  | 'warning'
  | 'aviandr'

export interface ReportMetric {
  id: string
  label: string
  value: string
  footnote: string
  badge: string
  badgeTone: MetricBadgeTone
}

export type AttentionIcon = 'trend' | 'alert' | 'pill' | 'calendar'

export interface AttentionItemReport {
  id: string
  icon: AttentionIcon
  text: string
  meta?: string
}

export type SleepDayTone = 'ok' | 'bad' | 'hard' | 'empty'

export interface SleepDay {
  id: string
  tone: SleepDayTone
  label?: string
}

export interface PatientQuestion {
  id: string
  text: string
}

export interface PeriodAlert {
  id: string
  priority: AlertPriority
  title: string
  when: string
}

export interface PreVisitReport {
  patientId: string
  shortName: string
  initials: string
  periodLabel: string
  appointmentLabel: string
  generatedLabel: string
  metrics: ReportMetric[]
  attention: AttentionItemReport[]
  sleep: {
    title: string
    days: SleepDay[]
  }
  questions: PatientQuestion[]
  alerts: PeriodAlert[]
  notes: string
}

export type ExerciseCategory =
  | 'breathing'
  | 'thought_diary'
  | 'behavioral'
  | 'relaxation'

export type ExerciseIconTone =
  | 'blue'
  | 'rose'
  | 'amber'
  | 'green'
  | 'teal'
  | 'violet'

export type ExerciseIconId =
  | 'lungs'
  | 'heart'
  | 'notebook'
  | 'calendar'
  | 'leaf'
  | 'walk'

export interface ExerciseItem {
  id: string
  title: string
  category: ExerciseCategory
  categoryLabel: string
  durationMin: number
  description: string
  icon: ExerciseIconId
  iconTone: ExerciseIconTone
}

export type AssignFrequency = 'daily' | 'every_other_day' | 'weekly'

export type AssignReminder = 'morning' | 'evening' | 'daytime'

export interface ExerciseAssignPatient {
  id: string
  shortName: string
  initials: string
  age: number
  programLabel: string
}

/* ── Препараты · ГРЛС ─────────────────────────────── */

export type MedicationBadgeTone = 'rx' | 'monitor' | 'grls'

export type InteractionSeverity = 'mandatory' | 'preferred'

export interface MedicationBadge {
  id: string
  label: string
  tone: MedicationBadgeTone
}

export interface MedicationDoseRow {
  id: string
  label: string
  value: string
}

export interface MedicationAdverseRow {
  id: string
  label: string
  value: string
  valueTone?: 'warn' | 'ink'
}

export interface MedicationInteraction {
  id: string
  severity: InteractionSeverity
  severityLabel: string
  body: string
  footer: string
}

export interface GrlsMedication {
  id: string
  tradeName: string
  shortName: string
  innLine: string
  category: string
  badges: MedicationBadge[]
  grlsUrl: string
  indications: string[]
  indicationsFooter: string
  contraindications: string[]
  dosage: MedicationDoseRow[]
  adverse: MedicationAdverseRow[]
  adverseNote: string
  interactions: MedicationInteraction[]
}

/** D07 — план лечения */
export type PlanFieldLock = 'locked' | 'editable'

export interface PlanDoseField {
  id: string
  label: string
  value: string
  lock: PlanFieldLock
}

export interface PlanDrugBlock {
  contourLabel: string
  title: string
  schedule: string
  statusLabel: string
  fields: PlanDoseField[]
  validationNote: string
}

export type PlanExerciseStatus = 'new' | 'active'

export interface PlanExerciseItem {
  id: string
  title: string
  status: PlanExerciseStatus
  statusLabel: string
}

export type SafetyTone = 'critical' | 'warning' | 'caution'

export interface PlanSafetyCheck {
  id: string
  tone: SafetyTone
  priorityLabel: string
  title: string
  historyLabel: string
  historyOk: boolean
}

export interface TreatmentPlan {
  patientId: string
  shortName: string
  initials: string
  draftLabel: string
  versionLabel: string
  drug: PlanDrugBlock
  exercises: PlanExerciseItem[]
  recommendations: string[]
  safety: PlanSafetyCheck[]
  consentDefault: boolean
}
