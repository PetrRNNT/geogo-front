import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
})

export const geocode = (address) =>
  api.get('/geocode', { params: { address } })

export const reverseGeocode = (lat, lon) =>
  api.get('/reverse', { params: { lat, lon } })

export const getPlaces = () =>
  api.get('/places')

export const addPlace = (place, apiKey) =>
  api.post('/places', place, {
    headers: { 'X-API-Key': apiKey }
  })
