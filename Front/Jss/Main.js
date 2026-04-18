document.addEventListener("DOMContentLoaded", () => {
    // 1. Role-Based Navigation Logic
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const loginNav = document.getElementById('login-nav');
    const adminNav = document.getElementById('admin-nav');


    // Banner Auto-Slide Logic (4.5 seconds)
    let current = 0;
    const slides = document.querySelectorAll('.slide');
    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 4500);

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (window.scrollY > 100) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });

    if (user) {
        // Change "Login" to "Logout"
        loginNav.innerHTML = `<a href="#" id="logout-btn">Logout (${user.role})</a>`;
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.reload();
        });

        // Show Dashboard only for Staff and Admin
        if (user.role === 'admin' || user.role === 'staff') {
            adminNav.style.display = 'block';
        }
    }

    // 2. Cart Counter Update
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
        cartCounter.innerText = cart.length;
    }




})

document.addEventListener("DOMContentLoaded", () => {
    const session = JSON.parse(localStorage.getItem('flourFlameUser'));
    const adminNavLink = document.getElementById('admin-link');

    if (session && (session.role === 'admin' || session.role === 'staff')) {
        if (adminNavLink) adminNavLink.style.display = 'block';
    }
});

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
