let currentCategory = 'all';
let currentSort = 'none';

function filterItems(category, event) {
    currentCategory = category;
    const btns = document.querySelectorAll('.filter-btn');
    if (btns.length > 0) {
        btns.forEach(btn => btn.classList.remove('active'));
        if (event) event.currentTarget.classList.add('active');
    }
    renderMenu();
}

function sortMenu() {
    const sortSelect = document.getElementById('sort-price');
    if (sortSelect) { currentSort = sortSelect.value; renderMenu(); }
}

let allMenuItems = [];

async function fetchMenu() {
    try {
        const res = await fetch('/api/menu');
        if (res.ok) {
            allMenuItems = await res.json();
        } else {
            allMenuItems = [];
        }
    } catch (err) {
        allMenuItems = [];
    }
    renderMenu();
}

function renderMenu() {
    const menuGrid = document.getElementById('main-menu');
    if (!menuGrid) return;

    let filtered = allMenuItems.filter(item => currentCategory === 'all' || item.category === currentCategory);

    if (currentSort === 'low-high') filtered.sort((a, b) => a.price - b.price);
    else if (currentSort === 'high-low') filtered.sort((a, b) => b.price - a.price);

    menuGrid.innerHTML = filtered.map((item, idx) => `
        <div class="menu-card ${item.category || 'all'} show">
            <div class="img-box"><img src="${item.image || `Pics/${(idx % 10) + 1}.jpeg`}" alt="${item.name}"></div>
            <div class="details">
                <div class="details-header">
                    <h3>${item.name}</h3> <span class="price">$${item.price}</span>
                </div>
                <p class="desc">Freshly prepared with authentic ingredients.</p>
                <button class="add-to-cart-btn" onclick="addToCart('${item.name.replace(/'/g, "\\'")}', ${item.price})">Add to Cart</button>
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
    if (cart.length === 0) {
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

async function placeOrder() {
    if (cart.length === 0) { alert("Your cart is empty."); return; }

    const addressInput = document.getElementById('checkout-address');
    if (addressInput && !addressInput.value.trim()) { alert("Please enter a delivery address."); return; }

    if (window.phoneInput && !window.phoneInput.isValidNumber()) {
        alert("Please enter a valid phone number for the selected country.");
        return;
    }

    const paymentMethod = document.getElementById('payment-method').value;
    const phoneVal = window.phoneInput ? window.phoneInput.getNumber() : '';
    const addressVal = addressInput ? addressInput.value.trim() : '';
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart,
                total,
                payment: paymentMethod,
                address: addressVal,
                phone: phoneVal,
                userId: currentUser ? currentUser._id : null
            })
        });

        if (!res.ok) { alert("Failed to place order. Please try again."); return; }

        const order = await res.json();

        const myOrders = JSON.parse(localStorage.getItem('my_active_orders')) || [];
        myOrders.push(order.orderId);
        localStorage.setItem('my_active_orders', JSON.stringify(myOrders));

        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        document.getElementById('cart-drawer').classList.remove('active');
        window.location.href = "TrackOrder.html";
    } catch (err) {
        alert("Server error. Please try again.");
    }
}

updateCartUI();
fetchMenu();

document.addEventListener("DOMContentLoaded", () => {
    const phoneInputField = document.getElementById("checkout-phone");
    if (phoneInputField && window.intlTelInput) {
        window.phoneInput = window.intlTelInput(phoneInputField, {
            initialCountry: "auto",
            geoIpLookup: function (callback) {
                fetch("https://ipapi.co/json").then(res => res.json()).then(data => callback(data.country_code)).catch(() => callback("us"));
            },
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
        });
    }
});
