<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import Chart from "chart.js/auto";

const props = defineProps<{
  data: Record<string, number>;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

function renderChart() {
  if (!canvasRef.value) return;

  const labels = Object.keys(props.data);
  const values = Object.values(props.data);

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(canvasRef.value, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data: values,
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}

onMounted(renderChart);

watch(
  () => props.data,
  () => {
    renderChart();
  },
  { deep: true }
);
</script>

<template>
<div class="chart-container">
  <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style>
.chart-container {
  width: 100%;
  max-width: 250px;
  height: 250px;
  margin: 0 auto;
}
</style>