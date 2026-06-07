const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById('date-display').innerText = new Date().toLocaleDateString(undefined, options);

function getToken() { return localStorage.getItem('token'); }
function authHeaders() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }; }

async function renderOrders() {
    const container = document.getElementById('staff-order-list');
    if (!container) return;
    try {
        const res = await fetch('/api/orders', { headers: authHeaders() });
        if (!res.ok) { container.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#ff4d4d;">Access denied.</td></tr>`; return; }
        const orders = await res.json();
        if (orders.length === 0) { container.innerHTML = `<tr><td colspan="4" style="text-align:center;">No orders yet.</td></tr>`; return; }
        container.innerHTML = orders.map(order => `
            <tr>
                <td>${order.orderId}</td>
                <td>${new Date(order.createdAt).toLocaleString()}</td>
                <td>${order.items ? order.items.length + ' items' : '0 items'}</td>
                <td>
                    <select onchange="updateStatus('${order.orderId}', this.value)" style="padding: 5px; background: #000; border: 1px solid var(--gold); color: var(--gold); border-radius: 4px;">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>Ready</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        container.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#ff4d4d;">Failed to load orders.</td></tr>`;
    }
}

async function updateStatus(id, newStatus) {
    try {
        await fetch(`/api/orders/${id}/status`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status: newStatus }) });
        renderOrders();
    } catch (err) { showToast('Failed to update order status.', 'error'); }
}

function showToast(message, color) {
    const existing = document.getElementById('order-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'order-toast';
    toast.style.cssText = `
        position: fixed; top: 24px; right: 24px; z-index: 9999;
        background: #111; border: 1px solid ${color || 'var(--gold)'};
        color: ${color || 'var(--gold)'}; padding: 16px 24px;
        border-radius: 8px; font-size: 0.95rem; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        display: flex; align-items: center; gap: 12px;
        animation: slideIn 0.3s ease;
    `;
    toast.innerHTML = `<span style="font-size:1.4rem;">🔔</span><span>${message}</span>`;

    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.textContent = `@keyframes slideIn { from { transform: translateX(110%); opacity:0; } to { transform: translateX(0); opacity:1; } }`;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 5000);
}

function connectSSE() {
    const evtSource = new EventSource('/api/events');

    evtSource.onmessage = (e) => {
        try {
            const data = JSON.parse(e.data);
            if (data.type === 'new_order') {
                showToast(`New order ${data.orderId} — ${data.itemCount} item(s) — $${Number(data.total).toFixed(2)}`, 'var(--gold)');
                renderOrders();
            } else if (data.type === 'status_update') {
                renderOrders();
            }
        } catch (err) {}
    };

    evtSource.onerror = () => {
        evtSource.close();
        setTimeout(connectSSE, 5000);
    };
}

renderOrders();
connectSSE();
