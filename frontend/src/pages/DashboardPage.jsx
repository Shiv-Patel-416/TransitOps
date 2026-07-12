import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { LayoutDashboard, Truck, Users, Route, Wrench, DollarSign } from 'lucide-react'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/kpis').then(res => {
      setData(res.data || res)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading dashboard...</p>
      </div>
    )
  }

  const STATS = [
    { label: 'Active Vehicles', value: data?.active_vehicles || '0', icon: Truck, color: '#6366f1', bg: '#eef2ff' },
    { label: 'Drivers On Duty', value: data?.drivers_on_duty || '0', icon: Users, color: '#06b6d4', bg: '#ecfeff' },
    { label: 'Trips Today', value: data?.trips_today || '0', icon: Route, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Pending Maintenance', value: data?.pending_maintenance || '0', icon: Wrench, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Monthly Fuel Cost', value: `$${(data?.monthly_fuel_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: '#ef4444', bg: '#fef2f2' },
    { label: 'Fleet Utilization', value: `${data?.fleet_utilization || 0}%`, icon: LayoutDashboard, color: '#8b5cf6', bg: '#f5f3ff' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Fleet overview and key metrics
          </p>
        </div>
      </div>

      <div className="kpi-grid">
        {STATS.map((stat) => (
          <div className="kpi-card" key={stat.label}>
            <div className="kpi-icon" style={{ background: stat.bg, color: stat.color }}>
              <stat.icon size={20} />
            </div>
            <div>
              <div className="kpi-value">{stat.value}</div>
              <div className="kpi-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          <LayoutDashboard size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>The dashboard KPIs are now live connected to the backend!</p>
        </div>
      </div>
    </div>
  )
}
