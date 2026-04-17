

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