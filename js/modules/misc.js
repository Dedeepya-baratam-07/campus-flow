// misc.js - Handles Remaining Mock Modules (Attendance, Events, Timetable, LostFound)

const AttendanceModule = {
    render(container) {
        container.innerHTML = `
            <div class="module-header" style="margin-bottom: 2rem;">
                <h2>Attendance Correction</h2>
                <p style="color: var(--text-secondary);">Request attendance corrections from your lecturers.</p>
            </div>
            <div class="card attendance-card" style="text-align: center; padding: 4rem;">
                <div id="attendance-initial-state">
                    <i class="fa-solid fa-calendar-check" style="font-size: 3rem; color: var(--border-color); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-primary);">No active attendance issues</h3>
                    <p style="color: var(--text-secondary);">Your attendance is up to date.</p>
                    <button class="btn btn-outline" style="margin-top: 1.5rem;" onclick="window.MiscModules.AttendanceModule.requestCorrection()">Request Correction</button>
                </div>
            </div>
        `;
    },
    requestCorrection() {
        const container = document.getElementById('attendance-initial-state');
        if (container) {
            container.innerHTML = `
                <i class="fa-solid fa-clock-rotate-left" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-primary);">Processing Request...</h3>
                <p style="color: var(--text-secondary);">Connecting to Attendance Server</p>
            `;
            setTimeout(() => {
                container.innerHTML = `
                    <i class="fa-solid fa-circle-check" style="font-size: 3rem; color: var(--secondary-color); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-primary);">Request Sent!</h3>
                    <p style="color: var(--text-secondary);">Lecturer notified successfully.</p>
                    <button class="btn btn-outline btn-sm" style="margin-top: 1rem;" onclick="app.loadView('attendance', 'Attendance')">Back to status</button>
                `;
            }, 1500);
        }
    }
};

const EventsModule = {
    render(container) {
        container.innerHTML = `
            <div class="module-header flex justify-between items-center" style="margin-bottom: 2rem;">
                <div>
                    <h2>Events & Certificates</h2>
                    <p style="color: var(--text-secondary);">Register for college events and download certificates.</p>
                </div>
                <button class="btn btn-primary" onclick="app.mockAction('Opening New Event Form...')"><i class="fa-solid fa-plus"></i> New Event</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                <div class="card event-card">
                    <div style="height: 120px; background: linear-gradient(135deg, #3B82F6, #8B5CF6); border-radius: var(--radius-md); margin-bottom: 1rem;"></div>
                    <h3>Annual Tech Symposium</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;"><i class="fa-regular fa-calendar"></i> Oct 24, 2026</p>
                    <button class="btn btn-outline reg-btn" style="width: 100%; justify-content: center;" onclick="window.MiscModules.EventsModule.register(this)">Register Now</button>
                </div>
                <div class="card cert-card">
                    <div style="height: 120px; background: linear-gradient(135deg, #10B981, #059669); border-radius: var(--radius-md); margin-bottom: 1rem;"></div>
                    <h3>AI Workshop Certificate</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;"><i class="fa-regular fa-calendar"></i> Attended last month</p>
                    <button class="btn btn-primary download-btn" style="width: 100%; justify-content: center;" onclick="window.MiscModules.EventsModule.download(this)">
                        <span class="btn-text"><i class="fa-solid fa-download"></i> Download Cert</span>
                    </button>
                </div>
            </div>
        `;
    },
    register(btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering...';
        btn.disabled = true;
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Registered Successfully';
            btn.style.borderColor = 'var(--secondary-color)';
            btn.style.color = 'var(--secondary-color)';
        }, 1200);
    },
    download(btn) {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparing...';
        btn.disabled = true;
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-check"></i> File Ready - Started';
            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
                app.mockAction('Certificate file "AI-Workshop-2026.pdf" downloaded!');
            }, 2000);
        }, 1500);
    }
};

const TimetableModule = {
    render(container) {
        container.innerHTML = `
            <div class="module-header" style="margin-bottom: 2rem;">
                <h2>Smart Timetable</h2>
                <p style="color: var(--text-secondary);">Your daily schedule aligned automatically.</p>
            </div>
            <div class="card">
                <div style="background: var(--background-light); padding: 3rem; text-align: center; border-radius: var(--radius-md);">
                    <i class="fa-solid fa-table" style="font-size: 3rem; color: var(--border-color); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-primary);">Timetable Synchronized</h3>
                    <p style="color: var(--text-secondary);">No changes to your regular schedule today.</p>
                </div>
            </div>
        `;
    }
};

const LostFoundModule = {
    render(container) {
        container.innerHTML = `
            <div class="module-header flex justify-between items-center" style="margin-bottom: 2rem;">
                <div>
                    <h2>Lost & Found</h2>
                </div>
                <button class="btn btn-primary" onclick="app.mockAction('Opening Report Item Modal...')"><i class="fa-solid fa-plus"></i> Report Item</button>
            </div>
            <div id="lost-items-container">
                <div class="card flex items-center justify-between" style="margin-bottom: 1rem; border-left: 4px solid var(--warning-color);">
                    <div>
                        <h3 style="color: var(--text-primary); margin-bottom: 0.25rem;">Lost: Blue Water Bottle</h3>
                        <p style="color: var(--text-secondary);">Left in Room 102 near the back benches.</p>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="app.mockAction('Contacting the finder...')">Contact Finder</button>
                </div>
                <div class="card flex items-center justify-between" style="border-left: 4px solid var(--secondary-color);">
                    <div>
                        <h3 style="color: var(--text-primary); margin-bottom: 0.25rem;">Found: College ID Card</h3>
                        <p style="color: var(--text-secondary);">Found in the library. Handed over to Admin front desk.</p>
                    </div>
                </div>
            </div>
        `;
    }
};

window.MiscModules = { AttendanceModule, EventsModule, TimetableModule, LostFoundModule };
