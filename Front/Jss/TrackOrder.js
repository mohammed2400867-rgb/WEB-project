function trackOrder() {
    const input = document.getElementById('order-id-input').value.trim();
    const resultDiv = document.getElementById('track-result');
    
    if(!input) {
        alert("Please enter an Order ID.");
        return;
    }

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === input);

    if(order) {
        let itemsHtml = (order.items || []).map(item => `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding: 10px 0;">
                <span>${item.name}</span>
                <span style="color: var(--gold);">$${item.price.toFixed(2)}</span>
            </div>
        `).join('');
        const statuses = ["Pending", "Preparing", "Ready", "Delivered"];
        const currentIndex = statuses.indexOf(order.status) >= 0 ? statuses.indexOf(order.status) : 0;
        
        let stepperHtml = '<div class="stepper">';
        statuses.forEach((status, index) => {
            let className = 'step';
            if (index < currentIndex) className += ' completed';
            if (index === currentIndex) className += ' active';
            stepperHtml += `<div class="${className}">${status}</div>`;
        });
        stepperHtml += '</div>';

        resultDiv.innerHTML = `
            <h3 style="color: var(--gold); margin-bottom: 15px;">Order Details</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Time:</strong> ${order.timestamp || 'N/A'}</p>
            <p><strong>Payment:</strong> ${order.payment || 'N/A'}</p>
            
            ${stepperHtml}
            
            <h4 style="margin-top: 20px; border-bottom: 1px solid var(--gold); padding-bottom: 5px;">Items</h4>
            ${itemsHtml}
            
            <div style="display: flex; justify-content: space-between; margin-top: 15px; font-weight: bold; font-size: 1.2rem;">
                <span>Total:</span>
                <span style="color: var(--gold);">$${(order.total || 0).toFixed(2)}</span>
            </div>
        `;
        resultDiv.classList.add('active');
    } else {
        resultDiv.innerHTML = `<p style="color: #ff4d4d; text-align: center;">Order not found. Please check your Order ID.</p>`;
        resultDiv.classList.add('active');
    }
}

function loadActiveOrders() {
    const myOrderIds = JSON.parse(localStorage.getItem('my_active_orders')) || [];
    if (myOrderIds.length === 0) return;

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const container = document.getElementById('my-active-orders-container');
    const listDiv = document.getElementById('active-orders-list');
    
    const myOrders = orders.filter(o => myOrderIds.includes(o.id)).reverse();
    
    if (myOrders.length > 0) {
        container.style.display = 'block';
        listDiv.innerHTML = myOrders.map(order => `
            <div style="border-bottom: 1px solid #333; padding: 15px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <strong style="color: var(--cream);">${order.id}</strong>
                    <span class="status-badge">${order.status}</span>
                </div>
                <div style="font-size: 0.9em; color: #999;">
                    ${order.timestamp || ''} &bull; $${(order.total || 0).toFixed(2)}
                </div>
                <div style="font-size: 0.85em; color: #777; margin-top: 5px;">
                    ${(order.items || []).map(i => i.name).join(', ')}
                </div>
                <button onclick="document.getElementById('order-id-input').value='${order.id}'; trackOrder();" style="margin-top: 10px; background: transparent; border: 1px solid var(--gold); color: var(--gold); padding: 5px 10px; font-size: 0.8em; cursor: pointer; border-radius: 4px;">View Details</button>
            </div>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', loadActiveOrders);
