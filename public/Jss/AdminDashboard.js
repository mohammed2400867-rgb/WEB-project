const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById('date-display').innerText = new Date().toLocaleDateString(undefined, options);

function getToken() { return localStorage.getItem('token'); }
function authHeaders() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }; }

function showSection(sectionId, event) {
    document.querySelectorAll('.admin-section').forEach(sec => sec.style.display = 'none');
    document.getElementById('section-' + sectionId).style.display = 'block';
    const navs = document.querySelectorAll('.sidebar .nav-item');
    navs.forEach(nav => nav.classList.remove('active'));
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
    if (sectionId === 'orders') loadOrderHistory();
    if (sectionId === 'reservations') renderReservations();
}

async function renderReservations() {
    const container = document.getElementById('admin-res-list');
    if (!container) return;
    try {
        const res = await fetch('/api/reservations', { headers: authHeaders() });
        if (!res.ok) { container.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#ff4d4d;">Access denied or server error.</td></tr>`; return; }
        const reservations = await res.json();
        if (reservations.length === 0) { container.innerHTML = `<tr><td colspan="5" style="text-align: center;">No reservations yet.</td></tr>`; return; }
        container.innerHTML = reservations.map(res => `
            <tr>
                <td>${res.name}</td>
                <td>${new Date(res.date).toLocaleString()}</td>
                <td>${res.guests} People</td>
                <td><span class="status-badge ${res.status === 'Confirmed' ? 'badge-confirmed' : res.status === 'Declined' ? 'badge-declined' : 'badge-pending'}">${res.status}</span></td>
                <td>
                    <button class="btn-action btn-view" onclick="showToast('📞 ${res.phone} | Requests: ${res.requests || 'None'}', 'info', 6000)">View</button>
                    <button class="btn-action btn-accept" onclick="updateResStatus('${res.reservationId}', 'Confirmed')">Accept</button>
                    <button class="btn-action btn-decline" onclick="updateResStatus('${res.reservationId}', 'Declined')">Decline</button>
                    <button class="btn-action btn-edit" onclick="editResTime('${res.reservationId}')">Edit Time</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        container.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#ff4d4d;">Failed to load reservations.</td></tr>`;
    }
}

async function updateResStatus(id, status) {
    try {
        await fetch(`/api/reservations/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status }) });
        renderReservations();
    } catch (err) { showToast('Failed to update reservation.', 'error'); }
}

async function editResTime(id) {
    const newTime = prompt('Enter new date/time (e.g., 2026-05-10 19:30):');
    if (newTime) {
        try {
            await fetch(`/api/reservations/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ date: newTime }) });
            renderReservations();
        } catch (err) { showToast('Failed to update reservation time.', 'error'); }
    }
}

async function renderOrders() {
    const container = document.getElementById('admin-order-list');
    if (!container) return;
    try {
        const res = await fetch('/api/orders', { headers: authHeaders() });
        if (!res.ok) { container.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#ff4d4d;">Access denied.</td></tr>`; return; }
        const orders = await res.json();
        container.innerHTML = orders.map(order => `
            <tr>
                <td>${order.orderId}</td>
                <td>${new Date(order.createdAt).toLocaleString()}</td>
                <td>$${(order.total || 0).toFixed(2)}</td>
                <td><span class="status-badge">${order.status}</span></td>
            </tr>
        `).join('');
    } catch (err) {
        container.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#ff4d4d;">Failed to load orders.</td></tr>`;
    }
}

async function renderAnalytics() {
    try {
        const res = await fetch('/api/orders', { headers: authHeaders() });
        if (!res.ok) return;
        const orders = await res.json();
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'Pending').length;
        const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const elTotal = document.getElementById('stat-total-orders');
        const elPending = document.getElementById('stat-pending-orders');
        const elDelivered = document.getElementById('stat-delivered-orders');
        const elRevenue = document.getElementById('stat-total-revenue');
        if (elTotal) elTotal.innerText = totalOrders;
        if (elPending) elPending.innerText = pendingOrders;
        if (elDelivered) elDelivered.innerText = deliveredOrders;
        if (elRevenue) elRevenue.innerText = `$${totalRevenue.toFixed(2)}`;
    } catch (err) {}
}

