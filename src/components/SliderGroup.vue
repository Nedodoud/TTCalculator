<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import PieChart from "./PieChart.vue";

// основные параметры
const time = ref<number>(50);
const teamSize = ref<number>(5);

const topHeight = ref(400); // начальная высота в px
const isResizing = ref(false);

const props = defineProps<{
  components: { tag: string; value: number }[];
  cards: any[];
}>();

const emit = defineEmits<{
  (e: "update:components", value: { tag: string; value: number }[]): void;
  (e: "update:teamSize", value: number): void;
  (e: "reset-all"): void;
}>();

const priorities = computed(() => {
  if (!props.cards) return [];

  const unique = new Set(props.cards.map(c => c.priority));
  return Array.from(unique).sort((a, b) => a - b);
});


// Ограничения степперов
const totalComponents = computed(() =>
  props.components.reduce((sum, c) => sum + c.value, 0)
);

const selectedPriority = ref<number | "total" | null>(null);

const tagSums = computed(() => {
  if (selectedPriority.value === null) return {};

  const filtered =
    selectedPriority.value === "total"
      ? props.cards
      : props.cards.filter(c => c.priority === selectedPriority.value);

  const result: Record<string, number> = {};

  filtered.forEach(card => {
    Object.entries(card.tagValues).forEach(([tag, value]) => {
      result[tag] = (result[tag] || 0) + (value as number);
    });
  });

  return result;
});


  // @ts-expect-error unknown external type
function onInput(comp: Component, e: any) {
  // повышаем предел
  const updated = totalComponents.value;
  teamSize.value = updated;

  updateComponent(comp.tag, e);
  emit("update:teamSize", updated);
  
}

function updateComponent(tag: string, newValue: number) {
  const updated = props.components.map(c =>
    c.tag === tag
      ? { ...c, value: Math.max(0, newValue) }
      : c
  );

  emit("update:components", updated);
}

const priorityTime = computed(() => {
  if (selectedPriority.value === null || selectedPriority.value === "total") {
    return 0;
  }

  const filtered = props.cards.filter(
    c => c.priority === selectedPriority.value
  );

  if (filtered.length === 0) return 0;

  const times = filtered.map(c =>
    c.planned ? c.complexity : c.complexity * 7
  );

  return Math.max(...times);
});

const totalTime = computed(() => {
  const prioritiesSet = new Set(props.cards.map(c => c.priority));

  let sum = 0;

  prioritiesSet.forEach(priority => {
    const filtered = props.cards.filter(c => c.priority === priority);

    if (filtered.length === 0) return;

    const times = filtered.map(c =>
      c.planned ? c.complexity : c.complexity * 7
    );

    sum += Math.max(...times);
  });

  return sum;
});

const resourceWarnings = computed(() => {
  if (selectedPriority.value === null || selectedPriority.value === "total") {
    return [];
  }

  const warnings: string[] = [];

  Object.entries(tagSums.value).forEach(([tag, value]) => {
    const team = props.components.find(c => c.tag === tag);

    if (!team) return;

    if (value > team.value) {
      warnings.push(
        `${tag}: required ${value}, but you have only ${team.value}`
      );
    }
  });

  return warnings;
});

function startResize() {
  isResizing.value = true;
}

function stopResize() {
  isResizing.value = false;
}

function onMouseMove(e: MouseEvent) {
  if (!isResizing.value) return;

  // ограничим минимальную и максимальную высоту
  const min = 100;
  const max = window.innerHeight * 0.8;

  const newHeight = Math.min(Math.max(e.clientY, min), max);

  topHeight.value = newHeight;
}

onMounted(() => {
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", stopResize);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", stopResize);
});

