# Unfazed – Therapist Portal

A full-stack therapist management and client engagement platform designed to simplify therapy practice management, online bookings, payments, clinical documentation, client communication, and notifications.

## 🚀 Live Application

### Frontend
https://therapist-portal-kappa.vercel.app/login

### Backend API
https://unfazed-6dt7.onrender.com

---

## 📌 Overview

**Unfazed** is a web-based Therapist Portal that provides separate experiences for therapists and clients.

The platform allows therapists to manage their practice from a centralized dashboard while clients can book sessions, complete intake forms, make payments, communicate with their therapist, view shared notes, and manage their sessions.

The system follows a full-stack architecture with a React frontend, Node.js/Express backend, MongoDB database, Socket.IO for real-time communication, and Razorpay for online payments.

---

## ✨ Features

### 👨‍⚕️ Therapist Portal

- Therapist registration and login
- JWT-based authentication
- Therapist profile management
- Branded therapist profile links
- Therapist dashboard
- Client CRM
- Client search and management
- Session scheduling
- Recurring availability
- Booking duration configuration
- Buffer time configuration
- Minimum booking notice
- Booking window configuration
- Session management
- Clinical notes
- Private and shared notes
- Analytics dashboard
- Payment management
- Invoice generation
- Subscription and entitlement management
- Active-client limits
- Real-time chat with clients
- Notifications
- Session and payment updates

---

### 👤 Client Portal

- Client registration and login
- Secure client authentication
- Client dashboard
- Therapist profile viewing
- Online session booking
- Session management
- Intake form
- Digital consent
- Payment through Razorpay
- Payment history
- Invoice access
- Package management
- Shared clinical notes
- Real-time therapist/client chat
- Typing indicators
- Read receipts
- Notifications
- Client profile management

---

## 💳 Online Payments

The application integrates **Razorpay** for online payments.

The payment workflow includes:

1. Client selects a session.
2. A pending session is created.
3. A Razorpay order is generated.
4. Razorpay Checkout is opened.
5. Client completes the payment.
6. Payment is verified on the backend.
7. Razorpay webhook confirms the payment.
8. The session is marked as confirmed.
9. Payment information is stored.
10. Invoice information is generated.

The application uses Razorpay Test Mode during development/testing.

---

## 💬 Real-Time Chat

Unfazed includes a real-time therapist/client communication system powered by **Socket.IO**.

### Chat features

- Therapist-to-client messaging
- Client-to-therapist messaging
- Real-time message delivery
- Conversation rooms
- Typing indicators
- Read receipts
- Message persistence
- JWT-authenticated Socket.IO connections
- In-app notifications for new messages

---

## 🔔 Notifications

The notification system supports event-driven notifications for important application events.

Examples include:

- Booking confirmation
- New chat messages
- Session reminders
- Post-session follow-up
- Payment-related events
- Notification read/unread status

The backend also includes scheduled session reminder processing.

---

## 📝 Clinical Documentation

Therapists can maintain clinical documentation for their clients.

The system supports:

- Private therapist notes
- Shared client notes
- Note creation
- Note editing
- Note deletion
- Client access to shared notes only

Private therapist notes are protected from client-facing API responses.

---

## 📅 Scheduling & Booking

Therapists can configure their availability and clients can book available sessions.

Scheduling functionality includes:

- Weekly availability
- Available time slots
- Session duration
- Buffer time
- Minimum notice period
- Booking window
- Timezone-aware scheduling
- Pending bookings
- Confirmed bookings
- Cancelled sessions
- Completed sessions
- No-show sessions
- Double-booking protection

---

## 🧾 Client Intake & Consent

The client portal includes an intake and consent workflow.

Clients can:

- Complete intake information
- Provide consent
- Update their profile information
- Access their session-related information

---

## 📊 Analytics

The therapist dashboard includes analytics based on application data stored in MongoDB.

Analytics can include information related to:

- Sessions
- Clients
- Payments
- Revenue
- Session status
- Client activity

Analytics are generated from backend data rather than static frontend demo values.

---

## 🔐 Authentication & Security

The application uses JWT-based authentication for protected resources.

Security features include:

- Password-based authentication
- Password hashing
- JWT authentication
- Therapist authentication middleware
- Client authentication middleware
- Role-based access
- Protected API routes
- Authenticated Socket.IO connections
- Razorpay server-side payment verification
- Razorpay webhook signature verification
- Private clinical notes protection

Sensitive credentials such as Razorpay secrets and JWT secrets are stored using environment variables.

---

## 🏗️ Technology Stack

### Frontend

- React.js
- React Router
- Axios
- Socket.IO Client
- Vite
- JavaScript
- HTML
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Socket.IO
- Nodemailer
- node-cron

### Payment Gateway

- Razorpay

### Deployment

- Vercel – Frontend
- Render – Backend
- MongoDB – Database

---

## 🏛️ System Architecture

