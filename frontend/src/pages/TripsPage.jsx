import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Plus, Check, Play, Ban, Route, Search, X, AlertTriangle } from 'lucide-react'
import './TripsPage.css'

const TRIP_STATUSES = ['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED']

const STATUS_BADGE = {
  DRAFT: 'badge badge-draft',
  DISPATCHED: 'badge badge-dispatched',
  COMPLETED: 'badge badge-completed',
  CANCELLED: 'badge badge-cancelled',
}

const EMPTY_TRIP_FORM = {
  source: '',
  destination: '',
  vehicle_id: '',
  driver_id: '',
  cargo_weight: '',
  planned_distance: '',
}

const EMPTY_COMPLETE_FORM = {
  actual_distance: '',
  fuel_consumed: '',
  revenue: '',
}

export default function TripsPage() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [errorToast, setErrorToast] = useState('')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  
  // Available lists for selection
  const [availableVehicles, setAvailableVehicles] = useState([])
  const [availableDrivers, setAvailableDrivers] = useState([])
  const [loadingSelections, setLoadingSelections] = useState(false)

  // Forms
  const [tripForm, setTripForm] = useState(EMPTY_TRIP_FORM)
  const [completeForm, setCompleteForm] = useState(EMPTY_COMPLETE_FORM)
  const [activeTripId, setActiveTripId] = useState(null)
  
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadTrips()
  }, [])

  async function loadTrips() {
    setLoading(true)
    try {
      const data = await api.get('/trips')
      setTrips(data)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function showError(msg) {
    setErrorToast(msg)
    setTimeout(() => setErrorToast(''), 5000)
  }

  async function openCreate() {
    setTripForm(EMPTY_TRIP_FORM)
    setFormError('')
    setAvailableVehicles([])
    setAvailableDrivers([])
    setShowCreateModal(true)
    setLoadingSelections(true)

    try {
      // Fetch available vehicles and drivers from endpoints
      const [vehiclesData, driversData] = await Promise.all([
        api.get('/vehicles/available'),
        api.get('/drivers/available'),
      ])
      setAvailableVehicles(vehiclesData)
      setAvailableDrivers(driversData)
    } catch (err) {
      setFormError('Failed to load available vehicles or drivers: ' + err.message)
    } finally {
      setLoadingSelections(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setFormError('')
    
    // Inline validation: cargo weight <= vehicle capacity
    const selectedVehicle = availableVehicles.find(v => v.id === parseInt(tripForm.vehicle_id))
    const cargoWeight = parseFloat(tripForm.cargo_weight)
    
    if (selectedVehicle && cargoWeight > selectedVehicle.max_load_capacity) {
      setFormError(`Cargo weight (${cargoWeight} kg) exceeds vehicle maximum capacity (${selectedVehicle.max_load_capacity} kg)`)
      return
    }

    setSaving(true)
    const payload = {
      source: tripForm.source,
      destination: tripForm.destination,
      vehicle_id: parseInt(tripForm.vehicle_id),
      driver_id: parseInt(tripForm.driver_id),
      cargo_weight: cargoWeight,
      planned_distance: parseFloat(tripForm.planned_distance),
    }

    try {
      await api.post('/trips/', payload)
      setShowCreateModal(false)
      loadTrips()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDispatch(tripId) {
    try {
      await api.post(`/trips/${tripId}/dispatch`)
      loadTrips()
    } catch (err) {
      showError(err.message)
    }
  }

  async function handleCancel(tripId) {
    if (!confirm('Are you sure you want to cancel this trip?')) return
    try {
      await api.post(`/trips/${tripId}/cancel`)
      loadTrips()
    } catch (err) {
      showError(err.message)
    }
  }

  function openComplete(tripId) {
    setActiveTripId(tripId)
    setCompleteForm(EMPTY_COMPLETE_FORM)
    setFormError('')
    setShowCompleteModal(true)
  }

  async function handleCompleteSubmit(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)

    const payload = {
      actual_distance: parseFloat(completeForm.actual_distance),
      fuel_consumed: parseFloat(completeForm.fuel_consumed),
      revenue: completeForm.revenue ? parseFloat(completeForm.revenue) : 0,
    }

    try {
      await api.post(`/trips/${activeTripId}/complete`, payload)
      setShowCompleteModal(false)
      loadTrips()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const selectedVehicleForDetails = availableVehicles.find(v => v.id === parseInt(tripForm.vehicle_id))

  const filtered = trips.filter((t) => {
    const term = search.toLowerCase()
    const matchSearch =
      !search ||
      t.source.toLowerCase().includes(term) ||
      t.destination.toLowerCase().includes(term) ||
      String(t.id).includes(term)
    const matchStatus = !statusFilter || t.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      {/* Toast Notification */}
      {errorToast && (
        <div className="toast-container">
          <div className="toast toast-error">
            <AlertTriangle size={18} />
            <span>{errorToast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Trips</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Monitoractive dispatches, drafts, and trip history
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} />
          Create Trip
        </button>
      </div>

      {/* Filters */}
      <div className="trips-filters">
        <div className="trips-search">
          <Search size={18} className="trips-search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by ID, source, or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '160px' }}
        >
          <option value="">All Statuses</option>
          {TRIP_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Route</th>
                <th>Cargo Weight</th>
                <th>Planned Dist.</th>
                <th>Status</th>
                <th>Details / Stats</th>
                <th style={{ width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="empty-state">Loading trips...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <Route size={40} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p>No trips found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id}>
                    <td><strong>#{t.id}</strong></td>
                    <td>
                      <div className="trip-route-info">
                        <span className="route-endpoint">{t.source}</span>
                        <span className="route-arrow">→</span>
                        <span className="route-endpoint">{t.destination}</span>
                      </div>
                    </td>
                    <td>{t.cargo_weight?.toLocaleString()} kg</td>
                    <td>{t.planned_distance?.toLocaleString()} km</td>
                    <td>
                      <span className={STATUS_BADGE[t.status] || 'badge'}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      {t.status === 'COMPLETED' ? (
                        <div className="trip-stats-detail">
                          <div>Dist: <strong>{t.actual_distance} km</strong></div>
                          <div>Fuel: <strong>{t.fuel_consumed} L</strong></div>
                          {t.revenue > 0 && <div>Rev: <strong className="text-success">${t.revenue}</strong></div>}
                        </div>
                      ) : t.status === 'CANCELLED' ? (
                        <span className="text-danger" style={{ fontSize: '0.8125rem' }}>Cancelled</span>
                      ) : (
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>Pending execution</span>
                      )}
                    </td>
                    <td>
                      <div className="trip-actions-row">
                        {t.status === 'DRAFT' && (
                          <>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleDispatch(t.id)}>
                              <Play size={12} /> Dispatch
                            </button>
                            <button className="btn-icon" title="Cancel Trip" onClick={() => handleCancel(t.id)} style={{ color: 'var(--color-danger)' }}>
                              <Ban size={16} />
                            </button>
                          </>
                        )}
                        {t.status === 'DISPATCHED' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => openComplete(t.id)}>
                              <Check size={12} /> Complete
                            </button>
                            <button className="btn-icon" title="Cancel Trip" onClick={() => handleCancel(t.id)} style={{ color: 'var(--color-danger)' }}>
                              <Ban size={16} />
                            </button>
                          </>
                        )}
                        {(t.status === 'COMPLETED' || t.status === 'CANCELLED') && (
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>Locked</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Trip</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formError && <div className="login-error">{formError}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Source *</label>
                    <input
                      className="form-input"
                      value={tripForm.source}
                      onChange={(e) => setTripForm({ ...tripForm, source: e.target.value })}
                      placeholder="e.g. Warehouse A"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Destination *</label>
                    <input
                      className="form-input"
                      value={tripForm.destination}
                      onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                      placeholder="e.g. Depot B"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Vehicle *</label>
                    <select
                      className="form-select"
                      value={tripForm.vehicle_id}
                      onChange={(e) => setTripForm({ ...tripForm, vehicle_id: e.target.value })}
                      disabled={loadingSelections}
                      required
                    >
                      <option value="">-- Select Available --</option>
                      {availableVehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.registration_number} - {v.name} ({v.max_load_capacity} kg capacity)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Driver *</label>
                    <select
                      className="form-select"
                      value={tripForm.driver_id}
                      onChange={(e) => setTripForm({ ...tripForm, driver_id: e.target.value })}
                      disabled={loadingSelections}
                      required
                    >
                      <option value="">-- Select Available --</option>
                      {availableDrivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} (Score: {d.safety_score})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Cargo Weight (kg) *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={tripForm.cargo_weight}
                      onChange={(e) => setTripForm({ ...tripForm, cargo_weight: e.target.value })}
                      placeholder="e.g. 450"
                      required
                    />
                    {/* Inline Validation Warning */}
                    {selectedVehicleForDetails && parseFloat(tripForm.cargo_weight) > selectedVehicleForDetails.max_load_capacity && (
                      <span className="form-error" style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '2px' }}>
                        <AlertTriangle size={12} /> Exceeds capacity of {selectedVehicleForDetails.max_load_capacity} kg!
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Planned Distance (km) *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={tripForm.planned_distance}
                      onChange={(e) => setTripForm({ ...tripForm, planned_distance: e.target.value })}
                      placeholder="e.g. 120"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving || loadingSelections}>
                  {saving ? 'Creating…' : 'Create Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="modal-overlay" onClick={() => setShowCompleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Complete Trip</h2>
              <button className="btn-icon" onClick={() => setShowCompleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCompleteSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formError && <div className="login-error">{formError}</div>}

                <div className="form-group">
                  <label className="form-label">Actual Distance Traveled (km) *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={completeForm.actual_distance}
                    onChange={(e) => setCompleteForm({ ...completeForm, actual_distance: e.target.value })}
                    placeholder="e.g. 125.4"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Fuel Consumed (Liters) *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={completeForm.fuel_consumed}
                      onChange={(e) => setCompleteForm({ ...completeForm, fuel_consumed: e.target.value })}
                      placeholder="e.g. 15.5"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Trip Revenue ($) *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={completeForm.revenue}
                      onChange={(e) => setCompleteForm({ ...completeForm, revenue: e.target.value })}
                      placeholder="e.g. 850"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompleteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={saving}>
                  {saving ? 'Completing…' : 'Complete Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
