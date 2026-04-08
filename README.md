# InventoryDashboard

# Inventory & Order Analytics Dashboard

A full-stack e-commerce operations dashboard with:
- **Server**: Node.js/Express API with 500+ products and 1000+ orders
- **Client**: React 18 + TypeScript with inventory, orders, and analytics views
- Features: pagination, filtering, sorting, inline editing, bulk actions, charts, URL state sync, feature flags

## Tech Stack

React 18, TypeScript, Vite, TanStack Query, Zustand, React Router, Recharts, Tailwind CSS, Express

## Run

```bash
# Install dependencies
npm install && cd server && npm install && cd ../client && npm install

# Run server (port 3001) and client (port 5173)
npm run dev
```

## Technical Decisions

State Management: TanStack Query for server state (caching, invalidation), Zustand for UI state (toasts, sidebar, filters)
Routing: React Router with URL state sync for shareable deep links
Styling: Tailwind CSS for rapid development
Charts: Recharts for its React integration and responsive containers


# Trade-offs

Used in-memory data instead of a real DB for simplicity and faster setup
No optimistic UI for bulk actions (just refetch after)
Single large bundle (could split with lazy loading)


# Improvements with more time

Add unit tests
Implement real-time updates with WebSockets
Code splitting with React.lazy()
Docker Compose for one-command setup
