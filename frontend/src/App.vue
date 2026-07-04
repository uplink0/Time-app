<template>
  <main class="page">
    <div v-if="authLoading" class="loading">Загрузка...</div>

    <Auth
      v-else-if="!user"
      :api-url="apiUrl"
      @auth-success="handleAuthSuccess"
    />

    <template v-else>
      <section class="app">
        <div class="top">
          <p class="eyebrow">Focus Time</p>
          <h1>Фокус-таймер</h1>
          <p class="subtitle">
            Привет,{{ user.username }}. Это твоё личное пространство.
          </p>

          <button class="logout" @click="logout">Выйти</button>
        </div>

        <input
          v-model="title"
          class="task-input"
          placeholder="Например: Изучение Docker"
          :disabled="!!activeSession"
        />

        <div class="time-grid">
          <div class="panel">
            <span>Текущее время</span>
            <strong>{{ currentTime }}</strong>
            <small>{{ currentDate }}</small>
          </div>

          <div class="panel accent">
            <span>Таймер сессии</span>
            <strong>{{ formattedTimer }}</strong>

            <div v-if="!activeSession" class="presets">
              <button @click="setDuration(5)">5 мин</button>
              <button @click="setDuration(15)">15 мин</button>
              <button @click="setDuration(25)">25 мин</button>
              <button @click="setDuration(45)">45 мин</button>
            </div>

            <div v-if="!activeSession" class="manual-duration">
              <label>Своя длительность, минут</label>

              <input
                v-model.number="durationMinutes"
                @input="setDuration(durationMinutes)"
                class="duration-input"
                type="number"
                min="1"
                max="180"
                placeholder="Например: 30"
              />
            </div>
          </div>
        </div>

        <div class="actions">
          <button
            v-if="!activeSession"
            @click="startFocusSession"
            :disabled="loading"
          >
            Начать сессию
          </button>

          <button
            v-if="activeSession"
            class="danger"
            @click="finishFocusSession"
            :disabled="loading"
          >
            Завершить
          </button>

          <button v-if="activeSession" class="light" @click="pauseTimer">
            {{ isPaused ? 'Продолжить' : 'Пауза' }}
          </button>

          <button class="light" @click="loadData" :disabled="loading">
            Обновить
          </button>
        </div>

        <p v-if="activeSession" class="active">
          Активная сессия: {{ activeSession.title }}
        </p>

        <p v-if="message" class="message">
          {{ message }}
        </p>
      </section>

      <section class="stats">
        <div>
          <strong>{{ stats.total_sessions }}</strong>
          <span>сессий</span>
        </div>
        <div>
          <strong>{{ stats.total_minutes }}</strong>
          <span>минут</span>
        </div>
        <div>
          <strong>{{ stats.longest_session }}</strong>
          <span>максимум</span>
        </div>
      </section>

      <section class="history">
        <h2>История</h2>

        <div v-if="finishedSessions.length === 0" class="empty">
          Завершённых сессий пока нет.
        </div>

        <div
          v-for="session in finishedSessions"
          :key="session.id"
          class="history-item"
        >
          <strong>{{ session.title }}</strong>
          <span
            >{{ session.duration_minutes }} мин ·
            {{ formatDate(session.started_at) }}</span
          >
        </div>
      </section>
    </template>
  </main>
</template>

<script>
import Auth from './components/Auth.vue'

