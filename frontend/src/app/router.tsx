import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DoctorLayout } from '@/layouts/DoctorLayout'
import { AdverseEventAlertPage } from '@/pages/alerts/AdverseEventAlertPage'
import { AlertsPage } from '@/pages/alerts/AlertsPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ExercisesPage } from '@/pages/exercises/ExercisesPage'
import { PatientCardPage } from '@/pages/patient-card/PatientCardPage'
import { PatientsPage } from '@/pages/patients/PatientsPage'
import { PreVisitReportPage } from '@/pages/pre-visit-report/PreVisitReportPage'
import { MedicationsPage } from '@/pages/medications/MedicationsPage'
import { MessagesPage } from '@/pages/messages/MessagesPage'
import { TreatmentPlanPage } from '@/pages/treatment-plan/TreatmentPlanPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DoctorLayout />}>
          <Route index element={<DashboardPage />} />
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
          <Route path="*" element={<Navigate to="/alerts" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
