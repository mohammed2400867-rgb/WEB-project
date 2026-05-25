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
    } catch (err) { alert('Failed to update order status.'); }
}

renderOrders();
