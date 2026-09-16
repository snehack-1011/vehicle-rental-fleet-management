# Vehicle Rental & Fleet Management System 🚗

A full-stack, comprehensive web application built for college project submissions that mimics the functionality of Ola/Uber rentals. It handles customer vehicle bookings, fleet manager operations, and an administrator revenue dashboard.

## Tech Stack
- **Frontend**: React.js, React Router DOM, CSS3 (Responsive UI with Glassmorphism)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (In-Memory `mongodb-memory-server` for instant local testing!)
- **Notifications**: Nodemailer (Ethereal Email for safe local testing)
- **Security**: JWT Authentication, bcrypt password hashing

## Features Overview

### 1. Customer Portal
- Browse and filter vehicles by city, type, and price limits.
- Sophisticated Double-Booking prevention system!
- Dynamic Pricing Engine that accurately calculates duration multiplied by base price.
- Live GPS Map simulation for tracking vehicle coordinates.
- Leave ratings and feedback on completed rentals!

### 2. Fleet Manager Dashboard
- Lock vehicles into `MAINTENANCE` or mark them `AVAILABLE` or `DAMAGED`.
- Monitor live revenue metrics pulled straight from the active database!
- Read live customer feedback and ratings in a chronological feed.

### 3. Automated Subsystems
- **Auto-Seeding**: Upon backend startup, the database auto-populates 20 diverse vehicles and 3 default test users so you never have to manually type data.
- **Mock Email System**: Generates a secure Ethereal link in the backend terminal when a booking is confirmed, allowing you to preview the HTML email the customer would receive.

## How to Run Locally

### Step 1: Start the Backend
1. Open a terminal and navigate to the `server/` directory.
2. Run `npm install` to install dependencies (express, mongoose, nodemailer, etc).
3. Run `node server.js` to start the backend.
   - The server will run on `http://localhost:5000`.
   - It will automatically connect to a memory database and seed the data!

### Step 2: Start the Frontend
1. Open a *second* terminal and navigate to the `client/` directory.
2. Run `npm install` to install React dependencies.
3. Run `npm start` to spin up the UI.
   - The React app will run on `http://localhost:3000`.

## Test Accounts
Use these pre-seeded accounts to explore the different dashboards:
- **Customer**: `customer@test.com` (Password: `password123`)
- **Fleet Manager**: `fleet@test.com` (Password: `password123`)
- **Admin**: `admin@test.com` (Password: `password123`)

---
*Developed for the Software Requirements Specification (SRS) Final Submission.*
