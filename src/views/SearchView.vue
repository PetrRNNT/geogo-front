<template>
  <div class="search-layout">
    <!-- Левая панель -->
    <div class="panel">
      <div class="tabs">
        <button class="tab" :class="{ active: mode === 'address' }" @click="mode = 'address'">
          Адрес → Координаты
        </button>
        <button class="tab" :class="{ active: mode === 'coords' }" @click="mode = 'coords'">
          Координаты → Адрес
        </button>
      </div>

      <!-- Поиск по адресу -->
      <div v-if="mode === 'address'" class="form">
        <label class="label">Адрес или название</label>
        <div class="input-row">
          <input
            v-model="query"
            class="input"
            placeholder="Кремль, Эйфелева башня..."
            @keyup.enter="search"
          />
          <button class="btn" @click="search" :disabled="loading">
            {{ loading ? '...' : 'Найти' }}
          </button>
        </div>
      </div>

      <!-- Поиск по координатам -->
      <div v-if="mode === 'coords'" class="form">
        <label class="label">Координаты</label>
        <div class="coords-row">
          <input v-model="lat" class="input" placeholder="Широта (lat)" type="number" step="any" />
          <input v-model="lon" class="input" placeholder="Долгота (lon)" type="number" step="any" />
        </div>
        <button class="btn full" @click="search" :disabled="loading">
          {{ loading ? '...' : 'Найти место' }}
        </button>
      </div>

      <!-- Ошибка -->
      <div v-if="error" class="error-msg">{{ error }}</div>

      <!-- Результат -->
      <div v-if="result" class="result">
        <div class="result-label">Результат</div>
        <div class="result-name">{{ result.name }}</div>
        <div class="result-address">{{ result.address }}, {{ result.city }}, {{ result.country }}</div>
        <div class="result-coords">
          <span class="coords-tag">lat</span>{{ result.lat.toFixed(6) }}
          <span class="coords-tag" style="margin-left:12px">lon</span>{{ result.lon.toFixed(6) }}
          <span class="cursor">_</span>
        </div>
      </div>

      <!-- Подсказка клика по карте -->
      <div class="hint">
        <span class="hint-icon">⌖</span>
        Кликни по карте для обратного геокодинга
      </div>
    </div>

    <!-- Карта -->
    <div class="map-wrap">
      <div id="map" ref="mapEl"></div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { geocode, reverseGeocode } from '../api.js'

// Фикс иконок Leaflet в Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default {
  data() {
    return {
      mode: 'address',
      query: '',
      lat: '',
      lon: '',
      result: null,
      error: null,
      loading: false,
      map: null,
      marker: null,
    }
  },
  mounted() {
    this.initMap()
  },
  beforeUnmount() {
    if (this.map) this.map.remove()
  },
  methods: {
    initMap() {
      this.map = L.map(this.$refs.mapEl, {
        center: [48, 16],
        zoom: 4,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19,
      }).addTo(this.map)

      this.map.on('click', (e) => {
        this.mode = 'coords'
        this.lat = e.latlng.lat.toFixed(6)
        this.lon = e.latlng.lng.toFixed(6)
        this.search()
      })
    },

    async search() {
      this.error = null
      this.result = null
      this.loading = true

      try {
        let res
        if (this.mode === 'address') {
          res = await geocode(this.query)
        } else {
          res = await reverseGeocode(this.lat, this.lon)
        }

        this.result = res.data
        this.placeMarker(res.data.lat, res.data.lon)
      } catch (e) {
        this.error = e.response?.data?.error || 'Место не найдено'
      } finally {
        this.loading = false
      }
    },

    placeMarker(lat, lon) {
      if (this.marker) this.marker.remove()
      this.marker = L.marker([lat, lon]).addTo(this.map)
      this.map.flyTo([lat, lon], 13, { duration: 1.2 })
    },
  }
}
</script>

<style scoped>
.search-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
  height: calc(100vh - 60px - 64px);
}

.panel {
  display: flex; flex-direction: column; gap: 20px;
  overflow-y: auto;
}

.tabs { display: flex; gap: 4px; background: var(--bg-card); border-radius: 8px; padding: 4px; }
.tab {
  flex: 1; background: none; border: none; cursor: pointer;
  color: var(--text-muted); font-size: 13px; font-family: var(--font-ui);
  padding: 7px 10px; border-radius: 6px; transition: all 0.15s;
}
.tab.active { background: var(--bg-input); color: var(--text); }

.form { display: flex; flex-direction: column; gap: 10px; }
.label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }

.input-row { display: flex; gap: 8px; }
.coords-row { display: flex; gap: 8px; }

.input {
  flex: 1; background: var(--bg-input); border: 1px solid var(--border);
  border-radius: 8px; color: var(--text); font-family: var(--font-ui); font-size: 14px;
  padding: 10px 14px; outline: none; transition: border 0.15s;
  width: 100%;
}
.input:focus { border-color: var(--accent); }
.input::placeholder { color: var(--text-muted); }

/* Remove number input arrows */
.input[type=number]::-webkit-outer-spin-button,
.input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }

.btn {
  background: var(--accent); color: #0a0f1e; border: none; border-radius: 8px;
  font-family: var(--font-ui); font-size: 14px; font-weight: 600;
  padding: 10px 18px; cursor: pointer; white-space: nowrap; transition: opacity 0.15s;
}
.btn:hover { opacity: 0.85; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.full { width: 100%; }

.error-msg {
  background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 8px; padding: 12px 14px; font-size: 14px; color: var(--error);
}

.result {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 10px; padding: 18px;
  display: flex; flex-direction: column; gap: 6px;
}
.result-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
.result-name { font-size: 20px; font-weight: 600; color: var(--text); }
.result-address { font-size: 13px; color: var(--text-muted); }
.result-coords {
  margin-top: 8px; font-family: var(--font-mono); font-size: 13px;
  color: var(--accent); background: var(--accent-dim);
  padding: 8px 12px; border-radius: 6px;
}
.coords-tag {
  font-size: 10px; text-transform: uppercase; opacity: 0.6;
  margin-right: 6px; letter-spacing: 0.05em;
}
.cursor { animation: blink 1s step-end infinite; margin-left: 2px; }
@keyframes blink { 50% { opacity: 0; } }

.hint {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: var(--text-muted);
  margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border);
}
.hint-icon { color: var(--accent); }

.map-wrap { border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
#map { width: 100%; height: 100%; }
</style>
