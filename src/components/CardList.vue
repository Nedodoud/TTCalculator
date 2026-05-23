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
  console.log(cards);
  cards.value.push({
    id: nextId++,
    title: `Card ${nextId}`,
    core: false,
    planned: false,
    tags: [],
    tagValues: {},
    recommendedTagValues: {},
    priority: 0,
    taskType: "Own mechanics",
    complexity: 2, // 👈 дефолт
    recommendedComplexity: 2
  });
  emit("update:cards", cards.value);
  emit("update:cards", cards.value);
}

function deleteCard(id: number) {
  cards.value = cards.value.filter(c => c.id !== id);
  emit("update:cards", cards.value);
}

</script>

<template>

  <div class="header-right">
    <h2>Mechanics cards</h2>
    <button @click="addCard" >➕ Add Card</button>
      <div class="right">
        <div class="card-list">
          <CardItem
              v-for="card in cards"
              :key="card.id"
              :teamComponents="teamComponents"
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