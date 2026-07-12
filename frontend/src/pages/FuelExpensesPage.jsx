import { Fuel } from 'lucide-react'

export default function FuelExpensesPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fuel & Expenses</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Log fuel fill-ups and track operational expenses
          </p>
        </div>
      </div>
      <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        <Fuel size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <p>Fuel & Expenses page — coming in Hour 4.5–5.5.</p>
      </div>
    </div>
  )
}
