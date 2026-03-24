# CampusFlow - Design Document

## Project Overview
CampusFlow is a centralized, role-based college support system providing modules for doubt solving, complaint routing, notices, attendance, and more. 

For the MVP, this is a **Frontend-only** implementation using HTML, CSS, and Vanilla JavaScript. The state and data will be temporarily managed using `localStorage` to simulate a fully working application.

## UI Style
* **Design System:** Minimal, clean SaaS dashboard. 
* **Colors:** Trustworthy Blue (Primary), Clean White/Light Gray (Backgrounds), Alert Colors (Red/Yellow/Green for status).
* **Layout:** Sidebar navigation (responsive), Header with Role Switcher, and a dynamic Main Content Area.

## Page Structure
The application will operate as a Single Page Application (SPA) using vanilla JS to swap content sections.

### 1. Auth View (Login)
* **Purpose:** User enters credentials or selects a role.
* **Sections:** Login Form, Role Mock Selector.

### 2. Main Dashboard (Unified)
* **Purpose:** Central hub for the user (changes based on role).
* **Layout:** 
  - **Sidebar:** Navigation links (Dashboard, Doubts, Complaints, Notices, Timetable, etc.).
  - **Header:** Notification bell, User Profile, Role Switcher (for dev testing).
  - **Content Area:** Dynamic views.

#### Internal Views (Rendered in Content Area):
* **Overview:** Charts/Stats (mocked with CSS/JS arrays), Recent Activity.
* **Doubts Module:** List of doubts, "Ask Doubt" modal, Threaded view.
* **Complaints Module:** Complaint table, Status tracking, "Lodge Complaint" form.
* **Notices:** Feed of notices, "Add Notice" modal (Admin/HOD).
* **Classroom Finder:** Grid of rooms with Free/Occupied status.
* **Attendance & Events:** Simple list interfaces with Accept/Reject buttons for Lecturers.

## User Flow
Login -> Select Role -> Land on Dashboard -> Navigate via Sidebar -> Interact with specific module -> Data saved to `localStorage` -> UI updates instantly.
