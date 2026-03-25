// doubts.js - Handles Doubt Solving Module with Firestore Integration
const DoubtsModule = {
    state: {
        doubts: [],
        unsubscribe: null,
        currentThreadId: null
    },

    init() {
        // Initialization handled during render or app start
    },

    render(container) {
        const user = window.app.state.user;
        if (!user) return container.innerHTML = "<p>Please log in to view doubts.</p>";

        container.innerHTML = `
            <div class="module-header flex justify-between items-center" style="margin-bottom: 2rem;">
                <h2 style="font-family: 'Orbitron', sans-serif; color: var(--primary-color);">Doubt Solving Portal</h2>
                ${user.role === 'student' ? '<button class="btn btn-primary" onclick="window.DoubtsModule.openAskModal()"><i class="fa-solid fa-plus"></i> Ask Doubt</button>' : ''}
            </div>
            
            <div class="filter-bar flex gap-1" style="margin-bottom: 1.5rem; gap: 1rem;">
                <select id="filter-status" class="form-control" style="width: 200px;" onchange="window.DoubtsModule.filterList()">
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="solved">Solved</option>
                </select>
                <input type="text" id="filter-search" class="form-control" placeholder="Search subject or title..." onkeyup="window.DoubtsModule.filterList()">
            </div>
            
            <div class="doubts-list" id="doubts-list-container">
                <div class="loading-spinner" style="text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-spinner fa-spin fa-3x" style="color: var(--primary-color)"></i>
                    <p style="margin-top: 1rem; color: var(--text-secondary)">Loading from Cloud...</p>
                </div>
            </div>
            ${this.getModalHtml()}
        `;

        this.startListener(user);
    },

    startListener(user) {
        if (this.state.unsubscribe) this.state.unsubscribe();

        const q = fb.qry(fb.col(fb.db, "doubts"), fb.ord("timestamp", "desc"));
        
        this.state.unsubscribe = fb.snap(q, (snapshot) => {
            this.state.doubts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.filterList();
            
            if (this.state.currentThreadId) {
                this.renderThreadContent();
            }
        });
    },

    generateListHtml(doubts) {
        if (doubts.length === 0) return `<div class="card"><p style="text-align: center; color: var(--text-secondary)">No doubts found in this category.</p></div>`;

        return doubts.map(d => `
            <div class="card doubt-card" onclick="window.DoubtsModule.openThread('${d.id}')" style="cursor: pointer; margin-bottom: 1rem; transition: transform 0.2s;">
                <div class="flex justify-between items-center" style="margin-bottom: 0.75rem;">
                    <div class="badges">
                        <span class="badge ${d.status === 'solved' ? 'badge-success' : 'badge-warning'}">${d.status.toUpperCase()}</span>
                        ${d.priority === 'high' ? '<span class="badge badge-danger" style="box-shadow: 0 0 10px rgba(239, 68, 68, 0.4)">URGENT</span>' : ''}
                    </div>
                    <small style="color: var(--text-secondary); font-family: monospace;">${d.timestamp ? new Date(d.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}</small>
                </div>
                <h3 style="margin-bottom: 0.5rem; color: var(--primary-color); font-family: 'Outfit', sans-serif;">${d.title}</h3>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem; display: flex; gap: 1rem;">
                    <span><i class="fa-solid fa-book"></i> ${d.subject}</span>
                    <span><i class="fa-solid fa-user-graduate"></i> From: ${d.studentName}</span>
                </div>
                <p style="color: var(--text-primary); line-height: 1.5; opacity: 0.9;">${d.description.length > 150 ? d.description.substring(0, 150) + '...' : d.description}</p>
            </div>
        `).join('');
    },

    filterList() {
        const status = document.getElementById('filter-status')?.value || 'all';
        const search = document.getElementById('filter-search')?.value.toLowerCase() || '';
        
        let filtered = this.state.doubts.filter(d => {
            const matchStatus = status === 'all' || d.status === status;
            const matchSearch = d.title.toLowerCase().includes(search) || d.subject.toLowerCase().includes(search);
            return matchStatus && matchSearch;
        });
        
        const container = document.getElementById('doubts-list-container');
        if (container) {
            container.innerHTML = this.generateListHtml(filtered);
        }
    },

    getModalHtml() {
        const user = window.app.state.user || { role: 'student' };
        return `
            <div id="doubt-modal" class="modal hidden">
                <div class="modal-content card" style="border: 1px solid var(--primary-color)">
                    <div class="modal-header flex justify-between items-center" style="border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                        <h3 style="color: var(--primary-color)">Ask a New Doubt</h3>
                        <button class="btn-icon" onclick="window.DoubtsModule.closeModal()"><i class="fa-solid fa-times"></i></button>
                    </div>
                    <form id="ask-doubt-form" onsubmit="window.DoubtsModule.submitDoubt(event)" style="padding-top: 1rem;">
                        <div class="grid grid-2 gap-1">
                            <div class="form-group">
                                <label>Subject</label>
                                <input type="text" id="doubt-subject" class="form-control" placeholder="e.g. Physics II" required>
                            </div>
                            <div class="form-group">
                                <label>Target Lecturer</label>
                                <input type="text" id="doubt-lecturer" class="form-control" placeholder="Names of lecturer" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Short Title</label>
                            <input type="text" id="doubt-title" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>Detailed Problem</label>
                            <textarea id="doubt-desc" class="form-control" rows="4" required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Priority Level</label>
                            <select id="doubt-priority" class="form-control">
                                <option value="normal">Routine (Normal)</option>
                                <option value="high">Critical (High)</option>
                            </select>
                        </div>
                        <div class="modal-footer flex justify-end gap-1" style="margin-top: 1.5rem;">
                            <button type="button" class="btn btn-outline" onclick="window.DoubtsModule.closeModal()">Cancel</button>
                            <button type="submit" id="doubt-submit-btn" class="btn btn-primary">Publish to Cloud</button>
                        </div>
                    </form>
                </div>
            </div>

            <div id="thread-modal" class="modal hidden">
                <div class="modal-content card" style="max-width: 700px; border: 1px solid var(--secondary-color)">
                    <div class="modal-header flex justify-between items-center" style="border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                        <h3 style="color: var(--secondary-color)">Cloud Discussion Thread</h3>
                        <button class="btn-icon" onclick="window.DoubtsModule.closeThread()"><i class="fa-solid fa-times"></i></button>
                    </div>
                    <div id="thread-content" style="max-height: 50vh; overflow-y: auto; padding: 1rem 0; margin-bottom: 1rem;">
                        <!-- Discussion injected by snapshot -->
                    </div>
                    <div class="reply-section flex gap-1" style="border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
                        <input type="text" id="reply-input" class="form-control" placeholder="Contribute to discussion...">
                        <button class="btn btn-primary" onclick="window.DoubtsModule.addReply()"><i class="fa-solid fa-paper-plane"></i></button>
                    </div>
                    ${user.role === 'lecturer' || user.role === 'admin' ? `
                    <div style="margin-top: 1rem; text-align: center;">
                        <button class="btn btn-outline btn-sm" onclick="window.DoubtsModule.markSolved()">Mark as Resolved</button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    openAskModal() {
        document.getElementById('doubt-modal').classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('doubt-modal').classList.add('hidden');
    },

    async submitDoubt(e) {
        e.preventDefault();
        const user = window.app.state.user;
        const btn = document.getElementById('doubt-submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Finalizing...';

        const newDoubt = {
            studentId: user.uid,
            studentName: user.fullName || user.email,
            subject: document.getElementById('doubt-subject').value,
            lecturer: document.getElementById('doubt-lecturer').value,
            title: document.getElementById('doubt-title').value,
            description: document.getElementById('doubt-desc').value,
            priority: document.getElementById('doubt-priority').value,
            status: 'pending',
            timestamp: fb.ts(),
            replies: []
        };

        try {
            await fb.add(fb.col(fb.db, "doubts"), newDoubt);
            window.app.showToast("Doubt published to Cloud successfully!");
            this.closeModal();
            document.getElementById('ask-doubt-form').reset();
        } catch (err) {
            console.error(err);
            window.app.showToast("Error publishing doubt: " + err.message, "danger");
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Publish to Cloud';
        }
    },

    openThread(id) {
        this.state.currentThreadId = id;
        this.renderThreadContent();
        document.getElementById('thread-modal').classList.remove('hidden');
    },

    renderThreadContent() {
        const doubt = this.state.doubts.find(d => d.id === this.state.currentThreadId);
        const container = document.getElementById('thread-content');
        if (!doubt || !container) return;

        let html = `
            <div style="background: rgba(255,255,255,0.03); padding: 1.5rem; border-radius: var(--radius-md); margin-bottom: 2rem; border-left: 4px solid var(--primary-color);">
                <div class="flex justify-between items-start" style="margin-bottom: 1rem;">
                    <div>
                        <h4 style="color: var(--primary-color); font-size: 1.25rem;">${doubt.title}</h4>
                        <p style="font-size: 0.9rem; color: var(--text-secondary)">Subject: ${doubt.subject} | To: ${doubt.lecturer}</p>
                    </div>
                    <span class="badge ${doubt.status === 'solved' ? 'badge-success' : 'badge-warning'}">${doubt.status.toUpperCase()}</span>
                </div>
                <p style="color: var(--text-primary); white-space: pre-line;">${doubt.description}</p>
            </div>
            
            <h4 style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Cloud Replies (${doubt.replies.length})</h4>
            <div class="replies flex flex-column gap-1">
                ${doubt.replies.length === 0 ? '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No replies yet. Start the conversation!</p>' : ''}
                ${doubt.replies.map(r => `
                    <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.05);">
                        <div class="flex justify-between" style="margin-bottom: 0.5rem;">
                            <span style="font-weight: 700; color: var(--secondary-color); font-size: 0.8rem;">${r.name} (${r.role.toUpperCase()})</span>
                            <small style="color: var(--text-secondary)">Cloud-Sync</small>
                        </div>
                        <p style="color: var(--text-primary)">${r.text}</p>
                    </div>
                `).join('')}
            </div>
        `;
        container.innerHTML = html;
        container.scrollTop = container.scrollHeight;
    },

    async addReply() {
        const input = document.getElementById('reply-input');
        const text = input.value.trim();
        if (!text) return;

        const user = window.app.state.user;
        const doubt = this.state.doubts.find(d => d.id === this.state.currentThreadId);
        
        const updatedReplies = [...doubt.replies, {
            uid: user.uid,
            name: user.fullName || user.email,
            role: user.role,
            text,
            timestamp: new Date().toISOString()
        }];

        try {
            await fb.upd(fb.docRef(fb.db, "doubts", doubt.id), { replies: updatedReplies });
            input.value = '';
        } catch (err) {
            console.error(err);
            window.app.showToast("Failed to sync reply", "danger");
        }
    },

    async markSolved() {
        try {
            await fb.upd(fb.docRef(fb.db, "doubts", this.state.currentThreadId), { status: 'solved' });
            window.app.showToast("Thread marked as resolved!");
        } catch (err) {
            console.error(err);
        }
    },

    closeThread() {
        document.getElementById('thread-modal')?.classList.add('hidden');
        this.state.currentThreadId = null;
    },

    closeModal() {
        document.getElementById('doubt-modal')?.classList.add('hidden');
    }
};

window.DoubtsModule = DoubtsModule;
