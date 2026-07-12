import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Truck, Eye, EyeOff, Shield, Users, Route, BarChart3 } from 'lucide-react'
import './LoginPage.css'

const FEATURES = [
  { icon: Truck, text: 'Fleet Management' },
  { icon: Route, text: 'Trip Dispatcher' },
  { icon: Shield, text: 'Safety Officer' },
  { icon: BarChart3, text: 'Financial Analyst' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Decorative background */}
      <div className="login-bg">
        <div className="login-bg-circle login-bg-circle-1" />
        <div className="login-bg-circle login-bg-circle-2" />
        <div className="login-bg-circle login-bg-circle-3" />
      </div>

      <div className="login-split">
        {/* Left Branding Panel */}
        <div className="login-brand-panel">
          <div className="login-brand-content">
            <div className="login-brand-logo">
              <Truck size={32} />
            </div>
            <h1 className="login-brand-title">TransitOps</h1>
            <p className="login-brand-subtitle">Smart Transport Operations Platform</p>

            <div className="login-features">
              <p className="login-features-label">Key System Roles</p>
              {FEATURES.map(({ icon: Icon, text }) => (
                <div className="login-feature" key={text}>
                  <div className="login-feature-dot"><Icon size={14} /></div>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <p className="login-brand-footer">TransitOps © 2026 · Built with ❤️</p>
          </div>
        </div>

        {/* Right Sign-In Panel */}
        <div className="login-form-panel">
          <div className="login-form-container">
            <h2 className="login-form-heading">Sign in to your account</h2>
            <p className="login-form-subheading">Enter your credentials below</p>

            {/* Demo Credential Quick-Select */}
            <div className="login-demo">
              <p className="login-demo-title">Quick Login</p>
              <div className="login-demo-grid">
                <DemoCred role="Fleet Manager" email="fleet@transitops.com" pw="fleet123" onClick={(e, p) => { setEmail(e); setPassword(p) }} />
                <DemoCred role="Driver" email="driver@transitops.com" pw="driver123" onClick={(e, p) => { setEmail(e); setPassword(p) }} />
                <DemoCred role="Safety Officer" email="safety@transitops.com" pw="safety123" onClick={(e, p) => { setEmail(e); setPassword(p) }} />
                <DemoCred role="Financial Analyst" email="finance@transitops.com" pw="finance123" onClick={(e, p) => { setEmail(e); setPassword(p) }} />
              </div>
            </div>

            {/* Error */}
            {error && <div className="login-error">{error}</div>}

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div className="login-password-wrap">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="login-remember">
                <label className="login-checkbox-label">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                  <span>Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary login-submit"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="login-hint">
              <p>* Fleet Manager = <strong>fleet@transitops.com</strong> / <strong>fleet123</strong></p>
              <p>* Driver = <strong>driver@transitops.com</strong> / <strong>driver123</strong></p>
              <p>* Safety Officer = <strong>safety@transitops.com</strong> / <strong>safety123</strong></p>
              <p>* Financial Analyst = <strong>finance@transitops.com</strong> / <strong>finance123</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DemoCred({ role, email, pw, onClick }) {
  return (
    <button
      type="button"
      className="login-demo-btn"
      onClick={() => onClick(email, pw)}
    >
      {role}
    </button>
  )
}
