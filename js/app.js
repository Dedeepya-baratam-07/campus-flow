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
                    <div class="stat-icon" style="background-color: var(--warning-color, #f59e0b)"><i class="fa-solid fa-exclamation-triangle"></i></div>
                    <div class="stat-content"><h4>Active Complaints</h4><p>1</p></div>
                </div>
            `;
        } else if (user.role === 'hod' || user.role === 'admin') {
            statsHtml = `
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: var(--danger-color, #ef4444)"><i class="fa-solid fa-exclamation-triangle"></i></div>
                    <div class="stat-content"><h4>Total Complaints</h4><p>14</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: var(--secondary-color, #10b981)"><i class="fa-solid fa-check-circle"></i></div>
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
            <h2 style="margin-bottom: 2rem; color: var(--text-primary); font-family: 'Orbitron', sans-serif; letter-spacing: 1px;">Analytics Overview</h2>
            
            <div class="stats-grid" style="margin-bottom: 2.5rem;">
                ${statsHtml}
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: #8B5CF6"><i class="fa-solid fa-bullhorn"></i></div>
                    <div class="stat-content"><h4>New Notices</h4><p>3</p></div>
                </div>
            </div>
            
            <div class="dashboard-charts">
                <!-- Row 1: Main Line Chart -->
                <div class="chart-card line-chart-container">
                    <h3>Campus Support Pulse (Monthly)</h3>
                    <canvas id="campusActivityChart"></canvas>
                </div>
                
                <!-- Row 2: Secondary Chart + Recent Activity -->
                <div class="chart-card donut-chart-container" style="min-height: 320px;">
                    <h3>Departmental Doubt Distribution</h3>
                    <canvas id="doubtDonutChart"></canvas>
                </div>
                
                <div class="chart-card" style="min-height: 320px;">
                    <h3>System Vital Stats</h3>
                    <div class="flex flex-column" style="gap: 1.5rem; margin-top: 1rem;">
                        <div class="flex items-center justify-between" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.75rem;">
                            <span style="color: var(--text-secondary); font-size: 0.9rem;">Server Uptime</span>
                            <span style="color: #10b981; font-weight: 700;">99.9%</span>
                        </div>
                        <div class="flex items-center justify-between" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.75rem;">
                            <span style="color: var(--text-secondary); font-size: 0.9rem;">Sync Status</span>
                            <span style="color: #00bcd4; font-weight: 700;">Live</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span style="color: var(--text-secondary); font-size: 0.9rem;">Active Users</span>
                            <span style="color: #ffffff; font-weight: 700;">1,248</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Wait for DOM to update then init charts
        setTimeout(() => this.initCharts(), 10);
    },

    initCharts() {
        // 1. Campus Activity Chart (Line)
        const lineCtx = document.getElementById('campusActivityChart')?.getContext('2d');
        if (lineCtx) {
            const gradientPink = lineCtx.createLinearGradient(0, 0, 0, 400);
            gradientPink.addColorStop(0, 'rgba(233, 30, 140, 0.4)');
            gradientPink.addColorStop(1, 'rgba(233, 30, 140, 0)');

            const gradientBlue = lineCtx.createLinearGradient(0, 0, 0, 400);
            gradientBlue.addColorStop(0, 'rgba(0, 188, 212, 0.4)');
            gradientBlue.addColorStop(1, 'rgba(0, 188, 212, 0)');

            new Chart(lineCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                    datasets: [{
                        label: 'Doubts Raised',
                        data: [45, 59, 80, 81, 56, 55, 40],
                        borderColor: '#e91e8c',
                        backgroundColor: gradientPink,
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointBackgroundColor: '#e91e8c',
                        pointBorderColor: '#fff',
                        pointRadius: 4
                    }, {
                        label: 'Complaints',
                        data: [28, 48, 40, 19, 86, 27, 90],
                        borderColor: '#00bcd4',
                        backgroundColor: gradientBlue,
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointBackgroundColor: '#00bcd4',
                        pointBorderColor: '#fff',
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: '#e8f4f8' } }
                    },
                    scales: {
                        y: { 
                            grid: { color: 'rgba(233, 30, 140, 0.1)' },
                            ticks: { color: '#e8f4f8' }
                        },
                        x: { 
                            grid: { color: 'rgba(233, 30, 140, 0.1)' },
                            ticks: { color: '#e8f4f8' }
                        }
                    }
                }
            });
        }

        // 2. Doubt Donut Chart
        const donutCtx = document.getElementById('doubtDonutChart')?.getContext('2d');
        if (donutCtx) {
            new Chart(donutCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Academic', 'Admin', 'Facility', 'Others'],
                    datasets: [{
                        data: [44, 25, 12, 19],
                        backgroundColor: ['#e91e8c', '#00bcd4', '#ff4db8', '#80deea'], /* Theme-aligned colors */
                        borderWidth: 0,
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#e8f4f8', padding: 20 } }
                    }
                }
            });
        }
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
