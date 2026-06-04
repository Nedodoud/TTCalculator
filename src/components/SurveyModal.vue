<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const secondsLeft = ref(1800);
const showTimeoutModal = ref(false);

let timer: number | undefined;

onMounted(() => {
  timer = window.setInterval(() => {
    if (secondsLeft.value > 0) {
      secondsLeft.value--;
    }

    if (secondsLeft.value === 0) {
      clearInterval(timer);

      // Show non-closable modal
      showTimeoutModal.value = true;
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});


</script>

<template>
  <div>
    <!-- Modal -->
    <div
      v-if="showTimeoutModal"
      class="modal-overlay"
    >
      <div class="modal">
        <h2> Пожалуйста, пройдите опрос о использовании приложения!</h2>

        <p>
          Мы ограничили время для тестирования, 
          чтобы опыт участников опроса был более универсальным. 
          Будем очень благодарны когда вы пройдёте наш опрос!  
        </p>

        
      <button
        class="tutorial-open-button"
        onclick="window.location.href='https://forms.gle/pFZRZLbwSdQJCCgx9';"
      >
          Пройти опрос    
      </button>

      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(0, 0, 0, 0.6);

  z-index: 9999;
}

.modal {
  width: 400px;
  max-width: 90vw;

  padding: 24px;

  background: var(--bg);
  border-radius: 12px;

  text-align: center;
  box-shadow: 0 8px 30px var(--accent);
}

.tutorial-open-button {
  padding: 8px;
  margin: 4px;
  margin-top: 20px;

  border-radius: 4px;

  border: none;

  background: var(--accent);
  color: var(--tooltip-text);

  font-size: 10px;
  font-weight: bold;

  cursor: pointer;

  z-index: 5000;
}
</style>