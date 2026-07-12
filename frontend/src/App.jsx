import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import VehiclesPage from './pages/VehiclesPage'
import DriversPage from './pages/DriversPage'
import TripsPage from './pages/TripsPage'
import MaintenancePage from './pages/MaintenancePage'
import FuelExpensesPage from './pages/FuelExpensesPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading…</p>
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="drivers" element={<DriversPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="fuel-expenses" element={<FuelExpensesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
