<script setup lang="ts">
import { ref } from "vue";
import CardItem from "./CardItem.vue";
import type { Card } from "../types";

const cards = ref<Card[]>([]);

const emit = defineEmits(["update:cards"]);

const props = defineProps<{
  teamComponents: { tag: string; value: number }[];
}>();

let nextId = 1;

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
    <h2>Mechanics cards</h2>
  <div>
    <button @click="addCard" >➕ Add Card</button>

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
</template>

<style scoped>
.card-list {
  margin-top: 16px;
}

button {
  border-radius: 4px;
}

</style>