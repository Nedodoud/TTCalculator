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
    ? "Оценка времязатрат задачи(в рабочих днях)"
    : "Оценка сложноти задачи"
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
        <span
        v-if="!isEditing"
        class="title-text"
        @click="startEditing"
        >
        {{ card.title }}
        </span>

        <!-- INPUT -->
        <input
        v-else
        ref="titleInput"
        class="title-input"
        :value="card.title"
        @input="onInput"
        @blur="stopEditing"
        @keyup.enter="stopEditing"
        />
    </div>
     <button class="delete-btn" @click="emit('delete', card.id)" >
      <el-icon><Delete /></el-icon>
      </button> 
    </div>

    <!-- BODY -->
    <div class="card-body">
      <!-- LEFT -->
      <div class="left">
        <div class="priority">
              <label>Приоритет:</label>
              <el-input-number 
                v-model.number="card.priority"
                :min="1" />

            </div>
        <!-- CHECKBOXES -->
        <!--<label>
          <input type="checkbox" v-model="card.core" />
          Core
        </label>-->

        <label>
          <input type="checkbox" v-model="card.planned" />
            Оценка времязатрат
        </label>
        <div class="task-type">
            <label>Тип механики:</label>
            
               <el-select v-model="card.taskType" 
                          placeholder="Своя механика" 
                          @change="applyTaskType(card.taskType)">
                  <el-option
                    v-for="(_, name) in TASK_TYPES"
                    :key="name"
                    :value="name"
                  />
                </el-select>
                </div>

        <div v-if="missingRecommendedTags.length > 0" class="recommended-tags">
                    Recommended tags:
                    <span v-for="tag in missingRecommendedTags" :key="tag">
                        {{ tag }}
                    </span>
                    </div>

        <!-- TAGS -->
        <div class="tags-section">
          <button @click="showTagSelector = !showTagSelector">
            ➕ Добавить роль
          </button>

          <!-- список выбора -->
          <div v-if="showTagSelector" class="tag-selector">
            <div
              v-for="tag in availableTags"
              :key="tag"
              class="tag-option"
              @click="addTag(tag)"
            >
              {{ tag }}
            </div>

            <div v-if="availableTags.length === 0">
              All tags added
            </div>
          </div>
        
          <!-- выбранные теги -->
        <div class="tag-list">
            <div v-for="tag in card.tags" :key="tag" class="tag">
                <span>{{ tag }}</span>
                <button class="tag-delete" @click="removeTag(tag)">✖</button>
            </div>
        </div>
        </div>
      </div>

      <!-- RIGHT -->
    <div class="right">
        <div class="slider-block main-slider">
            <label class="slider-label">
                {{ complexityLabel }}
            </label>

            <SmartSlider
              v-model="card.complexity"
              :min="1"
              :max="complexityMax"
              :recommended="TASK_TYPES[card.taskType]?.complexity ?? -1"
              :predicted="computePredictedPlannedTime(card.taskType, card)"
            />
        </div>
    <div
  v-for="tag in card.tags"
  :key="tag"
  class="slider-block"
>

        <label class="slider-label">{{ tag }}</label>
        <!--            :modelValue="Math.min(card.tagValues[tag], getMaxForTag(tag))" -->
        <SmartSlider
            v-model="card.tagValues[tag]"
            :min="0"
            :max="getMaxForTag(tag)"

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
  text-align: left;
  cursor: pointer;

  /* ключевая магия */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  font-size: clamp(10px, 2vw, 16px);
}

.title-input {
  width: 100%;
  font-size: 16px;
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
}
.task-type select {
  width: 80%;
  align-items: center;
  gap: 6px;
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
  font-size: 14px;
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
  height: 16px;
  font-size: 10px;
  line-height: 1;

  border: none;
  background: #bbb;
  cursor: pointer;
  border-radius: 2px;
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
  font-size: 12px;
  color: #929292;
}

.tags-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 👈 ключ */
  gap: 10px;
}


.tags-section button {
  width: 80%;
  align-items: center;
  gap: 6px;
  
  border-radius: 4px;
  border: 1px solid #626262;
}

</style>