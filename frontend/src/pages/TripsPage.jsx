import { Route } from 'lucide-react'

export default function TripsPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Trips</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage trip lifecycle — draft, dispatch, complete, cancel
          </p>
        </div>
      </div>
      <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        <Route size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <p>Trips page — coming in Hour 3–4.5.</p>
      </div>
    </div>
  )
}
