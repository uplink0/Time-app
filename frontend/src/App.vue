<template>
  <main class="page">
    <section class="card">
      <p class="eyebrow">Focus Time</p>

      <h1>Твой личный таймер концентрации</h1>

      <p class="subtitle">
        Сохраняй важные временные отметки и следи за своим рабочим ритмом.
      </p>

      <div class="clock">
        {{ currentTime }}
      </div>

      <p class="date">
        {{ currentDate }}
      </p>

      <div class="actions">
        <button @click="saveCurrentTime" :disabled="loading">
          Сохранить время
        </button>

        <button class="secondary" @click="loadTimes" :disabled="loading">
          Обновить
        </button>
      </div>

      <p v-if="message" class="message">
        {{ message }}
      </p>
    </section>

    <section class="history">
      <h2>История сохранений</h2>

      <div v-if="times.length === 0" class="empty">
        Пока нет сохранённых записей.
      </div>

      <div v-for="item in times" :key="item.id" class="history-item">
        <div>
          <strong>{{ item.time }}</strong>
          <span>{{ formatDate(item.created_at) }}</span>
        </div>

        <button class="delete" @click="deleteTime(item.id)">
          Удалить
        </button>
      </div>
    </section>
  </main>
</template>

<script>
export default {
  data() {
    return {
      currentTime: '',
      currentDate: '',
      times: [],
      loading: false,
      message: '',
      timer: null,
      apiUrl: 'http://localhost:5555'
    }
  },

  mounted() {
    this.updateClock()
    this.timer = setInterval(this.updateClock, 1000)
    this.loadTimes()
  },

  beforeUnmount() {
    clearInterval(this.timer)
  },

  methods: {
    updateClock() {
      const now = new Date()

      this.currentTime = now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })

      this.currentDate = now.toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    },

    async loadTimes() {
      try {
        this.loading = true
        const response = await fetch(`${this.apiUrl}/times`)
        this.times = await response.json()
      } catch (error) {
        this.message = 'Не удалось загрузить историю'
      } finally {
        this.loading = false
      }
    },

    async saveCurrentTime() {
      try {
        this.loading = true

        await fetch(`${this.apiUrl}/times`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            time: this.currentTime
          })
        })

        this.message = 'Время сохранено'
        await this.loadTimes()
      } catch (error) {
        this.message = 'Не удалось сохранить время'
      } finally {
        this.loading = false
      }
    },

    async deleteTime(id) {
      try {
        this.loading = true
        await fetch(`${this.apiUrl}/time/${id}`, {
          method: 'DELETE'
        })

        this.message = 'Запись удалена'
        await this.loadTimes()
      } catch (error) {
        this.message = 'Не удалось удалить запись'
      } finally {
        this.loading = false
      }
    },

    formatDate(value) {
      if (!value) return ''

      return new Date(value).toLocaleString('ru-RU')
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background:
    radial-gradient(circle at top left, #ffe5b4, transparent 35%),
    linear-gradient(135deg, #101828, #1d2939);
  color: #fff;
}

.page {
  min-height: 100vh;
  padding: 40px 20px;
  display: grid;
  gap: 24px;
  place-items: center;
}

.card,
.history {
  width: min(760px, 100%);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.1);
  padding: 36px;
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
}

.eyebrow {
  margin: 0 0 12px;
  color: #ffd166;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(32px, 6vw, 64px);
  line-height: 1;
}

.subtitle {
  max-width: 520px;
  color: #d0d5dd;
  font-size: 18px;
}

.clock {
  margin: 32px 0 8px;
  font-size: clamp(56px, 12vw, 120px);
  font-weight: 800;
  letter-spacing: -0.06em;
}

.date {
  color: #d0d5dd;
  font-size: 18px;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 28px;
}

button {
  border: 0;
  border-radius: 999px;
  padding: 14px 22px;
  cursor: pointer;
  font-weight: 700;
  color: #101828;
  background: #ffd166;
}

button:hover {
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary {
  background: #fff;
}

.message {
  margin-top: 18px;
  color: #98fb98;
}

.history h2 {
  margin-top: 0;
}

.empty {
  color: #d0d5dd;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.history-item span {
  display: block;
  margin-top: 4px;
  color: #d0d5dd;
  font-size: 14px;
}

.delete {
  background: #ff6b6b;
  color: #fff;
}
</style>