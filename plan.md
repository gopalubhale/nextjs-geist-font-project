# Detailed Plan for Razorpay Payment Integration and Admin Payment Settings

---

## Overview

We will integrate Razorpay payment gateway into the existing advertising panel app backend and frontend. The super admin will have a dedicated UI to configure Razorpay API keys and payment settings. Customers will be able to make online payments for packages using Razorpay. The system will handle payment verification, update package subscriptions, and notify customers accordingly.

---

## Backend Changes

### 1. Add Razorpay Configuration Storage

- **Database**: Add a table `payment_settings` with fields:
  - `id` (primary key)
  - `razorpay_key_id` (string)
  - `razorpay_key_secret` (string)
  - `updated_at` (timestamp)

- **API Endpoints**:
  - `GET /api/admin/payment-settings`: Return current Razorpay keys (only for super admin).
  - `POST /api/admin/payment-settings`: Update Razorpay keys and settings (only for super admin).

- **Security**:
  - Protect these endpoints with super admin authentication.
  - Store Razorpay secret securely, never expose it to frontend.

### 2. Payment Order Creation API

- `POST /api/payment/create-order`:
  - Input: package ID, user token.
  - Backend creates Razorpay order using stored keys and package amount.
  - Returns order details (order ID, amount, currency) to frontend.

### 3. Payment Verification API

- `POST /api/payment/verify`:
  - Input: payment details from frontend (payment ID, order ID, signature).
  - Verify signature using Razorpay secret.
  - On success, update user package subscription status.
  - On failure, return error.

### 4. Offline Payment API

- Extend existing offline payment API to allow super admin to mark payments as received.

### 5. Notifications

- Send alerts to customers on payment success, package expiry, and renewal reminders.

---

## Frontend Changes

### 1. Super Admin Payment Settings Page

- New page under `/src/app/admin/payment-settings.tsx`.
- Form to input and update Razorpay Key ID and Key Secret.
- Validate inputs and show success/error messages.
- Use secure API calls to backend.

### 2. Customer Payment UI

- On package purchase page (e.g., `/src/app/dashboard/packages.tsx` or dedicated purchase page):
  - Add "Pay Online" button.
  - On click, call backend to create Razorpay order.
  - Use Razorpay Checkout JS SDK to open payment modal.
  - On payment success, call backend to verify payment.
  - Show payment status and update UI accordingly.

### 3. Payment Status Alerts

- Show toast notifications or dashboard alerts for payment success, expiry, and renewal.

---

## Integration Details

- Use official Razorpay Node.js SDK on backend.
- Use Razorpay Checkout JS SDK on frontend.
- Ensure all API calls are authenticated and secure.
- Handle errors gracefully with user-friendly messages.
- Store payment settings securely and allow super admin to update anytime.
- Use environment variables for fallback or initial Razorpay keys if needed.

---

## File Changes Summary

| File/Folder                      | Changes/Features                                                                                  |
|---------------------------------|-------------------------------------------------------------------------------------------------|
| `server/`                       | Add `payment_settings` table migration, implement payment APIs, Razorpay integration             |
| `server/index.js`               | Add new routes for payment settings, order creation, payment verification                        |
| `src/app/admin/payment-settings.tsx` | New admin page for managing Razorpay keys and payment settings                                  |
| `src/app/dashboard/packages.tsx`| Add online payment button and payment flow integration                                           |
| `src/lib/payment.ts`            | Add Razorpay API integration utilities                                                          |
| `src/hooks/usePayment.ts`       | Hook for payment process and status handling                                                    |

---

## UI/UX Considerations

- Admin payment settings page: clean form with labeled inputs, save button, and feedback messages.
- Customer payment flow: seamless modal popup for Razorpay checkout, clear success/failure feedback.
- Alerts: non-intrusive toast notifications for payment events.
- Maintain consistent branding and styling with the rest of the app.

---

## Error Handling & Best Practices

- Validate all inputs on frontend and backend.
- Securely store and handle Razorpay secret key.
- Verify payment signatures strictly.
- Handle network errors and payment failures gracefully.
- Log payment events for audit and debugging.
- Use HTTPS for all API calls involving payments.

---

## Next Steps

- Implement database migration for `payment_settings`.
- Implement backend APIs for payment settings and Razorpay order/payment handling.
- Create frontend admin payment settings page.
- Integrate Razorpay checkout in customer package purchase flow.
- Test payment flows end-to-end including success, failure, and edge cases.

---

Please confirm this detailed plan or provide any additional requirements before I proceed with implementation.