const recommendationText = computed(() => {
  const allCards = props.cards;

  if (allCards.length === 0) {
    return ["No tasks available for analysis."];
  }

  // =========================
  // фильтрация по приоритету
  // =========================
  
  const tasks =
    selectedPriority.value === "total"
      ? props.cards
      : props.cards.filter(c => c.priority === selectedPriority.value);;

  if (tasks.length === 0) {
    return ["No tasks for selected priority."];
  }

  const recommendations: string[] = [];

  // =========================
  // 1. Dominant task
  // =========================
  const maxTask = tasks.reduce((a, b) =>
    a.complexity > b.complexity ? a : b
  );

  const avgTime =
    tasks.reduce((sum, t) => sum + t.complexity, 0) / tasks.length;

  if (maxTask.complexity > avgTime * 1.5) {
    recommendations.push(
      `Task "${maxTask.title}" dominates the timeline. Optimizing it will have the biggest impact.`
    );
  }

  // =========================
  // 2. Short tasks
  // =========================
  tasks.forEach(task => {
    const acComplexity = task.planned ? task.complexity : task.complexity * 7; 
    if (acComplexity < avgTime * 0.5) {
      recommendations.push(
        `Task "${task.title}" is much shorter than others. Consider reallocating resources.`
      );
    }
  });

  // =========================
  // 3. Resource usage per tag
  // =========================
  const tagUsage: Record<string, number> = {};

  // =====================================
  // обычный режим (конкретный приоритет)
  // =====================================

  if (selectedPriority.value !== "total") {

    tasks.forEach(task => {

      (task.tags as string[]).forEach(tag => {

        const value = task.tagValues[tag] ?? 0;

        tagUsage[tag] = (tagUsage[tag] || 0) + value;

      });

    });

  }

  // =====================================
  // TOTAL режим
  // =====================================

  else {

    // сумма тегов отдельно по каждому приоритету
    const priorityTagUsage: Record<string, Record<string, number>> = {};

    props.cards.forEach(task => {

      const priority = String(task.priority);

      if (!priorityTagUsage[priority]) {
        priorityTagUsage[priority] = {};
      }

      (task.tags as string[]).forEach(tag => {

        const value = task.tagValues[tag] ?? 0;

        priorityTagUsage[priority][tag] =
          (priorityTagUsage[priority][tag] || 0) + value;

      });

    });

    // ищем максимальное значение тега среди приоритетов

    Object.values(priorityTagUsage).forEach(priorityData => {

      Object.entries(priorityData).forEach(([tag, value]) => {

        tagUsage[tag] = Math.max(
          tagUsage[tag] || 0,
          value
        );

      });

    });

  }
  

  // =========================
// 3.5 Total-mode resource analysis
// =========================


  props.components.forEach(component => {

    const tag = component.tag;
    const available = component.value;

    // максимальное использование тега
    // среди всех приоритетов
    const maxUsed = tagUsage[tag] ?? 0;
    
    console.log(tag, maxUsed);

    // ---------------------------------
    // тег вообще не используется
    // ---------------------------------
        
    if (selectedPriority.value === "total") {
    if (maxUsed === 0 && available > 0) {

      recommendations.push(
        `Unused resource detected: ${tag} has ${available} assigned team members, but no tasks currently use this resource.`
      );

    }
    }

    // ---------------------------------
    // недоиспользование
    // ---------------------------------

    if (maxUsed !== 0 && maxUsed < available) {

      recommendations.push(
        `Underutilized resource: ${tag} uses at most ${maxUsed}/${available} available team members across priorities.`
      );

    }

    // ---------------------------------
    // переиспользование
    // ---------------------------------
    else if (maxUsed > available) {

      recommendations.push(
        `Resource overload: ${tag} requires ${maxUsed}, but only ${available} team members are available at peak priority load.`
      );

    }

  });



  // =========================
  // 4. Per-task efficiency
  // =========================
  tasks.forEach(task => {
    Object.entries(task.recommendedTagValues as Record<string, number>).forEach(([tag, recommended]) => {

      const actual = task.tagValues[tag] ?? 0;

      if (actual > recommended * 1.5 && recommended > 0) {
        recommendations.push(
          `Task "${task.title}" has too many ${tag} resources. Efficiency may decrease.`
        );
      }

      if (actual < recommended) {
        recommendations.push(
          `Task "${task.title}" may benefit from more ${tag} resources.`
        );
      }

    });
  });

  // =========================
  // 5. Planned vs recommended time
  // =========================
  tasks.forEach(task => {

    const actualTime = task.complexity;
    const recommendedTime = task.recommendedComplexity;

    if (recommendedTime <= 0) return;

    if (actualTime > recommendedTime * 1.5) {
      recommendations.push(
        `Task "${task.title}" is expected to take much longer than recommended.`
      );
    }

    if (actualTime < recommendedTime * 0.7) {
      recommendations.push(
        `Task "${task.title}" is faster than expected. Resources might be redistributed.`
      );
    }

  });

  // =========================
  // 6. Unplanned tasks warning
  // =========================
  const unplannedTasks = tasks.filter(t => !t.planned);

  if (unplannedTasks.length > 0) {
    recommendations.push(
      `There are ${unplannedTasks.length} tasks without planned time. This reduces prediction accuracy.`
    );
  }

  // =========================
  // fallback
  // =========================
  if (recommendations.length === 0) {
    return ["Resource allocation and task distribution look balanced."];
  }

  return recommendations;

});

