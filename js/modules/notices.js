// notices.js - Handles Smart Notice Board Module
const NoticesModule = {
    init() {
        if (!Store.get('notices')) {
            Store.set('notices', [
                { id: 1, title: 'Exam Schedule Released', content: 'Mid-term exams will start from 15th April. Check the portal for details.', author: 'Admin', urgent: true, timestamp: new Date().toISOString() },
                { id: 2, title: 'Hackathon Registration', content: 'Register for the upcoming coding hackathon by Friday.', author: 'HOD', urgent: false, timestamp: new Date(Date.now() - 86400000).toISOString() }
            ]);
        }
    },

    render(container) {
        const user = Store.getCurrentUser();
        const notices = Store.get('notices', []);
        
        let headerHtml = `
            <div class="module-header flex justify-between items-center" style="margin-bottom: 2rem;">
                <h2>Smart Notice Board</h2>
                ${(user.role === 'admin' || user.role === 'hod' || user.role === 'lecturer') ? 
                    '<button class="btn btn-primary" onclick="window.NoticesModule.openModal()"><i class="fa-solid fa-bullhorn"></i> Post Notice</button>' : ''}
            </div>
        `;

        let listHtml = `<div class="notices-list" id="notices-list-container" style="display: flex; flex-direction: column; gap: 1rem;">
            ${this.generateListHtml(notices, user)}
        </div>`;

        container.innerHTML = headerHtml + listHtml + this.getModalHtml();
    },

    generateListHtml(notices, user) {
        if(notices.length === 0) return `<p>No recent notices.</p>`;

        return notices.map(n => `
            <div class="card" style="border-left: 4px solid ${n.urgent ? 'var(--danger-color)' : 'var(--primary-color)'};">
                <div class="flex justify-between items-center">
                    <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">
                        ${n.urgent ? '<i class="fa-solid fa-circle-exclamation" style="color: var(--danger-color);"></i> ' : ''}
                        ${n.title}
                    </h3>
                    <small style="color: var(--text-secondary)">${new Date(n.timestamp).toLocaleDateString()}</small>
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">Posted by: <strong>${n.author}</strong></p>
                <p style="color: var(--text-primary); white-space: pre-wrap;">${n.content}</p>
                ${(user.role === 'admin' || user.role === 'hod') ? 
                    `<div style="text-align: right; margin-top: 1rem;">
                        <button class="btn btn-outline btn-sm" style="color: var(--danger-color); border-color: var(--danger-color);" onclick="window.NoticesModule.deleteNotice(${n.id})"><i class="fa-solid fa-trash"></i> Delete</button>
                    </div>` : ''}
            </div>
        `).join('');
    },

    getModalHtml() {
        return `
            <div id="notice-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header flex justify-between items-center">
                        <h3>Post New Notice</h3>
                        <button class="btn-icon" onclick="window.NoticesModule.closeModal()"><i class="fa-solid fa-times"></i></button>
                    </div>
                    <form onsubmit="window.NoticesModule.submitNotice(event)">
                        <div class="form-group">
                            <label>Title</label>
                            <input type="text" id="notice-title" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>Content</label>
                            <textarea id="notice-content" class="form-control" rows="4" required></textarea>
                        </div>
                        <div class="form-group" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem;">
                            <input type="checkbox" id="notice-urgent" style="width: 18px; height: 18px;">
                            <label style="margin-bottom: 0;">Mark as Urgent</label>
                        </div>
                        <div class="modal-footer" style="margin-top: 1.5rem; text-align: right;">
                            <button type="button" class="btn btn-outline" onclick="window.NoticesModule.closeModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Post Notice</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    openModal() {
        document.getElementById('notice-modal').classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('notice-modal').classList.add('hidden');
    },

    submitNotice(e) {
        e.preventDefault();
        const notices = Store.get('notices', []);
        const user = Store.getCurrentUser();
        
        const newNotice = {
            id: Date.now(),
            title: document.getElementById('notice-title').value,
            content: document.getElementById('notice-content').value,
            urgent: document.getElementById('notice-urgent').checked,
            author: user.role.toUpperCase(),
            timestamp: new Date().toISOString()
        };
        
        notices.unshift(newNotice);
        Store.set('notices', notices);
        this.closeModal();
        app.loadView('notices', 'Notices');
    },

    deleteNotice(id) {
        if(confirm('Are you sure you want to delete this notice?')) {
            let notices = Store.get('notices', []);
            notices = notices.filter(n => n.id !== id);
            Store.set('notices', notices);
            app.loadView('notices', 'Notices');
        }
    }
};
window.NoticesModule = NoticesModule;
document.addEventListener('DOMContentLoaded', () => NoticesModule.init());
