<script setup>
import { ref, computed, onMounted } from "vue";
import { useSalesOrders } from "../composables/useSalesOrders.js";
import StatusBadge from "../components/StatusBadge.vue";
import {
  formatCurrency,
  formatDate,
  formatNumber,
} from "../utils/formatters.js";

const {
  // Data
  orders,
  // Pagination state
  page,
  pageSize,
  total,
  totalPages,
  // Filter / search state
  selectedStatus,
  selectedSite,
  // Sort state
  sortField,
  sortOrder,
  // Async state
  loading,
  error,
  // Filter option lists (from /meta)
  statusOptions,
  siteOptions,
  metaError,
  // Functions
  loadOrders,
  loadFilterMeta,
  searchOrders,
  filterByStatus,
  filterBySite,
  changePage,
  changePageSize,
  changeSort,
  resetFilters,
} = useSalesOrders();

// Local input value — only sent to the API when the user submits.
// Kept separate so typing does not trigger requests on every keystroke.
const searchInput = ref("");

onMounted(() => {
  loadFilterMeta();
  loadOrders();
});

// ── Search ────────────────────────────────────────────────────────────────────

function submitSearch() {
  searchOrders(searchInput.value.trim());
}

function handleSearchKeydown(event) {
  if (event.key === "Enter") submitSearch();
}

// ── Reset ─────────────────────────────────────────────────────────────────────

function handleReset() {
  searchInput.value = "";
  resetFilters();
}

// ── Sort helpers ──────────────────────────────────────────────────────────────

function isSortActive(field) {
  return sortField.value === field;
}

// ── Pagination items (computed) ───────────────────────────────────────────────
//
// Builds a small array of items for the page-number buttons.
// Each item is either:
//   { type: 'page', value: n }  — a clickable page number
//   { type: 'ellipsis', key }   — a non-clickable '…' separator
//
// Rules:
//   - Always include page 1 and the last page.
//   - Include up to 2 pages before and after the current page.
//   - Insert an ellipsis wherever there is a gap of more than one page.
//   - No duplicate page numbers.
const paginationItems = computed(() => {
  const total = totalPages.value;
  const current = page.value;
  if (total <= 1) return [];

  // Collect the set of page numbers to show, in order.
  const pageSet = new Set([
    1,
    total,
    current - 2,
    current - 1,
    current,
    current + 1,
    current + 2,
  ]);

  // Filter out numbers outside the valid range, then sort.
  const pages = [...pageSet]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  // Build the final list, inserting ellipsis items for gaps.
  const items = [];
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) {
      items.push({ type: "ellipsis", key: `ellipsis-${pages[i]}` });
    }
    items.push({ type: "page", value: pages[i] });
  }
  return items;
});

// ── Page size options ─────────────────────────────────────────────────────────

const pageSizeOptions = [10, 25, 50, 100];

function handlePageSizeChange(event) {
  changePageSize(Number(event.target.value));
}

function handleStatusChange(event) {
  filterByStatus(event.target.value);
}

function handleSiteChange(event) {
  filterBySite(event.target.value);
}
</script>

