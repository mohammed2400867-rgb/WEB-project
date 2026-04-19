function filterItems(category, event) {
    const cards = document.querySelectorAll('.menu-card');
    const btns = document.querySelectorAll('.filter-btn');

    btns.forEach(btn => btn.classList.remove('active'));
    if (event) event.currentTarget.classList.add('active');

    cards.forEach(card => {
        if (category === 'all' || card.classList.contains(category)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function renderMenu() {
    const menuGrid = document.getElementById('main-menu');
    if (!menuGrid) return;

    let menuStr = localStorage.getItem('menu');
    let menuItems = menuStr ? JSON.parse(menuStr) : null;
    
    // Restore default if no menu exists, or if there are items but they lack categories or images (old version)
    if (!menuItems || (menuItems.length > 0 && (!menuItems[0].category || !menuItems[0].image))) {
        menuItems = [
            { id: 1, name: "Spaghetti Carbonara", price: 19, category: "pasta", image: "Pics/1.jpeg" },
            { id: 2, name: "Vesuvius Pomodoro", price: 17, category: "pasta", image: "Pics/2.jpeg" },
            { id: 3, name: "Lasagna verdi", price: 23, category: "pasta", image: "Pics/Lasan.jpeg" },
            { id: 4, name: "Margherita DOC", price: 18, category: "pizza", image: "Pics/Seg.jpeg" },
            { id: 5, name: "Bianca al Tartufo", price: 25, category: "pizza", image: "Pics/3.jpeg" },
            { id: 6, name: "The Garden Flame", price: 21, category: "pizza", image: "Pics/5.jpeg" },
            { id: 7, name: "Sicilian Sunset", price: 10, category: "drinks", image: "Pics/6.jpeg" },
            { id: 8, name: "Limonata Zenzero", price: 9, category: "drinks", image: "Pics/7.jpeg" },
            { id: 9, name: "Espresso Tonic", price: 8, category: "drinks", image: "Pics/8.jpeg" },
            { id: 10, name: "Classic Tiramisù", price: 13, category: "dessert", image: "Pics/Cake.jpeg" },
            { id: 11, name: "Vanilla Panna Cotta", price: 11, category: "dessert", image: "Pics/9.jpeg" },
            { id: 12, name: "Sicilian Cannoli", price: 12, category: "dessert", image: "Pics/10.jpeg" }
        ];
        localStorage.setItem('menu', JSON.stringify(menuItems));
    }

    menuGrid.innerHTML = menuItems.map((item, idx) => `
        <div class="menu-card ${item.category || 'all'} show">
            <div class="img-box"><img src="${item.image || `Pics/${(idx % 10) + 1}.jpeg`}" alt="${item.name}"></div>
            <div class="details">
                <div class="details-header">
                    <h3>${item.name}</h3> <span class="price">$${item.price}</span>
                </div>
                <p class="desc">Freshly prepared with authentic ingredients.</p>
                <button class="add-to-cart-btn" onclick="addToCart('${item.name}', ${item.price})">Add to Cart</button>
            </div>
        </div>
    `).join('');
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
    const paymentMethod = document.getElementById('payment-method').value;
    const newOrder = {
        id: "ORD-" + Math.floor(Math.random() * 10000),
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price, 0),
        status: "Pending",
        timestamp: new Date().toLocaleTimeString(),
        payment: paymentMethod
    };
    
    // Save to global orders
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Save to my_active_orders
    const myOrders = JSON.parse(localStorage.getItem('my_active_orders')) || [];
    myOrders.push(newOrder.id);
    localStorage.setItem('my_active_orders', JSON.stringify(myOrders));
    
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    document.getElementById('cart-drawer').classList.remove('active');
    
    // Redirect to Track Order
    window.location.href = "TrackOrder.html";
}

// Initialize UI
renderMenu();
updateCartUI();