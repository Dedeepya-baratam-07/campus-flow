// complaints.js - Handles Complaint Routing Module with Firestore Integration
const ComplaintsModule = {
    state: {
        complaints: [],
        unsubscribe: null,
        currentCompId: null
    },

    init() {
        // Initialization handled during render or app start
    },

    render(container) {
        const user = window.app.state.user;
        if (!user) return container.innerHTML = "<p>Please log in to view complaints.</p>";

        container.innerHTML = `
            <div class="module-header flex justify-between items-center" style="margin-bottom: 2rem;">
                <h2 style="font-family: 'Orbitron', sans-serif; color: var(--primary-color);">Complaint Management System</h2>
                <button class="btn btn-primary" onclick="window.ComplaintsModule.openComplaintModal()"><i class="fa-solid fa-plus"></i> File New Case</button>
            </div>
            
            <div class="filter-bar flex gap-1" style="margin-bottom: 1.5rem; gap: 1rem;">
                <select id="comp-filter-category" class="form-control" style="width: 200px;" onchange="window.ComplaintsModule.filterList()">
                    <option value="all">All Categories</option>
                    <option value="Wifi">Wifi & Internet</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Classroom">Classroom & Infrastructure</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Cleanliness">Cleanliness</option>
                    <option value="Others">Others</option>
                </select>
                <select id="comp-filter-status" class="form-control" style="width: 200px;" onchange="window.ComplaintsModule.filterList()">
                    <option value="all">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="in progress">In Progress</option>
                    <option value="solved">Resolved</option>
                </select>
            </div>
            
            <div class="complaints-list" id="complaints-list-container" style="overflow-x: auto;">
                 <div class="loading-spinner" style="text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-cloud-arrow-down fa-spin fa-3x" style="color: var(--secondary-color)"></i>
                    <p style="margin-top: 1rem; color: var(--text-secondary)">Syncing with Cloud Database...</p>
                </div>
            </div>
            ${this.getModalHtml()}
        `;

        this.startListener(user);
    },

    startListener(user) {
        if (this.state.unsubscribe) this.state.unsubscribe();

        // Listen to all complaints (In a real app, students might only see theirs, but for demo we show all)
        const q = fb.qry(fb.col(fb.db, "complaints"), fb.ord("timestamp", "desc"));
        
        this.state.unsubscribe = fb.snap(q, (snapshot) => {
            this.state.complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.filterList();
        });
    },

    generateTableHtml(complaints) {
        if (complaints.length === 0) return `<div class="card"><p style="text-align: center; color: var(--text-secondary)">No records found.</p></div>`;

        let rowsHtml = complaints.map(c => {
            let statusBadge = '';
            if (c.status === 'solved') statusBadge = `<span class="badge badge-success">RESOLVED</span>`;
            else if (c.status === 'in progress') statusBadge = `<span class="badge" style="background: rgba(0, 188, 212, 0.2); color: #00bcd4; border: 1px solid #00bcd4;">IN PROGRESS</span>`;
            else statusBadge = `<span class="badge badge-warning">SUBMITTED</span>`;

            return `
            <tr onclick="window.ComplaintsModule.openDetailModal('${c.id}')" style="cursor: pointer; transition: background 0.2s;" class="table-row-hover">
                <td style="padding: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.05); font-family: monospace; font-size: 0.8rem; color: var(--text-secondary)">#${c.id.substring(0,6)}</td>
                <td style="padding: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.05);">${c.timestamp ? new Date(c.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}</td>
                <td style="padding: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 600; color: var(--primary-color)">${c.category}</td>
                <td style="padding: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.05); opacity: 0.8;">${c.description.substring(0, 50)}${c.description.length > 50 ? '...' : ''}</td>
                <td style="padding: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.05);">${c.userName}</td>
                <td style="padding: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.05);">${statusBadge}</td>
            </tr>
            `;
        }).join('');

        return `
        <table style="width: 100%; text-align: left; border-collapse: collapse; background: rgba(255,255,255,0.02); border-radius: var(--radius-lg); overflow: hidden; min-width: 800px;">
            <thead style="background: rgba(255,255,255,0.05); text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">
                <tr>
                    <th style="padding: 1.25rem;">UID</th>
                    <th style="padding: 1.25rem;">Date</th>
                    <th style="padding: 1.25rem;">Category</th>
                    <th style="padding: 1.25rem;">Description snippet</th>
                    <th style="padding: 1.25rem;">User</th>
                    <th style="padding: 1.25rem;">Status</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
        `;
    },

    filterList() {
        const category = document.getElementById('comp-filter-category')?.value || 'all';
        const status = document.getElementById('comp-filter-status')?.value || 'all';
        
        let filtered = this.state.complaints.filter(c => {
            const matchCat = category === 'all' || c.category === category;
            const matchStatus = status === 'all' || c.status === status;
            return matchCat && matchStatus;
        });
        
        const container = document.getElementById('complaints-list-container');
        if (container) {
            container.innerHTML = this.generateTableHtml(filtered);
        }
    },

    getModalHtml() {
        const user = window.app.state.user || { role: 'student' };
        return `
            <div id="complaint-modal" class="modal hidden">
                <div class="modal-content card" style="border: 1px solid var(--secondary-color)">
                    <div class="modal-header flex justify-between items-center" style="border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                        <h3 style="color: var(--secondary-color)">File a Formal Complaint</h3>
                        <button class="btn-icon" onclick="window.ComplaintsModule.closeComplaintModal()"><i class="fa-solid fa-times"></i></button>
                    </div>
                    <form id="file-complaint-form" onsubmit="window.ComplaintsModule.submitComplaint(event)" style="padding-top: 1rem;">
                        <div class="form-group">
                            <label>Context Category</label>
                            <select id="comp-category" class="form-control" required>
                                <option value="Wifi">Wifi & Internet</option>
                                <option value="Electricity">Electricity</option>
                                <option value="Classroom">Classroom & Infrastructure</option>
                                <option value="Facilities">Facilities</option>
                                <option value="Cleanliness">Cleanliness</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Incident / Issue Description</label>
                            <textarea id="comp-desc" class="form-control" rows="4" required placeholder="Provide clear details for the HOD..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Impact Level</label>
                            <select id="comp-priority" class="form-control">
                                <option value="normal">Normal</option>
                                <option value="high">High (Immediate Action Required)</option>
                            </select>
                        </div>
                        <div class="modal-footer flex justify-end gap-1" style="margin-top: 1.5rem;">
                            <button type="button" class="btn btn-outline" onclick="window.ComplaintsModule.closeComplaintModal()">Cancel</button>
                            <button type="submit" id="comp-submit-btn" class="btn btn-primary" style="background: var(--secondary-color)">File Complaint</button>
                        </div>
                    </form>
                </div>
            </div>

            <div id="comp-detail-modal" class="modal hidden">
                <div class="modal-content card" style="max-width: 550px; border: 1px solid var(--primary-color)">
                    <div class="modal-header flex justify-between items-center" style="border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                        <h3 style="color: var(--primary-color)">Case Investigation</h3>
                        <button class="btn-icon" onclick="window.ComplaintsModule.closeDetailModal()"><i class="fa-solid fa-times"></i></button>
                    </div>
                    <div id="comp-detail-content" style="padding: 1.5rem 0;">
                        <!-- Injected by JS -->
                    </div>
                    
                    ${user.role === 'hod' || user.role === 'admin' ? `
                    <div id="comp-admin-controls" style="border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
                        <h4 style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase;">Cloud Authority Actions</h4>
                        <div class="flex gap-1">
                            <button class="btn btn-outline" onclick="window.ComplaintsModule.updateStatus('in progress')" style="color: #00bcd4; border-color: #00bcd4; flex: 1;">Acknowledge</button>
                            <button class="btn btn-primary" onclick="window.ComplaintsModule.updateStatus('solved')" style="background-color: var(--secondary-color); flex: 1;">Resolve Case</button>
                        </div>
                    </div>
                    ` : ''}
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

    async submitComplaint(e) {
        e.preventDefault();
        const user = window.app.state.user;
        const btn = document.getElementById('comp-submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-sync fa-spin"></i> Filing...';

        const newComp = {
            userId: user.uid,
            userName: user.fullName || user.email,
            userRole: user.role,
            category: document.getElementById('comp-category').value,
            description: document.getElementById('comp-desc').value,
            priority: document.getElementById('comp-priority').value,
            status: 'submitted',
            timestamp: fb.ts()
        };

        try {
            await fb.add(fb.col(fb.db, "complaints"), newComp);
            window.app.showToast("Formal complaint filed successfully!");
            this.closeComplaintModal();
            document.getElementById('file-complaint-form').reset();
        } catch (err) {
            console.error(err);
            window.app.showToast("Cloud sync error: " + err.message, "danger");
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'File Complaint';
        }
    },

    openDetailModal(id) {
        this.state.currentCompId = id;
        const comp = this.state.complaints.find(c => c.id === id);
        if (!comp) return;

        let html = `
            <div style="margin-bottom: 1rem;">
                <div class="flex justify-between items-start" style="margin-bottom: 1.5rem;">
                    <div>
                        <h4 style="font-size: 1.5rem; color: var(--text-primary);">${comp.category}</h4>
                        <p style="color: var(--text-secondary); font-size: 0.8rem;">Case ID: #${comp.id} | ${comp.timestamp ? new Date(comp.timestamp.seconds * 1000).toLocaleString() : 'Just now'}</p>
                    </div>
                    <div class="flex flex-column items-end gap-0.5">
                        <span class="badge ${comp.status === 'solved' ? 'badge-success' : 'badge-warning'}">${comp.status.toUpperCase()}</span>
                        ${comp.priority === 'high' ? '<span class="badge badge-danger">High Impact</span>' : ''}
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.05); color: var(--text-primary);">
                    <p style="white-space: pre-line; line-height: 1.6;">${comp.description}</p>
                </div>
                <div style="margin-top: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary-color); display: flex; items-center; justify-center; font-weight: bold; font-size: 0.8rem;">${comp.userName.charAt(0)}</div>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">Filed by <strong>${comp.userName}</strong> (${comp.userRole.toUpperCase()})</p>
                </div>
            </div>
        `;

        const content = document.getElementById('comp-detail-content');
        if (content) content.innerHTML = html;
        document.getElementById('comp-detail-modal').classList.remove('hidden');
    },

    async updateStatus(newStatus) {
        if (!this.state.currentCompId) return;
        try {
            await fb.upd(fb.docRef(fb.db, "complaints", this.state.currentCompId), { status: newStatus });
            window.app.showToast("Cloud status updated!");
            this.closeDetailModal();
        } catch (err) {
            console.error(err);
            window.app.showToast("Failed to update cloud status", "danger");
        }
    },

    closeDetailModal() {
        document.getElementById('comp-detail-modal')?.classList.add('hidden');
        this.state.currentCompId = null;
    },

    closeComplaintModal() {
        document.getElementById('complaint-modal')?.classList.add('hidden');
    }
};

window.ComplaintsModule = ComplaintsModule;
