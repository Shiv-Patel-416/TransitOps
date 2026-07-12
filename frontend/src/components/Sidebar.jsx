import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Settings
} from 'lucide-react'
import { useState, useEffect } from 'react'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vehicles', icon: Truck, label: 'Vehicles' },
  { to: '/drivers', icon: Users, label: 'Drivers' },
  { to: '/trips', icon: Route, label: 'Trips' },
  { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { to: '/fuel-expenses', icon: Fuel, label: 'Fuel & Expenses' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const isDarkStored = localStorage.getItem('darkMode') === 'true'
    setIsDark(isDarkStored)
    if (isDarkStored) document.documentElement.classList.add('dark')
  }, [])

  function toggleDark() {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem('darkMode', next)
    if (next) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Truck size={24} />
        </div>
        {!collapsed && <span className="sidebar-title">TransitOps</span>}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.filter((item) => {
          if (!user || !user.role) return false
          const role = user.role
          if (role === 'FLEET_MANAGER') return true
          if (role === 'FINANCIAL_ANALYST') return true // Sees everything as well
          if (role === 'SAFETY_OFFICER') {
            return ['/', '/vehicles', '/drivers', '/maintenance', '/settings'].includes(item.to)
          }
          if (role === 'DRIVER') {
            return ['/trips', '/fuel-expenses'].includes(item.to)
          }
          return false
        }).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.username || 'User'}</div>
              <div className="sidebar-user-role">
                {user?.role?.replace('_', ' ') || 'Role'}
              </div>
            </div>
          </div>
        )}
        <button className="sidebar-link" onClick={toggleDark} title="Toggle Dark Mode">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button className="sidebar-link sidebar-logout" onClick={handleLogout} title="Logout">
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
