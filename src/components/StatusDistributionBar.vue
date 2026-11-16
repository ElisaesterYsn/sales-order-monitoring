<script setup>
import { computed } from 'vue'
import { formatNumber } from '../utils/formatters.js'

/**
 * StatusDistributionBar
 * Displays a proportional horizontal bar broken into coloured segments,
 * one per order status. No chart library required.
 *
 * Props:
 *   summary  {object|null}  The summary object from the API:
 *                           { total_orders, open_orders, invoiced_orders,
 *                             delivered_orders, cancelled_orders }
 *   loading  {boolean}
 */
const props = defineProps({
  summary: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const segments = computed(() => {
  if (!props.summary) return []
  const total = props.summary.total_orders || 1 // avoid division by zero
  return [
    {
      label: 'Open',
      fullLabel: 'Open order',
      count: props.summary.open_orders,
      pct: (props.summary.open_orders / total) * 100,
      bar: 'bg-blue-500',
      dot: 'bg-blue-500',
      text: 'text-blue-700',
    },
    {
      label: 'Invoiced',
      fullLabel: 'Invoiced',
      count: props.summary.invoiced_orders,
      pct: (props.summary.invoiced_orders / total) * 100,
      bar: 'bg-purple-500',
      dot: 'bg-purple-500',
      text: 'text-purple-700',
    },
    {
      label: 'Delivered',
      fullLabel: 'Delivered',
      count: props.summary.delivered_orders,
      pct: (props.summary.delivered_orders / total) * 100,
      bar: 'bg-green-500',
      dot: 'bg-green-500',
      text: 'text-green-700',
    },
    {
      label: 'Cancelled',
      fullLabel: 'Cancelled',
      count: props.summary.cancelled_orders,
      pct: (props.summary.cancelled_orders / total) * 100,
      bar: 'bg-red-400',
      dot: 'bg-red-400',
      text: 'text-red-700',
    },
  ]
})
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 p-5">
    <h2 class="text-sm font-semibold text-gray-700 mb-4">Order Status Distribution</h2>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <div class="h-5 w-full bg-gray-200 rounded-full animate-pulse" />
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div v-for="i in 4" :key="i" class="h-10 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>

    <template v-else-if="summary">
      <!-- Proportional bar -->
      <div class="flex h-5 rounded-full overflow-hidden gap-px mb-5">
        <div
          v-for="seg in segments"
          :key="seg.label"
          :class="[seg.bar, 'transition-all duration-500']"
          :style="{ width: seg.pct + '%' }"
          :title="`${seg.fullLabel}: ${seg.count}`"
        />
      </div>

      <!-- Legend -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          v-for="seg in segments"
          :key="seg.label"
          class="flex flex-col gap-1"
        >
          <div class="flex items-center gap-1.5">
            <span :class="['w-2.5 h-2.5 rounded-full shrink-0', seg.dot]" />
            <span class="text-xs text-gray-500 font-medium">{{ seg.label }}</span>
          </div>
          <span :class="['text-lg font-bold tabular-nums', seg.text]">
            {{ formatNumber(seg.count) }}
          </span>
          <span class="text-xs text-gray-400">{{ seg.pct.toFixed(1) }}%</span>
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <p v-else class="text-sm text-gray-400 text-center py-4">No data available.</p>
  </div>
</template>