```text
                         ┌──────────────────────┐
                         │      Client/User      │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Vercel Frontend    │
                         │      React + Vite     │
                         └──────────┬───────────┘
                                    │
                         REST API / Socket.IO
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Render Backend     │
                         │   Node + Express     │
                         │      + Socket.IO     │
                         └───────┬───────┬──────┘
                                 │       │
                    ┌────────────┘       └─────────────┐
                    ▼                                  ▼
          ┌──────────────────┐              ┌──────────────────┐
          │     MongoDB      │              │     Razorpay     │
          │     Database     │              │  Payment Gateway │
          └──────────────────┘              └──────────────────┘
```
## ⚙️ Local Installation

### 1. Clone the repository

~~~bash
git clone https://github.com/shubham99-coder/Therapist_Portal.git
cd Therapist_Portal
~~~

### 2. Install frontend dependencies

~~~bash
cd Unfazed-frontend
npm install
~~~

### 3. Install backend dependencies

Open another terminal:

~~~bash
cd unfazed-backend
npm install
~~~

### 4. Configure environment variables

Create the required `.env` files using the environment variable examples provided above.

### 5. Start the backend

~~~bash
cd unfazed-backend
npm start
~~~

The backend runs locally on:

~~~text
http://localhost:5000
~~~

### 6. Start the frontend

In another terminal:

~~~bash
cd Unfazed-frontend
npm run dev
~~~

The frontend will normally be available at:

~~~text
http://localhost:5173
~~~

---

## 🧪 Testing

The application can be tested using:

- Therapist account
- Client account
- Public therapist profile
- Session booking
- Razorpay Test Mode
- Therapist/client chat
- Notifications
- Intake forms
- Shared notes
- Payment history
- Invoice generation

### Razorpay Test Mode

Use Razorpay's official test credentials/cards when testing payments.

Do not use real payment credentials in development.

---

## 🌐 Deployment

### Frontend

The React/Vite frontend is deployed using Vercel.

**Live Frontend:**

https://therapist-portal-kappa.vercel.app/login

### Backend

The Node.js/Express backend is deployed using Render.

**Live Backend:**

https://unfazed-6dt7.onrender.com

### WebSocket

Socket.IO uses the deployed Render backend:

https://unfazed-6dt7.onrender.com

### Razorpay Webhook

The production Razorpay webhook points to:

https://unfazed-6dt7.onrender.com/api/webhooks/razorpay

---

## 🔄 Application Flow

### Client Booking Flow

~~~text
Client
  ↓
Therapist Public Profile
  ↓
Select Service
  ↓
Select Date & Time
  ↓
Create Pending Session
  ↓
Razorpay Checkout
  ↓
Payment
  ↓
Payment Verification
  ↓
Razorpay Webhook
  ↓
Session Confirmed
  ↓
Notification
~~~

### Chat Flow

~~~text
Therapist / Client
        ↓
Socket.IO Connection
        ↓
JWT Authentication
        ↓
Conversation Room
        ↓
Send Message
        ↓
Backend
        ↓
MongoDB
        ↓
Real-Time Broadcast
        ↓
Recipient
        ↓
Notification
~~~

---

## 📌 API Modules

The backend contains API modules for:

~~~text
Authentication
Therapists
Clients
Scheduling
Sessions
Packages
Payments
Client Portal
Client Authentication
Client Chat
Chat
Notifications
Clinical Notes
Analytics
Subscriptions
Entitlements
~~~

---

## 📈 Subscription & Entitlement System

The application includes a centralized entitlement architecture for subscription-based features.

It provides:

- Subscription tier configuration
- Feature access control
- Active-client limits
- Centralized entitlement checks
- Upgrade prompts
- Subscription-aware therapist functionality

---

## 🔒 Privacy

Unfazed separates therapist and client access.

Therapists can access therapist-specific information, while clients can only access information intended for them.

In particular:

~~~text
Private Therapist Notes
        ↓
Therapist Only

Shared Notes
        ↓
Therapist + Authorized Client
~~~

---

## 🛠️ Future Improvements

Possible future improvements include:

- WhatsApp API integration
- Advanced email notification system
- Advanced SOAP/DAP clinical templates
- Dynamic intake form builder
- Waitlist functionality
- Cloud/S3 document storage
- Advanced subscription billing
- More detailed analytics
- Mobile application
- Video consultation integration
- Calendar integrations
- Automated appointment reminders

---

## 👨‍💻 Developer

**Shubham Kumar Singh**

B.Tech – Computer Science & Engineering  
GGSIPU

---

## 📄 Project Status

~~~text
Project: Unfazed – Therapist Portal
Status: Completed
Frontend: React + Vite
Backend: Node.js + Express
Database: MongoDB
Real-Time Communication: Socket.IO
Payments: Razorpay
Frontend Deployment: Vercel
Backend Deployment: Render
~~~

---

## ⭐ Acknowledgement

This project was developed as a full-stack therapist management and client engagement platform, integrating authentication, scheduling, client management, clinical documentation, payments, real-time communication, notifications, analytics, and subscription-based access control into a single application.
