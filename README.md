```markdown
# MERN E‑commerce

A MERN-style e‑commerce application: an Express/Node backend with MongoDB, and a Vite-powered React frontend styled with Tailwind and motion/visual libraries.

## Table of contents

- [Overview](#overview)
- [Backend](#backend)
  - [Server & infrastructure](#server--infrastructure)
  - [Database & integrations](#database--integrations)
  - [Data models & middleware](#data-models--middleware)
  - [Controllers & routes](#controllers--routes)
- [Frontend](#frontend)
  - [Routing & layout](#routing--layout)
  - [State & data fetching](#state--data-fetching)
  - [Key screens & components](#key-screens--components)
  - [Admin dashboard](#admin-dashboard)
- [End-to-end flow](#end-to-end-flow)
- [Pointers / What to learn next](#pointers--what-to-learn-next)
  - [Environment setup](#environment-setup)
  - [Running locally](#running-locally)
  - [Extend auth flows](#extend-auth-flows)
  - [Enhance analytics or marketing](#enhance-analytics-or-marketing)
  - [Stabilize admin tooling](#stabilize-admin-tooling)
- [Notes & structure pointers](#notes--structure-pointers)

## Overview

This project implements a full-stack e‑commerce experience:

- Backend: Express + Node, REST API endpoints under `/api`.
- Database: MongoDB via Mongoose.
- Frontend: React (Vite) styled with Tailwind; animation/motion libraries included.
- Third‑party services: Cloudinary (images), Upstash Redis (refresh tokens / caching), Stripe (payments).

## Backend

### Server & infrastructure

- Entry: `backend/server.js` bootstraps the Express server.
- Loads environment variables, parses JSON and cookies.
- Registers REST routes under `/api`.
- In production, serves the built frontend from the server.
- Connects to MongoDB on startup.

Typical responsibilities:
- Authentication (access + refresh tokens, HttpOnly cookies).
- Serving product, cart, coupon, order, and analytics endpoints.
- Admin-only endpoints guarded by middleware.

### Database & integrations

- MongoDB connection logic is centralized in `lib/db.js`.
- Cloudinary helper(s) handle image uploads and deletions.
- Upstash Redis is used to store refresh tokens and caching (e.g., featured products).
- Stripe integration lives in a payments helper to create Checkout sessions and handle webhooks.

### Data models & middleware

Mongoose models represent:
- Users (including cart items, hashed passwords).
- Products (with fields like `featured`).
- Coupons (per-user codes, usage, expiration).
- Orders (items captured after checkout).

Middleware:
- `protectRoute`: validates the `accessToken` cookie and loads the authenticated user.
- `adminRoute`: additional guard that allows only admin users to access certain endpoints.

### Controllers & routes

Auth:
- Issues short-lived access tokens and long-lived refresh tokens stored in Redis.
- Sets HttpOnly cookies for auth flows.
- Supports token refresh and logout.
- Provides `/profile` for authenticated user info.

Products:
- Listing and filtering (category, search).
- Featured products with Redis caching for fast reads.
- Cloudinary-backed creation and deletion.
- Category filters and "people also bought" recommendations.
- Toggle featured state for admins.

Cart:
- Endpoints mutate the authenticated user’s `cartItems`.
- Hydrates items with product details.
- Supports quantity updates and clears.

Coupons:
- Fetch a user’s active coupon code.
- Validate coupon usage and expiration.
- Deactivate a coupon after use (order success).

Payments & Orders:
- Assemble Stripe Checkout sessions.
- Honor coupons during checkout.
- Create order records on successful payment.
- Optionally auto-generate rewards for large orders.

Analytics:
- Aggregates totals and 7-day sales/revenue trends using Mongo aggregations.
- Exposes admin-only endpoints returning summary stats and chart-ready data.

## Frontend

### Routing & layout

- `App.jsx` wires React Router paths:
  - Home, category listings, cart, auth (login/signup), admin panel.
  - Stripe success/cancel pages for post-checkout.
- Persistent navbar and toast container.
- Routes are gated based on authentication state and role.

Navbar:
- Reacts to login state.
- Displays cart item count.
- Shows admin dashboard link for elevated users.

### State & data fetching

- Axios is preconfigured to talk to `/api` (in dev it falls back to `http://localhost:5000/api`) and sends cookies for token flows.
- Zustand stores drive client state:
  - `useUserStore` handles signup/login/logout, persists auth status, and sets an Axios interceptor to refresh tokens on 401 responses.
  - `useCartStore` manages cart items, coupon application, and local total calculations.

