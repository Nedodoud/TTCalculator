<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import SliderGroup from "./components/SliderGroup.vue";
import SurveyModal from "./components/SurveyModal.vue";
import CardList from "./components/CardList.vue";
import TutorialOverlay from "./components/tutorial/TutorialOverlay.vue";
import TutorialWelcomeModal from "./components/tutorial/TutorialWelcomeModal.vue";
import type { Card } from "./types";

// 👇 глобальное состояние команды
const teamComponents = ref([
  { tag: "Разработчик", eng: "Engineer", value: 0, extraEffCoef: 0.2 },
  { tag: "Художник", eng: "Art", value: 0, extraEffCoef: 1 },
  { tag: "Музыкант", eng: "Music", value: 0, extraEffCoef: 0.5 },
  { tag: "Сценарист", eng: "Writer", value: 0, extraEffCoef: 0 },
  { tag: "Геймдизайнер", eng: "Gamedesigner", value: 0, extraEffCoef: 0 },
]);
let timer: number | undefined;
const countdown = ref(1800); // 10 минут

const showTutorial = ref(false);
const showTutorialWelcome = ref(false);

const cards = ref<Card[]>([]);
const cardListRef = ref<InstanceType<typeof CardList> | null>(null);

// подсказки точек на слайдерах

const tooltipText = ref("");
const showTooltip = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);

function handleMouseOver(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target.classList.value != "el-slider__stop el-slider__marks-stop") return;

  const mark = target.closest(".el-slider__marks-stop");
  const container = mark?.closest(".slider-block") as HTMLElement;
  if (!container) return;

  // console.log("work");

  const data = JSON.parse(container.dataset.props || "{}");

  const left = target.style.left || "0%";
  var markValue = Math.ceil((Number(left.slice(0, -1)) / 100) * Number(data.max));
  if (Number(left.slice(0, -1)) == 0) {
    markValue = 1;
  }
  var tip = "Минимальное значение";
  if (markValue == Number(data.max)) {
    tip = "Максимальное значение";
  }
  if (markValue == Number(data.recommended)) {
    tip = "Рекомендуемое значение";
  }
  if (markValue == Number(data.predicted)) {
    tip =
      "Расчетное время, затраченное на выполнение задачи определенного типа на основе ввода данных пользователем и рекомендаций";
  }

  tooltipText.value = `${tip}: ${markValue}`;
  showTooltip.value = true;

  const rect = target.getBoundingClientRect();
  console.log(rect);
  tooltipX.value = rect.left + 5;
  tooltipY.value = rect.top + 5;
}

function handleMouseOut(e: MouseEvent) {
  const target = e.target as HTMLElement;

  if (target.classList.value != "el-slider__stop el-slider__marks-stop") return;

  showTooltip.value = false;
}

function startTutorial() {
  showTutorialWelcome.value = false;

  showTutorial.value = true;
}

function closeTutorialWelcome() {
  showTutorialWelcome.value = false;
}

function resetAllData() {
  // reset team sliders

  teamComponents.value.forEach((component) => {
    component.value = 0;
  });

  // remove all cards

  [...cards.value].forEach((card) => {
    cardListRef.value?.deleteCard(card.id);
  });
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

onMounted(() => {
  showTutorialWelcome.value = true;
  document.addEventListener("mouseover", handleMouseOver);
  document.addEventListener("mouseout", handleMouseOut);

  timer = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    }

    if (countdown.value === 0 && timer) {
      clearInterval(timer);
    }
  }, 1000);
});

onUnmounted(() => {
  document.removeEventListener("mouseover", handleMouseOver);
  document.removeEventListener("mouseout", handleMouseOut);

  if (timer) {
    clearInterval(timer);
  }
});
</script>

<template>
  <div class="app">
    <TutorialWelcomeModal
      v-if="showTutorialWelcome"
      @start="startTutorial"
      @close="closeTutorialWelcome"
    />
    
    <SurveyModal
    />

    
    <TutorialOverlay v-if="showTutorial" @close="showTutorial = false" />

    <div class="left">
        <div class="helps-buttons">
        <button
          class="tutorial-open-button"
          @click="startTutorial"
          data-tutorial="tutorial-button"
        >
          Посмотреть руководство
        </button>
        <!--
        <el-tooltip class="box-item" effect="dark" placement="bottom-start">
            <template #content>
            Мы ограничили время тестирования приложения для унификации опыта респондентов. 
            <br>Пройти опрос можно минимум через 10 минут и максимум через 30 минут пользования приложением
            </template>
            <button
              class="tutorial-open-button"
              :disabled="countdown > 1200"
              data-tutorial="survey-button"
              onclick="window.location.href='https://forms.gle/pFZRZLbwSdQJCCgx9';"
            >
              {{
                countdown > 1200
                  ? `Опрос будет доступен через ${formatTime(countdown-1200)}`
                  : `Пройдите опрос до ${formatTime(countdown)}`
              }}
            </button>
        </el-tooltip>
        -->
      </div>

      <SliderGroup
        v-model:components="teamComponents"
        @reset-all="resetAllData"
        :cards="cards"
      />
    </div>

    <CardList
      ref="cardListRef"
      :teamComponents="teamComponents"
      v-model:cards="cards"
      data-tutorial="task-card-list"
    />

    <div
      v-if="showTooltip"
      class="tooltip"
      :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
    >
      {{ tooltipText }}
    </div>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;
  margin: 0px;
  padding-left: 0px;
  padding-right: 0px;
}

/* Левая часть (2/3) */
.left {
  flex: 2;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.left .container {
width: 100%;
}

/* Правая часть (1/3) */

.tooltip {
  position: fixed;
  background: var(--code-bg);
  color: var(--tooltip-text);
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  pointer-events: none;
  z-index: 9999;
}
.helps-buttons {
  display: flex;
}

.tutorial-open-button {
  padding: 8px;
  margin: 4px;
  border-radius: 4px;

  border: none;

  background: var(--accent);
  color: var(--tooltip-text);

  font-size: 14px;
  font-weight: bold;

  cursor: pointer;

  z-index: 5000;
}
.tutorial-open-button:disabled {
  background: var(--disabled-accent);
}
</style>
