// store.js - Handles local storage and mock data
const Store = {
    // Basic wrapper to get/set JSON in localStorage
    get: (key, defaultValue) => {
        const item = localStorage.getItem('campusflow_' + key);
        return item ? JSON.parse(item) : defaultValue;
    },
    set: (key, value) => {
        localStorage.setItem('campusflow_' + key, JSON.stringify(value));
    },

    // Current State
    getCurrentUser: () => Store.get('currentUser', null),
    setCurrentUser: (role) => Store.set('currentUser', { role }),
    logout: () => localStorage.removeItem('campusflow_currentUser'),
    
    // Config / Navigation links based on role
    getNavLinks: (role) => {
        const links = [
            { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie', roles: ['student', 'lecturer', 'hod', 'admin'] },
            { id: 'doubts', label: 'Doubts', icon: 'fa-question-circle', roles: ['student', 'lecturer'] },
            { id: 'complaints', label: 'Complaints', icon: 'fa-exclamation-circle', roles: ['student', 'lecturer', 'hod', 'admin'] },
            { id: 'notices', label: 'Notices', icon: 'fa-bullhorn', roles: ['student', 'lecturer', 'hod', 'admin'] },
            { id: 'attendance', label: 'Attendance', icon: 'fa-calendar-check', roles: ['student', 'lecturer', 'hod'] },
            { id: 'classrooms', label: 'Classrooms', icon: 'fa-door-open', roles: ['student', 'lecturer', 'hod', 'admin'] },
            { id: 'events', label: 'Events & Certs', icon: 'fa-calendar-star', roles: ['student', 'admin'] },
            { id: 'lostfound', label: 'Lost & Found', icon: 'fa-box-open', roles: ['student', 'admin'] },
            { id: 'timetable', label: 'Timetable', icon: 'fa-table', roles: ['student', 'lecturer'] },
        ];
        return links.filter(link => link.roles.includes(role));
    }
};
