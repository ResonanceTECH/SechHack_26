import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireDoctorAuth } from '@/components/auth/RequireDoctorAuth'
import { AdminLayout } from '@/layouts/AdminLayout'
import { DoctorLayout } from '@/layouts/DoctorLayout'
import { AdminPlaceholderPage } from '@/pages/admin/AdminPlaceholderPage'
import { AnalyticsPage } from '@/pages/admin/analytics/AnalyticsPage'
import { EmployeesPage } from '@/pages/admin/employees/EmployeesPage'
import { AdverseEventAlertPage } from '@/pages/alerts/AdverseEventAlertPage'
import { AlertsPage } from '@/pages/alerts/AlertsPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ExercisesPage } from '@/pages/exercises/ExercisesPage'
import { LoginPage } from '@/pages/login/LoginPage'
import { PatientCardPage } from '@/pages/patient-card/PatientCardPage'
import { PatientsPage } from '@/pages/patients/PatientsPage'
import { PreVisitReportPage } from '@/pages/pre-visit-report/PreVisitReportPage'
import { PreVisitReportsPage } from '@/pages/pre-visit-reports/PreVisitReportsPage'
import { MedicationsPage } from '@/pages/medications/MedicationsPage'
import { MessagesPage } from '@/pages/messages/MessagesPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { TreatmentPlanPage } from '@/pages/treatment-plan/TreatmentPlanPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="employees" replace />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="audit" element={<AdminPlaceholderPage />} />
          <Route path="settings" element={<AdminPlaceholderPage />} />
        </Route>

        <Route
          element={
            <RequireDoctorAuth>
              <DoctorLayout />
            </RequireDoctorAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="reports" element={<PreVisitReportsPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="patients/:patientId" element={<PatientCardPage />} />
          <Route
            path="patients/:patientId/report"
            element={<PreVisitReportPage />}
          />
          <Route
            path="patients/:patientId/plan"
            element={<TreatmentPlanPage />}
          />
          <Route
            path="patients/:patientId/messages"
            element={<MessagesPage />}
          />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="alerts/:alertId" element={<AdverseEventAlertPage />} />
          <Route path="medications" element={<MedicationsPage />} />
          <Route path="exercises" element={<ExercisesPage />} />
          <Route path="exercises/:patientId" element={<ExercisesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/alerts" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
