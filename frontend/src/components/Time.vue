<template>
  <div class="greetings">
    <h1 class="green">{{ currentTime }}</h1>

    <h3>Нажмите кнопку для сохранения в базе данных</h3>

    <button @click="saveTime">
      Сохранить текущее время!
    </button>

    <h3 v-if="savedTimes.length && showSavedTimes">
      Ранее сохраненные времена:
    </h3>

    <template v-if="showSavedTimes">
      <div
        v-for="savedTime in savedTimes"
        :key="savedTime.id"
        class="deleted-items"
      >
        <div class="deleted-item">
          {{ savedTime.time }}
        </div>

        <button
          class="btn-sm bg-red"
          @click="() => deleteTime(savedTime.id)"
        >
          Удалить
        </button>
      </div>
    </template>

  </div>
</template>