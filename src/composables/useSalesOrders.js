import { ref } from "vue";
import { fetchOrders, fetchMeta } from "../services/salesOrderApi.js";

/**
 * useSalesOrders
 *
 * Manages the sales order listing: data, pagination, filters, sorting,
 * and filter option lists sourced from the API metadata.
 *
 * ─── Reactive state ──────────────────────────────────────────────────────────
 *
 *   orders       {Array}        Current page of sales order objects.
 *   page         {number}       Current page number (1-based).
 *   pageSize     {number}       Records per page (default 25, max 100).
 *   total        {number}       Total records matching current filters.
 *   totalPages   {number}       Total pages for the current result set.
 *   searchQuery  {string}       Free-text search term (not sent until
 *                               searchOrders() is called explicitly).
 *   selectedStatus {string}     Active status filter value, or '' for none.
 *   selectedSite   {string}     Active site filter value, or '' for none.
 *   sortField    {string}       Active sort column (default 'SalesId').
 *   sortOrder    {string}       Sort direction: 'asc' or 'desc'.
 *   loading      {boolean}      True while an orders request is in flight.
 *   error        {object|null}  { status, message } on failure, null on success.
 *   statusOptions {Array}       Status values from /meta for the filter dropdown.
 *                               Each element: { value: string, count: number }
 *   siteOptions   {Array}       Site values from /meta for the filter dropdown.
 *                               Each element: { value: string, count: number }
 *   metaError     {object|null} Set if the /meta call fails.
 *
 * ─── Exposed functions ───────────────────────────────────────────────────────
 *
 *   loadOrders()          Fetches orders using the current state values.
 *   loadFilterMeta()      Fetches /meta and populates statusOptions/siteOptions.
 *   searchOrders(q)       Sets searchQuery, resets to page 1, fetches.
 *   filterByStatus(value) Sets selectedStatus, resets to page 1, fetches.
 *   filterBySite(value)   Sets selectedSite, resets to page 1, fetches.
 *   changePage(n)         Sets page to n (without resetting other filters).
 *   changePageSize(n)     Sets pageSize, resets to page 1, fetches.
 *   changeSort(field)     Toggles direction if same field, else sorts asc.
 *                         Resets to page 1, fetches.
 *   resetFilters()        Clears all filters and search, resets to page 1,
 *                         fetches.
 *
 * ─── Design notes ────────────────────────────────────────────────────────────
 *
 *   - searchOrders() is deliberate — search is NOT triggered on every
 *     keystroke. The UI controls when to call it (button or debounce).
 *   - Filter changes (status, site, page size, sort) do trigger an immediate
 *     fetch because they are discrete selections, not freeform typing.
 *   - loadFilterMeta() is separate so the UI can call it once on mount and
 *     never again, independent of pagination or filter state.
 *   - This composable never touches the dashboard summary; it owns only the
 *     orders listing concern.
 */
