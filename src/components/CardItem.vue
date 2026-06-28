/* eslint-disable */
<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import type { Card } from "../types";
import { TASK_TYPES } from "../logic/taskTypes";
import SmartSlider from "./SmartSlider.vue";

const props = defineProps<{
  teamComponents: { tag: string; value: number }[];
  cards : Card[];
  card: Card;
  isMobile: boolean;
}>();

const emit = defineEmits<{
  (e: "delete", id: number): void;
}>();

// список всех возможных тегов
const allTags = props.teamComponents.map(c => c.tag);

// управление выпадашкой
const showTagSelector = ref(false);

// доступные теги (исключаем уже выбранные)
const availableTags = computed(() =>
  allTags.filter(tag => !props.card.tags.includes(tag))
);

const isEditing = ref(false);
const titleInput = ref<HTMLInputElement | null>(null);

function startEditing() {
  isEditing.value = true;

  nextTick(() => {
    titleInput.value?.focus();
  });
}

function stopEditing() {
  isEditing.value = false;
}

// ограничение длины
function onInput(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.value.length > 50) {
    input.value = input.value.slice(0, 50);
  }
  props.card.title = input.value;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}


function getMaxForTag(tag: string): number {
  const found = props.teamComponents.find(c => c.tag === tag);
  return found ? found.value : 0;
}

function computePredictedPlannedTime(
  cardTaskType: string,
  card: Card
): number {

  if (cardTaskType === "Own mechanics") return -1;

  const config = TASK_TYPES[cardTaskType];
  if (!config) return -1;

  let predicted = config.complexity;
  let needToPredicte = false;

  for (const [tag, tagConfig] of Object.entries(config.tags)) {
    const recommendedValue = tagConfig.value;
    const weight = tagConfig.weight ?? 1;

    const userValue = card.tagValues[tag] ?? 0;

    // ❗ отсутствие роли
    if (userValue === 0 && recommendedValue > 0) {
      const penalty = 1 + 1.5 * weight;
      predicted *= penalty;
      needToPredicte = true;
      continue;
    }

    if(userValue === recommendedValue){
      continue;
    }
    needToPredicte = true;

    const ratio =
      recommendedValue > 0
        ? userValue / recommendedValue
        : 1;

    // ✅ убывающая отдача
    let efficiency =
      ratio <= 1
        ? ratio
        : Math.sqrt(ratio);

    let roleEfficiencyPercent = efficiency * 100;

    // 🔥 перегруз
    if (ratio > 2) {
      const overload = ratio - 2;
      const overloadPenalty = 1 + 0.15 * overload;
      roleEfficiencyPercent /= overloadPenalty;
    }

    // 🎯 влияние роли
    const delta =
      weight *
      (config.complexity / 2) *
      ((100 - roleEfficiencyPercent) / 100);

    predicted += delta;
  }

  if (!needToPredicte) return -1;
  // 📉 коммуникация
  const totalPeople = Object.values(card.tagValues)
    .reduce((a, b) => a + b, 0);

  const communicationPenalty =
    1 + 0.03 * (totalPeople * (totalPeople - 1)) / 10;

  predicted *= communicationPenalty;

  // 🎚️ сглаживание
  predicted =
    0.7 * predicted +
    0.3 * config.complexity;

  // ⛔ минимум
  const minTime = config.complexity / 2;
  if (predicted < minTime) predicted = minTime;

  props.card.recommendedComplexity = Math.round(predicted);
  return Math.round(predicted);
}

function addTag(tag: string) {
  props.card.tags.push(tag);

  // создаём слайдер со значением по умолчанию
  props.card.tagValues[tag] = clamp(
    props.card.tagValues[tag],
    0,
    getMaxForTag(tag)
  );
  showTagSelector.value = false;
}

function removeTag(tagToRemove: string) {
  const index = props.card.tags.indexOf(tagToRemove);
  if (index !== -1) {
    props.card.tags.splice(index, 1);
  }

  // удаляем значение слайдера
  delete props.card.tagValues[tagToRemove];
}

function applyTaskType(typeName: string) {
  const config = TASK_TYPES[typeName];

  props.card.taskType = typeName;
  props.card.planned = true;

  let suffix = 1;
  let title = props.card.taskType;

  while (props.cards.some(card => card.title === title)) {
    title = `${props.card.taskType} (${suffix++})`;
  }
  props.card.title = title;

  // сброс
  props.card.tags = [];
  
  props.card.recommendedTagValues = {};
  props.card.tagValues = {};

  // применяем
  if (props.card.taskType != "Своя механика")
    {props.card.complexity = config.complexity;}

  Object.entries(config.tags).forEach(([tag, value]) => {
    props.card.tags.push(tag);
    props.card.tagValues[tag] = value.value;
    props.card.recommendedTagValues[tag] = value.value; 
  });
}

