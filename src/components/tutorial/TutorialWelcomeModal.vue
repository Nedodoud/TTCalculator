<script setup lang="ts">

const emit = defineEmits<{
  (e: "start"): void;
  (e: "close"): void;
}>();

function startTutorial() {
  emit("start");
}

/*
function skipTutorial() {
  emit("close");
}
  */

</script>

<template>

  <div class="tutorial-modal-overlay">

    <div class="tutorial-modal">

      <h2 class="tutorial-title">
        Добро пожаловать!
      </h2>

      <div class="tutorial-description">
        
        Спасибо за согласие принять участие в моём эксперименте!

        Этот инструмент призван помочь разработчикам игр до начала разработки в:

        <ul>
          <li>Планировании ресурсов команды</li>
          <li>Оценке продолжительности выполнения задачи</li> 
          <li>Анализе рабочей нагрузки</li>
          <li>Получении рекомендаций по оптимизации</li>
        </ul>
      </div>

      <div class="tutorial-buttons">

        <button
          class="tutorial-start-button"
          @click="startTutorial"
        >
          Посмотреть руководство
        </button>

        <!--
        <button
          class="tutorial-skip-button"
          @click="skipTutorial"
        >
          Skip
        </button>
        -->

      </div>

    </div>

  </div>

</template>

<style scoped>

.tutorial-modal-overlay {
  position: fixed;
  inset: 0;

  background: rgba(0,0,0,0.45);

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 15000;
}

.tutorial-modal {
  width: 420px;
  max-width: 90vw;

  background: var(--bg);

  border-radius: 18px;

  padding: 28px;

  box-shadow:
    0 20px 60px rgba(0,0,0,0.35);

  animation: tutorialModalAppear 0.25s ease;
}

.tutorial-title {
  margin: 0 0 18px 0;

  font-size: 28px;
}

.tutorial-description {
  font-size: 15px;
  line-height: 1.6;

  color: var(--text);
}

.tutorial-description ul {
  margin-top: 12px;
  margin-bottom: 18px;
}

.tutorial-description ul li{ 
  text-align: left;
}

.tutorial-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  margin-top: 24px;
}

.tutorial-start-button,
.tutorial-skip-button {
  border: none;

  border-radius: 10px;

  padding: 10px 18px;

  font-size: 14px;

  cursor: pointer;

  transition: 0.2s;
}

.tutorial-start-button {
  background: var(--accent);
  color: white;
}

.tutorial-start-button:hover {
  background: var(--accent-border);
}

.tutorial-skip-button {
  background: var(--negative-accent);
}

.tutorial-skip-button:hover {
  background: var(--negative-accent-border);
}

@keyframes tutorialModalAppear {

  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

}

</style>