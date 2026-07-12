import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { BarChart3, PieChart, DollarSign } from 'lucide-react'
import './ReportsPage.css'

export default function ReportsPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports/expenses-summary').then(res => {
      setExpenses(res.data || res)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  const totalExpense = expenses.reduce((sum, item) => sum + (item.total || 0), 0)

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
      
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30vh' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading reports...</p>
        </div>
      ) : (
        <div className="reports-grid">
          <div className="card">
            <div className="card-header">
              <h3>Expenses Breakdown</h3>
            </div>
            <div className="card-body">
              {expenses.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)' }}>No expenses found.</p>
              ) : (
                <div className="expense-bars">
                  {expenses.map(exp => (
                    <div key={exp.category} className="expense-bar-item">
                      <div className="expense-bar-label">
                        <span>{exp.category}</span>
                        <span>${(exp.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="expense-bar-track">
                        <div 
                          className="expense-bar-fill" 
                          style={{ width: `${Math.min(100, (exp.total / totalExpense) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
             <BarChart3 size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
             <p>Additional reports can be integrated here (e.g. Driver Safety, Vehicle Utilization over time).</p>
          </div>
        </div>
      )}
    </div>
  )
}
