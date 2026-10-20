import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireDoctorAuth } from '@/components/auth/RequireDoctorAuth'
import { AdminLayout } from '@/layouts/AdminLayout'
import { DoctorLayout } from '@/layouts/DoctorLayout'
import { AnalyticsPage } from '@/pages/admin/analytics/AnalyticsPage'
import { ApplicationsPage } from '@/pages/admin/applications/ApplicationsPage'
import { AuditPage } from '@/pages/admin/audit/AuditPage'
import { EmployeesPage } from '@/pages/admin/employees/EmployeesPage'
import { InviteAdminPage } from '@/pages/admin/invite-admin/InviteAdminPage'
import { InviteDoctorPage } from '@/pages/admin/invite-doctor/InviteDoctorPage'
import { InviteSentPage } from '@/pages/admin/invite-sent/InviteSentPage'
import { SettingsPage } from '@/pages/admin/settings/SettingsPage'
import { VerifyDoctorPage } from '@/pages/admin/verify-doctor/VerifyDoctorPage'
import { WelcomePage } from '@/pages/admin/welcome/WelcomePage'
import { AdverseEventAlertPage } from '@/pages/alerts/AdverseEventAlertPage'
import { AlertsPage } from '@/pages/alerts/AlertsPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ExercisesPage } from '@/pages/exercises/ExercisesPage'
import { ConnectClinicActivatePage } from '@/pages/connect-clinic/ConnectClinicActivatePage'
import { ConnectClinicPage } from '@/pages/connect-clinic/ConnectClinicPage'
import { ConnectClinicReadyPage } from '@/pages/connect-clinic/ConnectClinicReadyPage'
import { ConnectClinicSecurityPage } from '@/pages/connect-clinic/ConnectClinicSecurityPage'
import { ConnectClinicStatusPage } from '@/pages/connect-clinic/ConnectClinicStatusPage'
import { ConnectClinicVerifyPage } from '@/pages/connect-clinic/ConnectClinicVerifyPage'
import { DoctorInvitePage } from '@/pages/invite/DoctorInvitePage'
import { DoctorPendingPage } from '@/pages/invite/DoctorPendingPage'
import { DoctorQualificationPage } from '@/pages/invite/DoctorQualificationPage'
import { AdminLogin2faPage } from '@/pages/login/AdminLogin2faPage'
import { LoginPage } from '@/pages/login/LoginPage'
import { SpecialistRegisterPage } from '@/pages/register/SpecialistRegisterPage'
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
        <Route path="/login/admin-2fa" element={<AdminLogin2faPage />} />
        <Route
          path="/register/specialist"
          element={<SpecialistRegisterPage />}
        />
        <Route path="/invite/doctor" element={<DoctorInvitePage />} />
        <Route
          path="/invite/doctor/qualification"
          element={<DoctorQualificationPage />}
        />
        <Route
          path="/invite/doctor/pending"
          element={<DoctorPendingPage />}
        />
        <Route path="/connect-clinic" element={<ConnectClinicPage />} />
        <Route
          path="/connect-clinic/verify"
          element={<ConnectClinicVerifyPage />}
        />
        <Route
          path="/connect-clinic/status"
          element={<ConnectClinicStatusPage />}
        />
        <Route
          path="/connect-clinic/ready"
          element={<ConnectClinicReadyPage />}
        />
        <Route
          path="/connect-clinic/activate"
          element={<ConnectClinicActivatePage />}
        />
        <Route
          path="/connect-clinic/security"
          element={<ConnectClinicSecurityPage />}
        />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="welcome" replace />} />
          <Route path="welcome" element={<WelcomePage />} />
          <Route path="invite-doctor" element={<InviteDoctorPage />} />
          <Route path="invite-admin" element={<InviteAdminPage />} />
          <Route path="invite-sent" element={<InviteSentPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="verify-doctor" element={<VerifyDoctorPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="settings" element={<SettingsPage />} />
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
