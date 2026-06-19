<script setup lang="ts">
import { ref, computed, shallowReactive, watch } from "vue";


const props = defineProps<{
  modelValue: number;
  min: number;
  max: number;
  recommended: number;
  predicted: number;
}>();


const emit = defineEmits(["update:modelValue"]);

// clamp (важно!)
function clamp(val: number) {
  return Math.max(props.min, Math.min(val, props.max));
}

// текущее значение 
var currentValue = ref(clamp(props.modelValue ?? props.min));

function setMarks(){
  type Mark = {
    style?: {
      color: string;
    };
    label: string;
  };
  const minMax:Record<number, Mark> = {};
  minMax[props.min] = {
          label: props.min.toString()
        };
  minMax[props.max] = {
          label: props.max.toString()
        };
  if(props.recommended > 0){
    minMax[props.recommended] = 
          {
          style: {
              color: '#67c15d',
          },
          label: props.recommended.toString()
        };
  }
  if(props.predicted > 0){
    minMax[props.predicted] = 
          {
          style: {
            color: '#ebcd53',
            
          },
          label: props.predicted.toString(),
        };
  }
  // @ts-expect-error unknown external type
  return shallowReactive<Marks>(minMax);
}


const minMaxMarks = computed(setMarks);


// input
function onInput(e: any) {
  const value = e;
  console.log(e, currentValue);
  emit("update:modelValue", clamp(value));
}

// метод изменения рекомендации
function setRecommended(value: number) {
  console.log("New recommended:", value);
}

defineExpose({ setRecommended });

watch(
  () => props.modelValue,
  (modelValue) => {
    currentValue = ref(clamp(modelValue ?? props.min));
  }
);

</script>

<template>
  <div class="smart-slider">
    <div class="slider-block"
    :data-props="JSON.stringify({ max, min, recommended, predicted })">


      <el-slider v-model.number="currentValue"  
        :min="min" 
        :max="max"  
        :marks="minMaxMarks"      
        @change="onInput($event)"/>

    </div>
</div>
</template>

<style scoped>

.smart-slider {
  width: 100%;
  height: 100%;
  padding-bottom: 15%;
  padding-top: 8%;
}

.slider-block {
  max-width: 90%;
}

.slider-block .el-slider {
  --el-slider-main-bg-color: var(--accent);
  height: 50%;
}

/* сам range */
input[type="range"] {
  width: 100%;
  margin: 0;
}

/* контейнер точки */
.recommended-point {
  width: 100%;
  height: 10px;
  align-items: center;
  pointer-events: none;
}

/* точка */
.dot {
  position: relative;
  width: 10px;
  height: 10px;
  background: red;
  border-radius: 50%;
}
/* точка предсказания */
.predicted-dot {
  
  position: relative;
  width: 10px;
  height: 10px;
  background: yellow;
  border-radius: 50%;
}

/* подпись */
.label {
  font-size: 10px;
  margin-top: 6px;
}

</style>