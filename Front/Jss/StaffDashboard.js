// Set current date
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById('date-display').innerText = new Date().toLocaleDateString(undefined, options);

function renderOrders() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const container = document.getElementById('staff-order-list');
  if(!container) return;

  container.innerHTML = orders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.timestamp || 'N/A'}</td>
            <td>${order.items ? order.items.length + ' items' : '0 items'}</td>
            <td>
                <select onchange="updateStatus('${order.id}', this.value)" style="padding: 5px; background: #000; border: 1px solid var(--gold); color: var(--gold); border-radius: 4px;">
                    <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                    <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>Ready</option>
                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </td>
        </tr>
    `).join('');
}

function updateStatus(id, newStatus) {
  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
  localStorage.setItem('orders', JSON.stringify(orders));
  renderOrders();
}

renderOrders();
