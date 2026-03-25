// app.js - Main application logic

const App = {
    state: {
        currentView: 'dashboard'
    },
    
    init() {
        const user = Store.getCurrentUser();
        if (user) {
            this.showDashboard(user.role);
        } else {
            this.showAuth();
        }
    },

    toggleAuthMode(mode) {
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const subtitle = document.getElementById('auth-subtitle');

        if (mode === 'signup') {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            subtitle.innerText = 'Create a new account';
        } else {
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            subtitle.innerText = 'Sign in to your account';
        }
    },

    handleLogin(e) {
        e.preventDefault();
        const role = document.getElementById('login-role').value;
        Store.setCurrentUser(role);
        this.showDashboard(role);
    },

    handleSignup(e) {
        e.preventDefault();
        const role = document.getElementById('signup-role').value;
        const name = document.getElementById('signup-name').value;
        alert(`Authentication mock: Account created successfully for ${name}! Logged in as ${role}.`);
        Store.setCurrentUser(role);
        this.showDashboard(role);
    },

    logout() {
        Store.logout();
        this.showAuth();
    },

    showAuth() {
        document.getElementById('dashboard-view').classList.add('hidden');
        document.getElementById('dashboard-view').classList.remove('active');
        
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('auth-view').classList.add('active');
    },

    showDashboard(role) {
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('auth-view').classList.remove('active');
        
        document.getElementById('dashboard-view').classList.remove('hidden');
        document.getElementById('dashboard-view').classList.add('active');
        
        document.getElementById('current-role-display').innerText = role;
        
        this.renderSidebar(role);
        this.loadView('dashboard'); // Default view
    },

    renderSidebar(role) {
        const navContainer = document.getElementById('sidebar-nav');
        const links = Store.getNavLinks(role);
        
        navContainer.innerHTML = links.map(link => `
            <a class="nav-item ${this.state.currentView === link.id ? 'active' : ''}" 
               onclick="app.loadView('${link.id}', '${link.label}')"
               id="nav-${link.id}">
                <span class="nav-text">${link.label}</span>
                <div class="nav-icon"><i class="fa-solid ${link.icon}"></i></div>
            </a>
        `).join('');
    },

    loadView(viewId, title = 'Dashboard') {
        this.state.currentView = viewId;
        document.getElementById('current-page-title').innerText = title;
        
        // Update active class on sidebar
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const activeNav = document.getElementById(`nav-${viewId}`);
        if(activeNav) activeNav.classList.add('active');
        
        // Render content (Mock view right now)
        const contentArea = document.getElementById('content-area');
        
        if (viewId === 'dashboard') {
            this.renderDashboardHome(contentArea);
        } else if (viewId === 'doubts') {
            if(window.DoubtsModule) window.DoubtsModule.render(contentArea);
        } else if (viewId === 'complaints') {
            if(window.ComplaintsModule) window.ComplaintsModule.render(contentArea);
        } else if (viewId === 'notices') {
            if(window.NoticesModule) window.NoticesModule.render(contentArea);
        } else if (viewId === 'classrooms') {
            if(window.ClassroomsModule) window.ClassroomsModule.render(contentArea);
        } else if (viewId === 'attendance') {
            if(window.MiscModules) window.MiscModules.AttendanceModule.render(contentArea);
        } else if (viewId === 'events') {
            if(window.MiscModules) window.MiscModules.EventsModule.render(contentArea);
        } else if (viewId === 'timetable') {
            if(window.MiscModules) window.MiscModules.TimetableModule.render(contentArea);
        } else if (viewId === 'lostfound') {
            if(window.MiscModules) window.MiscModules.LostFoundModule.render(contentArea);
        } else {
            contentArea.innerHTML = `
                <div class="stat-card" style="margin-top: 2rem;">
                    <div>
                        <h2>${title} Module</h2>
                        <p style="color: var(--text-secondary); margin-top: 1rem;">
                            This module is currently under development. To be built in next tasks.
                        </p>
                    </div>
                </div>
            `;
        }
        
        // On mobile, close sidebar after clicking
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('open');
        }
    },

    renderDashboardHome(container) {
        const user = Store.getCurrentUser();
        // Just mock some basic stats based on role
        let statsHtml = '';
        
        if (user.role === 'student') {
            statsHtml = `
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: var(--primary-color)"><i class="fa-solid fa-question"></i></div>
                    <div class="stat-content"><h4>Pending Doubts</h4><p>2</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: var(--warning-color)"><i class="fa-solid fa-exclamation-triangle"></i></div>
                    <div class="stat-content"><h4>Active Complaints</h4><p>1</p></div>
                </div>
            `;
        } else if (user.role === 'hod' || user.role === 'admin') {
            statsHtml = `
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: var(--danger-color)"><i class="fa-solid fa-exclamation-triangle"></i></div>
                    <div class="stat-content"><h4>Total Complaints</h4><p>14</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: var(--secondary-color)"><i class="fa-solid fa-check-circle"></i></div>
                    <div class="stat-content"><h4>Resolved</h4><p>112</p></div>
                </div>
            `;
        } else {
             statsHtml = `
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: var(--primary-color)"><i class="fa-solid fa-chalkboard-user"></i></div>
                    <div class="stat-content"><h4>Student Doubts</h4><p>5</p></div>
                </div>
            `;
        }

        container.innerHTML = `
            <h2 style="margin-bottom: 1.5rem;">Welcome back, ${user.role}!</h2>
            <div class="stats-grid">
                ${statsHtml}
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: #8B5CF6"><i class="fa-solid fa-bullhorn"></i></div>
                    <div class="stat-content"><h4>New Notices</h4><p>3</p></div>
                </div>
            </div>
            
            <div class="stat-card">
                <h3>Recent Activity</h3>
                <p style="color: var(--text-secondary); margin-top: 1rem;">No recent activity to show.</p>
            </div>
        `;
    },

    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('open');
    }
};

// Expose app to global scope for HTML onclick handlers
window.app = App;

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
