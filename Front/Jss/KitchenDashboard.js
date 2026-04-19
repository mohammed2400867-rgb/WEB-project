const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById('date-display').innerText = new Date().toLocaleDateString(undefined, options);

function renderKanban() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    const statuses = ['Pending', 'Preparing', 'Ready', 'Delivered'];
    
    statuses.forEach(status => {
        const container = document.getElementById(`items-${status.toLowerCase()}`);
        if (!container) return;
        
        const filteredOrders = orders.filter(o => o.status === status);
        
        container.innerHTML = filteredOrders.map(order => {
            let nextStatusBtn = '';
            const idx = statuses.indexOf(status);
            if (idx >= 0 && idx < statuses.length - 1) {
                nextStatusBtn = `<button class="btn-move" onclick="updateOrderStatus('${order.id}', '${statuses[idx + 1]}')">Move to ${statuses[idx + 1]}</button>`;
            }
            
            const itemsList = (order.items || []).map(i => `&bull; ${i.name}`).join('<br>');

            return `
                <div class="kanban-card">
                    <h4>${order.id}</h4>
                    <p><strong>Time:</strong> ${order.timestamp}</p>
                    <p><strong>Payment:</strong> ${order.payment || 'N/A'}</p>
                    <div style="margin-top: 10px; font-size: 0.9rem; color: #ccc;">
                        ${itemsList}
                    </div>
                    <div class="kanban-actions">
                        ${nextStatusBtn}
                    </div>
                </div>
            `;
        }).join('');
    });
}

function updateOrderStatus(id, newStatus) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    localStorage.setItem('orders', JSON.stringify(orders));
    renderKanban();
}

// Initial render
renderKanban();
// Refresh every 10 seconds to auto-update new orders
setInterval(renderKanban, 10000);
