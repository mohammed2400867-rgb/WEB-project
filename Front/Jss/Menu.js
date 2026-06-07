let currentCategory = 'all';
let currentSort = 'none';
let appliedDiscount = 0;
let pointsToSpend = 0;

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
        if (res.ok) allMenuItems = await res.json();
        else allMenuItems = [];
    } catch (err) { allMenuItems = []; }
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
    if (appliedDiscount > 0) {
        appliedDiscount = 0;
        pointsToSpend = 0;
    }
    updateCartUI();
}

function updateCartUI() {
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const finalTotal = Math.max(0, subtotal - appliedDiscount);

    const counts = document.querySelectorAll('.cart-count');
    counts.forEach(el => el.innerText = cart.length);

    const cartItemsContainer = document.getElementById('cart-items');
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--gold); padding: 20px;">Your cart is empty.</p>';
        document.getElementById('cart-total').innerText = `$0.00`;
        updateLoyaltyWidget(subtotal);
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

    if (appliedDiscount > 0) {
        document.getElementById('cart-total').innerHTML =
            `<span style="text-decoration:line-through; color:#666; font-size:0.9em;">$${subtotal.toFixed(2)}</span> <span style="color:#4CAF50;">$${finalTotal.toFixed(2)}</span>`;
    } else {
        document.getElementById('cart-total').innerText = `$${subtotal.toFixed(2)}`;
    }

    updateLoyaltyWidget(subtotal);
}

