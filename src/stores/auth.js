import { reactive } from 'vue'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const auth = reactive({
  token: localStorage.getItem('token') || null,
  email: localStorage.getItem('email') || null,

  get isLoggedIn() {
    return !!this.token
  },

  async login(email, password) {
    const res = await axios.post(`${API}/auth/login`, { email, password })
    this.token = res.data.token
    this.email = res.data.email
    localStorage.setItem('token', this.token)
    localStorage.setItem('email', this.email)
  },

  async register(email, password) {
    await axios.post(`${API}/auth/register`, { email, password })
    await this.login(email, password)
  },

  logout() {
    this.token = null
    this.email = null
    localStorage.removeItem('token')
    localStorage.removeItem('email')
  }
})