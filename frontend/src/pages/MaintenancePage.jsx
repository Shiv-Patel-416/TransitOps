import { Wrench } from 'lucide-react'

export default function MaintenancePage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Track vehicle maintenance logs and shop status
          </p>
        </div>
      </div>
      <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        <Wrench size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <p>Maintenance page — coming in Hour 4.5–5.5.</p>
      </div>
    </div>
  )
}
