<template>
  <section class="auth-card">
    <p class="eyebrow">Focus Time</p>

    <h1>{{ isRegister ? 'Регистрация' : 'Вход' }}</h1>

    <p class="subtitle">
      {{
        isRegister
          ? 'Создай аккаунт для личного пространства.'
          : 'Войди, чтобы увидеть свои сессии.'
      }}
    </p>

    <input v-model="username" placeholder="Логин" />

    <input v-if="isRegister" v-model="email" placeholder="Email" type="email" />

    <input v-model="password" placeholder="Пароль" type="password" />

    <label v-if="isRegister" class="privacy-check">
      <input v-model="privacyAccepted" type="checkbox" />
      <span>
        Я согласен с
        <button class="privacy-link" type="button" @click="showPrivacyPolicy = !showPrivacyPolicy">
          политикой обработки персональных данных
        </button>
      </span>
    </label>

    <div v-if="isRegister && showPrivacyPolicy" class="privacy-box">
      <h3>Политика обработки персональных данных</h3>
      <p>
        Сервис Focus Time собирает минимальные данные, необходимые для работы приложения:
        логин, email, хеш пароля и данные о фокус-сессиях.
      </p>
      <p>
        Данные используются только для регистрации, входа в аккаунт, хранения личной статистики
        и работы пользовательских сессий.
      </p>
      <p>
        Пароли не хранятся в открытом виде. Для защиты используются HTTPS, JWT, bcrypt,
        firewall и резервное копирование базы данных.
      </p>
      <p>
        Пользователь может запросить удаление аккаунта и связанных данных у администратора сервиса.
      </p>
    </div>

    <button @click="submit" :disabled="loading">
      {{ isRegister ? 'Зарегистрироваться' : 'Войти' }}
    </button>

    <button class="link" @click="toggleMode">
      {{
        isRegister
          ? 'Уже есть аккаунт? Войти'
          : 'Нет аккаунта? Зарегистрироваться'
      }}
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
      required: true,
    },
  },

  emits: ['auth-success'],

  data() {
    return {
      isRegister: false,
      username: '',
      email: '',
      password: '',
      privacyAccepted: false,
      showPrivacyPolicy: false,
      loading: false,
      message: '',
    }
  },

  methods: {
    toggleMode() {
      this.isRegister = !this.isRegister
      this.message = ''
      this.privacyAccepted = false
      this.showPrivacyPolicy = false
    },

    async submit() {
      try {
        this.loading = true
        this.message = ''

        if (this.isRegister && !this.privacyAccepted) {
          this.message = 'Необходимо согласиться с политикой обработки персональных данных'
          return
        }

        const endpoint = this.isRegister
          ? `${this.apiUrl}/auth/register`
          : `${this.apiUrl}/auth/login`

        const body = this.isRegister
          ? {
              username: this.username,
              email: this.email,
              password: this.password,
            }
          : {
              username: this.username,
              password: this.password,
            }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
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
    },
  },
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

.privacy-check {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-top: 14px;
  color: #d0d5dd;
  font-size: 14px;
  line-height: 1.4;
}

.privacy-check input {
  width: auto;
  margin-top: 2px;
}

.privacy-link {
  width: auto;
  margin: 0;
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: #ffd166;
  text-decoration: underline;
}

.privacy-box {
  margin-top: 14px;
  padding: 14px;
  border-radius: 14px;
  background: #101828;
  color: #d0d5dd;
  font-size: 13px;
  line-height: 1.45;
}

.privacy-box h3 {
  margin: 0 0 8px;
  color: #fff;
  font-size: 16px;
}

.privacy-box p {
  margin: 8px 0;
}
</style>