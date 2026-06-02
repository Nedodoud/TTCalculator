<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import SliderGroup from "./components/SliderGroup.vue";
import CardList from "./components/CardList.vue";
import TutorialOverlay from "./components/tutorial/TutorialOverlay.vue";
import TutorialWelcomeModal from "./components/tutorial/TutorialWelcomeModal.vue";
import type { Card } from "./types";


// 👇 глобальное состояние команды
const teamComponents = ref([
  { tag: "Engineer", value: 0 , extraEffCoef: 0.2 },
  { tag: "Art", value: 0 , extraEffCoef: 1},
  { tag: "Music", value: 0 , extraEffCoef: 0.5},
  { tag: "Writer", value: 0 , extraEffCoef: 0},
  { tag: "Gamedesigner", value: 0 , extraEffCoef: 0}
]);

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
  var markValue = Math.ceil((Number(left.slice(0, -1))/100) * Number(data.max));
  if (Number(left.slice(0, -1)) == 0){
    markValue = 1;
  }
  var tip = "Минимальное значение";
  if (markValue == Number(data.max)){
    tip = "Максимальное значение";
  }
  if (markValue == Number(data.recommended)){
    tip = "Рекомендуемое значение";
  }
  if (markValue == Number(data.predicted)){
    tip = "Расчетное время, затраченное на выполнение задачи определенного типа на основе ввода данных пользователем и рекомендаций.";
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

  teamComponents.value.forEach(component => {

    component.value = 0;

  });

  // remove all cards

  [...cards.value].forEach(card => {

    cardListRef.value?.deleteCard(card.id);

  });

}

onMounted(() => {

  showTutorialWelcome.value = true;
  document.addEventListener("mouseover", handleMouseOver);
  document.addEventListener("mouseout", handleMouseOut);
});

onUnmounted(() => {
  document.removeEventListener("mouseover", handleMouseOver);
  document.removeEventListener("mouseout", handleMouseOut);
});

</script>

<template>
  <div class="app">

      <TutorialWelcomeModal
        v-if="showTutorialWelcome"
        @start="startTutorial"
        @close="closeTutorialWelcome"
      />

      <div class="helps-buttons">
        <button
          class="tutorial-open-button"
          @click="startTutorial"
        >
          Посмотреть руководство
        </button>
        
        <button
          class="tutorial-open-button"
          data-tutorial="survey-button"
          onclick="window.location.href='https://forms.gle/pFZRZLbwSdQJCCgx9';"
        >
          Пройти опрос
        </button>
      </div>

    <TutorialOverlay
      v-if="showTutorial"
      @close="showTutorial = false"
    />

    <div class="left">  


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

    <div v-if="showTooltip" 
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
}

/* Правая часть (1/3) */


.tooltip {
  position: fixed;
  background: black;
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  pointer-events: none;
  z-index: 9999;
}
.helps-buttons {
position: fixed;

  left: 20px;
  top: 20px;
  display: flex;
}
.tutorial-open-button {
  
  padding: 8px;
  margin: 4px;

  border-radius: 10%;

  border: none;

  background: var(--accent);
  color: white;

  font-size: 10px;
  font-weight: bold;

  cursor: pointer;

  z-index: 5000;
}


</style>