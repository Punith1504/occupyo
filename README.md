<div align="center">
  <img src="public/favicon.ico" alt="Occupyo Logo" width="80" height="80">
  <h3 align="center">Occupyo</h3>
  <p align="center">
    A Global B2B Flex Occupancy Marketplace built with Next.js, FastAPI, and Capacitor.
    <br />
    <a href="https://occupyo.com"><strong>View Live Demo »</strong></a>
    <br />
    <br />
  </p>
</div>

---

## 🚀 Overview

**Occupyo** is a hyper-premium, globally scalable B2B marketplace designed to connect commercial real estate owners with tenants looking for flexible warehouse, office, and industrial spaces. 

Engineered with a focus on modern **Liquid Glass UI**, enterprise-grade scalability, and cross-platform native delivery, Occupyo serves as a comprehensive case study in modern full-stack development, machine learning integration, and CI/CD automation.

## ✨ Key Features & Technical Achievements

- **Omnichannel Delivery (Web, iOS, Android)**
  - Built natively for the web as a PWA and wrapped into fully functional **iOS and Android** applications using **Capacitor**.
  - Maintains a single unified codebase (`Next.js`) for all platforms with instant OTA (Over-The-Air) deployment capability via native web views.

- **AI/ML Recommendation Engine (FastAPI)**
  - Engineered a standalone microservice using **Python, FastAPI, and Scikit-Learn**.
  - Collects silent user telemetry (clicks, dwell time, searches) into a PostgreSQL database and utilizes **TF-IDF Vectorization & Cosine Similarity** to power a content-based collaborative filtering recommendation engine.

- **Global Payment Infrastructure**
  - Integrated **Stripe Connect** for multi-currency, cross-border international transactions.

- **Geospatial & Predictive Global Search**
  - Engineered a custom, debounced predictive autocomplete service interacting directly with the **Google Maps Places API**.
  - Features real-time substring highlighting, cognitive load balancing, and dynamic location-based distance sorting (Haversine formula) to calculate proximity between users and properties.

- **Liquid Glassmorphism UX & Haptic Micro-interactions**
  - Bypassed standard utility frameworks to deliver a custom **iOS-native "Liquid Glass"** aesthetic with hardware-accelerated CSS physics.
  - Interfaced with the `navigator.vibrate` Web API to inject real physical **haptic feedback** on interactive elements, delivering a tactile, native-app feel on mobile devices.
  - Features real-time blur, neon accents, floating AI chatbots, and elastic, squishy component animations (`active:scale-95`).

- **Automated CI/CD Pipeline**
  - Configured robust **GitHub Actions** pipelines for automated linting, Prisma type generation, and staging/production deployments directly to **Vercel**.

## 🛠️ Technology Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend Core** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| **Backend API** | Next.js Route Handlers, Python (FastAPI, Pandas, Scikit-Learn) |
| **Database & ORM** | PostgreSQL (Neon), Prisma ORM |
| **Authentication** | Clerk Auth (B2B OAuth & JWT) |
| **Payments** | Stripe Connect |
| **Mobile Native** | Ionic Capacitor (iOS/Android) |
| **DevOps & CI/CD** | GitHub Actions, Vercel |

## 📐 Architecture Breakdown

### 1. Database Schema (Prisma)
- Utilizes relational modeling for `Users` (Owners vs. Tenants), `Properties`, `Leases`, and `SpaceRequests`.
- Implements a specialized `UserEvent` table to act as the primary data lake for the ML telemetry pipeline.

### 2. Machine Learning Pipeline
- A Next.js tracking component silently POSTs telemetry to a Node.js route handler.
- The Python FastAPI backend ingests this telemetry, vectorizes property attributes, and returns an array of personalized `propertyIds` mapped to the user profile.

### 3. Payment State Machine
- Transactions trigger a `PENDING` state in the database.
- Asynchronous webhook endpoints (for Stripe) listen for cryptographically verified success payloads to update the lease state to `ACTIVE`, ensuring zero data loss during network interruptions.

## 💻 Local Development Setup

To run Occupyo locally on your machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Punith1504/occupyo.git
   cd occupyo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and populate the required keys:
   ```env
   # Database
   DATABASE_URL="your_postgresql_connection_string"
   
   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
   CLERK_SECRET_KEY="..."
   
   # Payments
   STRIPE_SECRET_KEY="..."
   STRIPE_WEBHOOK_SECRET="..."
   # Maps
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."
   ```

4. **Initialize Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```

## 📱 Compiling Mobile Apps
To compile the native shells, you must have Android Studio (for Android) or Xcode (for iOS) installed.

```bash
# For Android
npx cap open android

# For iOS (Requires macOS)
npx cap open ios
```

---
<div align="center">
  <i>Developed and engineered by <a href="https://github.com/Punith1504">Punith</a></i>
</div>
