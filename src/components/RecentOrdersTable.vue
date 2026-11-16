<script setup>
import StatusBadge from './StatusBadge.vue'
import { formatCurrency, formatDate } from '../utils/formatters.js'

/**
 * RecentOrdersTable
 * Displays a compact read-only table of recent sales orders.
 *
 * Props:
 *   orders   {Array}    Array of sales order objects from the API.
 *   loading  {boolean}  Shows skeleton rows when true.
 */
defineProps({
  orders: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const SKELETON_ROWS = 5
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <!-- Card header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <h2 class="text-sm font-semibold text-gray-700">Recent Orders</h2>
      <router-link
        to="/orders"
        class="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
      >
        View all →
      </router-link>
    </div>

    <!-- Table wrapper — horizontally scrollable on small screens -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100">
            <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              Order No.
            </th>
            <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              Customer
            </th>
            <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              Site
            </th>
            <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              Date
            </th>
            <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              Status
            </th>
            <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              Amount
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-50">
          <!-- Loading skeleton rows -->
          <template v-if="loading">
            <tr v-for="i in SKELETON_ROWS" :key="i" class="animate-pulse">
              <td class="px-5 py-3.5"><div class="h-4 w-28 bg-gray-200 rounded" /></td>
              <td class="px-5 py-3.5"><div class="h-4 w-40 bg-gray-200 rounded" /></td>
              <td class="px-5 py-3.5"><div class="h-4 w-10 bg-gray-200 rounded" /></td>
              <td class="px-5 py-3.5"><div class="h-4 w-24 bg-gray-200 rounded" /></td>
              <td class="px-5 py-3.5"><div class="h-5 w-20 bg-gray-200 rounded-full" /></td>
              <td class="px-5 py-3.5 text-right"><div class="h-4 w-24 bg-gray-200 rounded ml-auto" /></td>
            </tr>
          </template>

          <!-- Data rows -->
          <template v-else-if="orders.length > 0">
            <tr
              v-for="order in orders"
              :key="order.SalesId"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-5 py-3.5 font-medium text-navy-900 whitespace-nowrap">
                {{ order.SalesId }}
              </td>
              <td class="px-5 py-3.5 text-gray-700 max-w-[180px] truncate" :title="order.SalesName">
                {{ order.SalesName }}
              </td>
              <td class="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                {{ order.InventSiteId }}
              </td>
              <td class="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                {{ formatDate(order.CreatedDateTime1) }}
              </td>
              <td class="px-5 py-3.5 whitespace-nowrap">
                <StatusBadge :status="order.SalesStatus" />
              </td>
              <td class="px-5 py-3.5 text-right font-medium text-navy-900 whitespace-nowrap tabular-nums">
                {{ formatCurrency(order.HAR_TotalSOAmount) }}
              </td>
            </tr>
          </template>

          <!-- Empty state -->
          <tr v-else>
            <td colspan="6" class="px-5 py-10 text-center text-sm text-gray-400">
              No orders to display.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
