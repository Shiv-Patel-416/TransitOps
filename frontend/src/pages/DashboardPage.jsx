import { LayoutDashboard, Truck, Users, Route, Wrench, DollarSign } from 'lucide-react'

const STATS = [
  { label: 'Active Vehicles', value: '12', icon: Truck, color: '#6366f1', bg: '#eef2ff' },
  { label: 'Drivers On Duty', value: '8', icon: Users, color: '#06b6d4', bg: '#ecfeff' },
  { label: 'Trips Today', value: '5', icon: Route, color: '#10b981', bg: '#ecfdf5' },
  { label: 'Pending Maintenance', value: '3', icon: Wrench, color: '#f59e0b', bg: '#fffbeb' },
  { label: 'Monthly Fuel Cost', value: '$4,520', icon: DollarSign, color: '#ef4444', bg: '#fef2f2' },
  { label: 'Fleet Utilization', value: '67%', icon: LayoutDashboard, color: '#8b5cf6', bg: '#f5f3ff' },
]

export default function DashboardPage() {
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
          <p>Charts and detailed analytics will be connected once the dashboard API is live.</p>
        </div>
      </div>
    </div>
  )
}