const recommendedTags = computed(() => {
  const config = TASK_TYPES[props.card.taskType];
  return Object.keys(config.tags);
});

const missingRecommendedTags = computed(() =>
  recommendedTags.value.filter(tag => !props.card.tags.includes(tag))
);

const complexityLabel = computed(() =>
  props.card.planned
    ? "Оценка времязатрат задачи (в рабочих днях)"
    : "Оценка сложности задачи"
);

// диапазон
const complexityMax = computed(() =>
  props.card.planned ? 60 : 3
);

// следим за изменением режима и корректируем значение
watch(
  () => props.card.planned,
  (planned) => {
    if (planned) {
      // если было больше 14 — ограничим
      if (props.card.complexity > 14) {
        props.card.complexity = 14;
      }
    } else {
      // если было больше 3 — ограничим
      if (props.card.complexity > 3) {
        props.card.complexity = 2;
      }
    }
  }
);

watch(
  () => props.card.tagValues,
  () => {
    Object.keys(props.card.tagValues).forEach(tag => {
      const max = getMaxForTag(tag);

      if (props.card.tagValues[tag] > max) {
        props.card.tagValues[tag] = max;
      }
    });
  },
  { deep: true }
);

function getRecommendedForTag(tag: string, cardTaskType: string): number {
  if (cardTaskType === "Own mechanics") return -1;
  console.log("1");
  if (TASK_TYPES[cardTaskType]?.tags[tag] === undefined)
    return -1;
  return TASK_TYPES[cardTaskType]?.tags[tag].value ?? -1;
}

</script>

<template>
  <div class="card">
    <!-- HEADER -->
    <div class="card-header">
    <div class="title-container">
        <!-- TEXT -->
        <div
        v-if="!isEditing"
        class="title-text"
        :class="{ mobilebutton: props.isMobile }"
        @click="startEditing"
        >
        {{ card.title }}
        </div>

        <!-- INPUT -->
        <input
        v-else
        ref="titleInput"
        class="title-input"
        :class="{ mobilebutton: props.isMobile }"
        :value="card.title"
        @input="onInput"
        @blur="stopEditing"
        @keyup.enter="stopEditing"
        />
    </div>
     <button class="delete-btn"
        :class="{ mobilebutton: props.isMobile }" @click="emit('delete', card.id)" >
      <el-icon><Delete /></el-icon>
      </button> 
    </div>

    <!-- BODY -->
    <div class="card-body">
      <!-- LEFT -->
      <div class="left">
        <div class="priority">
              <label :class="{ mobiletext: props.isMobile }">Приоритет:</label>
              <el-input-number 
                :max="20"
                :value-on-clear="1"
                v-model.number="card.priority"
                :min="1" />

            </div>
        <!-- CHECKBOXES -->

        <label :class="{ mobiletext: props.isMobile }">
          <input class="labeled-checkbox" type="checkbox" v-model="card.planned" />
            Оценка в рабочих днях
        </label>
        <div class="task-type"  :class="{ mobile: props.isMobile }">
            <label :class="{ mobiletext: props.isMobile }">Тип механики:</label>
            
               <el-select class="in-task-type" v-model="card.taskType" 
                          placeholder="Своя механика" 
                          @change="applyTaskType(card.taskType)">
                  <el-option
                    v-for="(_, name) in TASK_TYPES"
                    :key="name"
                    :value="name"
                  />
                </el-select>
                </div>

        <div v-if="missingRecommendedTags.length > 0" class="recommended-tags" :class="{ mobiletext: props.isMobile }">
                    Рекомендованные теги:
                    <span  :class="{ mobiletext: props.isMobile }" v-for="tag in missingRecommendedTags" :key="tag">
                        {{ tag }}
                    </span>
                    </div>

        <!-- TAGS -->
        <div class="tags-section">
          <button :class="{ mobiletext: props.isMobile }" @click="showTagSelector = !showTagSelector">
            ➕ Добавить роль
          </button>

          <!-- список выбора -->
          <div v-if="showTagSelector" class="tag-selector">
            <div :class="{ mobiletext: props.isMobile }"
              v-for="tag in availableTags"
              :key="tag"
              class="tag-option"
              @click="addTag(tag)"
            >
              {{ tag }}
            </div>

            <div v-if="availableTags.length === 0" :class="{ mobiletext: props.isMobile }">
              Все роли уже добавлены
            </div>
          </div>
        
          <!-- выбранные теги -->
        <div class="tag-list">
            <div v-for="tag in card.tags" :key="tag" class="tag">
                <span :class="{ mobiletext: props.isMobile }">{{ tag }}</span>
                <button class="tag-delete" :class="{ mobiletext: props.isMobile }" @click="removeTag(tag)">✖</button>
            </div>
        </div>
        </div>
      </div>

      <!-- RIGHT -->
    <div class="right">
        <div class="slider-block main-slider">
            <label class="slider-label" :class="{ mobiletext: props.isMobile }" >
                {{ complexityLabel }}
            </label>

            <SmartSlider
              v-model="card.complexity"
              :min="1"
              :max="complexityMax"
              :recommended="TASK_TYPES[card.taskType]?.complexity ?? -1"
              :predicted="computePredictedPlannedTime(card.taskType, card)"
              :isMobile="props.isMobile"    
            />
        </div>
    <div
  v-for="tag in card.tags"
  :key="tag"
  class="slider-block"
