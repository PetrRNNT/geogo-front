import axios from 'axios'
import { auth } from './stores/auth.js'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
})

// Автоматически добавляет токен в каждый запрос
api.interceptors.request.use((config) => {
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

export const geocode = (address) =>
  api.get('/geocode', { params: { address } })

export const reverseGeocode = (lat, lon) =>
  api.get('/reverse', { params: { lat, lon } })

export const getPlaces = () =>
  api.get('/places')

export const addPlace = (place) =>
  api.post('/places', place)

export const deletePlace = (id) =>
  api.delete(`/places/${id}`)