let menuItems = [];
let editingItemId = null;

async function fetchAdminMenu() {
    try {
        const res = await fetch('/api/menu');
        if (res.ok) menuItems = await res.json();
    } catch (err) { menuItems = []; }
    renderMenu();
}

async function restoreDefaultMenu() {
    if (!confirm('This will replace all current menu items with the defaults. Continue?')) return;
    try {
        const current = await fetch('/api/menu');
        const items = await current.json();
        for (const item of items) {
            await fetch(`/api/menu/${item._id}`, { method: 'DELETE', headers: authHeaders() });
        }
        const defaults = [
            { name: "Spaghetti Carbonara", price: 19, category: "pasta", image: "Pics/1.jpeg" },
            { name: "Vesuvius Pomodoro", price: 17, category: "pasta", image: "Pics/2.jpeg" },
            { name: "Lasagna verdi", price: 23, category: "pasta", image: "Pics/Lasan.jpeg" },
            { name: "Margherita DOC", price: 18, category: "pizza", image: "Pics/Seg.jpeg" },
            { name: "Bianca al Tartufo", price: 25, category: "pizza", image: "Pics/3.jpeg" },
            { name: "The Garden Flame", price: 21, category: "pizza", image: "Pics/5.jpeg" },
            { name: "Sicilian Sunset", price: 10, category: "drinks", image: "Pics/6.jpeg" },
            { name: "Limonata Zenzero", price: 9, category: "drinks", image: "Pics/7.jpeg" },
            { name: "Espresso Tonic", price: 8, category: "drinks", image: "Pics/8.jpeg" },
            { name: "Classic Tiramisù", price: 13, category: "dessert", image: "Pics/Cake.jpeg" },
            { name: "Vanilla Panna Cotta", price: 11, category: "dessert", image: "Pics/9.jpeg" },
            { name: "Sicilian Cannoli", price: 12, category: "dessert", image: "Pics/10.jpeg" }
        ];
        for (const item of defaults) {
            await fetch('/api/menu', { method: 'POST', headers: authHeaders(), body: JSON.stringify(item) });
        }
        await fetchAdminMenu();
        showToast('Menu restored to default items!', 'success');
    } catch (err) { showToast('Failed to restore menu.', 'error'); }
}

function renderMenu() {
    const container = document.getElementById('admin-menu-list');
    if (!container) return;
    container.innerHTML = menuItems.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>$${Number(item.price).toFixed(2)}</td>
            <td>
                <button class="btn-action" onclick="editMenuItem('${item._id}')" style="background: transparent; color: var(--gold); border: 1px solid var(--gold); margin-right: 5px;">Edit</button>
                <button class="btn-action" onclick="removeMenuItem('${item._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// ── Image upload handler ──
async function handleImageSelect(input) {
    const file = input.files[0];
    if (!file) return;

    // Show preview instantly
    const preview = document.getElementById('image-preview');
    const labelText = document.getElementById('upload-label-text');
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'inline-block';
    labelText.textContent = '⏳ Uploading...';

    // Upload to server
    const formData = new FormData();
    formData.append('image', file);
    try {
        const res = await fetch('/api/menu/upload', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + getToken() },
            body: formData
        });
        const data = await res.json();
        if (!res.ok) { labelText.textContent = '❌ Upload failed'; return; }
        document.getElementById('new-item-image').value = data.path;
        labelText.textContent = '✅ ' + file.name;
    } catch (err) {
        labelText.textContent = '❌ Upload error';
    }
}

function resetImageInput() {
    document.getElementById('new-item-image-file').value = '';
    document.getElementById('new-item-image').value = '';
    document.getElementById('upload-label-text').textContent = '📁 Choose Image';
    const preview = document.getElementById('image-preview');
    preview.style.display = 'none';
    preview.src = '';
}

