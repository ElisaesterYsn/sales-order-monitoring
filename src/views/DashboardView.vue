<script setup>
import { onMounted } from "vue";
import { useDashboard } from "../composables/useDashboard.js";
import { useSalesOrders } from "../composables/useSalesOrders.js";
import KpiCard from "../components/KpiCard.vue";
import StatusDistributionBar from "../components/StatusDistributionBar.vue";
import RecentOrdersTable from "../components/RecentOrdersTable.vue";
import { formatCurrency, formatNumber } from "../utils/formatters.js";

// ── Dashboard summary (unfiltered totals) ────────────────────────────────────
const {
  summary,
  loading: dashLoading,
  error: dashError,
  loadDashboard,
} = useDashboard();

// ── Recent orders (8 most recent by creation date, descending) ───────────────
const {
  orders,
  loading: ordersLoading,
  error: ordersError,
  pageSize,
  sortField,
  sortOrder,
  loadOrders,
} = useSalesOrders();

onMounted(() => {
  loadDashboard();

  // Configure the composable's refs before calling loadOrders so the request
  // is built from the correct state. loadOrders() reads these refs internally.
  pageSize.value = 8;
  sortField.value = "CreatedDateTime1";
  sortOrder.value = "desc";
  loadOrders();
});

// KPI card definitions — values derived from summary ref
// Defined as a function so the template can call it reactively
function kpiCards() {
  const s = summary.value;
  return [
    {
      label: "Total Orders",
      value: s ? formatNumber(s.total_orders) : "—",
      accent: "border-l-navy-700",
    },
    {
      label: "Open Orders",
      value: s ? formatNumber(s.open_orders) : "—",
      accent: "border-l-blue-500",
    },
    {
      label: "Invoiced",
      value: s ? formatNumber(s.invoiced_orders) : "—",
      accent: "border-l-purple-500",
    },
    {
      label: "Delivered",
      value: s ? formatNumber(s.delivered_orders) : "—",
      accent: "border-l-green-500",
    },
    {
      label: "Cancelled",
      value: s ? formatNumber(s.cancelled_orders) : "—",
      accent: "border-l-red-400",
    },
    {
      label: "Total Order Value",
      value: s ? formatCurrency(s.total_order_value) : "—",
      accent: "border-l-amber-500",
    },
  ];
}
</script>

<template>
  <!-- Page header -->
  <div class="mb-6">
    <h1 class="text-xl font-bold text-navy-900">Dashboard</h1>
    <p class="mt-1 text-sm text-gray-500">
      Overall sales order summary for Harrisons Sabah Sdn Bhd.
    </p>
  </div>

  <!-- ── Dashboard error state ─────────────────────────────────────────────── -->
  <div
    v-if="dashError"
    class="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-4"
  >
    <svg
      class="mt-0.5 w-4 h-4 text-red-500 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3
           L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-red-700">
        Could not load dashboard data
        <span v-if="dashError.status" class="font-normal text-red-500"
          >({{ dashError.status }})</span
        >
      </p>
      <p class="mt-0.5 text-sm text-red-600">{{ dashError.message }}</p>
    </div>
    <button
      @click="loadDashboard"
      class="shrink-0 text-xs font-medium text-red-700 hover:text-red-900 underline"
    >
      Retry
    </button>
  </div>

  <!-- ── KPI cards ─────────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
    <KpiCard
      v-for="card in kpiCards()"
      :key="card.label"
      :label="card.label"
      :value="card.value"
      :accent="card.accent"
      :loading="dashLoading"
    />
  </div>

  <!-- ── Status distribution ───────────────────────────────────────────────── -->
  <div class="mb-6">
    <StatusDistributionBar :summary="summary" :loading="dashLoading" />
  </div>

  <!-- ── Recent orders ─────────────────────────────────────────────────────── -->
  <div>
    <!-- Orders error state -->
    <div
      v-if="ordersError"
      class="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-4"
    >
      <svg
        class="mt-0.5 w-4 h-4 text-red-500 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3
             L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-red-700">
          Could not load recent orders
          <span v-if="ordersError.status" class="font-normal text-red-500"
            >({{ ordersError.status }})</span
          >
        </p>
        <p class="mt-0.5 text-sm text-red-600">{{ ordersError.message }}</p>
      </div>
      <button
        @click="loadOrders"
        class="shrink-0 text-xs font-medium text-red-700 hover:text-red-900 underline"
      >
        Retry
      </button>
    </div>

    <RecentOrdersTable :orders="orders" :loading="ordersLoading" />
  </div>
</template>
