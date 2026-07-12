<template>
  <section class="admin-panel">
    <div class="admin-header">
      <div>
        <p class="eyebrow">Администрирование</p>
        <h2>Пользователи</h2>
      </div>

      <button
        class="refresh-button"
        :disabled="loading"
        @click="loadUsers"
      >
        Обновить
      </button>
    </div>

    <p v-if="loading" class="admin-message">
      Загрузка пользователей...
    </p>

    <p v-else-if="message" class="admin-message error">
      {{ message }}
    </p>

    <p v-else-if="users.length === 0" class="admin-message">
      Пользователей пока нет.
    </p>

    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Логин</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Создан</th>
            <th>Сессии</th>
            <th>Действия</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="account in users"
            :key="account.id"
          >
            <td>{{ account.id }}</td>
            <td>{{ account.username }}</td>
            <td>{{ account.email }}</td>
            <td>
              <span
                class="role-badge"
                :class="{ admin: account.role === 'admin' }"
              >
                {{ account.role }}
              </span>
            </td>
            <td>{{ formatDate(account.created_at) }}</td>
            <td>{{ account.sessions_count }}</td>
            <td>
              <button
                class="delete-user-button"
                :disabled="
                  deletingUserId === account.id ||
                  account.id === currentUserId
                "
                @click="deleteUser(account)"
              >
                {{
                  account.id === currentUserId
                    ? 'Текущий аккаунт'
                    : deletingUserId === account.id
                      ? 'Удаление...'
                      : 'Удалить'
                }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    apiUrl: {
      type: String,
      required: true,
    },

    currentUserId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      users: [],
      loading: false,
      message: '',
      deletingUserId: null,
    }
  },

  mounted() {
    this.loadUsers()
  },

  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem('token')

      return {
        Authorization: `Bearer ${token}`,
      }
    },

    async loadUsers() {
      try {
        this.loading = true
        this.message = ''

        const response = await fetch(`${this.apiUrl}/admin/users`, {
          headers: this.getAuthHeaders(),
        })

        const data = await response.json()

        if (!response.ok) {
          this.message =
            data.message || 'Не удалось получить список пользователей'
          return
        }

        this.users = data
      } catch (error) {
        this.message = 'Не удалось подключиться к серверу'
      } finally {
        this.loading = false
      }
    },

    async deleteUser(account) {
      const confirmed = window.confirm(
        `Удалить пользователя "${account.username}" и все его сессии?`
      )

      if (!confirmed) return

      try {
        this.deletingUserId = account.id
        this.message = ''

        const response = await fetch(
          `${this.apiUrl}/admin/users/${account.id}`,
          {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          this.message =
            data.message || 'Не удалось удалить пользователя'
          return
        }

        this.users = this.users.filter(
          (user) => user.id !== account.id
        )
      } catch (error) {
        this.message = 'Не удалось подключиться к серверу'
      } finally {
        this.deletingUserId = null
      }
    },

    formatDate(value) {
      if (!value) return '—'

      return new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(value))
    },
  },
}
</script>

<style scoped>
.admin-panel {
  width: min(1100px, 100%);
  margin-top: 18px;
  border-radius: 24px;
  background: #1d2939;
  padding: 28px;
  color: #fff;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.admin-header h2 {
  margin: 0;
}

.eyebrow {
  margin: 0 0 8px;
  color: #ffd166;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.refresh-button {
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 700;
  color: #101828;
  background: #ffd166;
}

.admin-message {
  margin-top: 18px;
  color: #d0d5dd;
}

.admin-message.error {
  color: #ffb4b4;
}

.table-wrapper {
  margin-top: 20px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 820px;
}

th,
td {
  padding: 14px 12px;
  border-bottom: 1px solid #475467;
  text-align: left;
}

th {
  color: #d0d5dd;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.role-badge {
  display: inline-block;
  border-radius: 999px;
  padding: 5px 10px;
  background: #344054;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.role-badge.admin {
  background: #7f56d9;
}

.delete-user-button {
  border: 0;
  border-radius: 999px;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: 700;
  color: #fff;
  background: #d92d20;
}

.delete-user-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 760px) {
  .admin-panel {
    padding: 20px;
  }
}
</style>