import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Shield, UserPlus, X } from 'lucide-react'
import './SettingsPage.css'

const ROLES = ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']

const ROLE_LABELS = {
  FLEET_MANAGER: 'Fleet Manager',
  DRIVER: 'Driver',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
}

const ROLE_BADGE = {
  FLEET_MANAGER: 'badge badge-on-trip',
  DRIVER: 'badge badge-available',
  SAFETY_OFFICER: 'badge badge-in-shop',
  FINANCIAL_ANALYST: 'badge badge-off-duty',
}

const ROLE_PERMISSIONS = {
  FLEET_MANAGER: ['All Modules', 'Full CRUD Access', 'User Management', 'Reports Export'],
  DRIVER: ['View Trips', 'Fuel & Expenses'],
  SAFETY_OFFICER: ['Dashboard', 'Vehicles', 'Drivers & Compliance', 'Maintenance'],
  FINANCIAL_ANALYST: ['All Modules', 'Reports & Analytics', 'Fuel & Expenses', 'CSV Export'],
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'DRIVER' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      // Try the /api/auth/me approach – get current user info at minimum
      const me = await api.get('/auth/me')
      // We may not have a list endpoint, so show current user
      setUsers([me])
    } catch {
      // Fallback: show current logged-in user from context
      if (user) {
        setUsers([{ id: user.id, name: user.username, email: user.email || 'N/A', role: user.role }])
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      await api.post('/auth/register', form)
      setShowModal(false)
      loadUsers()
    } catch (err) {
      setFormError(err.message || 'Registration failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings & RBAC</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage users, roles, and system permissions
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ name: '', email: '', password: '', role: 'DRIVER' }); setFormError(''); setShowModal(true) }}>
          <UserPlus size={18} />
          Register User
        </button>
      </div>

      {/* Role Permission Cards */}
      <div className="settings-role-grid">
        {ROLES.map(role => (
          <div className="settings-role-card card" key={role}>
            <div className="settings-role-header">
              <Shield size={20} style={{ color: 'var(--color-primary)' }} />
              <span className={ROLE_BADGE[role]}>{ROLE_LABELS[role]}</span>
            </div>
            <div className="settings-role-perms">
              <p className="settings-perms-label">Permissions</p>
              <ul>
                {ROLE_PERMISSIONS[role].map(p => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Current User Info */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3>Current Session</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="empty-state">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={3} className="empty-state">No user data</td></tr>
              ) : (
                users.map((u, i) => (
                  <tr key={i}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><span className={ROLE_BADGE[u.role] || 'badge'}>{ROLE_LABELS[u.role] || u.role}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Register New User</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRegister}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formError && <div className="login-error">{formError}</div>}

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input className="form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required>
                    {ROLES.map(r => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Registering…' : 'Register'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
