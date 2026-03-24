// classrooms.js - Handles Free Classroom Finder Module
const ClassroomsModule = {
    init() {
        if (!Store.get('classrooms')) {
            Store.set('classrooms', [
                { id: '101', name: 'Room 101 (CS Lab)', capacity: 60, status: 'occupied', occupiedBy: 'Dr. Smith - AI Class' },
                { id: '102', name: 'Room 102 (Theory)', capacity: 40, status: 'free', occupiedBy: null },
                { id: '201', name: 'Room 201 (Workshop)', capacity: 30, status: 'free', occupiedBy: null },
                { id: '202', name: 'Room 202 (Lecture Hall)', capacity: 120, status: 'occupied', occupiedBy: 'Prof. Johnson - Physics' },
                { id: '301', name: 'Room 301 (Meeting Room)', capacity: 15, status: 'free', occupiedBy: null }
            ]);
        }
    },

    render(container) {
        const user = Store.getCurrentUser();
        const rooms = Store.get('classrooms', []);
        
        let headerHtml = `
            <div class="module-header flex justify-between items-center" style="margin-bottom: 2rem;">
                <h2>Free Classroom Finder</h2>
                <div class="flex gap-1 items-center">
                    <span class="badge badge-success">Free: ${rooms.filter(r=>r.status==='free').length}</span>
                    <span class="badge badge-danger">Occupied: ${rooms.filter(r=>r.status==='occupied').length}</span>
                </div>
            </div>
            
            <div class="filter-bar flex gap-1" style="margin-bottom: 1.5rem;">
                <select id="room-filter-status" class="form-control" style="width: 200px;" onchange="window.ClassroomsModule.filterRooms()">
                    <option value="all">All Rooms</option>
                    <option value="free">Free Only</option>
                    <option value="occupied">Occupied Only</option>
                </select>
            </div>
        `;

        let gridHtml = `<div class="room-grid" id="room-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
            ${this.generateGridHtml(rooms, user)}
        </div>`;

        container.innerHTML = headerHtml + gridHtml + this.getModalHtml();
    },

    generateGridHtml(rooms, user) {
        if(rooms.length === 0) return `<p>No rooms found.</p>`;

        return rooms.map(r => `
            <div class="card" style="border-top: 4px solid ${r.status === 'free' ? 'var(--secondary-color)' : 'var(--danger-color)'};">
                <div class="flex justify-between items-center" style="margin-bottom: 1rem;">
                    <h3 style="margin: 0; color: var(--text-primary);">${r.name}</h3>
                    <span class="badge ${r.status === 'free' ? 'badge-success' : 'badge-danger'}">
                        ${r.status.toUpperCase()}
                    </span>
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 0.5rem;"><i class="fa-solid fa-users"></i> Capacity: ${r.capacity}</p>
                
                ${r.status === 'occupied' ? 
                    `<p style="color: var(--text-primary);"><i class="fa-solid fa-chalkboard-user"></i> ${r.occupiedBy}</p>` 
                    : `<p style="color: var(--secondary-color); font-weight: 500;"><i class="fa-solid fa-check"></i> Available Now</p>`
                }

                ${(r.status === 'free' && (user.role === 'lecturer' || user.role === 'admin' || user.role === 'hod')) ? 
                    `<div style="margin-top: 1.5rem;">
                        <button class="btn btn-outline" style="width: 100%; justify-content: center;" onclick="window.ClassroomsModule.openModal('${r.id}')">Reserve Room</button>
                    </div>` : ''}
                    
                ${(r.status === 'occupied' && (user.role === 'admin' || user.role === 'hod')) ? 
                    `<div style="margin-top: 1.5rem;">
                        <button class="btn btn-outline" style="width: 100%; justify-content: center; color: var(--danger-color); border-color: var(--danger-color);" onclick="window.ClassroomsModule.freeRoom('${r.id}')">Mark as Free</button>
                    </div>` : ''}
            </div>
        `).join('');
    },

    filterRooms() {
        const rooms = Store.get('classrooms', []);
        const status = document.getElementById('room-filter-status').value;
        const filtered = status === 'all' ? rooms : rooms.filter(r => r.status === status);
        
        const container = document.getElementById('room-grid-container');
        if(container) {
            container.innerHTML = this.generateGridHtml(filtered, Store.getCurrentUser());
        }
    },

    getModalHtml() {
        return `
            <div id="room-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header flex justify-between items-center">
                        <h3>Reserve Room</h3>
                        <button class="btn-icon" onclick="window.ClassroomsModule.closeModal()"><i class="fa-solid fa-times"></i></button>
                    </div>
                    <form onsubmit="window.ClassroomsModule.submitRequest(event)">
                        <div class="form-group">
                            <label>Purpose / Occupied By</label>
                            <input type="text" id="room-purpose" class="form-control" placeholder="E.g., Special Lecture by Dr. Watson" required>
                        </div>
                        <div class="modal-footer" style="margin-top: 1.5rem; text-align: right;">
                            <button type="button" class="btn btn-outline" onclick="window.ClassroomsModule.closeModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Reserve Room</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    openModal(id) {
        this.currentRoomId = id;
        document.getElementById('room-modal').classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('room-modal').classList.add('hidden');
        this.currentRoomId = null;
    },

    submitRequest(e) {
        e.preventDefault();
        const rooms = Store.get('classrooms', []);
        const purpose = document.getElementById('room-purpose').value;
        
        const idx = rooms.findIndex(r => r.id === this.currentRoomId);
        if(idx !== -1) {
            rooms[idx].status = 'occupied';
            rooms[idx].occupiedBy = purpose;
            Store.set('classrooms', rooms);
        }
        
        this.closeModal();
        app.loadView('classrooms', 'Classrooms');
    },

    freeRoom(id) {
        if(confirm('Warning: Admin/HOD override. Mark this room as free?')) {
            const rooms = Store.get('classrooms', []);
            const idx = rooms.findIndex(r => r.id === id);
            if(idx !== -1) {
                rooms[idx].status = 'free';
                rooms[idx].occupiedBy = null;
                Store.set('classrooms', rooms);
                app.loadView('classrooms', 'Classrooms');
            }
        }
    }
};
window.ClassroomsModule = ClassroomsModule;
document.addEventListener('DOMContentLoaded', () => ClassroomsModule.init());
