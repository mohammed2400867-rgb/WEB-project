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
