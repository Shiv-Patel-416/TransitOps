import { api } from './api'

// Flip to false the moment the real /vehicles endpoint lands.
const USE_FAKE_DATA = true

export const VEHICLE_TYPES = ['TRUCK', 'VAN', 'BUS', 'CAR', 'MOTORCYCLE']
export const VEHICLE_STATUSES = ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']

// ── Fake in-memory store (shape matches backend Vehicle model) ──
let fakeVehicles = [
  { id: 1, registration_number: 'MH-12-AB-1234', name: 'Tata Prima', model: 'Prima 2830.K', type: 'TRUCK', max_load_capacity: 18000, odometer: 84500, acquisition_cost: 3200000, status: 'AVAILABLE', region: 'West' },
  { id: 2, registration_number: 'DL-01-CD-5678', name: 'Ashok Leyland Dost', model: 'Dost+ LS', type: 'VAN', max_load_capacity: 1250, odometer: 42100, acquisition_cost: 850000, status: 'ON_TRIP', region: 'North' },
  { id: 3, registration_number: 'KA-05-EF-9012', name: 'Volvo 9600', model: '9600 Sleeper', type: 'BUS', max_load_capacity: 5000, odometer: 156700, acquisition_cost: 12500000, status: 'IN_SHOP', region: 'South' },
  { id: 4, registration_number: 'TN-09-GH-3456', name: 'Mahindra Bolero', model: 'Bolero Camper', type: 'CAR', max_load_capacity: 800, odometer: 61300, acquisition_cost: 950000, status: 'AVAILABLE', region: 'South' },
  { id: 5, registration_number: 'GJ-03-IJ-7890', name: 'Eicher Pro', model: 'Pro 2049', type: 'TRUCK', max_load_capacity: 5200, odometer: 203400, acquisition_cost: 1750000, status: 'RETIRED', region: 'West' },
  { id: 6, registration_number: 'RJ-14-KL-2468', name: 'Bajaj RE', model: 'RE Maxima C', type: 'MOTORCYCLE', max_load_capacity: 350, odometer: 28900, acquisition_cost: 240000, status: 'AVAILABLE', region: 'North' },
]
let nextId = 7

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const fakeApi = {
  async list(params = {}) {
    await delay()
    let data = [...fakeVehicles]
    if (params.status) data = data.filter((v) => v.status === params.status)
    return { data, total: data.length, page: 1, limit: data.length }
  },

  async create(payload) {
    await delay()
    if (fakeVehicles.some((v) => v.registration_number === payload.registration_number)) {
      throw new Error('Registration number already exists')
    }
    const vehicle = {
      odometer: 0,
      status: 'AVAILABLE',
      region: null,
      ...payload,
      id: nextId++,
    }
    fakeVehicles.push(vehicle)
    return { data: vehicle }
  },

  async update(id, payload) {
    await delay()
    const idx = fakeVehicles.findIndex((v) => v.id === id)
    if (idx === -1) throw new Error('Vehicle not found')
    fakeVehicles[idx] = { ...fakeVehicles[idx], ...payload }
    return { data: fakeVehicles[idx] }
  },

  async remove(id) {
    await delay()
    const vehicle = fakeVehicles.find((v) => v.id === id)
    if (!vehicle) throw new Error('Vehicle not found')
    if (vehicle.status === 'ON_TRIP') throw new Error('Cannot delete a vehicle that is on a trip')
    fakeVehicles = fakeVehicles.filter((v) => v.id !== id)
    return { message: 'Vehicle deleted' }
  },
}

const realApi = {
  list(params = {}) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString()
    return api.get(`/vehicles${qs ? `?${qs}` : ''}`)
  },
  create: (payload) => api.post('/vehicles', payload),
  update: (id, payload) => api.put(`/vehicles/${id}`, payload),
  remove: (id) => api.delete(`/vehicles/${id}`),
}

export const vehiclesApi = USE_FAKE_DATA ? fakeApi : realApi
