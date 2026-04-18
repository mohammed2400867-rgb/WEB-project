// Set current date
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById('date-display').innerText = new Date().toLocaleDateString(undefined, options);

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

let menuItems = JSON.parse(localStorage.getItem('menu')) || [
    { id: 1, name: "Spaghetti Carbonara", price: 19 },
    { id: 2, name: "Margherita DOC", price: 18 }
];

function renderMenu() {
    const container = document.getElementById('admin-menu-list');
    if(!container) return;
    container.innerHTML = menuItems.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td><button class="btn-action" onclick="removeMenuItem(${item.id})">Delete</button></td>
        </tr>
    `).join('');
}

function addMenuItem() {
    const nameInput = document.getElementById('new-item-name');
    const priceInput = document.getElementById('new-item-price');
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);

    if(!name || isNaN(price)) {
        alert("Please enter a valid name and price.");
        return;
    }

    menuItems.push({ id: Date.now(), name, price });
    localStorage.setItem('menu', JSON.stringify(menuItems));
    renderMenu();
    nameInput.value = '';
    priceInput.value = '';
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
renderMenu();
renderStaff();