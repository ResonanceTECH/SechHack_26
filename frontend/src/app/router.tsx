import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DoctorLayout } from '@/layouts/DoctorLayout'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { PatientsPage } from '@/pages/patients/PatientsPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DoctorLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="alerts" element={<PlaceholderPage title="Алерты" />} />
          <Route
            path="medications"
            element={<PlaceholderPage title="Препараты · ГРЛС" />}
          />
          <Route
            path="exercises"
            element={<PlaceholderPage title="Упражнения" />}
          />
          <Route path="*" element={<Navigate to="/patients" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
