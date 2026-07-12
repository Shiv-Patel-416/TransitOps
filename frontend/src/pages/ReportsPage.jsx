import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { BarChart3, Download } from 'lucide-react'
import './ReportsPage.css'

export default function ReportsPage() {
  const [vehiclesSummary, setVehiclesSummary] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    setLoading(true)
    try {
      const res = await api.get('/reports/vehicles-summary')
      setVehiclesSummary(res.data || res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Generate and download CSV client-side
  function exportCSV() {
    if (vehiclesSummary.length === 0) return

    const headers = [
      'Registration',
      'Name',
      'Type',
      'Region',
      'Acquisition Cost ($)',
      'Total Trips',
      'Total Distance (km)',
      'Total Fuel (L)',
      'Fuel Cost ($)',
      'Maintenance Cost ($)',
      'Other Expenses ($)',
      'Total Operational Cost ($)',
      'Revenue ($)',
      'ROI'
    ]

    const rows = vehiclesSummary.map(v => [
      v.registration_number,
      v.name,
      v.type,
      v.region || 'N/A',
      v.acquisition_cost,
      v.total_trips,
      v.total_distance,
      v.total_fuel_liters,
      v.fuel_cost,
      v.maintenance_cost,
      v.other_expenses,
      v.total_operational_cost,
      v.revenue,
      v.roi
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(value => `"${value}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `fleet_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const maxOpsCost = Math.max(...vehiclesSummary.map(v => v.total_operational_cost || 1), 1)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Fleet analytics, operational cost, and ROI reports
          </p>
        </div>
        <button className="btn btn-primary" onClick={exportCSV} disabled={vehiclesSummary.length === 0}>
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading report data...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* ROI & Operational Cost Visual Charts (Custom CSS Bar Charts) */}
          <div className="reports-grid">
            <div className="card">
              <div className="card-header">
                <h3>Operational Cost per Vehicle</h3>
              </div>
              <div className="card-body">
                <div className="expense-bars">
                  {vehiclesSummary.map(v => (
                    <div key={v.id} className="expense-bar-item">
                      <div className="expense-bar-label">
                        <span><strong>{v.registration_number}</strong> ({v.name})</span>
                        <span>${v.total_operational_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="expense-bar-track">
                        <div 
                          className="expense-bar-fill" 
                          style={{ width: `${(v.total_operational_cost / maxOpsCost) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>ROI Summary (Revenue vs Ops Cost)</h3>
              </div>
              <div className="card-body">
                <div className="expense-bars">
                  {vehiclesSummary.map(v => {
                    const roiPercent = (v.roi * 100).toFixed(2)
                    const isPositive = v.roi >= 0
                    return (
                      <div key={v.id} className="expense-bar-item">
                        <div className="expense-bar-label">
                          <span><strong>{v.registration_number}</strong></span>
                          <span style={{ color: isPositive ? 'var(--color-success)' : 'var(--color-danger)' }}>
                            {isPositive ? '+' : ''}{roiPercent}% ROI
                          </span>
                        </div>
                        <div className="expense-bar-track">
                          <div 
                            className="expense-bar-fill" 
                            style={{ 
                              width: `${Math.min(100, Math.max(5, Math.abs(v.roi * 100)))}%`,
                              backgroundColor: isPositive ? 'var(--color-success)' : 'var(--color-danger)'
                            }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Table per Vehicle */}
          <div className="card">
            <div className="card-header">
              <h3>Fleet Metrics Table</h3>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Type</th>
                    <th>Trips</th>
                    <th>Distance</th>
                    <th>Fuel (L)</th>
                    <th>Ops Cost ($)</th>
                    <th>Revenue ($)</th>
                    <th>ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {vehiclesSummary.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="empty-state">No vehicle reports available.</td>
                    </tr>
                  ) : (
                    vehiclesSummary.map(v => (
                      <tr key={v.id}>
                        <td>
                          <strong>{v.registration_number}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{v.name}</div>
                        </td>
                        <td>{v.type}</td>
                        <td>{v.total_trips}</td>
                        <td>{v.total_distance.toLocaleString()} km</td>
                        <td>{v.total_fuel_liters.toLocaleString()} L</td>
                        <td>${v.total_operational_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td>${v.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td>
                          <span className={`badge ${v.roi >= 0 ? 'badge-available' : 'badge-retired'}`}>
                            {(v.roi * 100).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
