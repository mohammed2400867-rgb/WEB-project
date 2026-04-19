// Set current date
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById('date-display').innerText = new Date().toLocaleDateString(undefined, options);

function showSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(sec => sec.style.display = 'none');
    document.getElementById('section-' + sectionId).style.display = 'block';

    const navs = document.querySelectorAll('.sidebar .nav-item');
    navs.forEach(nav => nav.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

function renderReservations() {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const container = document.getElementById('admin-res-list');
    if (!container) return;

    if (reservations.length === 0) {
        container.innerHTML = `<tr><td colspan="5" style="text-align: center;">No reservations yet.</td></tr>`;
        return;
    }

    container.innerHTML = reservations.map(res => `
        <tr>
            <td>${res.name}</td>
            <td>${new Date(res.date).toLocaleString()}</td>
            <td>${res.guests} People</td>
            <td><span class="status-badge ${res.status === 'Confirmed' ? 'badge-confirmed' : res.status === 'Declined' ? 'badge-declined' : 'badge-pending'}">${res.status}</span></td>
            <td>
                <button class="btn-action btn-view" onclick="alert('Phone: ${res.phone}\\nRequests: ${res.requests}')">View</button>
                <button class="btn-action btn-accept" onclick="updateResStatus('${res.id}', 'Confirmed')">Accept</button>
                <button class="btn-action btn-decline" onclick="updateResStatus('${res.id}', 'Declined')">Decline</button>
                <button class="btn-action btn-edit" onclick="editResTime('${res.id}')">Edit Time</button>
            </td>
        </tr>
    `).join('');
}

function updateResStatus(id, status) {
    let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const index = reservations.findIndex(r => r.id === id);
    if (index !== -1) {
        reservations[index].status = status;
        localStorage.setItem('reservations', JSON.stringify(reservations));
        renderReservations();
    }
}

function editResTime(id) {
    let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const index = reservations.findIndex(r => r.id === id);
    if (index !== -1) {
        const newTime = prompt('Enter new date/time (e.g., 2026-05-10 19:30):', reservations[index].date);
        if (newTime) {
            reservations[index].date = newTime;
            localStorage.setItem('reservations', JSON.stringify(reservations));
            renderReservations();
        }
    }
}

function renderOrders() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const container = document.getElementById('admin-order-list');
  if(!container) return;

  container.innerHTML = orders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.timestamp || 'N/A'}</td>
            <td>$${(order.total || 0).toFixed(2)}</td>
            <td><span class="status-badge">${order.status}</span></td>
        </tr>
    `).join('');
}

function renderAnalytics() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
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
}

const defaultMenu = [
    { id: 1, name: "Spaghetti Carbonara", price: 19, category: "pasta" },
    { id: 2, name: "Vesuvius Pomodoro", price: 17, category: "pasta" },
    { id: 3, name: "Lasagna verdi", price: 23, category: "pasta" },
    { id: 4, name: "Margherita DOC", price: 18, category: "pizza" },
    { id: 5, name: "Bianca al Tartufo", price: 25, category: "pizza" },
    { id: 6, name: "The Garden Flame", price: 21, category: "pizza" },
    { id: 7, name: "Sicilian Sunset", price: 10, category: "drinks" },
    { id: 8, name: "Limonata Zenzero", price: 9, category: "drinks" },
    { id: 9, name: "Espresso Tonic", price: 8, category: "drinks" },
    { id: 10, name: "Classic Tiramisù", price: 13, category: "dessert" },
    { id: 11, name: "Vanilla Panna Cotta", price: 11, category: "dessert" },
    { id: 12, name: "Sicilian Cannoli", price: 12, category: "dessert" }
];

let menuItems = JSON.parse(localStorage.getItem('menu')) || defaultMenu;

function restoreDefaultMenu() {
    menuItems = [...defaultMenu];
    localStorage.setItem('menu', JSON.stringify(menuItems));
    renderMenu();
    alert("Menu restored to default items!");
}

function renderMenu() {
    const container = document.getElementById('admin-menu-list');
    if(!container) return;
    container.innerHTML = menuItems.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>$${Number(item.price).toFixed(2)}</td>
            <td>
                <button class="btn-action" onclick="editMenuItem(${item.id})" style="background: transparent; color: var(--gold); border: 1px solid var(--gold); margin-right: 5px;">Edit</button>
                <button class="btn-action" onclick="removeMenuItem(${item.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

let editingItemId = null;

function editMenuItem(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    
    document.getElementById('new-item-name').value = item.name;
    document.getElementById('new-item-price').value = item.price;
    const imgInput = document.getElementById('new-item-image');
    if (imgInput) imgInput.value = item.image || '';
    const catInput = document.getElementById('new-item-category');
    if (catInput) catInput.value = item.category || 'pasta';
    
    editingItemId = id;
    const addBtn = document.querySelector('button[onclick="addMenuItem()"]');
    addBtn.textContent = 'Save Changes';
    addBtn.style.background = '#4CAF50';
}

function addMenuItem() {
    const nameInput = document.getElementById('new-item-name');
    const priceInput = document.getElementById('new-item-price');
    const imageInput = document.getElementById('new-item-image');
    const categoryInput = document.getElementById('new-item-category');
    
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);
    const image = imageInput ? imageInput.value.trim() : "";
    const category = categoryInput ? categoryInput.value : "pasta";

    if(!name || isNaN(price)) {
        alert("Please enter a valid name and price.");
        return;
    }

    if (editingItemId !== null) {
        const itemIdx = menuItems.findIndex(i => i.id === editingItemId);
        if (itemIdx !== -1) {
            menuItems[itemIdx] = { ...menuItems[itemIdx], name, price, image, category };
        }
        editingItemId = null;
        const addBtn = document.querySelector('button[onclick="addMenuItem()"]');
        addBtn.textContent = 'Add Item';
        addBtn.style.background = 'var(--gold)';
    } else {
        menuItems.push({ id: Date.now(), name, price, image, category });
    }
    
    localStorage.setItem('menu', JSON.stringify(menuItems));
    renderMenu();
    nameInput.value = '';
    priceInput.value = '';
    if (imageInput) imageInput.value = '';
}

function removeMenuItem(id) {
    menuItems = menuItems.filter(item => item.id !== id);
    localStorage.setItem('menu', JSON.stringify(menuItems));
    renderMenu();
}

let staffMembers = JSON.parse(localStorage.getItem('staff')) || [
    { id: 1, name: "Admin User", email: "admin@flourflame.com", role: "Admin" },
    { id: 2, name: "Front Desk", email: "staff@flourflame.com", role: "Staff" }
];

function renderStaff() {
    const container = document.getElementById('admin-staff-list');
    if(!container) return;
    container.innerHTML = staffMembers.map(staff => `
        <tr>
            <td>${staff.name}</td>
            <td>${staff.email}</td>
            <td><span class="status-badge" style="background: ${staff.role === 'Admin' ? 'rgba(255, 77, 77, 0.1)' : 'rgba(212, 175, 55, 0.1)'}; color: ${staff.role === 'Admin' ? '#ff4d4d' : 'var(--gold)'}; border-color: ${staff.role === 'Admin' ? '#ff4d4d' : 'var(--gold)'};">${staff.role}</span></td>
            <td><button class="btn-action" onclick="removeStaff(${staff.id})">Remove</button></td>
        </tr>
    `).join('');
}

function addStaff() {
    const nameInput = document.getElementById('new-staff-name');
    const emailInput = document.getElementById('new-staff-email');
    const roleInput = document.getElementById('new-staff-role');
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const role = roleInput.value;

    if(!name || !email) {
        alert("Please enter a valid name and email.");
        return;
    }

    staffMembers.push({ id: Date.now(), name, email, role });
    localStorage.setItem('staff', JSON.stringify(staffMembers));
    
    // Auto-create user account for login
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if(!users.find(u => u.email === email)) {
        users.push({ email: email, pass: 'Welcome123!' });
        localStorage.setItem('users', JSON.stringify(users));
        alert(`Staff added! They can login with default password: Welcome123!`);
    }

    renderStaff();
    
    nameInput.value = '';
    emailInput.value = '';
}

function removeStaff(id) {
    if(staffMembers.length <= 1) {
        alert("Cannot remove the last staff member.");
        return;
    }
    staffMembers = staffMembers.filter(staff => staff.id !== id);
    localStorage.setItem('staff', JSON.stringify(staffMembers));
    renderStaff();
}

renderOrders();
renderAnalytics();
renderMenu();
renderStaff();