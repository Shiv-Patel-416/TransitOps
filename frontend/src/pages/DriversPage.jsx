import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Plus, Pencil, Trash2, Users, Search, X, AlertTriangle } from 'lucide-react'
import './DriversPage.css'

const LICENSE_CATEGORIES = ['A', 'B', 'C', 'D']
const DRIVER_STATUSES = ['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']

const STATUS_BADGE = {
  AVAILABLE: 'badge badge-available',
  ON_TRIP: 'badge badge-on-trip',
  OFF_DUTY: 'badge badge-off-duty',
  SUSPENDED: 'badge badge-suspended',
}

const EMPTY_FORM = {
  name: '',
  license_number: '',
  license_category: 'C',
  license_expiry_date: '',
  contact_number: '',
  safety_score: 100,
}

// ── Seed drivers for fallback ──
const today = new Date()
const getOffsetDate = (days) => {
  const d = new Date()
  d.setDate(today.getDate() + days)
  return d.toISOString().split('T')[0]
}

const FAKE_DRIVERS = [
  { id: 1, name: 'Alex Johnson', license_number: 'DL-ALEX-001', license_category: 'C', license_expiry_date: getOffsetDate(365), contact_number: '+1-555-0101', safety_score: 98.5, status: 'AVAILABLE' },
  { id: 2, name: 'Maria Garcia', license_number: 'DL-MARIA-002', license_category: 'B', license_expiry_date: getOffsetDate(180), contact_number: '+1-555-0102', safety_score: 95.0, status: 'AVAILABLE' },
  { id: 3, name: 'James Wilson', license_number: 'DL-JAMES-003', license_category: 'A', license_expiry_date: getOffsetDate(730), contact_number: '+1-555-0103', safety_score: 92.0, status: 'AVAILABLE' },
  { id: 4, name: 'David Brown', license_number: 'DL-DAVID-004', license_category: 'B', license_expiry_date: getOffsetDate(-30), contact_number: '+1-555-0104', safety_score: 78.0, status: 'AVAILABLE' },
  { id: 5, name: 'Emma Davis', license_number: 'DL-EMMA-005', license_category: 'C', license_expiry_date: getOffsetDate(200), contact_number: '+1-555-0105', safety_score: 45.0, status: 'SUSPENDED' },
]

export default function DriversPage() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingDriver, setEditingDriver] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadDrivers()
  }, [])

  async function loadDrivers() {
    setLoading(true)
    try {
      const data = await api.get('/drivers')
      setDrivers(data.data || data)
    } catch {
      // Fallback if backend API is not implemented yet
      setDrivers(FAKE_DRIVERS)
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingDriver(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  function openEdit(driver) {
    setEditingDriver(driver)
    setForm({
      name: driver.name,
      license_number: driver.license_number,
      license_category: driver.license_category,
      license_expiry_date: driver.license_expiry_date,
      contact_number: driver.contact_number,
      safety_score: driver.safety_score,
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
      safety_score: parseFloat(form.safety_score),
    }

    try {
      if (editingDriver) {
        await api.put(`/drivers/${editingDriver.id}`, payload)
      } else {
        await api.post('/drivers', payload)
      }
      setShowModal(false)
      loadDrivers()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(driver) {
    if (!confirm(`Delete driver ${driver.name}?`)) return
    try {
      await api.delete(`/drivers/${driver.id}`)
      loadDrivers()
    } catch (err) {
      alert(err.message)
    }
  }

  const isExpired = (dateString) => {
    if (!dateString) return false
    const expiry = new Date(dateString)
    return expiry < today
  }

  const isExpiringSoon = (dateString) => {
    if (!dateString) return false
    const expiry = new Date(dateString)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= 30
  }

  const getSafetyScoreColor = (score) => {
    if (score >= 90) return 'text-success'
    if (score >= 70) return 'text-warning'
    return 'text-danger'
  }

  const filtered = drivers.filter((d) => {
    const matchSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.license_number.toLowerCase().includes(search.toLowerCase()) ||
      d.contact_number.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || d.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Drivers</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage profiles, tracking safety score, and license validity
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} />
          Add Driver
        </button>
      </div>

      {/* Filters */}
      <div className="drivers-filters">
        <div className="drivers-search">
          <Search size={18} className="drivers-search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, license number, or phone..."
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
          {DRIVER_STATUSES.map((s) => (
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
                <th>Name</th>
                <th>License Number</th>
                <th>Category</th>
                <th>License Expiry</th>
                <th>Contact Number</th>
                <th>Safety Score</th>
                <th>Status</th>
                <th style={{ width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="empty-state">Loading drivers...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-state">
                    <Users size={40} strokeWidth={1} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p>No drivers found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((d) => {
                  const expired = isExpired(d.license_expiry_date)
                  const nearExpiry = isExpiringSoon(d.license_expiry_date)
                  return (
                    <tr key={d.id}>
                      <td><strong>{d.name}</strong></td>
                      <td>{d.license_number}</td>
                      <td>
                        <span className="driver-cat">{d.license_category}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ textDecoration: expired ? 'line-through' : 'none' }}>
                            {d.license_expiry_date}
                          </span>
                          {expired && (
                            <span className="badge badge-suspended" style={{ fontSize: '0.65rem', alignSelf: 'flex-start', display: 'flex', gap: '2px', alignItems: 'center' }}>
                              <AlertTriangle size={10} /> EXPIRED
                            </span>
                          )}
                          {nearExpiry && (
                            <span className="badge badge-in-shop" style={{ fontSize: '0.65rem', alignSelf: 'flex-start' }}>
                              EXPIRING SOON
                            </span>
                          )}
                        </div>
                      </td>
                      <td>{d.contact_number}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className={`score-dot ${d.safety_score >= 90 ? 'bg-success' : d.safety_score >= 70 ? 'bg-warning' : 'bg-danger'}`} />
                          <span className={getSafetyScoreColor(d.safety_score)} style={{ fontWeight: 600 }}>
                            {d.safety_score}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={STATUS_BADGE[d.status] || 'badge'}>
                          {d.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className="btn-icon" title="Edit" onClick={() => openEdit(d)}>
                            <Pencil size={16} />
                          </button>
                          <button className="btn-icon" title="Delete" onClick={() => handleDelete(d)} style={{ color: 'var(--color-danger)' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
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
              <h2>{editingDriver ? 'Edit Driver' : 'Add Driver'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formError && <div className="login-error">{formError}</div>}

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Alex Johnson"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">License Number *</label>
                    <input
                      className="form-input"
                      value={form.license_number}
                      onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                      placeholder="e.g. DL-ALEX-001"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">License Category *</label>
                    <select
                      className="form-select"
                      value={form.license_category}
                      onChange={(e) => setForm({ ...form, license_category: e.target.value })}
                      required
                    >
                      {LICENSE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">License Expiry Date *</label>
                    <input
                      className="form-input"
                      type="date"
                      value={form.license_expiry_date}
                      onChange={(e) => setForm({ ...form, license_expiry_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Safety Score *</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={form.safety_score}
                      onChange={(e) => setForm({ ...form, safety_score: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input
                    className="form-input"
                    value={form.contact_number}
                    onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
                    placeholder="e.g. +1-555-0101"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editingDriver ? 'Update Driver' : 'Create Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
