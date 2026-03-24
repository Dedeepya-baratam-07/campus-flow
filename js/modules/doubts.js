// doubts.js - Handles Doubt Solving Module
const DoubtsModule = {
    init() {
        if (!Store.get('doubts')) {
            Store.set('doubts', [
                { id: 1, studentName: 'Student User', subject: 'Math', lecturer: 'Dr. Smith', title: 'Calculus Integration', description: 'I don\'t understand step 2.', status: 'pending', priority: 'high', timestamp: new Date().toISOString(), replies: [] }
            ]);
        }
    },

    render(container) {
        const user = Store.getCurrentUser();
        const doubts = Store.get('doubts', []);
        
        let headerHtml = `
            <div class="module-header flex justify-between items-center" style="margin-bottom: 2rem;">
                <h2>Doubt Solving Module</h2>
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
        `;

        // Render List
        let listHtml = `<div class="doubts-list" id="doubts-list-container">
            ${this.generateListHtml(doubts, user)}
        </div>`;

        container.innerHTML = headerHtml + listHtml + this.getModalHtml();
    },

    generateListHtml(doubts, user) {
        if(doubts.length === 0) return `<p>No doubts found.</p>`;

        return doubts.map(d => `
            <div class="card doubt-card" onclick="window.DoubtsModule.openThread(${d.id})" style="cursor: pointer; margin-bottom: 1rem;">
                <div class="flex justify-between items-center" style="margin-bottom: 0.5rem;">
                    <div class="badges">
                        <span class="badge ${d.status === 'solved' ? 'badge-success' : 'badge-warning'}">${d.status.toUpperCase()}</span>
                        ${d.priority === 'high' ? '<span class="badge badge-danger">High Priority</span>' : ''}
                    </div>
                    <small style="color: var(--text-secondary)">${new Date(d.timestamp).toLocaleDateString()}</small>
                </div>
                <h3 style="margin-bottom: 0.5rem; color: var(--primary-color);">${d.title}</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">Subject: ${d.subject} | To: ${d.lecturer} | From: ${d.studentName}</p>
                <p style="color: var(--text-primary);">${d.description}</p>
            </div>
        `).join('');
    },

    filterList() {
        const doubts = Store.get('doubts', []);
        const status = document.getElementById('filter-status').value;
        const search = document.getElementById('filter-search').value.toLowerCase();
        
        let filtered = doubts.filter(d => {
            const matchStatus = status === 'all' || d.status === status;
            const matchSearch = d.title.toLowerCase().includes(search) || d.subject.toLowerCase().includes(search);
            return matchStatus && matchSearch;
        });
        
        const container = document.getElementById('doubts-list-container');
        if(container) {
            container.innerHTML = this.generateListHtml(filtered, Store.getCurrentUser());
        }
    },

    getModalHtml() {
        return `
            <div id="doubt-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header flex justify-between items-center">
                        <h3>Ask a Doubt</h3>
                        <button class="btn-icon" onclick="window.DoubtsModule.closeModal()"><i class="fa-solid fa-times"></i></button>
                    </div>
                    <form id="ask-doubt-form" onsubmit="window.DoubtsModule.submitDoubt(event)">
                        <div class="form-group">
                            <label>Subject</label>
                            <input type="text" id="doubt-subject" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>Lecturer Name</label>
                            <input type="text" id="doubt-lecturer" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>Title</label>
                            <input type="text" id="doubt-title" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="doubt-desc" class="form-control" rows="4" required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Priority</label>
                            <select id="doubt-priority" class="form-control">
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div class="modal-footer" style="margin-top: 1.5rem; text-align: right;">
                            <button type="button" class="btn btn-outline" onclick="window.DoubtsModule.closeModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Submit Doubt</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Thread Modal -->
            <div id="thread-modal" class="modal hidden">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header flex justify-between items-center">
                        <h3>Doubt Thread</h3>
                        <div class="flex items-center gap-1">
                            ${Store.getCurrentUser().role === 'lecturer' ? '<button class="btn btn-outline btn-sm" onclick="window.DoubtsModule.markSolved()">Mark Solved</button>' : ''}
                            <button class="btn-icon" onclick="window.DoubtsModule.closeThread()"><i class="fa-solid fa-times"></i></button>
                        </div>
                    </div>
                    <div id="thread-content" style="max-height: 400px; overflow-y: auto; margin-bottom: 1rem; padding-right: 0.5rem;">
                        <!-- Injected by JS -->
                    </div>
                    <div class="reply-box flex gap-1 items-center">
                        <input type="text" id="reply-input" class="form-control" placeholder="Type a reply...">
                        <button class="btn btn-primary" onclick="window.DoubtsModule.addReply()"><i class="fa-solid fa-paper-plane"></i></button>
                    </div>
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

    submitDoubt(e) {
        e.preventDefault();
        const doubts = Store.get('doubts', []);
        const newDoubt = {
            id: Date.now(),
            studentName: Store.getCurrentUser().role.toUpperCase() + ' User', 
            subject: document.getElementById('doubt-subject').value,
            lecturer: document.getElementById('doubt-lecturer').value,
            title: document.getElementById('doubt-title').value,
            description: document.getElementById('doubt-desc').value,
            priority: document.getElementById('doubt-priority').value,
            status: 'pending',
            timestamp: new Date().toISOString(),
            replies: []
        };
        doubts.unshift(newDoubt);
        Store.set('doubts', doubts);
        this.closeModal();
        app.loadView('doubts', 'Doubts'); 
    },

    openThread(id) {
        this.currentThreadId = id;
        this.renderThreadContent();
        document.getElementById('thread-modal').classList.remove('hidden');
    },

    renderThreadContent() {
        const doubts = Store.get('doubts', []);
        const doubt = doubts.find(d => d.id === this.currentThreadId);
        if(!doubt) return;

        let html = `
            <div style="background: var(--background-light); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
                <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">${doubt.title} <span class="badge ${doubt.status === 'solved' ? 'badge-success' : 'badge-warning'}">${doubt.status}</span></h4>
                <p><strong>${doubt.subject}</strong> | To: ${doubt.lecturer}</p>
                <p style="margin-top: 0.5rem;">${doubt.description}</p>
            </div>
            <h4>Replies</h4>
            <div class="replies" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                ${doubt.replies.length === 0 ? '<p style="color: var(--text-secondary)">No replies yet.</p>' : ''}
                ${doubt.replies.map(r => `
                    <div style="background: ${r.role === 'lecturer' ? '#E0E7FF' : '#F3F4F6'}; padding: 0.75rem; border-radius: var(--radius-md);">
                        <p style="font-size: 0.8rem; font-weight: bold; color: var(--text-secondary);">${r.role.toUpperCase()} - ${new Date(r.timestamp).toLocaleString()}</p>
                        <p>${r.text}</p>
                    </div>
                `).join('')}
            </div>
        `;
        document.getElementById('thread-content').innerHTML = html;
    },

    addReply() {
        const input = document.getElementById('reply-input');
        const text = input.value.trim();
        if(!text) return;

        const doubts = Store.get('doubts', []);
        const doubtIndex = doubts.findIndex(d => d.id === this.currentThreadId);
        if(doubtIndex === -1) return;

        doubts[doubtIndex].replies.push({
            role: Store.getCurrentUser().role,
            text,
            timestamp: new Date().toISOString()
        });

        Store.set('doubts', doubts);
        input.value = '';
        this.renderThreadContent(); 

        const container = document.getElementById('doubts-list-container');
        if(container) {
            container.innerHTML = this.generateListHtml(doubts, Store.getCurrentUser());
        }
    },

    markSolved() {
        const doubts = Store.get('doubts', []);
        const doubtIndex = doubts.findIndex(d => d.id === this.currentThreadId);
        if(doubtIndex === -1) return;

        doubts[doubtIndex].status = 'solved';
        Store.set('doubts', doubts);
        this.renderThreadContent();
        
        const container = document.getElementById('doubts-list-container');
        if(container) {
            container.innerHTML = this.generateListHtml(doubts, Store.getCurrentUser());
        }
    },

    closeThread() {
        document.getElementById('thread-modal').classList.add('hidden');
        this.currentThreadId = null;
    }
};

window.DoubtsModule = DoubtsModule;
document.addEventListener('DOMContentLoaded', () => {
    DoubtsModule.init();
});
