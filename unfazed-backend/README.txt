UNFAZED ANALYTICS REAL-DATA REPLACEMENT
=======================================

This ZIP contains only the files changed for connecting the Analytics page
 to the real MongoDB Session/Payment data and displaying monthly revenue as a
bar chart.

BACKEND
-------
Copy the contents of:
  unfazed-backend/
into your existing:
  unfazed-backend/

Files included:
  src/app.js
  src/controllers/analyticsController.js
  src/routes/analyticsRoutes.js

The updated app.js mounts:
  /api/analytics

and keeps the Razorpay webhook BEFORE express.json().

FRONTEND
--------
Copy the contents of:
  Unfazed-frontend/
into your existing:
  Unfazed-frontend/

Files included:
  src/api/analytics.js
  src/pages/therapist/Analytics.jsx

No package installation is required because Recharts is already present in
the supplied frontend package.json.

AFTER COPYING
-------------
1. Restart the backend:
   npm run dev

2. Restart the frontend:
   npm run dev

3. Log in as a therapist and open:
   /dashboard/analytics

The endpoint used by the page is:
   GET /api/analytics/summary?months=6

Revenue is read from Payment documents where:
   therapist = logged-in therapist
   status = 'paid'

The bar chart includes every requested month, including months with zero
revenue.

IMPORTANT
---------
The ZIP intentionally does NOT replace your BookingWidget, schedulingController,
Session.js, paymentController, or other Module 1-4 files. This prevents the
analytics update from overwriting your Razorpay booking work.

If the page still shows an error after replacement, check the backend terminal
for the exact error from GET /api/analytics/summary.