async function updateLoyaltyWidget(subtotal) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const token = localStorage.getItem('token');
    const widget = document.getElementById('loyalty-widget');
    if (!widget) return;

    if (!currentUser || !token) {
        widget.innerHTML = `<div style="border-top:1px solid #222; padding-top:12px; margin-top:8px; font-size:0.8rem; color:#666; text-align:center;">
            <a href="Login.html" style="color:var(--gold);">Log in</a> to earn & redeem loyalty points
        </div>`;
        return;
    }

    try {
        const res = await fetch('/api/loyalty/balance', { headers: { 'Authorization': 'Bearer ' + token } });
        if (!res.ok) { widget.innerHTML = ''; return; }
        const { points, pointsRequired, redeemValue } = await res.json();
        const canRedeem = points >= pointsRequired;
        const pointsEarnable = Math.floor(subtotal);

        widget.innerHTML = `
            <div style="border-top:1px solid #333; padding-top:14px; margin-top:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="color:#aaa; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px;">⭐ Loyalty Points</span>
                    <span style="color:var(--gold); font-weight:700; font-size:1rem;">${points} pts</span>
                </div>
                ${subtotal > 0 ? `<div style="color:#666; font-size:0.75rem; margin-bottom:8px;">You'll earn <strong style="color:var(--gold);">+${pointsEarnable} pts</strong> on this order</div>` : ''}
                ${appliedDiscount > 0
                    ? `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(76,175,80,0.1); border:1px solid #4CAF50; border-radius:6px; padding:8px 12px;">
                        <span style="color:#4CAF50; font-size:0.85rem;">✓ $${appliedDiscount} discount applied</span>
                        <button onclick="cancelRedeem()" style="background:none; border:none; color:#ff4d4d; cursor:pointer; font-size:0.8rem; padding:0;">Remove</button>
                       </div>`
                    : canRedeem
                        ? `<button onclick="usePoints()" style="width:100%; background:transparent; border:1px solid var(--gold); color:var(--gold); padding:8px; border-radius:6px; cursor:pointer; font-size:0.82rem; letter-spacing:1px; text-transform:uppercase; transition:all 0.2s;"
                               onmouseover="this.style.background='var(--gold)';this.style.color='#000'"
                               onmouseout="this.style.background='transparent';this.style.color='var(--gold)'">
                               Redeem ${pointsRequired} pts → -$${redeemValue}
                           </button>`
                        : `<div style="color:#555; font-size:0.78rem; text-align:center;">${pointsRequired - points} more pts needed to redeem $${redeemValue}</div>`
                }
            </div>
        `;
    } catch (err) { widget.innerHTML = ''; }
}

async function usePoints() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const res = await fetch('/api/loyalty/redeem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ units: 1 })
        });
        const data = await res.json();
        if (!res.ok) { alert(data.message || 'Could not redeem points.'); return; }
        appliedDiscount = data.discount;
        pointsToSpend = data.pointsToSpend;
        updateCartUI();
    } catch (err) { alert('Server error. Please try again.'); }
}

function cancelRedeem() {
    appliedDiscount = 0;
    pointsToSpend = 0;
    updateCartUI();
}

function toggleCart() {
    document.getElementById('cart-drawer').classList.toggle('active');
}

async function placeOrder() {
    if (cart.length === 0) { alert("Your cart is empty."); return; }

    const addressInput = document.getElementById('checkout-address');
    if (addressInput && !addressInput.value.trim()) { alert("Please enter a delivery address."); return; }
    if (window.phoneInput && !window.phoneInput.isValidNumber()) { alert("Please enter a valid phone number for the selected country."); return; }

    const paymentMethod = document.getElementById('payment-method').value;

    // Show credit card modal instead of placing order directly
    if (paymentMethod === 'Credit Card') {
        const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
        const finalTotal = Math.max(0, subtotal - appliedDiscount);
        document.getElementById('card-pay-amount').textContent = `$${finalTotal.toFixed(2)}`;
        document.getElementById('card-modal-overlay').style.display = 'flex';
        return;
    }

    await submitOrder();
}

async function submitOrder() {
    const addressInput = document.getElementById('checkout-address');
    const paymentMethod = document.getElementById('payment-method').value;
    const phoneVal = window.phoneInput ? window.phoneInput.getNumber() : '';
    const addressVal = addressInput ? addressInput.value.trim() : '';
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart,
                total: subtotal,
                payment: paymentMethod,
                address: addressVal,
                phone: phoneVal,
                userId: currentUser ? currentUser._id : null,
                pointsToRedeem: pointsToSpend
            })
        });

        if (!res.ok) { alert("Failed to place order. Please try again."); return; }

        const order = await res.json();

        if (order.pointsEarned > 0) {
            const msg = appliedDiscount > 0
                ? `Order placed! You saved $${appliedDiscount} and earned +${order.pointsEarned} loyalty points!`
                : `Order placed! You earned +${order.pointsEarned} loyalty points!`;
            setTimeout(() => alert(msg), 300);
        }

        const myOrders = JSON.parse(localStorage.getItem('my_active_orders')) || [];
        myOrders.push(order.orderId);
        localStorage.setItem('my_active_orders', JSON.stringify(myOrders));

        cart = [];
        appliedDiscount = 0;
        pointsToSpend = 0;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        document.getElementById('cart-drawer').classList.remove('active');
        window.location.href = "TrackOrder.html";
    } catch (err) { alert("Server error. Please try again."); }
}

// ===================== CARD MODAL LOGIC =====================

function closeCardModal() {
    document.getElementById('card-modal-overlay').style.display = 'none';
    document.getElementById('card-number').value = '';
    document.getElementById('card-name').value = '';
    document.getElementById('card-expiry').value = '';
    document.getElementById('card-cvv').value = '';
    document.getElementById('card-preview-number').textContent = '•••• •••• •••• ••••';
    document.getElementById('card-preview-name').textContent = 'FULL NAME';
    document.getElementById('card-preview-expiry').textContent = 'MM/YY';
    document.getElementById('card-type-logo').textContent = 'CARD';
    ['card-number','card-name','card-expiry','card-cvv'].forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('valid', 'invalid');
    });
    ['card-number-error','card-name-error','card-expiry-error','card-cvv-error'].forEach(id => {
        document.getElementById(id).textContent = '';
    });
    const btn = document.querySelector('.card-pay-btn');
    btn.disabled = false;
    btn.textContent = 'Pay ';
    const amountSpan = document.createElement('span');
    amountSpan.id = 'card-pay-amount';
    btn.appendChild(amountSpan);
}

function formatCardNumber(input) {
    let val = input.value.replace(/\D/g, '').substring(0, 16);
    input.value = val.replace(/(.{4})/g, '$1 ').trim();

    // Detect card type
    const logo = document.getElementById('card-type-logo');
    if (/^4/.test(val)) logo.textContent = 'VISA';
    else if (/^5[1-5]/.test(val) || /^2[2-7]/.test(val)) logo.textContent = 'MASTERCARD';
    else if (/^3[47]/.test(val)) logo.textContent = 'AMEX';
    else logo.textContent = 'CARD';

    // Update preview
    const padded = val.padEnd(16, '•');
    document.getElementById('card-preview-number').textContent =
        padded.substring(0,4) + ' ' + padded.substring(4,8) + ' ' + padded.substring(8,12) + ' ' + padded.substring(12,16);

    if (val.length === 16) {
        input.classList.add('valid'); input.classList.remove('invalid');
        document.getElementById('card-number-error').textContent = '';
    } else {
        input.classList.remove('valid', 'invalid');
    }
}

function updateCardName(input) {
    const val = input.value.replace(/[^a-zA-Z\s]/g, '');
    input.value = val;
    document.getElementById('card-preview-name').textContent = val.toUpperCase() || 'FULL NAME';
}

function formatExpiry(input) {
    let val = input.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) val = val.substring(0,2) + '/' + val.substring(2);
    input.value = val;
    document.getElementById('card-preview-expiry').textContent = val || 'MM/YY';

    if (val.length === 5) {
        const [mm, yy] = val.split('/').map(Number);
        const now = new Date();
        const expDate = new Date(2000 + yy, mm - 1);
        if (mm < 1 || mm > 12 || expDate < new Date(now.getFullYear(), now.getMonth())) {
            input.classList.add('invalid'); input.classList.remove('valid');
            document.getElementById('card-expiry-error').textContent = 'Card is expired or invalid month';
        } else {
            input.classList.add('valid'); input.classList.remove('invalid');
            document.getElementById('card-expiry-error').textContent = '';
        }
    } else {
        input.classList.remove('valid', 'invalid');
    }
}

function validateCvv(input) {
    const val = input.value.replace(/\D/g, '');
    input.value = val;
    if (val.length >= 3) {
        input.classList.add('valid'); input.classList.remove('invalid');
        document.getElementById('card-cvv-error').textContent = '';
    } else {
        input.classList.remove('valid', 'invalid');
    }
}

async function submitCardPayment() {
    const number = document.getElementById('card-number').value.replace(/\s/g, '');
    const name   = document.getElementById('card-name').value.trim();
    const expiry = document.getElementById('card-expiry').value;
    const cvv    = document.getElementById('card-cvv').value;
    let valid = true;

    if (number.length !== 16) {
        document.getElementById('card-number-error').textContent = 'Please enter a valid 16-digit card number';
        document.getElementById('card-number').classList.add('invalid');
        valid = false;
    }
    if (!name) {
        document.getElementById('card-name-error').textContent = 'Please enter the cardholder name';
        document.getElementById('card-name').classList.add('invalid');
        valid = false;
    }
    if (expiry.length !== 5 || document.getElementById('card-expiry').classList.contains('invalid')) {
        document.getElementById('card-expiry-error').textContent = 'Please enter a valid expiry date';
        document.getElementById('card-expiry').classList.add('invalid');
        valid = false;
    }
    if (cvv.length < 3) {
        document.getElementById('card-cvv-error').textContent = 'Please enter a valid CVV';
        document.getElementById('card-cvv').classList.add('invalid');
        valid = false;
    }
    if (!valid) return;

    // Simulate payment processing
    const btn = document.querySelector('.card-pay-btn');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    await new Promise(resolve => setTimeout(resolve, 1500));

    document.getElementById('card-modal-overlay').style.display = 'none';
    await submitOrder();
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
