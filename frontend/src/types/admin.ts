export type AdminNavItemId =
  | 'employees'
  | 'analytics'
  | 'audit'
  | 'settings'

export type EmployeeRoleId =
  | 'admin'
  | 'psychiatrist'
  | 'psychologist'
  | 'nurse'
  | 'registrar'

export type EmployeeStatus = 'active' | 'blocked'

export type AvatarTone =
  | 'rose'
  | 'amber'
  | 'blue'
  | 'green'
  | 'violet'
  | 'teal'

export type ContourAccess = 'full' | 'settings' | 'none'

export type PrescriptionAccess = 'prescriptions' | 'none'

export interface AdminProfile {
  fullName: string
  shortName: string
  initials: string
  role: string
}

export interface ClinicInfo {
  name: string
  employeeCount: number
  contourCount: number
}

export interface RoleOption {
  id: EmployeeRoleId
  label: string
  description: string
}

export interface RolePermission {
  id: string
  label: string
  allowed: boolean
}

export interface EmployeeRow {
  id: string
  fullName: string
  shortName: string
  email: string
  initials: string
  avatarTone: AvatarTone
  roleId: EmployeeRoleId
  roleLabel: string
  generalContour: ContourAccess
  prescriptionContour: PrescriptionAccess
  status: EmployeeStatus
  /** Grammatical gender for status label */
  statusGender: 'm' | 'f'
  inClinicSince: number
  roleDescription: string
  generalEnabled: boolean
  prescriptionEnabled: boolean
  permissions: RolePermission[]
}

/* ── Аналитика клиники ───────────────────────────── */

export type AnalyticsPeriod = 'week' | 'month' | 'quarter'

export type KpiDeltaTone = 'up' | 'down' | 'warn'

export type KpiBarTone = 'brand' | 'warning'

export interface AnalyticsKpi {
  id: string
  title: string
  value: string
  delta: string
  deltaTone: KpiDeltaTone
  progress: number
  barTone: KpiBarTone
  hint: string
}

export interface ActivityWeekPoint {
  id: string
  label: string
  patients: number
  doctors: number
}

export type AlertPriorityTone = 'mandatory' | 'optional' | 'rx'

export interface AnalyticsAlertRow {
  id: string
  type: string
  priorityLabel: string
  priorityTone: AlertPriorityTone
  count: number
  reaction: string
}

export interface ClinicAnalytics {
  subtitle: string
  kpis: AnalyticsKpi[]
  activity: ActivityWeekPoint[]
  activityMax: number
  alerts: AnalyticsAlertRow[]
}

/* ── Журнал аудита ───────────────────────────────── */

export type AuditCategory = 'all' | 'access' | 'settings'

export type AuditPeriod = 'today' | '7d'

export type AuditResult = 'success'

export interface AuditEvent {
  id: string
  /** Display number, e.g. А-1042 */
  number: string
  /** ISO date for filtering, e.g. 2026-10-18 */
  date: string
  /** Short table cell, e.g. 18 окт · 10:42 */
  timeLabel: string
  /** Full datetime for modal, e.g. 18 октября 2026 · 10:42 · UTC+3 */
  datetimeLabel: string
  initiator: string
  action: string
  /** Short object label for table */
  object: string
  /** Full object name for modal */
  objectFull: string
  result: AuditResult
  category: Exclude<AuditCategory, 'all'>
  detail: string
}

export interface ClinicAuditLog {
  subtitle: string
  rangeLabel: string
  footerNote: string
  immutableNote: string
  events: AuditEvent[]
}

/* ── Настройки клиники ───────────────────────────── */

export interface ClinicSettingsField {
  label: string
  value: string
}

export type ClinicWorkHoursId = '09-18' | '08-20'

export interface ClinicWorkHoursOption {
  id: ClinicWorkHoursId
  label: string
  /** Short value for settings card, e.g. Пн–пт, 09:00–18:00 */
  displayValue: string
}

export interface ClinicWorkSettingsDraft {
  email: string
  phone: string
  hoursId: ClinicWorkHoursId
}

export interface ClinicSettings {
  subtitle: string
  organization: {
    name: ClinicSettingsField
    inn: ClinicSettingsField
    confirmed: boolean
    confirmedLabel: string
    note: string
  }
  contacts: {
    email: ClinicSettingsField
    phone: ClinicSettingsField
    timezone: ClinicSettingsField
    hours: ClinicSettingsField
    note: string
  }
  workForm: {
    title: string
    subtitle: string
    hoursNote: string
    hoursOptions: ClinicWorkHoursOption[]
    defaultHoursId: ClinicWorkHoursId
  }
  team: {
    description: string
    note: string
  }
  audit: {
    description: string
  }
}
