<script setup lang="ts">
import { ref } from "vue";
import CardItem from "./CardItem.vue";
import type { Card } from "../types";

const cards = ref<Card[]>([]);

const emit = defineEmits(["update:cards"]);

const props = defineProps<{
  teamComponents: { tag: string; value: number }[];
}>();

let nextId = 0;

function addCard() {
    let suffix = 1;
    nextId++;
    let title = `Карточка №${nextId}`;
    let accId = nextId;

  while (cards.value.some(card => card.title === title)) {
    title = `${`Карточка №${nextId}`} (${suffix++})`;
    accId += suffix;
  }
  console.log(cards);
  cards.value.push({
    id: accId,
    title: title,
    core: false,
    planned: false,
    tags: [],
    tagValues: {},
    recommendedTagValues: {},
    priority: 0,
    taskType: "Своя механика",
    complexity: 2, // 👈 дефолт
    recommendedComplexity: 2
  });
  emit("update:cards", cards.value);
}

function deleteCard(id: number) {
  cards.value = cards.value.filter(c => c.id !== id);
  nextId--;
  emit("update:cards", cards.value);
}

defineExpose({
  deleteCard
});

</script>

<template>

  <div class="header-right">
    <h2>Механики</h2>
    <button @click="addCard" >➕ Добавить механику</button>
      <div class="right">
        <div class="card-list">
          <CardItem
              v-for="card in cards"
              :key="card.id"
              :teamComponents="teamComponents"
              :cards="cards"
              :card="card"
              @delete="deleteCard"
          />
        </div>
      </div>
      
  </div>
</template>

<style scoped>
.header-right {
  flex: 1;
  display: flex;
  flex-direction: column;

}

.header-right button {
 margin-bottom: 5px;
 width: 100%;
}

.right {
  border-left: 1px solid #ccc;
  padding-left: 20px;
  padding-right: 20px;
  overflow-y: auto;
}


.card-list {
  margin-top: 16px;
}

button {
  border-radius: 4px;
}

</style>