function editMenuItem(id) {
    const item = menuItems.find(i => i._id === id);
    if (!item) return;
    document.getElementById('new-item-name').value = item.name;
    document.getElementById('new-item-price').value = item.price;
    const imgInput = document.getElementById('new-item-image');
    if (imgInput) imgInput.value = item.image || '';
    // Show existing image preview
    if (item.image) {
        const preview = document.getElementById('image-preview');
        preview.src = item.image;
        preview.style.display = 'inline-block';
        document.getElementById('upload-label-text').textContent = '📁 Replace Image';
    }
    const catInput = document.getElementById('new-item-category');
    if (catInput) catInput.value = item.category || 'pasta';
    editingItemId = id;
    const addBtn = document.querySelector('button[onclick="addMenuItem()"]');
    addBtn.textContent = 'Save Changes';
    addBtn.style.background = '#4CAF50';
}

async function addMenuItem() {
    const nameInput = document.getElementById('new-item-name');
    const priceInput = document.getElementById('new-item-price');
    const imageInput = document.getElementById('new-item-image');
    const categoryInput = document.getElementById('new-item-category');
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);
    const image = imageInput ? imageInput.value.trim() : "";
    const category = categoryInput ? categoryInput.value : "pasta";
    if (!name || isNaN(price)) { showToast('Please enter a valid item name and price.', 'warning'); return; }

    try {
        if (editingItemId !== null) {
            await fetch(`/api/menu/${editingItemId}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ name, price, image, category }) });
            editingItemId = null;
            const addBtn = document.querySelector('button[onclick="addMenuItem()"]');
            addBtn.textContent = 'Add Item';
            addBtn.style.background = 'var(--gold)';
        } else {
            await fetch('/api/menu', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ name, price, image, category }) });
        }
        await fetchAdminMenu();
        nameInput.value = '';
        priceInput.value = '';
        resetImageInput();
    } catch (err) { showToast('Failed to save menu item.', 'error'); }
}

async function removeMenuItem(id) {
    if (!confirm('Delete this menu item?')) return;
    try {
        await fetch(`/api/menu/${id}`, { method: 'DELETE', headers: authHeaders() });
        await fetchAdminMenu();
    } catch (err) { showToast('Failed to delete menu item.', 'error'); }
}

let staffMembers = [];

async function fetchStaff() {
    try {
        const res = await fetch('/api/staff', { headers: authHeaders() });
        if (res.ok) staffMembers = await res.json();
    } catch (err) { staffMembers = []; }
    renderStaff();
}

function renderStaff() {
    const container = document.getElementById('admin-staff-list');
    if (!container) return;
    container.innerHTML = staffMembers.map(staff => `
        <tr>
            <td>${staff.name}</td>
            <td>${staff.email}</td>
            <td><span class="status-badge" style="background: ${staff.role === 'Admin' ? 'rgba(255, 77, 77, 0.1)' : 'rgba(212, 175, 55, 0.1)'}; color: ${staff.role === 'Admin' ? '#ff4d4d' : 'var(--gold)'}; border-color: ${staff.role === 'Admin' ? '#ff4d4d' : 'var(--gold)'};">${staff.role}</span></td>
            <td><button class="btn-action" onclick="removeStaff('${staff._id}')">Remove</button></td>
        </tr>
    `).join('');
}

async function addStaff() {
    const nameInput = document.getElementById('new-staff-name');
    const emailInput = document.getElementById('new-staff-email');
    const roleInput = document.getElementById('new-staff-role');
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const role = roleInput.value;
    if (!name || !email) { showToast('Please enter a valid name and email.', 'warning'); return; }

    try {
        const res = await fetch('/api/staff', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ name, email, role }) });
        const data = await res.json();
        if (!res.ok) { showToast(data.message || 'Failed to add staff.', 'error'); return; }
        showToast(data.message || 'Staff member added successfully!', 'success');
        await fetchStaff();
        nameInput.value = '';
        emailInput.value = '';
    } catch (err) { showToast('Failed to add staff.', 'error'); }
}

async function removeStaff(id) {
    if (!confirm('Remove this staff member?')) return;
    try {
        await fetch(`/api/staff/${id}`, { method: 'DELETE', headers: authHeaders() });
        await fetchStaff();
        showToast('Staff member removed.', 'info');
    } catch (err) { showToast('Failed to remove staff.', 'error'); }
}

let allOrdersCache = [];

async function loadOrderHistory() {
    try {
        const res = await fetch('/api/orders', { headers: authHeaders() });
        if (!res.ok) return;
        allOrdersCache = await res.json();
    } catch (err) { allOrdersCache = []; }
    applyOrderFilters();
}

function applyOrderFilters() {
    const from = document.getElementById('filter-date-from')?.value;
    const to = document.getElementById('filter-date-to')?.value;
    const status = document.getElementById('filter-status')?.value || 'all';

    let filtered = [...allOrdersCache];

    if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter(o => new Date(o.createdAt) >= fromDate);
    }
    if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(o => new Date(o.createdAt) <= toDate);
    }
    if (status !== 'all') {
        filtered = filtered.filter(o => o.status === status);
    }

    renderOrderHistory(filtered);
}

function clearOrderFilters() {
    const fromEl = document.getElementById('filter-date-from');
    const toEl = document.getElementById('filter-date-to');
    const statusEl = document.getElementById('filter-status');
    if (fromEl) fromEl.value = '';
    if (toEl) toEl.value = '';
    if (statusEl) statusEl.value = 'all';
    applyOrderFilters();
}

function renderOrderHistory(orders) {
    const container = document.getElementById('order-history-list');
    if (!container) return;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const delivered = orders.filter(o => o.status === 'Delivered').length;
    const pending = orders.filter(o => o.status === 'Pending').length;

    const countEl = document.getElementById('oh-count');
    const revEl = document.getElementById('oh-revenue');
    const delEl = document.getElementById('oh-delivered');
    const pendEl = document.getElementById('oh-pending');
    if (countEl) countEl.innerText = orders.length;
    if (revEl) revEl.innerText = `$${totalRevenue.toFixed(2)}`;
    if (delEl) delEl.innerText = delivered;
    if (pendEl) pendEl.innerText = pending;

    if (orders.length === 0) {
        container.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#666; padding:30px;">No orders match the selected filters.</td></tr>`;
        return;
    }

    const statusColors = { Pending: '#ffa500', Preparing: '#3b9eff', Ready: '#9c6fff', Delivered: '#4CAF50' };

    container.innerHTML = orders.map(order => `
        <tr>
            <td style="font-family: monospace; color: var(--gold);">${order.orderId}</td>
            <td>${new Date(order.createdAt).toLocaleString()}</td>
            <td style="color:#ccc; font-size:0.85rem;">${(order.items || []).map(i => i.name).join(', ') || '—'}</td>
            <td style="text-transform:capitalize;">${order.payment || 'N/A'}</td>
            <td style="color:#4CAF50; font-weight:600;">$${(order.total || 0).toFixed(2)}</td>
            <td><span class="status-badge" style="color:${statusColors[order.status] || '#fff'}; border-color:${statusColors[order.status] || '#fff'}; background:${statusColors[order.status] || '#fff'}18;">${order.status}</span></td>
        </tr>
    `).join('');
}

function exportOrdersCSV() {
    const from = document.getElementById('filter-date-from')?.value;
    const to = document.getElementById('filter-date-to')?.value;
    const status = document.getElementById('filter-status')?.value || 'all';

    let filtered = [...allOrdersCache];
    if (from) { const d = new Date(from); d.setHours(0,0,0,0); filtered = filtered.filter(o => new Date(o.createdAt) >= d); }
    if (to) { const d = new Date(to); d.setHours(23,59,59,999); filtered = filtered.filter(o => new Date(o.createdAt) <= d); }
    if (status !== 'all') filtered = filtered.filter(o => o.status === status);

    if (filtered.length === 0) { showToast('No orders to export.', 'warning'); return; }

    const headers = ['Order ID', 'Date & Time', 'Items', 'Payment', 'Total', 'Status'];
    const rows = filtered.map(o => [
        o.orderId,
        new Date(o.createdAt).toLocaleString(),
        `"${(o.items || []).map(i => i.name).join(', ')}"`,
        o.payment || 'N/A',
        `$${(o.total || 0).toFixed(2)}`,
        o.status
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

renderOrders();
renderAnalytics();
fetchAdminMenu();
fetchStaff();
renderReservations();