function resetAll() {
  time.value = 50;
  teamSize.value = 5;
  emit("reset-all");
}


</script>

<template>
  <div class="container">
    <!-- 🔼 ВЕРХ -->
    <div class="top" 
    :style="{ height: topHeight + 'px' }">

      <div class="header-block">
        <el-tooltip class="box-item" effect="dark" placement="bottom-start">
          <template #content>
            Here you need to enter the resources available to your team for project development, namely:
            <ul>
              <li>Estimated development time</li>
              <li>Total number of people on the team</li>
            </ul>
            Please note: the estimated development time is indicated in working days, assuming that one working day lasts 8 hours.
          </template>
          <el-icon :size="25" color="var(--negative-accent)" ><QuestionFilled /></el-icon>
        </el-tooltip>
        <h2>Resourses</h2> 
        <el-tooltip class="box-item" effect="dark" placement="bottom-start">
          <template #content>
            Clear all
          </template>
          <el-button size="small" color="var(--negative-accent)" icon="Refresh" data-tutorial="reset-buttons" @click="resetAll" > 
            Clear all</el-button>

        </el-tooltip>
      </div>

      <!-- Слайдер времени -->
      <div class="slider-block">
        <span class="demonstration"> Desired time</span>
        <el-slider v-model.number="time"  :min="1" :max="365" show-input />
      </div>

      <!-- Слайдер команды -->
      
      <div class="slider-block" data-tutorial="team-size-slider">
        <span class="demonstration">Desired number of team members</span>
        <el-slider v-model.number="teamSize"  :min="1" :max="25" show-input />
      </div>

      <!-- Роли в команде -->
      <div class="top" data-tutorial="team-roles">
        <h2>Roles</h2>

        <div v-for="comp in props.components" 
          :key="comp.tag"
          class="slider-block">

            <span class="demonstration" >{{ comp.tag }}</span>
            <el-slider v-model.number="comp.value"  :min="0" :max="50" show-input 
                @change="onInput(comp, $event)"/>
        
          </div>
        </div>
      </div>
      <!-- ручка для изменениея размера ферхнего блока-->
      <div class="resize-handle" @mousedown="startResize" data-tutorial="team-resize-hangle"></div>

    <!-- 🔽 НИЗ -->
    <div class="bottom" data-tutorial="recommendation-block">
          <div class="priority-buttons" data-tutorial="recommendation-priority-buttons">
          <button 
            v-for="p in priorities"
            :key="p"
            :class="{ active: selectedPriority === p }"
            @click="selectedPriority = p"
          >
            {{ p }}
          </button>

          <!-- TOTAL -->
          <button
            :class="{ active: selectedPriority === 'total' }"
            @click="selectedPriority = 'total'"
          >
            Total
          </button>
        </div>
      <h2>Recommendations</h2>
          <div class="recommendations">
          <!-- приоритет -->
          <div v-if="selectedPriority !== null && selectedPriority !== 'total'">
             <!-- суммы тегов -->
          
          <div class="tag-sum-container"> 
            <PieChart :data="tagSums" />
            <div class="tag-sum-container-list" >
              <div v-for="(value, tag) in tagSums" :key="tag">
                {{ tag }}: {{ value }}
              </div>
            </div>
          </div>

          <!-- ⏱ время -->
          <div class="time">
            Estimated time required to complete all tasks of the priority #{{ selectedPriority }}: {{ priorityTime }}
          </div>

          <!-- ⚠️ предупреждения -->
          <div v-if="resourceWarnings.length > 0" class="warnings">
            <div v-for="w in resourceWarnings" :key="w">
              ⚠️ {{ w }}
            </div>
          </div>
             <div class="recommendations">
                <ul>
                  <li v-for="(rec, index) in recommendationText" :key="index">
                    {{ rec }}
                  </li>
                </ul>
              </div>
          </div>

          <!-- total -->
          <div v-else-if="selectedPriority === 'total'">

            <div class="time">
              Total time: {{ totalTime }}
            </div>

              <div class="recommendations">
                <ul>
                  <li v-for="(rec, index) in recommendationText" :key="index">
                    {{ rec }}
                  </li>
                </ul>
              </div>
          </div>
          
        </div>

    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ВЕРХ 1/3 */
