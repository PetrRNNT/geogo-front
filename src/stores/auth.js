import { reactive } from 'vue'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const auth = reactive({
  token: localStorage.getItem('token') || null,
  email: localStorage.getItem('email') || null,
  role: localStorage.getItem('role') || null,

  get isLoggedIn() {
    return !!this.token
  },

  get isAdmin() {
    return this.role === 'admin'
  },

  async login(email, password) {
    const res = await axios.post(`${API}/auth/login`, { email, password })
    this.token = res.data.token
    this.email = res.data.email
    this.role = res.data.role
    localStorage.setItem('token', this.token)
    localStorage.setItem('email', this.email)
    localStorage.setItem('role', this.role)
  },

  async register(email, password) {
    await axios.post(`${API}/auth/register`, { email, password })
    await this.login(email, password)
  },

  logout() {
    this.token = null
    this.email = null
    this.role = null
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('role')
  }
})