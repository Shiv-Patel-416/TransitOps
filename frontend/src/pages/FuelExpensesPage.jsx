import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Plus, Fuel, DollarSign, X } from 'lucide-react'
import './FuelExpensesPage.css'

const EXPENSE_CATEGORIES = ['FUEL', 'MAINTENANCE', 'TOLL', 'INSURANCE', 'OTHER']

const EMPTY_FUEL_FORM = {
  vehicle_id: '',
  trip_id: '',
  liters: '',
  cost: '',
}

const EMPTY_EXPENSE_FORM = {
  vehicle_id: '',
  category: 'FUEL',
  amount: '',
  description: '',
}

export default function FuelExpensesPage() {
  const [activeTab, setActiveTab] = useState('fuel') // 'fuel' or 'expenses'
  const [fuelLogs, setFuelLogs] = useState([])
  const [expenses, setExpenses] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filter by Vehicle & Total Operational Cost
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState('')
  const [operationalCostData, setOperationalCostData] = useState(null)
  const [loadingOpsCost, setLoadingOpsCost] = useState(false)

  const [showFuelModal, setShowFuelModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  
  const [fuelForm, setFuelForm] = useState(EMPTY_FUEL_FORM)
  const [expenseForm, setExpenseForm] = useState(EMPTY_EXPENSE_FORM)
  
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedVehicleFilter) {
      loadOperationalCost(selectedVehicleFilter)
    } else {
      setOperationalCostData(null)
    }
  }, [selectedVehicleFilter])

  async function loadData() {
    setLoading(true)
    try {
      const [fuelRes, expRes, vehiclesRes, tripsRes] = await Promise.all([
        api.get('/fuel'),
        api.get('/expenses'),
        api.get('/vehicles'),
        api.get('/trips')
      ])
      setFuelLogs(fuelRes.data || fuelRes)
      setExpenses(expRes.data || expRes)
      setVehicles(vehiclesRes.data || vehiclesRes)
      setTrips(tripsRes.data || tripsRes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadOperationalCost(vehicleId) {
    setLoadingOpsCost(true)
    try {
      const res = await api.get(`/vehicles/${vehicleId}/operational-cost`)
      setOperationalCostData(res.data || res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingOpsCost(false)
    }
  }

  function openFuelModal() {
    setFuelForm(EMPTY_FUEL_FORM)
    setFormError('')
    setShowFuelModal(true)
  }

  function openExpenseModal() {
    setExpenseForm(EMPTY_EXPENSE_FORM)
    setFormError('')
    setShowExpenseModal(true)
  }

  async function handleSaveFuel(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    
    const payload = {
      ...fuelForm,
      vehicle_id: parseInt(fuelForm.vehicle_id, 10),
      trip_id: fuelForm.trip_id ? parseInt(fuelForm.trip_id, 10) : null,
      liters: parseFloat(fuelForm.liters),
      cost: parseFloat(fuelForm.cost),
    }

    try {
      await api.post('/fuel', payload)
      setShowFuelModal(false)
      loadData()
      if (selectedVehicleFilter && parseInt(selectedVehicleFilter) === payload.vehicle_id) {
        loadOperationalCost(selectedVehicleFilter)
      }
    } catch (err) {
      setFormError(err.message || 'Failed to log fuel')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveExpense(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)

    const payload = {
      ...expenseForm,
      vehicle_id: parseInt(expenseForm.vehicle_id, 10),
      amount: parseFloat(expenseForm.amount),
    }

    try {
      await api.post('/expenses', payload)
      setShowExpenseModal(false)
      loadData()
      if (selectedVehicleFilter && parseInt(selectedVehicleFilter) === payload.vehicle_id) {
        loadOperationalCost(selectedVehicleFilter)
      }
    } catch (err) {
      setFormError(err.message || 'Failed to log expense')
    } finally {
      setSaving(false)
    }
  }

  const getVehicleName = (id) => {
    const v = vehicles.find(v => v.id === id)
    return v ? `${v.registration_number}` : `#${id}`
  }

  const getTripInfo = (id) => {
    if (!id) return '—'
    const t = trips.find(t => t.id === id)
    return t ? `Trip #${t.id} (${t.source} to ${t.destination})` : `Trip #${id}`
  }

  const filteredFuelLogs = fuelLogs.filter(log => 
    !selectedVehicleFilter || log.vehicle_id === parseInt(selectedVehicleFilter)
  )

  const filteredExpenses = expenses.filter(exp => 
    !selectedVehicleFilter || exp.vehicle_id === parseInt(selectedVehicleFilter)
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fuel & Expenses</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage fuel logs and general operating expenses
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={openExpenseModal}>
            <DollarSign size={18} />
            Add Expense
          </button>
          <button className="btn btn-primary" onClick={openFuelModal}>
            <Plus size={18} />
            Log Fuel
          </button>
        </div>
      </div>

      {/* Vehicle Operational Cost Display */}
      <div className="vehicles-filters" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>Filter by Vehicle:</label>
          <select
            className="form-select"
            value={selectedVehicleFilter}
            onChange={(e) => setSelectedVehicleFilter(e.target.value)}
            style={{ width: '220px' }}
          >
            <option value="">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.registration_number} - {v.name}</option>
            ))}
          </select>
        </div>

        {selectedVehicleFilter && operationalCostData && (
          <div className="card operational-cost-summary" style={{ flex: 1, padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '300px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Operational Summary</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                Total Cost: ${operationalCostData.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              <div>Fuel: <strong>${operationalCostData.fuel_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></div>
              <div>Maintenance: <strong>${operationalCostData.maintenance_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></div>
            </div>
          </div>
        )}
      </div>

      <div className="tabs" style={{ marginTop: '1.5rem' }}>
        <button 
          className={`tab ${activeTab === 'fuel' ? 'active' : ''}`}
          onClick={() => setActiveTab('fuel')}
        >
          <Fuel size={16} /> Fuel Logs
        </button>
        <button 
          className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          <DollarSign size={16} /> Expenses
        </button>
      </div>

      <div className="card">
        {activeTab === 'fuel' ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vehicle</th>
                  <th>Trip</th>
                  <th>Liters</th>
                  <th>Cost ($)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="empty-state">Loading fuel logs...</td>
                  </tr>
                ) : filteredFuelLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      <Fuel size={40} strokeWidth={1} />
                      <p>No fuel logs found</p>
                    </td>
                  </tr>
                ) : (
                  filteredFuelLogs.map((log) => (
                    <tr key={log.id}>
                      <td>#{log.id}</td>
                      <td>{getVehicleName(log.vehicle_id)}</td>
                      <td>{getTripInfo(log.trip_id)}</td>
                      <td>{log.liters?.toFixed(2)}</td>
                      <td>{log.cost?.toFixed(2)}</td>
                      <td>{new Date(log.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vehicle</th>
                  <th>Category</th>
                  <th>Amount ($)</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="empty-state">Loading expenses...</td>
                  </tr>
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      <DollarSign size={40} strokeWidth={1} />
                      <p>No expenses found</p>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td>#{exp.id}</td>
                      <td>{getVehicleName(exp.vehicle_id)}</td>
                      <td><span className="badge badge-on-trip">{exp.category}</span></td>
                      <td>{exp.amount?.toFixed(2)}</td>
                      <td>{exp.description || '—'}</td>
                      <td>{new Date(exp.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fuel Modal */}
      {showFuelModal && (
        <div className="modal-overlay" onClick={() => setShowFuelModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Log Fuel</h2>
              <button className="btn-icon" onClick={() => setShowFuelModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveFuel}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formError && <div className="login-error">{formError}</div>}

                <div className="form-group">
                  <label className="form-label">Vehicle *</label>
                  <select
                    className="form-select"
                    value={fuelForm.vehicle_id}
                    onChange={(e) => setFuelForm({ ...fuelForm, vehicle_id: e.target.value })}
                    required
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.registration_number} - {v.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Trip (Optional)</label>
                  <select
                    className="form-select"
                    value={fuelForm.trip_id}
                    onChange={(e) => setFuelForm({ ...fuelForm, trip_id: e.target.value })}
                  >
                    <option value="">No trip associated</option>
                    {trips.map(t => (
                      <option key={t.id} value={t.id}>
                        Trip #{t.id} ({t.source} - {t.destination})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Liters *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0.1"
                      step="0.01"
                      value={fuelForm.liters}
                      onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Cost ($) *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={fuelForm.cost}
                      onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFuelModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Fuel Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Expense</h2>
              <button className="btn-icon" onClick={() => setShowExpenseModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveExpense}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formError && <div className="login-error">{formError}</div>}

                <div className="form-group">
                  <label className="form-label">Vehicle *</label>
                  <select
                    className="form-select"
                    value={expenseForm.vehicle_id}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vehicle_id: e.target.value })}
                    required
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.registration_number} - {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                      required
                    >
                      {EXPENSE_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount ($) *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    className="form-input"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowExpenseModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
