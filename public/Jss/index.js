document.addEventListener("DOMContentLoaded", () => {
    // Banner Auto-Slide Logic (4.5 seconds)
    let current = 0;
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        setInterval(() => {
            slides[current].classList.remove('active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('active');
        }, 4500);
    }

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (nav) {
            if (window.scrollY > 100) nav.classList.add('scrolled');
            else nav.classList.remove('scrolled');
        }
    });

    // Cart Counter Update
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
        cartCounter.innerText = cart.length;
    }
})


// ===================== ADMIN PIN =====================
let pinValue = '';

function showAdminPin() {
    pinValue = '';
    updatePinDots();
    document.getElementById('pin-error').textContent = '';
    document.getElementById('admin-pin-overlay').style.display = 'flex';
}

function closeAdminPin() {
    pinValue = '';
    updatePinDots();
    document.getElementById('pin-error').textContent = '';
    document.getElementById('admin-pin-overlay').style.display = 'none';
}

function pinPress(digit) {
    if (pinValue.length >= 4) return;
    pinValue += digit;
    updatePinDots();
    if (pinValue.length === 4) {
        setTimeout(checkPin, 120); // small delay so last dot fills visibly
    }
}

function pinDelete() {
    pinValue = pinValue.slice(0, -1);
    updatePinDots();
    document.getElementById('pin-error').textContent = '';
}

function updatePinDots() {
    for (let i = 0; i < 4; i++) {
        const dot = document.getElementById('pin-dot-' + i);
        dot.classList.remove('filled', 'error');
        if (i < pinValue.length) dot.classList.add('filled');
    }
}

async function checkPin() {
    if (pinValue !== '1111') {
        // Wrong PIN — shake + show error + flash dots red
        for (let i = 0; i < 4; i++) {
            const dot = document.getElementById('pin-dot-' + i);
            dot.classList.remove('filled');
            dot.classList.add('error');
        }
        document.getElementById('pin-error').textContent = 'Incorrect PIN. Try again.';
        const modal = document.getElementById('pin-modal');
        modal.classList.add('shake');
        modal.addEventListener('animationend', () => modal.classList.remove('shake'), { once: true });
        setTimeout(() => {
            pinValue = '';
            updatePinDots();
        }, 700);
        return;
    }

    // Correct PIN — log in as admin
    document.getElementById('pin-error').textContent = '';
    document.getElementById('pin-subtitle') && (document.getElementById('pin-subtitle').textContent = 'Verifying...');

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@flourflame.com', password: 'Admin@123' })
        });
        const data = await res.json();
        if (!res.ok) {
            document.getElementById('pin-error').textContent = data.message || 'Login failed.';
            pinValue = '';
            updatePinDots();
            return;
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        window.location.href = 'AdminDashboard.html';
    } catch (err) {
        document.getElementById('pin-error').textContent = 'Server error. Is the server running?';
        pinValue = '';
        updatePinDots();
    }
}

// Allow typing PIN with keyboard when overlay is open
document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('admin-pin-overlay');
    if (!overlay || overlay.style.display === 'none') return;
    if (e.key >= '0' && e.key <= '9') pinPress(e.key);
    else if (e.key === 'Backspace') pinDelete();
    else if (e.key === 'Escape') closeAdminPin();
});

// ===================== CART =====================
function addToCartMain(name, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ name, price, id: Date.now() });
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update counter if it exists
    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
        cartCounter.innerText = cart.length;
    }
    
    alert(`Added ${name} to cart!`);
}
