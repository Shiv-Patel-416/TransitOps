import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [])

  async function fetchMe() {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const text = await res.text()
        const data = text ? JSON.parse(text) : {}
        setUser(data.user || data)
      } else {
        logout()
      }
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || data.detail || 'Login failed')
    const newToken = data.access_token || data.token
    localStorage.setItem('token', newToken)
    setToken(newToken)
    // Fetch the full user profile (with role) from /me
    const meRes = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${newToken}` },
    })
    if (meRes.ok) {
      const meData = await meRes.json()
      setUser(meData.user || meData)
    } else {
      setUser(data.user || data)
    }
    return data
  }

  async function register(username, email, password, role) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: username, email, password, role }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || data.detail || 'Registration failed')
    localStorage.setItem('token', data.access_token || data.token)
    setToken(data.access_token || data.token)
    setUser(data.user || data)
    return data
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
