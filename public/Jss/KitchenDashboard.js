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

function showToast(message, color) {
    const existing = document.getElementById('order-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'order-toast';
    toast.style.cssText = `
        position: fixed; top: 24px; right: 24px; z-index: 9999;
        background: #111; border: 1px solid ${color || '#ff9800'};
        color: ${color || '#ff9800'}; padding: 16px 24px;
        border-radius: 8px; font-size: 0.95rem; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        display: flex; align-items: center; gap: 12px;
        animation: slideIn 0.3s ease;
    `;
    toast.innerHTML = `<span style="font-size:1.4rem;">🍕</span><span>${message}</span>`;

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
                showToast(`New order incoming! ${data.orderId} — ${data.itemCount} item(s)`, '#ff9800');
                renderKanban();
            } else if (data.type === 'status_update') {
                renderKanban();
            }
        } catch (err) {}
    };

    evtSource.onerror = () => {
        evtSource.close();
        setTimeout(connectSSE, 5000);
    };
}

renderKanban();
connectSSE();
