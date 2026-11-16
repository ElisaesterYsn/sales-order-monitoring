# Sales Order Monitoring

A responsive sales order monitoring dashboard built with Vue 3 and Vite for technical assessment. All data is sourced from a fictional assessment mock REST API.

---

## Features

- Dashboard with sales order KPIs and status distribution
- Sales order listing with sortable columns
- Search by order ID, customer name, account, reference or sales rep
- Filter by order status and branch/site
- Configurable pagination with page-size selection
- Loading skeletons, empty states and error handling with retry
- Responsive layout with collapsible sidebar

---

## Tech Stack

- Vue 3 (Composition API)
- Vite
- Vue Router
- Tailwind CSS
- Fetch API

---

## Getting Started

```bash
git clone https://github.com/ElisaesterYsn/sales-order-monitoring.git
cd sales-order-monitoring
npm install
npm run dev
```

App runs at **http://localhost:5173**

---

## Production Build

```bash
npm run build
```

---

## API

**Base URL:** `https://hiring.harrisons.my/api/mock/sales-orders`

All requests require the header:

```
x-assessment-key: <assessment key>
```

The API is read-only and is the application's sole data source. No backend, database or mock data is used.

---

## AI Disclosure & Testing

**Kiro** (agentic AI IDE) was used for code generation and implementation throughout the project. **ChatGPT** was used for technical review and debugging guidance. All generated code was reviewed and directed by the developer.

Testing was performed manually in the browser against the live mock API. The production build completes without errors. No automated test suite is included.

---

## Deployment

Deployed on **Vercel** with an SPA rewrite rule (`vercel.json`) to support Vue Router's `createWebHistory` routing.