>

        <label class="slider-label" :class="{ mobiletext: props.isMobile }">{{ tag }}</label>
        <!--            :modelValue="Math.min(card.tagValues[tag], getMaxForTag(tag))" -->
        <SmartSlider
            v-model="card.tagValues[tag]"
            :min="0"
            :max="getMaxForTag(tag)"
            :isMobile="props.isMobile" 
            :recommended="getRecommendedForTag(tag, card.taskType)"
            :predicted="-1"
          />
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-bottom: 12px;
}

/* HEADER */

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: stretch; /* важно */
  background: #eee;
  padding: 6px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

/* контейнер занимает всё место */
.title-container {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
}

/* автоуменьшение */
.title-text {
  width: 100%;
  height: 100%;
  margin-bottom: 0px;
  line-height: 100%;
  text-align: left;
  cursor: pointer;

  /* ключевая магия */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-input {
  width: 100%;
  border: none;
  outline: none;
}

/* кнопка удаления */
.delete-btn {
  aspect-ratio: 1 / 1;
  height: 100%;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #626262;
}

/* BODY */
.card-body {
  display: flex;
  padding: 5%;
  padding-bottom: 10%;
}


.left {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 👈 ключ */
  gap: 10px;
  margin-right:2%;
}


.left label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.priority {
  width: 100%;
  display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.priority .el-input-number {
  width: 90%;
}

.task-type {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 👈 ключ */
  gap: 10px;
  width: 90%;
}


.task-type select {
  width: 90%;
  align-items: center;
  gap: 6px;
}

.mobile .el-select{
    font-size: var(--text-font-size-mobile);
    height: 80px;
}

.mobile :deep(.el-select__selected-item){
    font-size: var(--text-font-size-mobile);
    line-height:  60px;
    height: 80px;
}
.mobile :deep(.el-select__wrapper){
    font-size: var(--text-font-size-mobile);
    height: 80px;
}

.mobile el-option {
    font-size: var(--text-font-size-mobile);
}

.right {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 👈 выравнивание */
  gap: 12px;
}

/* блок одного слайдера */
.slider-block {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* название */
.slider-label {
  margin-bottom: 4px;
}

/* значение */
.slider-value {
  font-size: 12px;
  margin-top: 2px;
}

/* TAGS */

.tag-selector {
  border: 1px solid #ccc;
  background: white;
  margin-top: 5px;
  border-radius: 4px;
}

.tag-option {
  padding: 5px;
  cursor: pointer;
}

.tag-option:hover {
  background: #eee;
}

.tag-list {
  margin-top: 8px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  background: #ddd;
  padding: 4px 6px;
  border-radius: 4px;
}

.tag-delete {
  width: 16px;

  border: none;
  background: #bbb;
  cursor: pointer;
  border-radius: 2px;
  margin-bottom: 0px;
}

.tag-delete:hover {
  background: #999;
}

.main-slider {
  border-bottom: 1px solid #ccc;
  padding-bottom: 15%;
  margin-bottom: 8px;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stepper input {
  width: 60px;
  text-align: center;
}

.recommendation {
  font-size: 12px;
  color: #666;
}

.recommended-tags {
  color: #929292;
}


.tags-section {
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 👈 ключ */
  gap: 10px;
}


.tags-section button {
  width: 100%;
  align-items: center;
  gap: 6px;
  
  border-radius: 4px;
  border: 1px solid #626262;
}

</style>