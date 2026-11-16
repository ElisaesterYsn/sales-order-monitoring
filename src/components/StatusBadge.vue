<script setup>
/**
 * StatusBadge
 * Renders a coloured pill for a SalesStatus value.
 * Colour mapping is based on the four confirmed API status values.
 */
defineProps({
  status: {
    type: String,
    required: true,
  },
})

const colourMap = {
  'Open order': 'bg-blue-100 text-blue-800',
  'Invoiced':   'bg-purple-100 text-purple-800',
  'Delivered':  'bg-green-100 text-green-800',
  'Cancelled':  'bg-red-100 text-red-800',
}

function badgeClass(status) {
  return colourMap[status] ?? 'bg-gray-100 text-gray-700'
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
      badgeClass(status),
    ]"
  >
    {{ status }}
  </span>
</template>
