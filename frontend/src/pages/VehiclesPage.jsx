import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Plus, Pencil, Trash2, Truck, Search, X } from 'lucide-react'
import './VehiclesPage.css'

const VEHICLE_TYPES = ['TRUCK', 'VAN', 'BUS', 'CAR', 'MOTORCYCLE']
const VEHICLE_STATUSES = ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']

const STATUS_BADGE = {
  AVAILABLE: 'badge badge-available',
  ON_TRIP: 'badge badge-on-trip',
  IN_SHOP: 'badge badge-in-shop',
  RETIRED: 'badge badge-retired',
}

const EMPTY_FORM = {
  registration_number: '',
  name: '',
  model: '',
  type: 'TRUCK',
  max_load_capacity: '',
  acquisition_cost: '',
  region: '',
}

// ── Fake seed data (swap to API when ready) ──
const FAKE_VEHICLES = [
  { id: 1, registration_number: 'TRK-001', name: 'Hauler Alpha', model: 'Volvo FH16', type: 'TRUCK', max_load_capacity: 8000, odometer: 45200, acquisition_cost: 120000, status: 'AVAILABLE', region: 'North' },
  { id: 2, registration_number: 'VAN-002', name: 'City Runner', model: 'Ford Transit', type: 'VAN', max_load_capacity: 1200, odometer: 32100, acquisition_cost: 35000, status: 'ON_TRIP', region: 'East' },
  { id: 3, registration_number: 'BUS-003', name: 'Metro Express', model: 'Mercedes Sprinter', type: 'BUS', max_load_capacity: 3000, odometer: 78500, acquisition_cost: 85000, status: 'AVAILABLE', region: 'South' },
  { id: 4, registration_number: 'TRK-004', name: 'Heavy Lifter', model: 'Scania R500', type: 'TRUCK', max_load_capacity: 12000, odometer: 120000, acquisition_cost: 150000, status: 'IN_SHOP', region: 'West' },
  { id: 5, registration_number: 'VAN-005', name: 'Quick Delivery', model: 'VW Crafter', type: 'VAN', max_load_capacity: 1500, odometer: 15000, acquisition_cost: 40000, status: 'RETIRED', region: 'North' },
]

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadVehicles()
  }, [])

  async function loadVehicles() {
    setLoading(true)
    try {
      const data = await api.get('/vehicles')
      setVehicles(data.data || data)
    } catch {
      // Fallback to fake data if API not ready
      setVehicles(FAKE_VEHICLES)
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingVehicle(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  function openEdit(vehicle) {
    setEditingVehicle(vehicle)
    setForm({
      registration_number: vehicle.registration_number,
      name: vehicle.name,
      model: vehicle.model,
      type: vehicle.type,
      max_load_capacity: vehicle.max_load_capacity,
      acquisition_cost: vehicle.acquisition_cost,
      region: vehicle.region || '',
    })
    setFormError('')
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)

    const payload = {
      ...form,
      max_load_capacity: parseFloat(form.max_load_capacity),
      acquisition_cost: parseFloat(form.acquisition_cost),
    }

    try {
      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, payload)
      } else {
        await api.post('/vehicles', payload)
      }
      setShowModal(false)
      loadVehicles()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(vehicle) {
    if (!confirm(`Delete vehicle ${vehicle.registration_number}?`)) return
    try {
      await api.delete(`/vehicles/${vehicle.id}`)
      loadVehicles()
    } catch (err) {
      alert(err.message)
    }
  }

  const filtered = vehicles.filter((v) => {
    const matchSearch =
      !search ||
      v.registration_number.toLowerCase().includes(search.toLowerCase()) ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || v.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicles</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage your fleet of {vehicles.length} vehicles
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} />
          Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="vehicles-filters">
        <div className="vehicles-search">
          <Search size={18} className="vehicles-search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by registration, name, or model…"
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
          {VEHICLE_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Registration</th>
                <th>Name</th>
                <th>Model</th>
                <th>Type</th>
                <th>Capacity (kg)</th>
                <th>Odometer (km)</th>
                <th>Status</th>
                <th>Region</th>
                <th style={{ width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="empty-state">Loading vehicles…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-state">
                    <Truck size={40} strokeWidth={1} />
                    <p>No vehicles found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id}>
                    <td><strong>{v.registration_number}</strong></td>
                    <td>{v.name}</td>
                    <td>{v.model}</td>
                    <td>{v.type}</td>
                    <td>{v.max_load_capacity?.toLocaleString()}</td>
                    <td>{v.odometer?.toLocaleString()}</td>
                    <td>
                      <span className={STATUS_BADGE[v.status] || 'badge'}>
                        {v.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{v.region || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="btn-icon" title="Edit" onClick={() => openEdit(v)}>
                          <Pencil size={16} />
                        </button>
                        <button className="btn-icon" title="Delete" onClick={() => handleDelete(v)} style={{ color: 'var(--color-danger)' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formError && <div className="login-error">{formError}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Registration Number *</label>
                    <input
                      className="form-input"
                      value={form.registration_number}
                      onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
                      placeholder="e.g. TRK-006"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input
                      className="form-input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Road King"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Model *</label>
                    <input
                      className="form-input"
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      placeholder="e.g. Volvo FH16"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type *</label>
                    <select
                      className="form-select"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      required
                    >
                      {VEHICLE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Max Load Capacity (kg) *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.max_load_capacity}
                      onChange={(e) => setForm({ ...form, max_load_capacity: e.target.value })}
                      placeholder="e.g. 8000"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Acquisition Cost *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.acquisition_cost}
                      onChange={(e) => setForm({ ...form, acquisition_cost: e.target.value })}
                      placeholder="e.g. 120000"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Region</label>
                  <input
                    className="form-input"
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    placeholder="e.g. North"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
