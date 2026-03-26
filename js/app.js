// app.js - Main application logic with Firebase Integration
const App = {
    state: {
        currentView: 'dashboard',
        user: null
    },
    
    init() {
        // Initialize Auth Listener
        this.initAuth();
    },

    initAuth() {
        if (!window.fb) return console.error("Firebase not loaded!");

        fb.onAuth(fb.auth, async (user) => {
            if (user) {
                // User is signed in. Get additional info (role) from Firestore
                this.state.user = user;
                try {
                    const userDoc = await fb.get(fb.docRef(fb.db, "users", user.uid));
                    let userData = userDoc.exists() ? userDoc.data() : null;
                    
                    if (!userData) {
                        // Fallback role if doc doesn't exist yet (should be created on signup)
                        userData = { role: 'student', displayName: user.displayName || 'User' };
                    }
                    
                    this.state.user.role = userData.role;
                    this.state.user.fullName = userData.displayName;
                    
                    // Synchronize with legacy Store for components that still use it
                    Store.setCurrentUser(userData.role);
                    
                    this.showDashboard(this.state.user.role);
                } catch (err) {
                    console.error("Error fetching user role:", err);
                    this.showDashboard('student'); // Default fallback
                }
            } else {
                // User is signed out.
                this.state.user = null;
                Store.logout();
                this.showAuth();
            }
        });
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

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        const btn = document.getElementById('login-submit-btn');

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';

        try {
            await fb.signIn(fb.auth, email, pass);
            this.showToast("Successfully logged in!");
        } catch (err) {
            console.error(err);
            this.showToast("Login failed: " + err.message, "danger");
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Login';
        }
    },

    async handleSignup(e) {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const name = document.getElementById('signup-name').value;
        const role = document.getElementById('signup-role').value;
        const pass = document.getElementById('signup-password').value;
        const btn = document.getElementById('signup-submit-btn');

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';

        try {
            const res = await fb.signUp(fb.auth, email, pass);
            const user = res.user;

            // Update user profile
            await fb.updateUser(user, { displayName: name });

            // Store role in Firestore with UID as document ID
            // Using fb.upd (updateDoc) with merge: true acts as setDoc if document exists, 
            // but updateDoc fails if it doesn't exist. 
            // I'll update firebase-init.js to include setDoc.
            // For now, I'll use add but the user requested better management.
            
            // Link UID as document ID for easier lookup
            await fb.set(fb.docRef(fb.db, "users", user.uid), {
                 uid: user.uid,
                 email: email,
                 displayName: name,
                 role: role,
                 createdAt: fb.ts()
            });
            
            this.showToast("Account created successfully!");
            // The onAuth listener will handle the redirection
        } catch (err) {
            console.error(err);
            this.showToast("Signup failed: " + err.message, "danger");
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';
        }
    },

    async logout() {
        try {
            await fb.signOut(fb.auth);
            this.showToast("Logged out successfully");
        } catch (err) {
            console.error(err);
        }
    },

    showAuth() {
        document.getElementById('dashboard-view')?.classList.add('hidden');
        document.getElementById('dashboard-view')?.classList.remove('active');
        document.getElementById('auth-view')?.classList.remove('hidden');
        document.getElementById('auth-view')?.classList.add('active');
    },

    showDashboard(role) {
        document.getElementById('auth-view')?.classList.add('hidden');
        document.getElementById('auth-view')?.classList.remove('active');
        document.getElementById('dashboard-view')?.classList.remove('hidden');
        document.getElementById('dashboard-view')?.classList.add('active');
        
        document.getElementById('current-role-display').innerText = role.toUpperCase();
        
        this.renderSidebar(role);
        this.loadView('dashboard');
    },

    renderSidebar(role) {
        const navContainer = document.getElementById('sidebar-nav');
        if (!navContainer) return;
        
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
        const titleEl = document.getElementById('current-page-title');
        if (titleEl) titleEl.innerText = title;
        
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const activeNav = document.getElementById(`nav-${viewId}`);
        if(activeNav) activeNav.classList.add('active');
        
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        
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
        } else if (viewId === 'attendance' || viewId === 'events' || viewId === 'timetable' || viewId === 'lostfound') {
            this.loadMiscModule(viewId, contentArea);
        } else {
            this.renderPlaceholder(contentArea, title);
        }
        
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar')?.classList.remove('open');
        }
    },

    loadMiscModule(viewId, container) {
        const mod = window.MiscModules;
        if (!mod) return;
        
        if (viewId === 'attendance') mod.AttendanceModule.render(container);
        else if (viewId === 'events') mod.EventsModule.render(container);
        else if (viewId === 'timetable') mod.TimetableModule.render(container);
        else if (viewId === 'lostfound') mod.LostFoundModule.render(container);
    },

    renderPlaceholder(container, title) {
        container.innerHTML = `
            <div class="stat-card" style="margin-top: 2rem;">
                <div>
                    <h2>${title} Module</h2>
                    <p style="color: var(--text-secondary); margin-top: 1rem;">
                        Connecting to real-time data...
                    </p>
                </div>
            </div>
        `;
    },

    renderDashboardHome(container) {
        const userRole = this.state.user?.role || 'student';
        let statsHtml = '';
        
        // Dynamic stats would come from Firestore aggregations in a full app
        if (userRole === 'student') {
            statsHtml = `
                <div class="stat-card"><div class="stat-icon" style="background-color: var(--primary-color)"><i class="fa-solid fa-question"></i></div><div class="stat-content"><h4>Your Doubts</h4><p>Live</p></div></div>
                <div class="stat-card"><div class="stat-icon" style="background-color: var(--warning-color, #f59e0b)"><i class="fa-solid fa-exclamation-triangle"></i></div><div class="stat-content"><h4>Complaints</h4><p>Active</p></div></div>
            `;
        } else {
            statsHtml = `
                <div class="stat-card"><div class="stat-icon" style="background-color: var(--danger-color, #ef4444)"><i class="fa-solid fa-exclamation-triangle"></i></div><div class="stat-content"><h4>Open Issues</h4><p>High</p></div></div>
                <div class="stat-card"><div class="stat-icon" style="background-color: var(--secondary-color, #10b981)"><i class="fa-solid fa-check-circle"></i></div><div class="stat-content"><h4>Resolved</h4><p>All</p></div></div>
            `;
        }

        container.innerHTML = `
            <h2 style="margin-bottom: 2rem; color: var(--text-primary); font-family: 'Orbitron', sans-serif;">System Status</h2>
            <div class="stats-grid" style="margin-bottom: 2.5rem;">
                ${statsHtml}
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: #8B5CF6"><i class="fa-solid fa-cloud"></i></div>
                    <div class="stat-content"><h4>Sync Mode</h4><p>Realtime</p></div>
                </div>
            </div>
            
            <div class="dashboard-charts">
                <div class="chart-card line-chart-container">
                    <h3>Campus Support Pulse</h3>
                    <canvas id="campusActivityChart"></canvas>
                </div>
                <div class="chart-card donut-chart-container">
                    <h3>Departmental Engagement</h3>
                    <canvas id="doubtDonutChart"></canvas>
                </div>
                <div class="chart-card">
                    <h3>Firebase Vital Stats</h3>
                    <div class="flex flex-column" style="gap: 1rem; margin-top: 1rem;">
                        <div class="flex items-center justify-between" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                            <span style="color: var(--text-secondary);">Auth Status</span>
                            <span style="color: #10b981; font-weight: 700;">Connected</span>
                        </div>
                        <div class="flex items-center justify-between" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                            <span style="color: var(--text-secondary);">Firestore</span>
                            <span style="color: #00bcd4; font-weight: 700;">Active</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        setTimeout(() => this.initCharts(), 100);
    },

    initCharts() {
        const lineCtx = document.getElementById('campusActivityChart')?.getContext('2d');
        if (lineCtx) {
            new Chart(lineCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Interactions',
                        data: [12, 19, 3, 5, 2, 3, 9],
                        borderColor: '#e91e8c',
                        tension: 0.4,
                        fill: true,
                        backgroundColor: 'rgba(233, 30, 140, 0.1)'
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
            });
        }
        
        const donutCtx = document.getElementById('doubtDonutChart')?.getContext('2d');
        if (donutCtx) {
            new Chart(donutCtx, {
                type: 'doughnut',
                data: {
                    labels: ['CSE', 'MECH', 'CIVIL', 'ECE'],
                    datasets: [{ data: [40, 20, 10, 30], backgroundColor: ['#e91e8c', '#00bcd4', '#8B5CF6', '#F59E0B'] }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    },

    showToast(message, type = 'primary') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fa-solid fa-info-circle"></i> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
};

window.app = App;
document.addEventListener('DOMContentLoaded', () => App.init());
