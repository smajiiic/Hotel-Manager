# Hotel Task Management Web Application

## Overview

The Hotel Task Management Web Application is a web-based system designed to help small hotels manage daily operations more efficiently. The application improves communication between hotel staff working different shifts and centralizes important operational information such as tasks, room status, guest requests, and bookings.

This project is being developed as part of a Software Engineering course team project.

---

## Features

### User Authentication

* Staff login/logout system
* Secure account access

### Task Management

* Create and manage hotel tasks
* Mark tasks as completed
* Associate tasks with rooms

### Special Requests

* Add and view guest requests or staff notes
* Improve communication between shifts

### Room Overview

* View all hotel rooms and their status
* Status examples:

  * Occupied
  * Available
  * Needs Cleaning

### Booking Management

* View upcoming reservations
* Track room occupancy

---

## Technologies Used

### Frontend

* React.js / HTML / CSS / JavaScript

### Backend

* Node.js + Express

### Database

* PostgreSQL / MySQL / SQLite

### Tools

* Git & GitHub
* Visual Studio Code
* Postman

---

## System Architecture

The application follows a layered architecture:

* **Frontend Layer** – User interface
* **Backend Layer** – Business logic and API handling
* **Database Layer** – Data storage

The project also applies software engineering principles such as:

* Modularity
* Abstraction
* High cohesion
* Low coupling

---

## Project Structure

```bash
project-root/
│
├── frontend/        # Frontend application
├── backend/         # Backend server and APIs
├── database/        # Database scripts/models
├── docs/            # Documentation
├── README.md
└── .gitignore
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd hotel-task-management
```

### Install Dependencies

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
npm install
```

---

## Running the Project

### Start Backend

```bash
npm start
```

### Start Frontend

```bash
npm run dev
```

The application should then be available at:

```bash
http://localhost:3000
```

---

## Future Improvements

* Real-time notifications
* Mobile responsiveness improvements
* Role-based permissions
* Analytics dashboard
* WebSocket support for live updates

---

## License

This project is developed for educational purposes as part of a university Software Engineering course.

---
