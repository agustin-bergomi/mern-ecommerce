Overview
This repo is a MERN-style e-commerce app: an Express/Node backend with MongoDB integrations and a Vite-powered React frontend styled with Tailwind and motion/visual libraries. The root package.json wires backend scripts (npm run dev starts backend/server.js), while the frontend has its own Vite toolchain and dependencies such as React, Zustand, Framer Motion, and Stripe’s client SDK.

Backend
Server & infrastructure
backend/server.js bootstraps Express, loads environment variables, parses JSON/cookies, registers REST routes under /api, serves the built frontend in production, and triggers the MongoDB connection on startup.

Mongo access is centralized in lib/db.js, while companion helpers configure Cloudinary for image uploads, Upstash Redis for token/cache storage, and Stripe for payments via environment variables such as MONGO_URI, CLOUDINARY_*, UPSTASH_*, and STRIPE_SECRET_KEY. These modules throw early if required configuration is missing.

Data models & middleware
Mongoose schemas model users (including cart items and hashed passwords), products (with featured flag), coupons (per-user codes with expiration), and orders (items captured after checkout).

protectRoute validates the accessToken cookie and loads the user, while adminRoute guards admin-only endpoints.

Controllers & routes
Auth endpoints issue short-lived access tokens plus refresh tokens stored in Redis, set HttpOnly cookies, support refresh/logout, and expose a /profile endpoint once authenticated.

Product management covers listing, featured caching via Redis, Cloudinary-backed creation/deletion, category filters, random “people also bought” suggestions, and toggling the featured state. These map to the admin-protected /api/products routes.

Cart endpoints mutate the authenticated user’s cartItems, hydrate product details, and handle quantity updates or clears.

Coupon logic fetches a user’s active code and validates discount usage.

Payment flows assemble Stripe Checkout sessions, honor coupons, auto-generate rewards for large orders, and create order records on success; follow-up requests deactivate used coupons.

Analytics aggregates totals and seven-day sales/revenue trends via Mongo aggregations, exposed through an admin-only route that returns both summary stats and chart data.

Frontend
Routing & layout
App.jsx wires React Router paths (home, category, cart, auth, admin, Stripe success/cancel) around a persistent navbar and toast container, gating routes based on the authenticated user’s role/state from the user store.

The navbar reacts to login state, displays cart counts, and surfaces the admin dashboard shortcut for elevated users.

State & data fetching
Axios is preconfigured to talk to /api (or http://localhost:5000/api in dev) with cookies enabled for token flows.

Zustand stores drive client state: useUserStore handles signup/login/logout, keeps auth status, and sets an Axios interceptor to refresh tokens on 401s; useCartStore manages cart items, coupon application, totals, and Stripe session requests; useProductStore powers admin product CRUD and featured/category fetches.

Key screens & components
The home page showcases curated categories and a responsive featured carousel sourced from the product store.

Category pages fetch filtered products, while ProductCard enforces login before cart interactions.

The cart view lists items, surfaces dynamic recommendations, calculates totals/discounts, and links into Stripe Checkout via OrderSummary, GiftCouponCard, and PeopleAlsoBought. Post-checkout, PurchaseSuccessPage confirms the session and clears the local cart.

The admin dashboard provides tabbed access to product creation (including client-side image-to-base64 handling), table-based management with featured toggles and delete actions, and the analytics visualization fed by the backend route.

End-to-end flow
A visitor signs up or logs in; the backend drops signed access/refresh cookies, and the frontend updates its Zustand state. Token refresh is automatic via the interceptor.

Browsing products hits public featured/category endpoints; admin APIs require protectRoute + adminRoute. Cart actions call the authenticated cart/coupon routes and recalc totals locally.

Checkout assembles Stripe line items, honors coupons, and redirects to hosted payment. Success triggers backend order creation and coupon deactivation; the UI shows a celebratory confirmation screen.

Admins can seed the catalog and inspect business metrics powered by Mongo aggregations, surfaced as summary cards and charts.

Pointers for what to learn next
Environment setup: Create an .env with the Mongo URI, Cloudinary credentials, Upstash Redis URL/token, Stripe keys, and a CLIENT_URL matching your frontend origin; every integration module depends on them.

Running locally: Start the backend with npm run dev at the repo root and the frontend with npm install && npm run dev inside frontend (or rely on the root build script when deploying).

Extend auth flows: Explore useUserStore’s interceptor logic if you need role-based routing, token revocation, or multi-factor prompts.

Enhance analytics or marketing: Build on the analytics aggregation to support custom time ranges, or leverage the coupon and recommendation endpoints to craft campaigns.

Stabilize the admin tooling: Add validation, file-size checks, or drag-and-drop uploads around CreateProductForm, and consider surfacing success/error feedback from the product store beyond toast notifications.

With these pieces in mind, you should have a solid map of how data flows from the database and third-party services up through the REST API into the client-side stores and React components.