export function useSalesOrders() {
  // ── Orders data ─────────────────────────────────────────────────────────────
  const orders = ref([]);

  // ── Pagination ───────────────────────────────────────────────────────────────
  const page = ref(1);
  const pageSize = ref(25);
  const total = ref(0);
  const totalPages = ref(0);

  // ── Filters and search ───────────────────────────────────────────────────────
  const searchQuery = ref("");
  const selectedStatus = ref("");
  const selectedSite = ref("");

  // ── Sorting ──────────────────────────────────────────────────────────────────
  const sortField = ref("SalesId");
  const sortOrder = ref("asc");

  // ── Async state ──────────────────────────────────────────────────────────────
  const loading = ref(false);
  const error = ref(null);

  // ── Filter options (from /meta) ───────────────────────────────────────────────
  const statusOptions = ref([]);
  const siteOptions = ref([]);
  const metaError = ref(null);

  // ── Race condition guard ─────────────────────────────────────────────────────
  //
  // Every call to loadOrders() increments this counter before it awaits.
  // After the await resolves, the call checks whether its own sequence number
  // still matches the counter. If another call started in the meantime, the
  // counter will have advanced and the stale response is silently discarded.
  //
  // Example: requests A (seq=1) and B (seq=2) are in flight simultaneously.
  // B finishes first → counter is 2, B's seq is 2, so B commits its results.
  // A finishes later → counter is still 2, A's seq is 1, so A is discarded.
  let requestSeq = 0;

  // ── Internal helper ──────────────────────────────────────────────────────────

  /**
   * Assembles the params object from current state and calls fetchOrders.
   * Empty filter values are excluded by the service layer's buildUrl.
   * Only the most recently started request is allowed to commit its results.
   */
  async function loadOrders() {
    // Claim the next sequence number for this invocation.
    const seq = ++requestSeq;

    loading.value = true;
    error.value = null;
    // Clear stale data immediately so the UI never shows results that belong
    // to a previous filter or page while the new request is in flight.
    orders.value = [];

    try {
      const response = await fetchOrders({
        page: page.value,
        pageSize: pageSize.value,
        status: selectedStatus.value,
        site: selectedSite.value,
        q: searchQuery.value,
        sort: sortField.value,
        order: sortOrder.value,
      });

      // Discard the response if a newer request has already started.
      if (seq !== requestSeq) return;

      orders.value = response.data;
      total.value = response.total;
      totalPages.value = response.totalPages;
    } catch (err) {
      // Only update error state if this is still the latest request.
      if (seq !== requestSeq) return;

      error.value = {
        status: err.status ?? null,
        message: err.message ?? "An unexpected error occurred.",
      };
    } finally {
      // Only clear the loading spinner if this is still the latest request.
      // If a newer request is in flight, it owns the loading state.
      if (seq === requestSeq) {
        loading.value = false;
      }
    }
  }

  // ── Filter metadata ──────────────────────────────────────────────────────────

  /**
   * Fetches /meta once to populate dropdown options.
   * Does not affect orders, pagination, or filters.
   */
  async function loadFilterMeta() {
    metaError.value = null;
    try {
      const meta = await fetchMeta();
      statusOptions.value = meta.facets.statuses;
      siteOptions.value = meta.facets.sites;
    } catch (err) {
      metaError.value = {
        status: err.status ?? null,
        message: err.message ?? "Could not load filter options.",
      };
    }
  }

  // ── Filter and search actions ─────────────────────────────────────────────────

  /**
   * Sets the search term and fetches from page 1.
   * Deliberately not triggered on input — called by the UI explicitly.
   * @param {string} q
   */
  function searchOrders(q) {
    searchQuery.value = q;
    page.value = 1;
    loadOrders();
  }

  /**
   * Sets the status filter and fetches from page 1.
   * Pass '' to clear the filter.
   * @param {string} value
   */
  function filterByStatus(value) {
    selectedStatus.value = value;
    page.value = 1;
    loadOrders();
  }

  /**
   * Sets the site filter and fetches from page 1.
   * Pass '' to clear the filter.
   * @param {string} value
   */
  function filterBySite(value) {
    selectedSite.value = value;
    page.value = 1;
    loadOrders();
  }

  // ── Pagination actions ────────────────────────────────────────────────────────

  /**
   * Navigates to a specific page without changing any filters.
   * Silently ignores values that are not positive integers or are outside the
   * known page range, preventing unnecessary API calls.
   * @param {number} n
   */
  function changePage(n) {
    const parsed = Number(n);
    if (
      !Number.isInteger(parsed) ||
      parsed < 1 ||
      (totalPages.value > 0 && parsed > totalPages.value)
    ) {
      return;
    }
    page.value = parsed;
    loadOrders();
  }

  /**
   * Changes the page size and resets to page 1.
   * @param {number} n
   */
  function changePageSize(n) {
    pageSize.value = n;
    page.value = 1;
    loadOrders();
  }

  // ── Sort action ───────────────────────────────────────────────────────────────

  /**
   * Updates the sort field and direction, then fetches from page 1.
   * Clicking the same field toggles asc ↔ desc.
   * Clicking a different field starts with asc.
   * @param {string} field  One of the sortable API field names.
   */
  function changeSort(field) {
    if (sortField.value === field) {
      sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
    } else {
      sortField.value = field;
      sortOrder.value = "asc";
    }
    page.value = 1;
    loadOrders();
  }

  // ── Reset ─────────────────────────────────────────────────────────────────────

  /**
   * Clears all active filters and the search query, then fetches from page 1.
   */
  function resetFilters() {
    searchQuery.value = "";
    selectedStatus.value = "";
    selectedSite.value = "";
    page.value = 1;
    loadOrders();
  }

  return {
    // State
    orders,
    page,
    pageSize,
    total,
    totalPages,
    searchQuery,
    selectedStatus,
    selectedSite,
    sortField,
    sortOrder,
    loading,
    error,
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
  };
}
