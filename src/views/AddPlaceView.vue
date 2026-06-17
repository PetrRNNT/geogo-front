<template>
  <div class="add-layout">
    <div class="add-panel">
      <h2 class="title">Добавить место</h2>
      <p class="subtitle">Кликни по карте чтобы выбрать координаты, или введи вручную</p>

      <div class="form">
        <div class="field">
          <label class="label">Название *</label>
          <input v-model="form.name" class="input" placeholder="Эйфелева башня" />
        </div>
        <div class="field-row">
          <div class="field">
            <label class="label">Страна</label>
            <input v-model="form.country" class="input" placeholder="France" />
          </div>
          <div class="field">
            <label class="label">Город</label>
            <input v-model="form.city" class="input" placeholder="Paris" />
          </div>
        </div>
        <div class="field">
          <label class="label">Адрес</label>
          <input v-model="form.address" class="input" placeholder="Champ de Mars, 5" />
        </div>
        <div class="field-row">
          <div class="field">
            <label class="label">Широта (lat)</label>
            <input
              v-model="form.lat"
              class="input mono"
              placeholder="48.8584"
              type="number"
              step="any"
            />
          </div>
          <div class="field">
            <label class="label">Долгота (lon)</label>
            <input
              v-model="form.lon"
              class="input mono"
              placeholder="2.2945"
              type="number"
              step="any"
            />
          </div>
        </div>

        <button class="btn" @click="submit" :disabled="loading || !form.name">
          {{ loading ? 'Сохраняем...' : 'Сохранить место' }}
        </button>

        <div v-if="success" class="success-msg">✓ Место добавлено!</div>
        <div v-if="error" class="error-msg">{{ error }}</div>
      </div>
    </div>

    <div class="map-wrap">
      <div id="add-map" ref="mapEl"></div>
      <div class="map-hint">Кликни по карте чтобы выбрать точку</div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { addPlace } from '../api.js'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default {
  data() {
    return {
      form: { name: '', country: '', city: '', address: '', lat: '', lon: '' },
      loading: false,
      success: false,
      error: null,
      map: null,
      marker: null,
    }
  },
  mounted() {
    this.map = L.map(this.$refs.mapEl, { center: [48, 16], zoom: 4 })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      maxZoom: 19,
    }).addTo(this.map)

    this.map.on('click', (e) => {
      this.form.lat = e.latlng.lat.toFixed(6)
      this.form.lon = e.latlng.lng.toFixed(6)
      if (this.marker) this.marker.remove()
      this.marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(this.map)
    })
  },
  beforeUnmount() {
    if (this.map) this.map.remove()
  },
  methods: {
    async submit() {
      this.error = null
      this.success = false
      this.loading = true
      try {
        await addPlace({
          name: this.form.name,
          country: this.form.country,
          city: this.form.city,
          address: this.form.address,
          lat: parseFloat(this.form.lat),
          lon: parseFloat(this.form.lon),
        })
        this.success = true
        this.form = { name: '', country: '', city: '', address: '', lat: '', lon: '' }
        if (this.marker) {
          this.marker.remove()
          this.marker = null
        }
      } catch (e) {
        this.error = e.response?.data?.error || 'Ошибка при сохранении'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.add-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
  height: calc(100vh - 60px - 64px);
}
.add-panel {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.title {
  font-size: 22px;
  font-weight: 600;
}
.subtitle {
  font-size: 13px;
  color: var(--text-muted);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.input {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-family: var(--font-ui);
  font-size: 14px;
  padding: 10px 14px;
  outline: none;
  transition: border 0.15s;
}
.input:focus {
  border-color: var(--accent);
}
.input::placeholder {
  color: var(--text-muted);
}
.input.mono {
  font-family: var(--font-mono);
}
.input[type='number']::-webkit-outer-spin-button,
.input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.btn {
  background: var(--accent);
  color: #0a0f1e;
  border: none;
  border-radius: 8px;
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 600;
  padding: 12px;
  cursor: pointer;
  transition: opacity 0.15s;
  margin-top: 4px;
}
.btn:hover {
  opacity: 0.85;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success-msg {
  background: var(--accent-dim);
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 14px;
  color: var(--accent);
}
.error-msg {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 14px;
  color: var(--error);
}

.map-wrap {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
}
#add-map {
  width: 100%;
  height: 100%;
}
.map-hint {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(10, 15, 30, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 12px;
  color: var(--text-muted);
  pointer-events: none;
}
</style>
