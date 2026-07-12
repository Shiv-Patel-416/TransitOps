import { BarChart3 } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Fleet analytics, fuel efficiency, and ROI reports
          </p>
        </div>
      </div>
      <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        <BarChart3 size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <p>Reports page — coming in Hour 5.5–6.5.</p>
      </div>
    </div>
  )
}
