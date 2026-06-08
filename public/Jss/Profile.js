const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const token = localStorage.getItem('token');

function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
}

function init() {
    if (!currentUser) { window.location.href = 'Login.html'; return; }

    const email = currentUser.email || '';
    document.getElementById('profile-email').textContent = email;
    document.getElementById('profile-role').textContent = currentUser.role || 'Customer';

    const words = email.split('@')[0].split(/[._-]/);
    const initials = words.length >= 2
        ? (words[0][0] + words[1][0]).toUpperCase()
        : email.substring(0, 2).toUpperCase();
    document.getElementById('avatar-initials').textContent = initials;

    const roleColors = { Admin: '#ff4d4d', Staff: '#d4af37', Kitchen: '#ff9800', Customer: '#4CAF50' };
    const badge = document.getElementById('profile-role');
    const role = currentUser.role || 'Customer';
    badge.style.borderColor = roleColors[role] || '#d4af37';
    badge.style.color = roleColors[role] || '#d4af37';

    const isStaffRole = ['Admin', 'Staff', 'Kitchen'].includes(role);

    if (isStaffRole) {
        // Hide customer-only sections
        document.getElementById('points-panel').style.display = 'none';
        document.querySelector('.panel:last-of-type').style.display = 'none';
        document.querySelector('.stats-row').style.display = 'none';

        // Show staff quick-access panel
        const dashMap = {
            Admin:   { href: 'AdminDashboard.html',   label: 'Go to Admin Dashboard',   icon: '🛠️' },
            Staff:   { href: 'StaffDashboard.html',   label: 'Go to Staff Dashboard',   icon: '📋' },
            Kitchen: { href: 'KitchenDashboard.html', label: 'Go to Kitchen Dashboard', icon: '👨‍🍳' }
        };
        const dash = dashMap[role];
        const staffPanel = document.createElement('div');
        staffPanel.className = 'panel';
        staffPanel.style.textAlign = 'center';
        staffPanel.innerHTML = `
            <div style="font-size:3rem; margin-bottom:12px;">${dash.icon}</div>
            <h2 style="margin-bottom:8px;">${role} Account</h2>
            <p style="color:#aaa; margin-bottom:24px;">This account is reserved for internal use. Customer features are not available.</p>
            <a href="${dash.href}" style="display:inline-block; background:var(--gold); color:#000; font-weight:700; padding:12px 28px; border-radius:6px; text-decoration:none; font-size:0.95rem;">${dash.label}</a>
        `;
        document.querySelector('.profile-wrapper').appendChild(staffPanel);
        return;
    }

    loadLoyalty();
    loadOrders();
}

async function loadLoyalty() {
    if (!token) return;
    try {
        const [balRes, histRes] = await Promise.all([
            fetch('/api/loyalty/balance', { headers: authHeaders() }),
            fetch('/api/loyalty/history', { headers: authHeaders() })
        ]);

        if (balRes.ok) {
            const { points, pointsRequired, redeemValue } = await balRes.json();
            document.getElementById('stat-points').textContent = points;

            const pct = Math.min(100, (points % pointsRequired) / pointsRequired * 100);
            document.getElementById('points-bar-fill').style.width = pct + '%';
            document.getElementById('points-bar-current').textContent = points + ' pts';
            const remaining = pointsRequired - (points % pointsRequired);
            document.getElementById('points-bar-next').textContent =
                points >= pointsRequired
                    ? `${Math.floor(points / pointsRequired)} redemption(s) available!`
                    : `${remaining} more pts → $${redeemValue} off`;
        }

        if (histRes.ok) {
            const txs = await histRes.json();
            const txList = document.getElementById('tx-list');
            if (!txs.length) {
                txList.innerHTML = '<p class="empty-msg">No transactions yet. Place an order to start earning!</p>';
                return;
            }
            txList.innerHTML = txs.map(tx => `
                <div class="tx-item">
                    <div>
                        <div class="tx-desc">${tx.description}</div>
                        <div class="tx-date">${new Date(tx.createdAt).toLocaleString()}</div>
                    </div>
                    <div class="${tx.type === 'earned' ? 'tx-points-earn' : 'tx-points-redeem'}">
                        ${tx.type === 'earned' ? '+' : ''}${tx.points} pts
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {}
}

let allOrders = [];

async function loadOrders() {
    const listEl = document.getElementById('order-list');
    try {
        const myOrderIds = JSON.parse(localStorage.getItem('my_active_orders')) || [];
        let orders = [];

        if (token) {
            const res = await fetch('/api/orders/user', { headers: authHeaders() });
            if (res.ok) orders = await res.json();
        }

        if (!orders.length && myOrderIds.length) {
            const res = await fetch(`/api/orders/my?ids=${myOrderIds.join(',')}`);
            if (res.ok) orders = await res.json();
        }

        allOrders = orders;

        const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
        const totalSaved = orders.reduce((s, o) => s + (o.discount || 0), 0);
        document.getElementById('stat-orders').textContent = orders.length;
        document.getElementById('stat-spent').textContent = `$${totalSpent.toFixed(0)}`;
        document.getElementById('stat-saved').textContent = `$${totalSaved.toFixed(0)}`;

        renderOrders(orders);
    } catch (err) {
        listEl.innerHTML = '<p class="empty-msg">Failed to load orders.</p>';
    }
}

function applyOrderFilter() {
    const status = document.getElementById('order-status-filter').value;
    const filtered = status === 'all' ? allOrders : allOrders.filter(o => o.status === status);
    renderOrders(filtered);
}

function renderOrders(orders) {
    const listEl = document.getElementById('order-list');
    if (!orders.length) {
        listEl.innerHTML = '<p class="empty-msg">No orders found.</p>';
        return;
    }
    listEl.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-card-top">
                <span class="order-id">${order.orderId}</span>
                <span class="order-status status-${order.status}">${order.status}</span>
            </div>
            <div class="order-items">${(order.items || []).map(i => i.name).join(', ') || '—'}</div>
            <div class="order-card-bottom">
                <div>
                    <div style="color:#555; font-size:0.78rem;">${new Date(order.createdAt).toLocaleString()} · ${order.payment || 'N/A'}</div>
                    ${order.pointsEarned ? `<div class="order-pts">+${order.pointsEarned} pts earned</div>` : ''}
                    ${order.discount ? `<div style="color:#4CAF50; font-size:0.78rem;">Saved $${order.discount.toFixed(2)}</div>` : ''}
                </div>
                <div style="display:flex; align-items:center; gap:14px;">
                    <span class="order-total">$${(order.total || 0).toFixed(2)}</span>
                    <a href="TrackOrder.html?id=${order.orderId}" class="track-btn">Track</a>
                </div>
            </div>
        </div>
    `).join('');
}

init();
