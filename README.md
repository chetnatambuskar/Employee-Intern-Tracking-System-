# 🏢 EITMS — Employee & Intern Tracking Management System

<div align="center">

![EITMS Banner](https://img.shields.io/badge/EITMS-Employee%20%26%20Intern%20Tracking-2563eb?style=for-the-badge&logo=building&logoColor=white)

[![Laravel](https://img.shields.io/badge/Laravel-12.15.0-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8.4.7-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1.11-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**A full-stack web application to manage employees, interns, attendance, tasks, placements, and reports — all in one place.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Screenshots](#-screenshots) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
  - [Backend Setup](#backend-setup-laravel)
  - [Frontend Setup](#frontend-setup-react)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Default Login Credentials](#-default-login-credentials)
- [API Documentation](#-api-documentation)
- [Role-Based Access](#-role-based-access)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About the Project

**EITMS (Employee & Intern Tracking Management System)** is a comprehensive HR management platform built for companies to efficiently manage their workforce. It provides separate portals for Admins, Managers, Employees, and Interns — each with role-specific features and access controls.

### Why EITMS?

- ✅ Centralized management of employees and interns
- ✅ Real-time attendance tracking with check-in/check-out
- ✅ Task assignment and progress monitoring
- ✅ Internship placement tracking and analytics
- ✅ Resume upload and profile management
- ✅ Live dashboard with charts and reports
- ✅ Notification system for tasks and placements
- ✅ Role-based access control (Admin / Manager / Employee / Intern)

---

## ✨ Features

### 👥 Employee Management
- Add, edit, delete employees
- Department-wise organization
- Employment type tracking (Full-time, Part-time, Contract)
- Status management (Active, Inactive, On Leave, Terminated)
- View employee profiles with education, skills, projects

### 🎓 Intern Management
- Complete intern lifecycle management
- College, course, and specialization tracking
- Internship duration with formatted dates
- Performance scoring and mentor notes
- Skill tracking and placement status

### 📅 Attendance System
- Daily attendance marking (Present, Absent, Half Day, Leave, Holiday)
- Check-in and check-out time recording
- Automatic working hours calculation
- Monthly attendance reports
- Bulk attendance marking

### 📋 Task Management
- Create and assign tasks to employees/interns
- Priority levels (Low, Medium, High, Urgent)
- Categories (Development, Design, QA, Management)
- Progress tracking (0–100%)
- Status workflow (Pending → In Progress → Review → Completed)
- Overdue task detection

### 🏆 Placement Tracking
- Record job offers for interns
- Track placement status (Offered, Accepted, Rejected, Joined)
- Package (LPA) tracking
- Placement type (Full Time, Part Time, Contract, PPO)
- Statistics and analytics

### 📊 Dashboard & Reports
- Real-time statistics cards
- Monthly attendance trend chart
- Task completion donut chart
- Top performing interns leaderboard
- Attendance summary reports
- Placement package bar charts
- Performance radar chart
- Live data refresh every 30 seconds

### 👤 User Profiles
- Personal profile page for each user
- Photo upload
- Education history (multiple entries)
- Work experience tracking
- Skills and language tags
- Projects portfolio with GitHub links
- Achievements and certifications
- Admin can view any user's complete profile

### 📄 Resume Management
- Upload PDF, DOC, DOCX files
- Set primary resume
- Download resumes
- Admin can view employee resumes

### 🔔 Notification System
- Real-time bell notifications
- Task assignment notifications
- Placement offer notifications
- Mark as read / Mark all as read
- Auto-refresh every 15 seconds

### 🏢 Department Management
- Create and manage departments
- Department codes
- Employee and intern count per department

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| PHP | 8.2+ | Server-side language |
| Laravel | 12.x | Backend framework |
| Laravel Sanctum | 4.x | API authentication |
| MySQL | 8.x | Database |
| Carbon | 3.x | Date/time handling |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool |
| React Router | 6.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Tailwind CSS | 3.x | Styling |




---

## 📁 Project Structure

```
EITMS/
├── Interns_backend/          # Laravel Backend
│   └── Intern/
│       ├── app/
│       │   ├── Http/
│       │   │   ├── Controllers/
│       │   │   │   ├── AuthController.php
│       │   │   │   ├── DashboardController.php
│       │   │   │   ├── DepartmentController.php
│       │   │   │   ├── EmployeeController.php
│       │   │   │   ├── InternController.php
│       │   │   │   ├── AttendanceController.php
│       │   │   │   ├── TaskController.php
│       │   │   │   ├── PlacementController.php
│       │   │   │   ├── ResumeController.php
│       │   │   │   ├── NotificationController.php
│       │   │   │   └── ProfileController.php
│       │   │   └── Middleware/
│       │   │       └── RoleMiddleware.php
│       │   └── Models/
│       │       ├── User.php
│       │       ├── Employee.php
│       │       ├── Intern.php
│       │       ├── Department.php
│       │       ├── Attendance.php
│       │       ├── Task.php
│       │       ├── Placement.php
│       │       ├── Resume.php
│       │       └── Notification.php
│       ├── database/
│       │   ├── migrations/
│       │   └── seeders/
│       └── routes/
│           └── api.php
│
└── Interns_frontend/         # React Frontend
    └── interns_app/
        └── src/
            ├── api/
            │   └── axios.js
            ├── context/
            │   └── AuthContext.jsx
            ├── components/
            │   ├── Layout/
            │   │   ├── Sidebar.jsx
            │   │   ├── Header.jsx
            │   │   └── Layout.jsx
            │   └── ui/
            │       ├── Badge.jsx
            │       ├── Modal.jsx
            │       └── Spinner.jsx
            └── pages/
                ├── Login.jsx
                ├── Dashboard.jsx
                ├── Employees/
                ├── Interns/
                ├── Attendance/
                ├── Tasks/
                ├── Placements/
                ├── Departments/
                ├── Resumes/
                ├── Reports/
                └── Profile/
```

---

## 📦 Prerequisites

Make sure you have the following installed:

- **PHP** >= 8.3.28
- **Composer** >= 2.9.7
- **Node.js** >= 24.16
- **npm** >= 11.15.0
- **MySQL** >= 8.4.7
- **WAMP / XAMPP / Laragon** (for local development)

---

## 🚀 Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/eitms.git
cd eitms
```

---

### Backend Setup (Laravel)

**Step 1 — Navigate to backend folder**
```bash
cd Interns_backend/Intern
```

**Step 2 — Install PHP dependencies**
```bash
composer install
```

**Step 3 — Copy environment file**
```bash
cp .env.example .env
```

**Step 4 — Generate application key**
```bash
php artisan key:generate
```

**Step 5 — Configure database in `.env`**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=eitms_db
DB_USERNAME=root
DB_PASSWORD=your_password
```

**Step 6 — Create the database**
```sql
CREATE DATABASE eitms_db;
```

**Step 7 — Run migrations**
```bash
php artisan migrate
```

**Step 8 — Seed the database**
```bash
php artisan db:seed
```

**Step 9 — Create storage link**
```bash
php artisan storage:link
```

**Step 10 — Start the backend server**
```bash
php artisan serve
```

Backend runs at: `http://localhost:8000`

---

### Frontend Setup (React)

**Step 1 — Navigate to frontend folder**
```bash
cd Interns_frontend/interns_app
```

**Step 2 — Install dependencies**
```bash
npm install
```

**Step 3 — Start the development server**
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend `.env`

```env
APP_NAME=EITMS
APP_ENV=local
APP_KEY=base64:your-generated-key
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=eitms_db
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost

FILESYSTEM_DISK=public
```

---

## 🗄 Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `users` | All system users (admin, manager, employee, intern) |
| `departments` | Company departments |
| `employees` | Employee-specific data linked to users |
| `interns` | Intern-specific data linked to users |
| `attendances` | Daily attendance records |
| `tasks` | Task assignments |
| `placements` | Intern placement/job offers |
| `resumes` | Uploaded resume files |
| `notifications` | System notifications |
| `user_profiles` | Extended profile data (bio, education, skills, etc.) |
| `personal_access_tokens` | Sanctum API tokens |


## 🔑 Default Login Credentials

After running `php artisan db:seed`:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@eitms.com | password |
| **Manager** | manager@eitms.com | password |
| **Employee** | employee@eitms.com | password |
| **Intern** | intern@eitms.com | password |

> ⚠️ **Change passwords immediately in production!**

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication

All protected routes require Bearer token:
```
Authorization: Bearer {your-token}
```

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Login and get token |
| POST | `/logout` | Logout (revoke token) |
| GET | `/me` | Get current user info |
| POST | `/change-password` | Change password |
| POST | `/profile` | Update profile |

### Employee Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employees` | List all employees |
| POST | `/employees` | Create employee |
| GET | `/employees/{id}` | Get employee |
| PUT | `/employees/{id}` | Update employee |
| DELETE | `/employees/{id}` | Delete employee |

### Intern Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/interns` | List all interns |
| POST | `/interns` | Create intern |
| GET | `/interns/{id}` | Get intern |
| PUT | `/interns/{id}` | Update intern |
| DELETE | `/interns/{id}` | Delete intern |
| PUT | `/interns/{id}/performance` | Update performance score |

### Attendance Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/attendance` | List attendance records |
| POST | `/attendance/mark` | Mark attendance |
| POST | `/attendance/bulk` | Bulk mark attendance |
| GET | `/attendance/my` | My attendance (current user) |
| GET | `/attendance/report` | Monthly report |

### Task Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List tasks |
| POST | `/tasks` | Create task |
| GET | `/tasks/{id}` | Get task |
| PUT | `/tasks/{id}` | Update task |
| PUT | `/tasks/{id}/status` | Update task status |
| DELETE | `/tasks/{id}` | Delete task |

### Placement Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/placements` | List placements |
| POST | `/placements` | Create placement |
| PUT | `/placements/{id}` | Update placement |
| DELETE | `/placements/{id}` | Delete placement |
| GET | `/placements/stats` | Placement statistics |

### Department Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/departments` | List departments |
| POST | `/departments` | Create department |
| GET | `/departments/{id}` | Get department |
| PUT | `/departments/{id}` | Update department |
| DELETE | `/departments/{id}` | Delete department |

### Resume Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/resumes` | List resumes |
| POST | `/resumes/upload` | Upload resume |
| DELETE | `/resumes/{id}` | Delete resume |
| PUT | `/resumes/{id}/primary` | Set primary resume |

### Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications |
| PUT | `/notifications/{id}/read` | Mark as read |
| POST | `/notifications/read-all` | Mark all as read |
| DELETE | `/notifications/{id}` | Delete notification |

### Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get my profile |
| POST | `/profile/update` | Save profile data |
| POST | `/profile/avatar` | Upload profile photo |
| GET | `/admin/user-profile/{id}` | Admin view any user profile |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | All dashboard statistics |

---

## 🖥 Screenshots

### Login Page
- Clean dark gradient design
- Email and password with show/hide
- Error message display

### Dashboard
- Statistics cards (Employees, Interns, Placements, Tasks)
- Monthly attendance trend chart
- Task overview donut chart
- Recent tasks list
- Top performing interns

### Employee Management
- Searchable and filterable table
- Eye icon to view full profile
- Edit and delete actions
- Status badges

### Attendance
- Mark attendance form with time picker
- Check-in / Check-out recording
- Monthly records table
- Working hours auto-calculation

### Reports
- Live data auto-refresh every 30 seconds
- Attendance trend area chart
- Placement packages bar chart
- Task completion line chart
- Intern status distribution donut
- Performance radar chart
- Monthly summary table with color-coded rates

### User Profile
- Profile photo upload
- 7 sections: Basic, Education, Experience, Skills, Projects, Achievements, Resume
- All fields completely optional
- Save button on each section

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open** a Pull Request

### Coding Standards
- Follow PSR-12 for PHP code
- Use ESLint rules for JavaScript
- Write meaningful commit messages
- Add comments for complex logic

---

## 🐛 Known Issues & Fixes

| Issue | Fix |
|-------|-----|
| CORS error on login | Add `localhost:5173` to `config/cors.php` |
| File upload not working | Run `php artisan storage:link` |
| 401 on API calls | Check `SANCTUM_STATEFUL_DOMAINS` in `.env` |
| Migration fails | Check database exists and credentials are correct |

---

## 👨‍💻 Author

**Your Name**
- GitHub: [https://github.com/chetnatambuskar](https://github.com/chetnatambuskar)
- LinkedIn: [www.linkedin.com/in/chetana-tambuskar-244065226](www.linkedin.com/in/chetana-tambuskar-244065226)
- Email: chetanatambuskar24@gmail.com

---

##  Acknowledgments

- [Laravel](https://laravel.com) — The PHP Framework for Web Artisans
- [React](https://reactjs.org) — A JavaScript library for building user interfaces
- [Tailwind CSS](https://tailwindcss.com) — A utility-first CSS framework
- [Recharts](https://recharts.org) — A composable charting library for React
- [Lucide React](https://lucide.dev) — Beautiful & consistent icons

---

<div align="center">

**⭐ If you found this project helpful, please give it a star!**
</div>
