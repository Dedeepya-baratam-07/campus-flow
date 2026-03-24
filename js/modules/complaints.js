// complaints.js - Handles Complaint Routing Module
const ComplaintsModule = {
    init() {
        if (!Store.get('complaints')) {
            Store.set('complaints', [
                { id: 101, userRole: 'student', userName: 'Student A', category: 'Wifi', description: 'Wifi is not working in Lab 3.', status: 'submitted', priority: 'high', timestamp: new Date(Date.now() - 86400000).toISOString() },
                { id: 102, userRole: 'lecturer', userName: 'Dr. Smith', category: 'Classroom', description: 'Projector broken in Room 204.', status: 'in progress', priority: 'normal', timestamp: new Date().toISOString() }
            ]);
        }
    },

    render(container) {
        const user = Store.getCurrentUser();
        const complaints = Store.get('complaints', []);
        
        let headerHtml = `
            <div class="module-header flex justify-between items-center" style="margin-bottom: 2rem;">
                <h2>Complaint Management</h2>
                <button class="btn btn-primary" onclick="window.ComplaintsModule.openComplaintModal()"><i class="fa-solid fa-plus"></i> File Complaint</button>
            </div>
            
            <div class="filter-bar flex gap-1" style="margin-bottom: 1.5rem; gap: 1rem;">
                <select id="comp-filter-category" class="form-control" style="width: 200px;" onchange="window.ComplaintsModule.filterList()">
                    <option value="all">All Categories</option>
                    <option value="Wifi">Wifi</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Classroom">Classroom</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Cleanliness">Cleanliness</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Timetable">Timetable</option>
                    <option value="Others">Others</option>
                </select>
                <select id="comp-filter-status" class="form-control" style="width: 200px;" onchange="window.ComplaintsModule.filterList()">
                    <option value="all">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="in progress">In Progress</option>
                    <option value="solved">Solved</option>
                </select>
            </div>
        `;

        let tableHtml = `<div class="complaints-list" id="complaints-list-container" style="overflow-x: auto;">
            ${this.generateTableHtml(complaints, user)}
        </div>`;

        container.innerHTML = headerHtml + tableHtml + this.getModalHtml();
    },

    generateTableHtml(complaints, user) {
        if(complaints.length === 0) return `<p>No complaints found.</p>`;

        // Building a table
        let rowsHtml = complaints.map(c => {
            let badgeClass = 'badge-warning';
            if (c.status === 'in progress') badgeClass = 'badge-primary';
            if (c.status === 'solved') badgeClass = 'badge-success';

            // We added inline style for primary fallback
            let statusBadge = `<span class="badge ${badgeClass}" ${c.status === 'in progress' ? 'style="background-color: #DBEAFE; color: #1D4ED8;"' : ''}>${c.status.toUpperCase()}</span>`;

            return `
            <tr onclick="window.ComplaintsModule.openDetailModal(${c.id})" style="cursor: pointer;" class="table-row-hover">
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color);">${c.id}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color);">${new Date(c.timestamp).toLocaleDateString()}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color);"><strong>${c.category}</strong></td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color);">${c.description.substring(0, 40)}${c.description.length > 40 ? '...' : ''}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color);">${c.userName} <small style="color: var(--text-secondary)">(${c.userRole})</small></td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--border-color);">${statusBadge}</td>
            </tr>
            `;
        }).join('');

        return `
        <table style="width: 100%; text-align: left; border-collapse: collapse; background: var(--surface-color); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); min-width: 700px;">
            <thead style="background: var(--background-light);">
                <tr>
                    <th style="padding: 1rem; color: var(--text-secondary); font-weight: 600;">ID</th>
                    <th style="padding: 1rem; color: var(--text-secondary); font-weight: 600;">Date</th>
                    <th style="padding: 1rem; color: var(--text-secondary); font-weight: 600;">Category</th>
                    <th style="padding: 1rem; color: var(--text-secondary); font-weight: 600;">Description</th>
                    <th style="padding: 1rem; color: var(--text-secondary); font-weight: 600;">Submitted By</th>
                    <th style="padding: 1rem; color: var(--text-secondary); font-weight: 600;">Status</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
        <style>
            .table-row-hover:hover { background-color: #F9FAFB; }
        </style>
        `;
    },

    filterList() {
        const complaints = Store.get('complaints', []);
        const category = document.getElementById('comp-filter-category').value;
        const status = document.getElementById('comp-filter-status').value;
        
        let filtered = complaints.filter(c => {
            const matchCat = category === 'all' || c.category === category;
            const matchStatus = status === 'all' || c.status === status;
            return matchCat && matchStatus;
        });
        
        const container = document.getElementById('complaints-list-container');
        if(container) {
            container.innerHTML = this.generateTableHtml(filtered, Store.getCurrentUser());
        }
    },

    getModalHtml() {
        return `
            <div id="complaint-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header flex justify-between items-center">
                        <h3>File a Complaint</h3>
                        <button class="btn-icon" onclick="window.ComplaintsModule.closeComplaintModal()"><i class="fa-solid fa-times"></i></button>
                    </div>
                    <form id="file-complaint-form" onsubmit="window.ComplaintsModule.submitComplaint(event)">
                        <div class="form-group">
                            <label>Category</label>
                            <select id="comp-category" class="form-control" required>
                                <option value="Wifi">Wifi</option>
                                <option value="Electricity">Electricity</option>
                                <option value="Classroom">Classroom</option>
                                <option value="Facilities">Facilities</option>
                                <option value="Cleanliness">Cleanliness</option>
                                <option value="Lecturer">Lecturer</option>
                                <option value="Timetable">Timetable</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="comp-desc" class="form-control" rows="4" required placeholder="Describe the issue..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Priority</label>
                            <select id="comp-priority" class="form-control">
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div class="modal-footer" style="margin-top: 1.5rem; text-align: right;">
                            <button type="button" class="btn btn-outline" onclick="window.ComplaintsModule.closeComplaintModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Submit Complaint</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Detail Modal for HOD/Admin -->
            <div id="comp-detail-modal" class="modal hidden">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header flex justify-between items-center">
                        <h3>Complaint Details</h3>
                        <button class="btn-icon" onclick="window.ComplaintsModule.closeDetailModal()"><i class="fa-solid fa-times"></i></button>
                    </div>
                    <div id="comp-detail-content" style="margin-bottom: 1.5rem;">
                        <!-- Injected by JS -->
                    </div>
                    
                    <div id="comp-admin-controls" style="border-top: 1px solid var(--border-color); padding-top: 1rem; display: none;">
                        <h4 style="margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem;">Admin Controls (Update Status)</h4>
                        <div class="flex gap-1" style="margin-top: 0.5rem;">
                            <button class="btn btn-outline" onclick="window.ComplaintsModule.updateStatus('in progress')" style="color: #1D4ED8; border-color: #1D4ED8;">Mark In Progress</button>
                            <button class="btn btn-primary" onclick="window.ComplaintsModule.updateStatus('solved')" style="background-color: var(--secondary-color);">Mark Solved</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    openComplaintModal() {
        document.getElementById('complaint-modal').classList.remove('hidden');
    },

    closeComplaintModal() {
        document.getElementById('complaint-modal').classList.add('hidden');
    },

    submitComplaint(e) {
        e.preventDefault();
        const complaints = Store.get('complaints', []);
        const user = Store.getCurrentUser();
        const newComp = {
            id: Math.floor(1000 + Math.random() * 9000), 
            userRole: user.role,
            userName: user.role.toUpperCase() + ' User', 
            category: document.getElementById('comp-category').value,
            description: document.getElementById('comp-desc').value,
            priority: document.getElementById('comp-priority').value,
            status: 'submitted',
            timestamp: new Date().toISOString()
        };
        complaints.unshift(newComp);
        Store.set('complaints', complaints);
        this.closeComplaintModal();
        app.loadView('complaints', 'Complaints'); 
    },

    openDetailModal(id) {
        this.currentCompId = id;
        const complaints = Store.get('complaints', []);
        const comp = complaints.find(c => c.id === id);
        if(!comp) return;

        let html = `
            <div style="margin-bottom: 1rem;">
                <p style="color: var(--text-secondary); font-size: 0.875rem;">ID: #${comp.id} | ${new Date(comp.timestamp).toLocaleString()}</p>
                <div class="flex justify-between items-center" style="margin-top: 0.5rem; margin-bottom: 1rem;">
                    <h4 style="font-size: 1.25rem;">${comp.category}</h4>
                    <div>
                        <span class="badge ${comp.status === 'solved' ? 'badge-success' : comp.status === 'in progress' ? 'badge-primary' : 'badge-warning'}"
                              ${comp.status === 'in progress' ? 'style="background-color: #DBEAFE; color: #1D4ED8;"' : ''}>
                              ${comp.status.toUpperCase()}
                        </span>
                        ${comp.priority === 'high' ? '<span class="badge badge-danger">High Prio</span>' : ''}
                    </div>
                </div>
                <div style="background: var(--background-light); padding: 1rem; border-radius: var(--radius-md);">
                    <p style="white-space: pre-wrap;">${comp.description}</p>
                </div>
                <p style="margin-top: 1rem; color: var(--text-secondary);">Submitted by: <strong>${comp.userName} (${comp.userRole})</strong></p>
            </div>
        `;

        document.getElementById('comp-detail-content').innerHTML = html;
        
        // Show controls only if HOD or Admin
        const userRole = Store.getCurrentUser().role;
        const controlsDiv = document.getElementById('comp-admin-controls');
        if(userRole === 'hod' || userRole === 'admin') {
            controlsDiv.style.display = 'block';
        } else {
            controlsDiv.style.display = 'none';
        }

        document.getElementById('comp-detail-modal').classList.remove('hidden');
    },

    updateStatus(newStatus) {
        const complaints = Store.get('complaints', []);
        const idx = complaints.findIndex(c => c.id === this.currentCompId);
        if(idx === -1) return;

        complaints[idx].status = newStatus;
        Store.set('complaints', complaints);
        
        this.closeDetailModal();
        
        // Refresh Table
        const container = document.getElementById('complaints-list-container');
        if(container) {
            container.innerHTML = this.generateTableHtml(complaints, Store.getCurrentUser());
        }
    },

    closeDetailModal() {
        document.getElementById('comp-detail-modal').classList.add('hidden');
        this.currentCompId = null;
    }
};

window.ComplaintsModule = ComplaintsModule;
document.addEventListener('DOMContentLoaded', () => {
    ComplaintsModule.init();
});
