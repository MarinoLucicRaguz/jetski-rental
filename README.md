# Jetski Rental Management System

The Jetski Rental Management System is a web application developed for internal use by a jet ski rental business. It is designed to streamline the process of tracking and managing reservations, ensuring efficient and organized operations.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Installation](#installation)

---

## Introduction

This application is built exclusively for internal business operations to manage reservations for jet ski rentals. It allows the business to track customer bookings, view schedules, and maintain reservation records. **Note**: This software is proprietary and is provided for viewing purposes only. Commercial use is strictly prohibited without explicit approval from the owner.

---

## Features

- **Reservation Management**:
  - Track and organize jet ski rental bookings.
  - View detailed schedules and reservation records.

- **Role-Based Access Control**:
  - **Admin Features**:
    - Add, edit, and delete **locations**, **reservations**, **reservation options**, **jetskis**, and **users**.
    - Assign roles to users (e.g., Admin, Manager, Staff).
  - **Manager Features**:
    - Manage jetski availability.
    - View and modify reservations.
  - **Staff Features**:
    - View bookings and schedules.
    - Create and update reservations.

- **Authentication**:
  - Secure login for all users.
  - Role-based permissions to ensure appropriate access.

- **PostgreSQL Database**:
  - Robust and scalable database for storing reservation and user data.

- **User-Friendly Interface**:
  - Intuitive design for seamless operation by staff and administrators.

---

## Technologies Used

- **TypeScript**: Provides type safety and enhances code maintainability.
- **Next.js**: Framework for building React-based applications with server-side rendering.
- **Prisma**: ORM for interacting with the PostgreSQL database.
- **PostgreSQL**: High-performance database for storing application data.
- **TailwindCSS**: Modern CSS framework for responsive and clean UI design.
- **NextAuth**: Handles authentication and session management.

---

## Installation

### Prerequisites

- **Node.js** (version 14 or later)
- **npm**
- **PostgreSQL** (Ensure PostgreSQL is installed and running)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/MarinoLucicRaguz/jetski-rental.git

Copyright © 2025, Marino Lučić-Raguž. All rights reserved.

This software is the property of Marino Lučić-Raguž. Permission to view the source code is granted, but use, modification, or distribution of the software for any purpose, commercial or otherwise, without express permission is prohibited.
