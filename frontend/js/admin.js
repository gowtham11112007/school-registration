const API_BASE_URL = window.API_URL || 'http://localhost:5002';
let adminKey = localStorage.getItem('adminKey');

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Check if already logged in
    if (adminKey) {
        showDashboard();
    }
    
    // Search and filter event listeners
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(loadRegistrations, 300));
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', loadRegistrations);
    }
});

function handleLogin(e) {
    e.preventDefault();
    
    const keyInput = document.getElementById('adminKey');
    adminKey = keyInput.value;
    
    if (adminKey) {
        localStorage.setItem('adminKey', adminKey);
        showDashboard();
    }
}

function showDashboard() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.remove('hidden');
    loadRegistrations();
}

function logout() {
    localStorage.removeItem('adminKey');
    adminKey = null;
    document.getElementById('dashboardSection').classList.add('hidden');
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('adminKey').value = '';
}

async function loadRegistrations() {
    const tableBody = document.getElementById('registrationsTableBody');
    tableBody.innerHTML = '<tr><td colspan="9">Loading...</td></tr>';
    
    try {
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        
        let url = `${API_BASE_URL}/api/registrations`;
        const params = new URLSearchParams();
        
        if (searchInput && searchInput.value) {
            params.append('search', searchInput.value);
        }
        
        if (statusFilter && statusFilter.value) {
            params.append('status', statusFilter.value);
        }
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${adminKey}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayRegistrations(result.registrations);
            updateStats(result.registrations);
        } else {
            tableBody.innerHTML = '<tr><td colspan="9">Failed to load registrations</td></tr>';
        }
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="9">Error loading registrations</td></tr>';
    }
}

function displayRegistrations(registrations) {
    const tableBody = document.getElementById('registrationsTableBody');
    
    if (!registrations || registrations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9">No registrations found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = registrations.map(reg => `
        <tr>
            <td>${escapeHtml(reg.registration_id)}</td>
            <td>${escapeHtml(reg.full_name)}</td>
            <td>${escapeHtml(reg.class_grade)}</td>
            <td>${escapeHtml(reg.parent_name)}</td>
            <td>${escapeHtml(reg.email)}</td>
            <td>${escapeHtml(reg.parent_contact)}</td>
            <td><span class="status-badge status-${reg.status}">${reg.status}</span></td>
            <td>${formatDate(reg.timestamp)}</td>
            <td>
                <div class="action-buttons-cell">
                    <button class="btn btn-sm btn-primary" onclick="viewDetails('${reg.registration_id}')">View</button>
                    <button class="btn btn-sm btn-success" onclick="updateStatus('${reg.registration_id}', 'approved')">Approve</button>
                    <button class="btn btn-sm btn-danger" onclick="updateStatus('${reg.registration_id}', 'rejected')">Reject</button>
                    <button class="btn btn-sm btn-secondary" onclick="deleteRegistration('${reg.registration_id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateStats(registrations) {
    const total = registrations.length;
    const pending = registrations.filter(r => r.status === 'pending').length;
    const approved = registrations.filter(r => r.status === 'approved').length;
    const rejected = registrations.filter(r => r.status === 'rejected').length;
    
    document.getElementById('totalCount').textContent = total;
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('approvedCount').textContent = approved;
    document.getElementById('rejectedCount').textContent = rejected;
}

async function viewDetails(registrationId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/registrations/${registrationId}`);
        const result = await response.json();
        
        if (result.success) {
            showDetailModal(result.registration);
        }
    } catch (error) {
        alert('Error loading registration details');
    }
}

function showDetailModal(registration) {
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Registration ID:</span>
            <span class="detail-value">${escapeHtml(registration.registration_id)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Student Name:</span>
            <span class="detail-value">${escapeHtml(registration.full_name)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Date of Birth:</span>
            <span class="detail-value">${escapeHtml(registration.date_of_birth)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Gender:</span>
            <span class="detail-value">${escapeHtml(registration.gender)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Class:</span>
            <span class="detail-value">${escapeHtml(registration.class_grade)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Previous School:</span>
            <span class="detail-value">${escapeHtml(registration.previous_school || 'N/A')}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Parent Name:</span>
            <span class="detail-value">${escapeHtml(registration.parent_name)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Contact:</span>
            <span class="detail-value">${escapeHtml(registration.parent_contact)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${escapeHtml(registration.email)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Address:</span>
            <span class="detail-value">${escapeHtml(registration.address)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value"><span class="status-badge status-${registration.status}">${registration.status}</span></span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Submitted:</span>
            <span class="detail-value">${formatDate(registration.timestamp)}</span>
        </div>
    `;
    
    document.getElementById('detailModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

async function updateStatus(registrationId, newStatus) {
    if (!confirm(`Are you sure you want to mark this registration as ${newStatus}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/registrations/${registrationId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminKey}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadRegistrations();
        } else {
            alert('Failed to update status');
        }
    } catch (error) {
        alert('Error updating status');
    }
}

async function deleteRegistration(registrationId) {
    if (!confirm('Are you sure you want to delete this registration? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/registrations/${registrationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminKey}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadRegistrations();
        } else {
            alert('Failed to delete registration');
        }
    } catch (error) {
        alert('Error deleting registration');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
