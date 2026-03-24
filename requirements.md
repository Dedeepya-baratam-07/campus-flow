# CampusFlow - Requirements Document

## Tech Stack
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+).
* **Backend:** Mocked temporarily (Phase 1).
* **Database:** `localStorage` for local state persistence.
* **External Assets:** 
  - FontAwesome (for icons via CDN).
  - Google Fonts (Inter or Roboto).
  - Chart.js (optional, for dashboard analytics).

## Roles Supported
* Student
* Lecturer
* HOD
* Staff / Admin

## Feature Requirements (MVP Phase 1 - Frontend)
1. **Routing:** Client-side vanilla JS router to switch views without reloading.
2. **State Management:** A simple JS module to read/write JSON from `localStorage`.
3. **Authentication Mock:** Ability to switch between Student/Lecturer/HOD to see different sidebar items.
4. **Forms:** HTML forms for submitting doubts and complaints, intercepted by JS.
5. **Responsive Design:** CSS Flexbox/Grid for mobile and desktop screens.

## Future Infrastructure (Phase 2 - Post MVP)
* **Backend:** Node.js or Firebase.
* **Auth:** Firebase Auth.
* **Database:** Firestore / MongoDB.
