import { ref } from 'vue'
import { fetchOrders } from '../services/salesOrderApi.js'

/**
 * useDashboard
 *
 * Fetches the overall sales order summary from the API.
 *
 * The dashboard statistics must reflect the full dataset, not a filtered
 * subset. This composable always calls fetchOrders without any status, site,
 * or search filters. pageSize: 1 is used because only the summary object is
 * needed — the data array is intentionally ignored here.
 *
 * Exposed state:
 *   summary  {object|null}  The summary object returned by the API:
 *                           { total_orders, filtered_orders, open_orders,
 *                             invoiced_orders, delivered_orders,
 *                             cancelled_orders, total_order_value }
 *   loading  {boolean}      True while the request is in flight.
 *   error    {object|null}  Set to { status, message } on API errors, or
 *                           { message } on network errors. Null on success.
 *
 * Exposed functions:
 *   loadDashboard()  Triggers the API call and updates state.
 */
export function useDashboard() {
  const summary = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function loadDashboard() {
    loading.value = true
    error.value = null

    try {
      // No filter params — summary must reflect the entire dataset.
      // pageSize: 1 minimises the response payload; we only need summary.
      const response = await fetchOrders({ page: 1, pageSize: 1 })
      summary.value = response.summary
    } catch (err) {
      // err is either { status, message } from apiFetch or an Error from a
      // network failure. Normalise to a plain object with a message string.
      error.value = {
        status: err.status ?? null,
        message: err.message ?? 'An unexpected error occurred.',
      }
    } finally {
      loading.value = false
    }
  }

  return {
    summary,
    loading,
    error,
    loadDashboard,
  }
}
