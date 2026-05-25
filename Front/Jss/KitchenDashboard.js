const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById('date-display').innerText = new Date().toLocaleDateString(undefined, options);

function getToken() { return localStorage.getItem('token'); }
function authHeaders() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() }; }

async function renderKanban() {
    try {
        const res = await fetch('/api/orders', { headers: authHeaders() });
        if (!res.ok) return;
        const orders = await res.json();
        const statuses = ['Pending', 'Preparing', 'Ready', 'Delivered'];

        statuses.forEach(status => {
            const container = document.getElementById(`items-${status.toLowerCase()}`);
            if (!container) return;
            const filteredOrders = orders.filter(o => o.status === status);
            container.innerHTML = filteredOrders.map(order => {
                let nextStatusBtn = '';
                const idx = statuses.indexOf(status);
                if (idx >= 0 && idx < statuses.length - 1) {
                    nextStatusBtn = `<button class="btn-move" onclick="updateOrderStatus('${order.orderId}', '${statuses[idx + 1]}')">Move to ${statuses[idx + 1]}</button>`;
                }
                const itemsList = (order.items || []).map(i => `&bull; ${i.name}`).join('<br>');
                return `
                    <div class="kanban-card">
                        <h4>${order.orderId}</h4>
                        <p><strong>Time:</strong> ${new Date(order.createdAt).toLocaleTimeString()}</p>
                        <p><strong>Payment:</strong> ${order.payment || 'N/A'}</p>
                        <div style="margin-top: 10px; font-size: 0.9rem; color: #ccc;">${itemsList}</div>
                        <div class="kanban-actions">${nextStatusBtn}</div>
                    </div>
                `;
            }).join('');
        });
    } catch (err) {}
}

async function updateOrderStatus(id, newStatus) {
    try {
        await fetch(`/api/orders/${id}/status`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status: newStatus }) });
        renderKanban();
    } catch (err) { alert('Failed to update order status.'); }
}

renderKanban();
setInterval(renderKanban, 10000);
