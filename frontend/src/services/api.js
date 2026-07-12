const API_BASE = '/api'

function getHeaders() {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function request(method, path, body = null) {
  const opts = { method, headers: getHeaders() }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${API_BASE}${path}`, opts)
  const text = await res.text()
  let data = {}
  try { data = text ? JSON.parse(text) : {} } catch { data = {} }
  if (!res.ok) {
    const msg = data.error?.message || data.detail || `Request failed (${res.status})`
    throw new Error(msg)
  }
  return data
}


export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body || {}),
  delete: (path) => request('DELETE', path),
}
