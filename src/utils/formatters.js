/**
 * formatters.js
 * Pure helper functions for display formatting.
 * No Vue dependencies — usable anywhere in the app.
 */

/**
 * Formats a number as Malaysian Ringgit.
 * e.g. 998244.30 → "RM 998,244.30"
 *
 * @param {number|null|undefined} value
 * @returns {string}
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return 'RM —'
  return (
    'RM ' +
    Number(value).toLocaleString('en-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

/**
 * Formats an ISO 8601 date string as a short readable date.
 * e.g. "2026-09-30T03:07:00.000Z" → "30 Sep 2026"
 *
 * @param {string|null|undefined} value
 * @returns {string}
 */
export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Formats a plain date string (YYYY-MM-DD) as a short readable date.
 * e.g. "2026-10-01" → "01 Oct 2026"
 * Uses UTC to avoid timezone-shift issues with date-only strings.
 *
 * @param {string|null|undefined} value
 * @returns {string}
 */
export function formatDateOnly(value) {
  if (!value) return '—'
  // Append T00:00:00Z so the Date is parsed in UTC, not local time.
  const date = new Date(value + 'T00:00:00Z')
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Formats a large integer with thousands separators.
 * e.g. 1200 → "1,200"
 *
 * @param {number|null|undefined} value
 * @returns {string}
 */
export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return Number(value).toLocaleString('en-MY')
}