export default {
  components: {
    Auth,
  },

  data() {
    return {
      user: null,
      authLoading: true,
      title: '',
      durationMinutes: 25,
      remainingSeconds: 25 * 60,
      currentTime: '',
      currentDate: '',
      sessions: [],
      activeSession: null,
      stats: {
        total_sessions: 0,
        total_minutes: 0,
        longest_session: 0,
      },
      loading: false,
      message: '',
      clockTimer: null,
      sessionTimer: null,
      isPaused: false,
      timerFinished: false,
      apiUrl: '/api',
    }
  },

  computed: {
    formattedTimer() {
      const minutes = Math.floor(this.remainingSeconds / 60)
      const seconds = this.remainingSeconds % 60
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
        2,
        '0'
      )}`
    },

    finishedSessions() {
      return this.sessions.filter((item) => item.status === 'finished')
    },
  },

  mounted() {
    this.updateClock()
    this.clockTimer = setInterval(this.updateClock, 1000)
    this.checkAuth()
  },

  beforeUnmount() {
    clearInterval(this.clockTimer)
    clearInterval(this.sessionTimer)
  },

  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem('token')

      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    },

    async checkAuth() {
      const token = localStorage.getItem('token')

      if (!token) {
        this.authLoading = false
        return
      }

      try {
        const response = await fetch(`${this.apiUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          localStorage.removeItem('token')
          return
        }

        this.user = data.user
        await this.loadData()
      } catch (error) {
        localStorage.removeItem('token')
      } finally {
        this.authLoading = false
      }
    },

    handleAuthSuccess(user) {
      this.user = user
      this.loadData()
    },

    logout() {
      localStorage.removeItem('token')
      clearInterval(this.sessionTimer)

      this.user = null
      this.sessions = []
      this.activeSession = null
      this.message = ''
      this.remainingSeconds = Number(this.durationMinutes) * 60
    },

    updateClock() {
      const now = new Date()

      this.currentTime = now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      this.currentDate = now.toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    },

    setDuration(minutes) {
      const safeMinutes = Number(minutes) > 0 ? Number(minutes) : 25
      this.durationMinutes = safeMinutes
      this.remainingSeconds = safeMinutes * 60
    },

    async loadData() {
      await Promise.all([this.loadSessions(), this.loadStats()])
    },

    async loadSessions() {
      try {
        const response = await fetch(`${this.apiUrl}/sessions`, {
          headers: this.getAuthHeaders(),
        })

        const data = await response.json()

        this.sessions = data
        this.activeSession =
          data.find((item) => item.status === 'active') || null
      } catch (error) {
        this.message = 'Не удалось загрузить сессии'
      }
    },

    async loadStats() {
      try {
        const response = await fetch(`${this.apiUrl}/stats`, {
          headers: this.getAuthHeaders(),
        })

        this.stats = await response.json()
      } catch (error) {
        this.message = 'Не удалось загрузить статистику'
      }
    },

    async startFocusSession() {
      try {
        this.loading = true
        this.message = ''

        const sessionTitle = this.title.trim() || 'Фокус-сессия'

        const response = await fetch(`${this.apiUrl}/sessions/start`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ title: sessionTitle }),
        })

        this.activeSession = await response.json()
        this.remainingSeconds = Number(this.durationMinutes) * 60
        this.timerFinished = false
        this.isPaused = false
        this.title = ''

        this.startLocalTimer()
        await this.loadData()

        this.message = 'Сессия началась'
      } catch (error) {
        this.message = 'Не удалось начать сессию'
      } finally {
        this.loading = false
      }
    },

    startLocalTimer() {
      clearInterval(this.sessionTimer)

      this.sessionTimer = setInterval(() => {
        if (this.isPaused) return

        if (this.remainingSeconds <= 1) {
          this.remainingSeconds = 0
          this.timerFinished = true
          clearInterval(this.sessionTimer)

          this.finishFocusSession(true)
          return
        }

        this.remainingSeconds -= 1
      }, 1000)
    },

    pauseTimer() {
      this.isPaused = !this.isPaused
    },

    async finishFocusSession(isAutoFinish = false) {
      if (!this.activeSession) return

      try {
        this.loading = true

        await fetch(`${this.apiUrl}/sessions/finish/${this.activeSession.id}`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
        })

        clearInterval(this.sessionTimer)

        this.activeSession = null
        this.isPaused = false
        this.remainingSeconds = Number(this.durationMinutes) * 60

        await this.loadData()

        this.message = isAutoFinish
          ? 'Время вышло. Сессия сохранена автоматически'
          : 'Сессия сохранена'
      } catch (error) {
        this.message = 'Не удалось завершить сессию'
      } finally {
        this.loading = false
      }
    },

    formatDate(value) {
      if (!value) return ''
      return new Date(value).toLocaleString('ru-RU')
    },
  },
}
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #101828;
  color: #fff;
}

.page {
  min-height: 100vh;
  padding: 24px;
  display: grid;
  gap: 18px;
  justify-items: center;
  align-content: start;
}

.loading {
  margin-top: 80px;
  color: #d0d5dd;
  font-size: 20px;
}

.app,
.stats,
.history {
  width: min(960px, 100%);
  border-radius: 24px;
  background: #1d2939;
  padding: 28px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #ffd166;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: 42px;
}

.subtitle {
  margin: 10px 0 0;
  color: #d0d5dd;
}

.logout {
  margin-top: 16px;
  background: #fff;
}

.task-input,
.duration-input {
  width: 100%;
  margin-top: 16px;
  border: 0;
  border-radius: 14px;
  padding: 14px 16px;
  font-size: 16px;
  outline: none;
}

.time-grid {
  margin-top: 22px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.panel {
  border-radius: 20px;
  background: #344054;
  padding: 22px;
}

.panel span {
  display: block;
  color: #d0d5dd;
  margin-bottom: 8px;
}

.panel strong {
  display: block;
  font-size: 52px;
  line-height: 1;
}

.panel small {
  display: block;
  margin-top: 10px;
  color: #d0d5dd;
}

.accent {
  background: #26384f;
}

.presets {
  display: flex;
  gap: 8px;
  margin-top: 18px;
  flex-wrap: wrap;
}

.presets button {
  padding: 8px 12px;
  background: #fff;
}

.manual-duration {
  margin-top: 14px;
}

.manual-duration label {
  display: block;
  margin-bottom: 8px;
  color: #d0d5dd;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 22px;
}

button {
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  cursor: pointer;
  font-weight: 700;
  color: #101828;
  background: #ffd166;
}

.light {
  background: #fff;
}

.danger {
  color: #fff;
  background: #ff6b6b;
}

.active {
  margin-top: 16px;
  color: #ffd166;
  font-weight: 700;
}

.done,
.message {
  margin-top: 12px;
  color: #98fb98;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.stats div {
  border-radius: 18px;
  background: #344054;
  padding: 18px;
}

.stats strong {
  display: block;
  font-size: 32px;
}

.stats span {
  color: #d0d5dd;
}

.history h2 {
  margin-top: 0;
}

.empty {
  color: #d0d5dd;
}

.history-item {
  padding: 14px 0;
  border-top: 1px solid #475467;
}

.history-item span {
  display: block;
  margin-top: 4px;
  color: #d0d5dd;
}

@media (max-width: 760px) {
  .time-grid,
  .stats {
    grid-template-columns: 1fr;
  }

  .panel strong {
    font-size: 42px;
  }

  h1 {
    font-size: 34px;
  }
}
</style>