<template>
  <!-- ── Page header ─────────────────────────────────────────────────────────── -->
  <div class="mb-6">
    <h1 class="text-xl font-bold text-navy-900">Sales Orders</h1>
    <p class="mt-1 text-sm text-gray-500">
      Monitor, search and filter all sales orders across branches.
    </p>
  </div>

  <!-- ── Search and filters bar ────────────────────────────────────────────── -->
  <div class="bg-white rounded-lg border border-gray-200 px-4 py-4 mb-5">
    <div class="flex flex-col sm:flex-row gap-3">
      <!-- Search input + button -->
      <div class="flex flex-1 min-w-0 gap-2">
        <div class="relative flex-1 min-w-0">
          <span
            class="absolute inset-y-0 left-3 flex items-center pointer-events-none"
          >
            <svg
              class="w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z"
              />
            </svg>
          </span>
          <input
            v-model="searchInput"
            type="text"
            placeholder="Order ID, customer, account, reference, sales rep…"
            class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            @keydown="handleSearchKeydown"
          />
        </div>
        <button
          @click="submitSearch"
          class="shrink-0 px-4 py-2 text-sm font-medium text-white bg-navy-900 rounded-lg hover:bg-navy-800 transition-colors"
        >
          Search
        </button>
      </div>

      <!-- Status filter -->
      <div class="flex gap-2 flex-wrap sm:flex-nowrap">
        <select
          :value="selectedStatus"
          @change="handleStatusChange"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :disabled="!!metaError"
        >
          <option value="">All Statuses</option>
          <option
            v-for="opt in statusOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.value }} ({{ formatNumber(opt.count) }})
          </option>
        </select>

        <!-- Site filter -->
        <select
          :value="selectedSite"
          @change="handleSiteChange"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :disabled="!!metaError"
        >
          <option value="">All Sites</option>
          <option
            v-for="opt in siteOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.value }} ({{ formatNumber(opt.count) }})
          </option>
        </select>

        <!-- Reset button -->
        <button
          @click="handleReset"
          class="shrink-0 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Metadata error notice (non-fatal — dropdowns just show placeholders) -->
    <p v-if="metaError" class="mt-2 text-xs text-amber-600">
      Filter options could not be loaded. Search and table are still available.
    </p>
  </div>

  <!-- ── Orders error state ─────────────────────────────────────────────────── -->
  <div
    v-if="error"
    class="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-4"
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
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-red-700">
        Could not load orders
        <span v-if="error.status" class="font-normal text-red-500"
          >({{ error.status }})</span
        >
      </p>
      <p class="mt-0.5 text-sm text-red-600">{{ error.message }}</p>
    </div>
    <button
      @click="loadOrders"
      class="shrink-0 text-xs font-medium text-red-700 hover:text-red-900 underline"
    >
      Retry
    </button>
  </div>

  <!-- ── Results bar ────────────────────────────────────────────────────────── -->
  <div class="flex items-center justify-between mb-3 gap-4 flex-wrap">
    <!-- Record count -->
    <p class="text-sm text-gray-500">
      <template v-if="loading">Loading…</template>
      <template v-else-if="total > 0">
        {{ formatNumber(total) }} order{{ total === 1 ? "" : "s" }} found
        <span v-if="totalPages > 1">
          — page {{ page }} of {{ totalPages }}</span
        >
      </template>
      <template v-else-if="!error">No orders found</template>
    </p>

    <!-- Page size selector -->
    <div class="flex items-center gap-2 text-sm text-gray-600">
      <label for="page-size" class="whitespace-nowrap">Rows per page</label>
      <select
        id="page-size"
        :value="pageSize"
        @change="handlePageSizeChange"
        class="px-2 py-1 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option v-for="n in pageSizeOptions" :key="n" :value="n">
          {{ n }}
        </option>
      </select>
    </div>
  </div>

  <!-- ── Orders table ───────────────────────────────────────────────────────── -->
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden mb-5">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <!-- Sortable: Order No. -->
            <th class="px-5 py-3 text-left">
              <button
                @click="changeSort('SalesId')"
                class="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-navy-900 transition-colors"
              >
                Order No.
                <span class="w-3.5 text-center">
                  <template v-if="isSortActive('SalesId')">{{
                    sortOrder === "asc" ? "↑" : "↓"
                  }}</template>
                  <template v-else
                    ><span class="text-gray-300">↕</span></template
                  >
                </span>
              </button>
            </th>

            <!-- Non-sortable: Customer -->
            <th
              class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
            >
              Customer
            </th>

            <!-- Non-sortable: Site -->
            <th
              class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
            >
              Site
            </th>

            <!-- Sortable: Date -->
            <th class="px-5 py-3 text-left">
              <button
                @click="changeSort('CreatedDateTime1')"
                class="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-navy-900 transition-colors"
              >
                Date
                <span class="w-3.5 text-center">
                  <template v-if="isSortActive('CreatedDateTime1')">{{
                    sortOrder === "asc" ? "↑" : "↓"
                  }}</template>
                  <template v-else
                    ><span class="text-gray-300">↕</span></template
                  >
                </span>
              </button>
            </th>

            <!-- Non-sortable: Status -->
            <th
              class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
            >
              Status
            </th>

            <!-- Sortable: Amount -->
            <th class="px-5 py-3 text-right">
              <button
                @click="changeSort('HAR_TotalSOAmount')"
                class="flex items-center justify-end gap-1 w-full text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-navy-900 transition-colors"
              >
                Amount
                <span class="w-3.5 text-center">
                  <template v-if="isSortActive('HAR_TotalSOAmount')">{{
                    sortOrder === "asc" ? "↑" : "↓"
                  }}</template>
                  <template v-else
                    ><span class="text-gray-300">↕</span></template
                  >
                </span>
              </button>
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100">
          <!-- Loading skeleton rows -->
          <template v-if="loading">
            <tr v-for="i in pageSize" :key="i" class="animate-pulse">
              <td class="px-5 py-3.5">
                <div class="h-4 w-28 bg-gray-200 rounded" />
              </td>
              <td class="px-5 py-3.5">
                <div class="h-4 w-44 bg-gray-200 rounded" />
              </td>
              <td class="px-5 py-3.5">
                <div class="h-4 w-10 bg-gray-200 rounded" />
              </td>
              <td class="px-5 py-3.5">
                <div class="h-4 w-24 bg-gray-200 rounded" />
              </td>
              <td class="px-5 py-3.5">
                <div class="h-5 w-20 bg-gray-200 rounded-full" />
              </td>
              <td class="px-5 py-3.5">
                <div class="h-4 w-24 bg-gray-200 rounded ml-auto" />
              </td>
            </tr>
          </template>

          <!-- Data rows -->
          <template v-else-if="orders.length > 0">
            <tr
              v-for="order in orders"
              :key="order.SalesId"
              class="hover:bg-gray-50 transition-colors"
            >
              <td
                class="px-5 py-3.5 font-medium text-navy-900 whitespace-nowrap"
              >
                {{ order.SalesId }}
              </td>
              <td
                class="px-5 py-3.5 text-gray-700 max-w-[200px] truncate"
                :title="order.SalesName"
              >
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
              <td
                class="px-5 py-3.5 text-right font-medium text-navy-900 whitespace-nowrap tabular-nums"
              >
                {{ formatCurrency(order.HAR_TotalSOAmount) }}
              </td>
            </tr>
          </template>

          <!-- Empty state -->
          <tr v-else-if="!error">
            <td colspan="6" class="px-5 py-14 text-center">
              <div class="flex flex-col items-center gap-2 text-gray-400">
                <svg
                  class="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.25"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p class="text-sm font-medium text-gray-500">No orders found</p>
                <p class="text-xs text-gray-400">
                  Try adjusting your search or filters.
                </p>
                <button
                  @click="handleReset"
                  class="mt-1 text-xs font-medium text-blue-600 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ── Pagination controls ────────────────────────────────────────────────── -->
  <div
    v-if="totalPages > 1"
    class="flex items-center justify-between gap-4 flex-wrap"
  >
    <!-- Page info -->
    <p class="text-sm text-gray-500">
      Page <span class="font-medium text-gray-700">{{ page }}</span> of
      <span class="font-medium text-gray-700">{{ totalPages }}</span>
    </p>

    <!-- Prev / Next -->
    <div class="flex items-center gap-2">
      <button
        @click="changePage(page - 1)"
        :disabled="page <= 1 || loading"
        class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          class="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Previous
      </button>

      <!-- Page number buttons — computed window avoids iterating every page -->
      <div class="hidden sm:flex items-center gap-1">
        <template v-for="item in paginationItems" :key="item.key ?? item.value">
          <span
            v-if="item.type === 'ellipsis'"
            class="w-8 text-center text-gray-400 text-sm select-none"
            >…</span
          >
          <button
            v-else
            @click="changePage(item.value)"
            :class="[
              'w-8 h-8 text-sm rounded-lg font-medium transition-colors',
              item.value === page
                ? 'bg-navy-900 text-white'
                : 'text-gray-600 hover:bg-gray-100 border border-gray-300',
            ]"
          >
            {{ item.value }}
          </button>
        </template>
      </div>

      <button
        @click="changePage(page + 1)"
        :disabled="page >= totalPages || loading"
        class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <svg
          class="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
