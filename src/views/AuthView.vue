<template>
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="auth-logo">⌖ GeoGo</div>

      <div class="tabs">
        <button class="tab" :class="{ active: mode === 'login' }" @click="mode = 'login'">
          Войти
        </button>
        <button class="tab" :class="{ active: mode === 'register' }" @click="mode = 'register'">
          Регистрация
        </button>
      </div>

      <div class="form">
        <div class="field">
          <label class="label">Email</label>
          <input
            v-model="email"
            class="input"
            type="email"
            placeholder="you@example.com"
            @keyup.enter="submit"
          />
        </div>
        <div class="field">
          <label class="label">Пароль</label>
          <input
            v-model="password"
            class="input"
            type="password"
            placeholder="••••••••"
            @keyup.enter="submit"
          />
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button class="btn" @click="submit" :disabled="loading">
          {{ loading ? '...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { auth } from '../stores/auth.js'

export default {
  emits: ['success'],
  data() {
    return { mode: 'login', email: '', password: '', error: null, loading: false }
  },
  methods: {
    async submit() {
      this.error = null
      this.loading = true
      try {
        if (this.mode === 'login') {
          await auth.login(this.email, this.password)
        } else {
          await auth.register(this.email, this.password)
        }
        this.$emit('success')
      } catch (e) {
        this.error = e.response?.data?.error || 'Ошибка'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.auth-wrap {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.auth-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.auth-logo {
  font-family: var(--font-mono);
  font-size: 22px;
  color: var(--accent);
  text-align: center;
}
.tabs {
  display: flex;
  gap: 4px;
  background: var(--bg-input);
  border-radius: 8px;
  padding: 4px;
}
.tab {
  flex: 1;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 14px;
  font-family: var(--font-ui);
  padding: 8px;
  border-radius: 6px;
  transition: all 0.15s;
}
.tab.active {
  background: var(--bg-card);
  color: var(--text);
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
.error-msg {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 14px;
  color: var(--error);
}
</style>
