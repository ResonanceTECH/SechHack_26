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
