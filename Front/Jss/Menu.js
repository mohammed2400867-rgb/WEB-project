function filterItems(category, event) {
    const cards = document.querySelectorAll('.menu-card');
    const btns = document.querySelectorAll('.filter-btn');

    // Toggle active button
    btns.forEach(btn => btn.classList.remove('active'));
    if (event) event.currentTarget.classList.add('active');

    cards.forEach(card => {
        if (category === 'all' || card.classList.contains(category)) {
            card.classList.add('show');
        } else {
            card.classList.remove('show');
        }
    });
}

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(name, price) {
    cart.push({ name, price, id: Date.now() });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    document.getElementById('cart-drawer').classList.add('active');
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cart-total').innerText = `$${total.toFixed(2)}`;
    
    const counts = document.querySelectorAll('.cart-count');
    counts.forEach(el => el.innerText = cart.length);

    const cartItemsContainer = document.getElementById('cart-items');
    if(cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--gold); padding: 20px;">Your cart is empty.</p>';
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <strong style="color: var(--cream);">${item.name}</strong>
                <div style="color: var(--gold); font-size: 0.9em;">$${item.price.toFixed(2)}</div>
            </div>
            <button onclick="removeFromCart(${item.id})" style="background: none; border: none; color: #ff4d4d; cursor: pointer; font-size: 1.2em;">&times;</button>
        </div>
    `).join('');
}

function toggleCart() {
    document.getElementById('cart-drawer').classList.toggle('active');
}

function placeOrder() {
    if(cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }
    const newOrder = {
        id: "ORD-" + Math.floor(Math.random() * 10000),
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price, 0),
        status: "Preparing",
        timestamp: new Date().toLocaleTimeString()
    };
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    alert("Order placed successfully! Order ID: " + newOrder.id);
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    document.getElementById('cart-drawer').classList.remove('active');
}

// Initialize UI
updateCartUI();