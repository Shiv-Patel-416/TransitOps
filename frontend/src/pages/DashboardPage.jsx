import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { LayoutDashboard, Truck, Users, Route, Wrench, DollarSign } from 'lucide-react'

const VEHICLE_TYPES = ['TRUCK', 'VAN', 'BUS', 'CAR', 'MOTORCYCLE']
const VEHICLE_STATUSES = ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Filters
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')

  useEffect(() => {
    loadKpis()
  }, [typeFilter, statusFilter, regionFilter])

  async function loadKpis() {
    setLoading(true)
    try {
      const params = {}
      if (typeFilter) params.type = typeFilter
      if (statusFilter) params.status = statusFilter
      if (regionFilter) params.region = regionFilter

      const res = await api.get('/dashboard/kpis', { params })
      setData(res.data || res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const STATS = [
    { label: 'Active Vehicles', value: data?.active_vehicles ?? '0', icon: Truck, color: '#6366f1', bg: '#eef2ff' },
    { label: 'Drivers On Duty', value: data?.drivers_on_duty ?? '0', icon: Users, color: '#06b6d4', bg: '#ecfeff' },
    { label: 'Trips Today', value: data?.trips_today ?? '0', icon: Route, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Pending Maintenance', value: data?.pending_maintenance ?? '0', icon: Wrench, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Monthly Fuel Cost', value: `$${(data?.monthly_fuel_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: '#ef4444', bg: '#fef2f2' },
    { label: 'Fleet Utilization', value: `${data?.fleet_utilization ?? 0}%`, icon: LayoutDashboard, color: '#8b5cf6', bg: '#f5f3ff' },
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

      {/* KPI Filters */}
      <div className="vehicles-filters" style={{ gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Vehicle Type</span>
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ width: '160px' }}
            >
              <option value="">All Types</option>
              {VEHICLE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Status</span>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '160px' }}
            >
              <option value="">All Statuses</option>
              {VEHICLE_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Region</span>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. North"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              style={{ width: '160px', height: '38px', padding: '0 0.75rem' }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Updating KPIs...</p>
        </div>
      ) : (
        <>
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
              <p>The dashboard KPIs are now live filtered against the backend database.</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
