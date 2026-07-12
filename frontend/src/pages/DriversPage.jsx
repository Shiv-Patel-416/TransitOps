import { Users } from 'lucide-react'

export default function DriversPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Drivers</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage driver registrations and compliance
          </p>
        </div>
      </div>
      <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        <Users size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <p>Drivers page — coming in Hour 2–3.</p>
      </div>
    </div>
  )
}
