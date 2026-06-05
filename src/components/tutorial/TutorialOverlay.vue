<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { tutorialSteps } from "./tutorialSteps";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const currentStepIndex = ref(0);

const currentStep = computed(() => {
  return tutorialSteps[currentStepIndex.value];
});

const targetRect = ref<DOMRect | null>(null);

function updateTargetPosition() {
  const element = document.querySelector(
    `[data-tutorial="${currentStep.value.id}"]`
  );

  if (!element) {
    targetRect.value = null;
    return;
  }

  targetRect.value = element.getBoundingClientRect();
}

function nextStep() {
  currentStepIndex.value++;

  if (currentStepIndex.value >= tutorialSteps.length) {
    closeTutorial();
  }
}

function prevStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
  }
}

function closeTutorial() {
  emit("close");
}

const highlightStyle = computed(() => {
  if (!targetRect.value) return {};

  return {
    left: `${targetRect.value.left - 8}px`,
    top: `${targetRect.value.top - 8}px`,
    width: `${targetRect.value.width + 16}px`,
    height: `${targetRect.value.height + 16}px`
  };
});

const tooltipStyle = computed(() => {

  if (!targetRect.value) return {};

  const rect = targetRect.value;

  const tooltipWidth = 300;
  const tooltipHeight = 180;

  const margin = 20;

  // =========================
  // 1. TRY BOTTOM
  // =========================

  let left =
    rect.left +
    rect.width / 2 -
    tooltipWidth / 2;

  left = Math.max(margin, left);
  left = Math.min(
    window.innerWidth - tooltipWidth - margin,
    left
  );

  let top = rect.bottom + margin;

  if (top + tooltipHeight <= window.innerHeight) {

    return {
      left: `${left}px`,
      top: `${top}px`
    };

  }

  // =========================
  // 2. TRY TOP
  // =========================

  top = rect.top - tooltipHeight - margin;

  if (top >= margin) {

    return {
      left: `${left}px`,
      top: `${top}px`
    };

  }

  // =========================
  // 3. TRY RIGHT
  // =========================

  left = rect.right + margin;

  top =
    rect.top +
    rect.height / 2 -
    tooltipHeight / 2;

  top = Math.max(margin, top);
  top = Math.min(
    window.innerHeight - tooltipHeight - margin,
    top
  );

  if (left + tooltipWidth <= window.innerWidth) {

    return {
      left: `${left}px`,
      top: `${top}px`
    };

  }

  // =========================
  // 4. TRY LEFT
  // =========================

  left = rect.left - tooltipWidth - margin;

  if (left >= margin) {

    return {
      left: `${left}px`,
      top: `${top}px`
    };

  }

  // =========================
  // FALLBACK
  // =========================

  return {
    left: `${margin}px`,
    top: `${margin}px`
  };

});

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeTutorial();
  }

  if (event.key === "ArrowRight") {
    nextStep();
  }

  if (event.key === "ArrowLeft") {
    prevStep();
  }
}

watch(currentStepIndex, () => {
  updateTargetPosition();
});

onMounted(() => {
  updateTargetPosition();

  window.addEventListener("resize", updateTargetPosition);
  window.addEventListener("scroll", updateTargetPosition);
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateTargetPosition);
  window.removeEventListener("scroll", updateTargetPosition);
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div class="tutorial-root">

    <!-- highlighted target -->
    <div
      v-if="targetRect"
      class="tutorial-highlight"
      :style="highlightStyle"
    />

    <!-- tooltip -->
    <div
      v-if="targetRect"
      class="tutorial-tooltip"
      :style="tooltipStyle"
    >
      <div class="tutorial-step-counter">
        Шаг {{ currentStepIndex + 1 }}
        /
        {{ tutorialSteps.length }}
      </div>

      <div class="tutorial-text">
        {{ currentStep.text }}
      </div>

      <div class="tutorial-buttons">

        <button
          class="tutorial-button"
          @click.stop="prevStep"
          :disabled="currentStepIndex === 0"
        >
          Предыдущий шаг
        </button>

        <button
          class="tutorial-button"
          @click.stop="nextStep"
        >
          {{
            currentStepIndex === tutorialSteps.length - 1
              ? "Закончить"
              : "Следующий шаг"
          }}
        </button>

      </div>
    </div>
    
    <!-- overlay -->
    <div
      class="tutorial-overlay"
      @click="nextStep"
    />
  </div>
</template>

<style scoped>

.tutorial-root {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}

.tutorial-overlay {
  position: fixed;
  inset: 0;
  background: transparent;
  pointer-events: auto;
}

.tutorial-highlight {
  position: fixed;

  border: 3px solid var(--accent);
  border-radius: 14px;

  box-shadow:
    0 0 0 9999px rgba(0,0,0,0.45),
    0 0 20px var(--accent);

  transition:
    left 0.25s ease,
    top 0.25s ease,
    width 0.25s ease,
    height 0.25s ease;

  pointer-events: none;
}

.tutorial-tooltip {
  position: fixed;

  width: 300px;

  background: white;
  color: #222;

  border-radius: 14px;

  padding: 16px;

  box-shadow:
    0 10px 40px rgba(0,0,0,0.35);

  z-index: 10000;

  pointer-events: auto;

  transition:
    left 0.25s ease,
    top 0.25s ease;
}

.tutorial-step-counter {
  font-size: 12px;
  color: #888;

  margin-bottom: 10px;
}

.tutorial-text {
  font-size: 15px;
  line-height: 1.5;

  margin-bottom: 16px;
}

.tutorial-buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.tutorial-button {
  border: none;

  background: var(--accent);
  color: white;

  border-radius: 8px;

  padding: 8px 14px;

  cursor: pointer;

  transition: 0.2s;
}

.tutorial-button:hover {
  background: var(--accent-border);
}

.tutorial-button:disabled {
  background: var(--disabled-accent);
  cursor: default;
}

</style>