const BASE_URL = "https://hiring.harrisons.my/api/mock/sales-orders";

const AUTH_HEADER = {
  "x-assessment-key": "hssb-assessment-mock-2026",
};

/**
 * Builds the full request URL.
 * Params with null, undefined, or empty-string values are excluded.
 *
 * @param {string} path  - Path segment appended to BASE_URL (e.g. '' or '/meta').
 * @param {object} params - Key/value query parameters.
 * @returns {string}
 */
function buildUrl(path, params = {}) {
  const url = new URL(BASE_URL + path);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

/**
 * Core fetch wrapper used by every exported function.
 * - Attaches the auth header on every request.
 * - Throws a structured { status, message } object for any non-2xx response.
 * - Re-throws network errors (fetch rejection) with their original message intact.
 *
 * @param {string} url - Fully-constructed request URL.
 * @returns {Promise<any>} Parsed JSON response body.
 */
async function apiFetch(url) {
  let response;

  try {
    response = await fetch(url, { headers: AUTH_HEADER });
  } catch (networkError) {
    // fetch() only rejects on actual network failures (no connection, DNS, etc.)
    throw new Error(`Network error: ${networkError.message}`);
  }

  if (!response.ok) {
    const rawBody = await response.text().catch(() => "");
    let message = response.statusText || "Request failed";
    if (rawBody) {
      try {
        const body = JSON.parse(rawBody);
        message = body.message ?? body.error ?? rawBody;
      } catch {
        message = rawBody;
      }
    }
    throw {
      status: response.status,
      message,
    };
  }

  return response.json();
}

/**
 * Fetches a paginated list of sales orders together with the dashboard summary.
 *
 * Supported params (all optional):
 *   page       {number}  Page number, >= 1 (default: 1)
 *   pageSize   {number}  Records per page, 1–100 (default: 25)
 *   status     {string}  Filter by SalesStatus — exact API value
 *                        ('Open order' | 'Invoiced' | 'Delivered' | 'Cancelled')
 *   site       {string}  Filter by InventSiteId — exact API value
 *                        ('A10' | 'B20' | 'C30' | 'D40' | 'E50' | 'KK01' | 'SDK02' | 'TWU03')
 *   q          {string}  Free-text search across SalesId, SalesName,
 *                        CustAccount, CustomerRef, SalesTaker
 *   sort       {string}  Sort field: SalesId | CreatedDateTime1 |
 *                        HAR_TotalSOAmount | SalesStatus | InventSiteId
 *   order      {string}  Sort direction: 'asc' | 'desc' (default: 'asc')
 *
 * Response shape:
 * {
 *   summary: { total_orders, filtered_orders, open_orders, invoiced_orders,
 *               delivered_orders, cancelled_orders, total_order_value },
 *   page, pageSize, total, totalPages, sort, order,
 *   data: [ ...order objects ],
 *   links: { meta, self }
 * }
 *
 * Important: `summary` reflects the full filtered dataset, not just the
 * current page. Call without status/site/q to get overall dashboard KPIs.
 *
 * @param {object} params
 * @returns {Promise<object>}
 */
export async function fetchOrders(params = {}) {
  const url = buildUrl("", params);
  return apiFetch(url);
}

/**
 * Fetches API metadata including filter facets (statuses and sites).
 *
 * Response shape (relevant fields):
 * {
 *   facets: {
 *     statuses: [{ value, count }, ...],
 *     sites:    [{ value, count }, ...]
 *   },
 *   dataset: { rows, primaryKey, sampleId },
 *   ...
 * }
 *
 * Use this to populate filter dropdowns with values sourced directly from
 * the API rather than hard-coded in the UI.
 *
 * @returns {Promise<object>}
 */
export async function fetchMeta() {
  const url = buildUrl("/meta");
  return apiFetch(url);
}

/**
 * Fetches a single sales order by its SalesId.
 *
 * The API returns the order nested under a `data` key:
 * { data: { SalesId, SalesName, ... } }
 *
 * This structure is preserved as-is; callers access the order via `.data`.
 *
 * @param {string} salesId - e.g. 'SO-MOCK-00001' (case-insensitive per API docs)
 * @returns {Promise<{ data: object }>}
 */
export async function fetchOrder(salesId) {
  const url = buildUrl(`/${encodeURIComponent(salesId)}`);
  return apiFetch(url);
}