### Key screens & components

- Home page: curated categories and a responsive featured carousel sourced from product endpoints.
- Category pages: fetch filtered products and present pagination or infinite scroll.
- `ProductCard`: shows product info and enforces login before cart interactions.
- Cart view: lists items, shows dynamic recommendations, calculates totals and discounts, and initiates Stripe Checkout using components like `OrderSummary`, `GiftCouponCard`, and `PeopleAlsoBought`.
- Post-checkout: `PurchaseSuccess` screen that displays order details and confirmation.

### Admin dashboard

- Tabbed UI to:
  - Create products (client-side image-to-base64 handling).
  - Manage products in a table with featured toggles and delete actions.
  - View analytics and business metrics (summary cards and charts).
- Creation flow can include client-side validation and image handling.

## End-to-end flow

1. Visitor signs up or logs in.
2. Backend issues signed access and refresh cookies.
3. Frontend updates Zustand stores and displays authenticated UI.
4. Browsing:
   - Public featured and category endpoints are used by all users.
   - Admin APIs require both `protectRoute` and `adminRoute`.
5. Cart actions:
   - Call authenticated cart/coupon endpoints to mutate server state.
   - Totals are recalculated locally in the client.
6. Checkout:
   - Frontend assembles Stripe line items and redirects to hosted Checkout.
   - On success, backend creates an order record and deactivates used coupons.
   - UI shows a confirmation screen.
7. Admins can seed the catalog and inspect metrics powered by Mongo aggregations.

## Pointers / What to learn next

### Environment setup

Create a `.env` file in the project root with the following keys (example names — adjust if your code uses different names):

```env
MONGO_URI=<your-mongodb-uri>
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
UPSTASH_REDIS_REST_URL=<upstash-redis-url>
UPSTASH_REDIS_REST_TOKEN=<upstash-redis-token>
STRIPE_SECRET_KEY=<stripe-secret-key>
STRIPE_PUBLISHABLE_KEY=<stripe-publishable-key>
CLIENT_URL=http://localhost:5173
PORT=5000
```

Every integration module (Mongo, Cloudinary, Upstash, Stripe) depends on these values.

### Running locally

From the repo root:

- Start the backend (assuming root scripts are configured):
  ```bash
  npm run dev
  ```

- Start the frontend:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

Alternatively, use the root build script when deploying to production so the backend serves the built frontend.

### Extend auth flows

- Inspect `useUserStore`'s Axios interceptor for token refresh logic.
- Add role-based routing, token revocation endpoints, or multi-factor authentication if required.

### Enhance analytics or marketing

- Extend the analytics aggregations to support custom time ranges and cohorts.
- Use coupon and recommendation endpoints to design marketing campaigns and promotional flows.

### Stabilize admin tooling

- Add validation and file-size checks to `CreateProductForm`.
- Consider drag-and-drop uploads with progress and server-side validation.
- Surface richer success/error feedback in the product store beyond toasts.

## Notes & structure pointers

- Protect admin operations by combining `protectRoute` and `adminRoute` middleware.
- Cache read-heavy endpoints (featured products, some analytics) in Redis to reduce DB load.
- Keep sensitive keys out of the repo and rotate API keys when necessary.
- Tests and CI are recommended to stabilize payment flows and webhook handling.

---

With this README you should have a clear, navigable map of how data flows from the database and third-party services up through the REST API into client-side stores and React components. Use the sections above to orient development, debugging, and feature extension.
```
