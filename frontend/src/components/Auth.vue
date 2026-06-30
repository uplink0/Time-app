<template>
  <section class="auth-card">
    <p class="eyebrow">Focus Time</p>

    <h1>{{ isRegister ? 'Регистрация' : 'Вход' }}</h1>

    <p class="subtitle">
      {{ isRegister ? 'Создай аккаунт для личного пространства.' : 'Войди, чтобы увидеть свои сессии.' }}
    </p>

    <input
      v-model="username"
      placeholder="Логин"
    />

    <input
      v-if="isRegister"
      v-model="email"
      placeholder="Email"
      type="email"
    />

    <input
      v-model="password"
      placeholder="Пароль"
      type="password"
    />

    <button @click="submit" :disabled="loading">
      {{ isRegister ? 'Зарегистрироваться' : 'Войти' }}
    </button>

    <button class="link" @click="toggleMode">
      {{ isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться' }}
    </button>

    <p v-if="message" class="message">
      {{ message }}
    </p>
  </section>
</template>

<script>
export default {
  props: {
    apiUrl: {
      type: String,
      required: true
    }
  },

  emits: ['auth-success'],

  data() {
    return {
      isRegister: false,
      username: '',
      email: '',
      password: '',
      loading: false,
      message: ''
    }
  },

  methods: {
    toggleMode() {
      this.isRegister = !this.isRegister
      this.message = ''
    },

    async submit() {
      try {
        this.loading = true
        this.message = ''

        const endpoint = this.isRegister
          ? `${this.apiUrl}/auth/register`
          : `${this.apiUrl}/auth/login`

        const body = this.isRegister
          ? {
              username: this.username,
              email: this.email,
              password: this.password
            }
          : {
              username: this.username,
              password: this.password
            }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        })

        const data = await response.json()

        if (!response.ok) {
          this.message = data.message || 'Ошибка авторизации'
          return
        }

        localStorage.setItem('token', data.token)
        this.$emit('auth-success', data.user)
      } catch (error) {
        this.message = 'Не удалось подключиться к серверу'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.auth-card {
  width: min(420px, 100%);
  border-radius: 24px;
  background: #1d2939;
  padding: 28px;
  color: #fff;
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
  font-size: 36px;
}

.subtitle {
  color: #d0d5dd;
}

input {
  width: 100%;
  margin-top: 14px;
  border: 0;
  border-radius: 14px;
  padding: 14px 16px;
  font-size: 16px;
  outline: none;
}

button {
  width: 100%;
  margin-top: 16px;
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  cursor: pointer;
  font-weight: 700;
  color: #101828;
  background: #ffd166;
}

.link {
  background: transparent;
  color: #ffd166;
}

.message {
  margin-top: 12px;
  color: #ffb4b4;
}
</style>