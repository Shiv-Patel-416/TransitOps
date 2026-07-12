import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Plus, CheckCircle, Wrench, Search, X } from 'lucide-react'
import './MaintenancePage.css'

const STATUS_BADGE = {
  OPEN: 'badge badge-available',
  CLOSED: 'badge badge-retired',
}

const EMPTY_FORM = {
  vehicle_id: '',
  description: '',
  maintenance_type: '',
  cost: '',
}

export default function MaintenancePage() {
  const [logs, setLogs] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [logsRes, vehiclesRes] = await Promise.all([
        api.get('/maintenance'),
        api.get('/vehicles')
      ])
      setLogs(logsRes.data || logsRes)
      setVehicles(vehiclesRes.data || vehiclesRes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)

    const payload = {
      ...form,
      vehicle_id: parseInt(form.vehicle_id, 10),
      cost: parseFloat(form.cost || 0),
    }

    try {
      await api.post('/maintenance', payload)
      setShowModal(false)
      loadData()
    } catch (err) {
      setFormError(err.message || 'Failed to save maintenance log')
    } finally {
      setSaving(false)
    }
  }

  async function handleClose(log) {
    if (!confirm(`Mark maintenance log #${log.id} as closed?`)) return
    try {
      await api.put(`/maintenance/${log.id}`, { status: 'CLOSED' })
      loadData()
    } catch (err) {
      alert(err.message || 'Failed to close maintenance log')
    }
  }

  const getVehicleName = (id) => {
    const v = vehicles.find(v => v.id === id)
    return v ? `${v.registration_number} - ${v.name}` : `Vehicle #${id}`
  }

  const filtered = logs.filter((log) => {
    const vName = getVehicleName(log.vehicle_id).toLowerCase()
    const desc = (log.description || '').toLowerCase()
    const type = (log.maintenance_type || '').toLowerCase()
    const q = search.toLowerCase()

    const matchSearch = !search || vName.includes(q) || desc.includes(q) || type.includes(q)
    const matchStatus = !statusFilter || log.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Track vehicle maintenance logs and shop status
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} />
          Log Maintenance
        </button>
      </div>

      <div className="vehicles-filters">
        <div className="vehicles-search">
          <Search size={18} className="vehicles-search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by vehicle, description, or type..."
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
          <option value="OPEN">OPEN</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Description</th>
                <th>Cost ($)</th>
                <th>Status</th>
                <th>Opened At</th>
                <th>Closed At</th>
                <th style={{ width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="empty-state">Loading maintenance logs...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-state">
                    <Wrench size={40} strokeWidth={1} />
                    <p>No maintenance logs found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id}>
                    <td>#{log.id}</td>
                    <td>{getVehicleName(log.vehicle_id)}</td>
                    <td>{log.maintenance_type}</td>
                    <td>{log.description}</td>
                    <td>{log.cost?.toFixed(2)}</td>
                    <td>
                      <span className={STATUS_BADGE[log.status] || 'badge'}>
                        {log.status}
                      </span>
                    </td>
                    <td>{new Date(log.opened_at).toLocaleDateString()}</td>
                    <td>{log.closed_at ? new Date(log.closed_at).toLocaleDateString() : '—'}</td>
                    <td>
                      {log.status === 'OPEN' && (
                        <button className="btn-icon" title="Mark as Closed" onClick={() => handleClose(log)} style={{ color: 'var(--color-primary)' }}>
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Log Maintenance</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formError && <div className="login-error">{formError}</div>}

                <div className="form-group">
                  <label className="form-label">Vehicle *</label>
                  <select
                    className="form-select"
                    value={form.vehicle_id}
                    onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
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
                  <label className="form-label">Maintenance Type *</label>
                  <input
                    className="form-input"
                    value={form.maintenance_type}
                    onChange={(e) => setForm({ ...form, maintenance_type: e.target.value })}
                    placeholder="e.g. Oil Change"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-input"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the maintenance work..."
                    rows={3}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cost ($) *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    placeholder="e.g. 150.00"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
