<template>
  <div class="places-layout">
    <div class="places-header">
      <h2 class="title">
        Все места <span class="count" v-if="places">{{ places.length }}</span>
      </h2>
      <input
        v-model="filter"
        class="input search-input"
        placeholder="Фильтр по названию или городу..."
      />
    </div>

    <div v-if="loading" class="state-msg">Загрузка...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else-if="!places || places.length === 0" class="state-msg">
      Мест пока нет. <span class="accent">Добавь первое!</span>
    </div>

    <div v-else class="places-grid">
      <div
        v-for="place in filtered"
        :key="place.id"
        class="place-card"
        @click="selectPlace(place)"
        :class="{ selected: selected?.id === place.id }"
      >
        <div class="place-top">
          <span class="place-name">{{ place.name }}</span>
          <span class="place-country">{{ place.country }}</span>
        </div>
        <div class="place-address">{{ place.address }}, {{ place.city }}</div>
        <div class="place-coords">{{ place.lat.toFixed(4) }}, {{ place.lon.toFixed(4) }}</div>
        <button v-if="auth.isAdmin" class="delete-btn" @click.stop="deletePlace(place.id)">
          Удалить
        </button>
      </div>
    </div>

    <!-- Детальная панель -->
    <div v-if="selected" class="detail-panel">
      <div class="detail-inner">
        <button class="close-btn" @click="selected = null">✕</button>
        <div class="detail-name">{{ selected.name }}</div>
        <div class="detail-row">
          <span class="detail-label">Адрес</span>
          <span>{{ selected.address }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Город</span>
          <span>{{ selected.city }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Страна</span>
          <span>{{ selected.country }}</span>
        </div>
        <div class="detail-coords">
          <span class="coords-tag">lat</span>{{ selected.lat.toFixed(6) }}
          <span class="coords-tag" style="margin-left: 12px">lon</span>{{ selected.lon.toFixed(6) }}
        </div>
        <a
          :href="`https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lon}&zoom=15`"
          target="_blank"
          class="osm-link"
          >Открыть на карте →</a
        >
      </div>
    </div>
  </div>
</template>

<script>
import { auth } from '../stores/auth.js'
import { getPlaces, deletePlace as deletePlaceApi } from '../api.js'

export default {
  data() {
    return { places: [], loading: true, error: null, filter: '', selected: null, auth }
  },
  computed: {
    filtered() {
      if (!this.filter) return this.places
      const q = this.filter.toLowerCase()
      return this.places.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.country?.toLowerCase().includes(q),
      )
    },
  },
  async mounted() {
    try {
      const res = await getPlaces()
      this.places = res.data || []
    } catch (e) {
      this.error = 'Не удалось загрузить места'
    } finally {
      this.loading = false
    }
  },
  methods: {
    selectPlace(place) {
      this.selected = this.selected?.id === place.id ? null : place
    },
    async deletePlace(id) {
      if (!confirm('Удалить место?')) return
      try {
        await deletePlaceApi(id)
        this.places = this.places.filter((p) => p.id !== id)
        if (this.selected?.id === id) this.selected = null
      } catch (e) {
        alert('Ошибка удаления')
      }
    },
  },
}
</script>

<style scoped>
.places-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.places-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.title {
  font-size: 22px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}
.count {
  font-size: 13px;
  font-family: var(--font-mono);
  background: var(--accent-dim);
  color: var(--accent);
  padding: 2px 8px;
  border-radius: 20px;
}
.search-input {
  max-width: 320px;
  flex: 1;
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

.state-msg {
  color: var(--text-muted);
  font-size: 15px;
  padding: 40px 0;
  text-align: center;
}
.accent {
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

.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}
.place-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    transform 0.1s;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.place-card:hover {
  border-color: #2d4a6e;
  transform: translateY(-1px);
}
.place-card.selected {
  border-color: var(--accent);
}

.place-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.place-name {
  font-size: 16px;
  font-weight: 600;
}
.place-country {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}
.place-address {
  font-size: 13px;
  color: var(--text-muted);
}
.place-coords {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--accent);
  margin-top: 4px;
}

.detail-panel {
  position: fixed;
  right: 24px;
  bottom: 24px;
  background: var(--bg-card);
  border: 1px solid var(--accent);
  border-radius: 12px;
  width: 300px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
.detail-inner {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}
.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 14px;
}
.close-btn:hover {
  color: var(--text);
}
.detail-name {
  font-size: 18px;
  font-weight: 600;
  padding-right: 24px;
}
.detail-row {
  display: flex;
  gap: 8px;
  font-size: 14px;
}
.detail-label {
  color: var(--text-muted);
  min-width: 60px;
}
.detail-coords {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--accent);
  background: var(--accent-dim);
  padding: 8px 12px;
  border-radius: 6px;
}
.coords-tag {
  font-size: 10px;
  opacity: 0.6;
  margin-right: 6px;
}
.osm-link {
  color: var(--accent);
  font-size: 13px;
  text-decoration: none;
  padding-top: 4px;
  transition: opacity 0.15s;
}
.osm-link:hover {
  opacity: 0.75;
}
.delete-btn {
  margin-top: 8px;
  background: none;
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 6px;
  color: var(--error);
  font-size: 12px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.15s;
  align-self: flex-start;
}
.delete-btn:hover {
  background: rgba(248, 113, 113, 0.1);
}
</style>
