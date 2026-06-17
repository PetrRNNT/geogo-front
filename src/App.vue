<template>
  <div id="app">
    <AuthView v-if="!auth.isLoggedIn" @success="onLogin" />

    <template v-else>
      <header class="header">
        <div class="header-inner">
          <div class="logo">
            <span class="logo-icon">⌖</span>
            <span class="logo-text">GeoGo</span>
          </div>
          <nav class="nav">
            <button
              class="nav-btn"
              :class="{ active: activeTab === 'search' }"
              @click="activeTab = 'search'"
            >
              Поиск
            </button>
            <button
              class="nav-btn"
              :class="{ active: activeTab === 'places' }"
              @click="activeTab = 'places'"
            >
              Все места
            </button>
            <button
              v-if="auth.isAdmin"
              class="nav-btn"
              :class="{ active: activeTab === 'add' }"
              @click="activeTab = 'add'"
            >
              + Добавить место
            </button>
          </nav>
          <div class="user-info">
            <span class="user-email">{{ auth.email }}</span>
            <button class="logout-btn" @click="auth.logout()">Выйти</button>
          </div>
        </div>
      </header>

      <main class="main">
        <SearchView v-if="activeTab === 'search'" />
        <AddPlaceView v-if="activeTab === 'add'" />
        <PlacesView v-if="activeTab === 'places'" />
      </main>
    </template>
  </div>
</template>

<script>
import { auth } from './stores/auth.js'
import AuthView from './views/AuthView.vue'
import SearchView from './views/SearchView.vue'
import AddPlaceView from './views/AddPlaceView.vue'
import PlacesView from './views/PlacesView.vue'

export default {
  components: { AuthView, SearchView, AddPlaceView, PlacesView },
  data() {
    return { activeTab: 'search', auth }
  },
  methods: {
    onLogin() {
      this.activeTab = 'search'
    },
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg: #0a0f1e;
  --bg-card: #111827;
  --bg-input: #1a2235;
  --border: #1f2d45;
  --accent: #4ade80;
  --accent-dim: #1a3d2b;
  --text: #e2e8f0;
  --text-muted: #64748b;
  --error: #f87171;
  --font-ui: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

html,
body {
  height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-ui);
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  border-bottom: 1px solid var(--border);
  background: rgba(10, 15, 30, 0.95);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 32px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-icon {
  font-size: 22px;
  color: var(--accent);
}
.logo-text {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.5px;
}

.nav {
  display: flex;
  gap: 4px;
}
.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  font-family: var(--font-ui);
  font-size: 14px;
  padding: 6px 14px;
  border-radius: 6px;
  transition:
    color 0.15s,
    background 0.15s;
}
.nav-btn:hover {
  color: var(--text);
  background: var(--bg-input);
}
.nav-btn.active {
  color: var(--accent);
  background: var(--accent-dim);
}

.main {
  flex: 1;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 32px 24px;
}
.user-info {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-email {
  font-size: 13px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.logout-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 13px;
  padding: 4px 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.logout-btn:hover {
  border-color: var(--error);
  color: var(--error);
}
</style>