.top {
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
  overflow: auto;
}

/* НИЗ 2/3 */
.bottom {
  flex: 2;
  overflow-y: auto;
  padding-top: 10px;
}

/* блоки */

.slider-block {
  max-width: 90%;
  display: flex;
  align-items: center;
}

.header-block {
  display: flex;
  justify-content: center;
  align-items: center;   
}

.header-block h2 {
  margin-right: 10px;
  margin-left: 10px;
}

.slider-block .el-slider {
  margin-top: 0;
  margin-left: 12px;
  --el-slider-main-bg-color: var(--accent);
}

.slider-block .demonstration {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 44px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0;
}

.stepper {
  vertical-align: middle;
  width: 150px;
  line-height: 30px;
  display: inline-flex;
  position: relative;
  
}


.stepper .el-input {
      --el-input-text-color: var(--el-text-color-regular);
    --el-input-border: var(--el-border);
    --el-input-hover-border: var(--el-border-color-hover);
    --el-input-focus-border: var(--el-color-primary);
    --el-input-transparent-border: 0 0 0 1px transparent inset;
    --el-input-border-color: var(--el-border-color);
    --el-input-border-radius: var(--el-border-radius-base);
    --el-input-bg-color: var(--el-fill-color-blank);
    --el-input-icon-color: var(--el-text-color-placeholder);
    --el-input-placeholder-color: var(--el-text-color-placeholder);
    --el-input-hover-border-color: var(--el-border-color-hover);
    --el-input-clear-hover-color: var(--el-text-color-secondary);
    --el-input-focus-border-color: var(--el-color-primary);
    --el-input-width: 100%;
    --el-input-height: var(--el-component-size);
    font-size: var(--el-font-size-base);
    width: var(--el-input-width);
    line-height: var(--el-input-height);
    box-sizing: border-box;
    vertical-align: middle;
    display: inline-flex;
    position: relative;
}

.slider-block .demonstration:hover {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 44px;
  flex: 1;
  overflow: visible;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0;
}

.slider-block .demonstration + .el-slider {
  flex: 0 0 70%;
}

/* Роли */
.components {
  margin-top: 10px;
}

.component-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}


.priority-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.priority-buttons button {
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
}

.priority-buttons button.active {
  background: var(--accent);
  color: white;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ручка */
.resize-handle {
  height: 6px;
  cursor: row-resize;
  background: #ccc;
}

.resize-handle:hover {
  background: #999;
}

.recommendations {
  display: flex;
  align-items: left;
}

.recommendations li{
  display: flex;
  align-items: left;
}

.tag-sum-container-list {
  width: 30%;
  display: flex;
  flex-direction: column;
  align-items: left;
}

.tag-sum-container-list div {
  display: flex;
  align-items: left;
}

.tag-sum-container {
  display: flex;
}
</style>