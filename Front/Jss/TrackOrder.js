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

        resultDiv.innerHTML = `
            <h3 style="color: var(--gold); margin-bottom: 15px;">Order Details</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Time:</strong> ${order.timestamp || 'N/A'}</p>
            <p style="margin-top: 15px; margin-bottom: 10px;"><strong>Status:</strong> <span class="status-badge">${order.status}</span></p>
            
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
