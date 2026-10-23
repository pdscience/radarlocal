<script setup lang="ts">
import { computed } from 'vue';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js';
import { Line } from 'vue-chartjs';
import type { TimelinePoint } from '../../types';
import { formatCurrency } from '../../utils/format';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const props = defineProps<{
  data: TimelinePoint[];
  ticketAverage: number;
  targetBoost: number;
}>();

const targetLabel = computed(() => `Meta (+${props.targetBoost}%)`);

const chartData = computed(() => ({
  labels: props.data.map((item) => item.month),
  datasets: [
    {
      label: 'Atual (0%)',
      data: props.data.map((item) => item.current),
      borderColor: '#f43f5e',
      backgroundColor: '#f43f5e',
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: '#f43f5e',
      tension: 0.4,
    },
    {
      label: 'Cenário +2%',
      data: props.data.map((item) => item.scenario2),
      borderColor: '#f59e0b',
      backgroundColor: '#f59e0b',
      borderWidth: 2,
      borderDash: [4, 4],
      pointRadius: 3,
      pointBackgroundColor: '#f59e0b',
      tension: 0.4,
    },
    {
      label: targetLabel.value,
      data: props.data.map((item) => item.target),
      borderColor: '#10b981',
      backgroundColor: '#10b981',
      borderWidth: 3.5,
      pointRadius: 5,
      pointBackgroundColor: '#10b981',
      pointBorderColor: '#064e3b',
      pointBorderWidth: 2,
      pointHoverRadius: 7,
      pointHoverBackgroundColor: '#34d399',
      tension: 0.4,
    },
    {
      label: 'Cenário +8%',
      data: props.data.map((item) => item.scenario8),
      borderColor: '#3b82f6',
      backgroundColor: '#3b82f6',
      borderWidth: 2,
      borderDash: [3, 3],
      pointRadius: 3,
      pointBackgroundColor: '#3b82f6',
      tension: 0.4,
    },
  ],
}));

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  scales: {
    x: {
      grid: {
        color: '#262626',
        display: false,
      },
      border: { color: '#262626' },
      ticks: {
        color: '#a3a3a3',
        font: { size: 11 },
      },
    },
    y: {
      grid: {
        color: '#262626',
        drawTicks: false,
      },
      border: { color: '#262626', display: false },
      ticks: {
        color: '#a3a3a3',
        font: { size: 11 },
        callback: (value) => {
          const numeric = Number(value);
          return `R$ ${numeric >= 1000 ? `${(numeric / 1000).toFixed(1)}k` : numeric}`;
        },
      },
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#a3a3a3',
        font: { size: 11 },
        padding: 12,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      backgroundColor: '#0a0a0a',
      borderColor: '#404040',
      borderWidth: 1,
      cornerRadius: 12,
      titleColor: '#e5e5e5',
      bodyColor: '#ffffff',
      padding: 10,
      titleFont: { size: 12, weight: 'bold' as const },
      bodyFont: { size: 12 },
      callbacks: {
        label: (context: TooltipItem<'line'>) => {
          const value = Number(context.parsed.y || 0);
          return `${context.dataset.label}: ${formatCurrency(value)},00 / mês`;
        },
      },
    },
  },
}));
</script>

<template>
  <div class="w-full h-72 pt-2">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
