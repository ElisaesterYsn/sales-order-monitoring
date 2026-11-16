<script setup>
/**
 * KpiCard
 * A single KPI tile for the dashboard summary row.
 *
 * Props:
 *   label    {string}  Stat description, e.g. "Total Orders"
 *   value    {string}  Pre-formatted value to display, e.g. "1,200" or "RM 998,244.30"
 *   accent   {string}  Tailwind left-border colour class, e.g. "border-blue-500"
 *   loading  {boolean} Shows a skeleton pulse when true
 */
defineProps({
  label: { type: String, required: true },
  value: { type: String, default: '—' },
  accent: { type: String, default: 'border-gray-300' },
  loading: { type: Boolean, default: false },
})
</script>

<template>
  <div :class="['bg-white rounded-lg border border-gray-200 p-5 border-l-4', accent]">
    <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ label }}</p>

    <!-- Loading skeleton -->
    <div v-if="loading" class="mt-2 h-7 w-28 bg-gray-200 rounded animate-pulse" />

    <!-- Value -->
    <p v-else class="mt-2 text-2xl font-bold text-navy-900 tabular-nums">{{ value }}</p>
  </div>
</template>
