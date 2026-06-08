document.addEventListener("DOMContentLoaded", async () => {
    const modal = document.getElementById("reviewModal");
    const btn = document.getElementById("openReview");
    const span = document.getElementById("closeReview");
    const reviewsContainer = document.getElementById("reviewsContainer");

    let reviews = [];

    async function fetchReviews() {
        try {
            const res = await fetch('/api/reviews');
            if (res.ok) reviews = await res.json();
        } catch (err) { reviews = []; }
        renderReviews();
    }

    function renderReviews() {
        if (!reviewsContainer) return;
        reviewsContainer.innerHTML = reviews.map(r => {
            const starsStr = "★".repeat(r.stars) + "☆".repeat(5 - r.stars);
            return `
                <div class="review-card">
                    <div class="stars" style="color: var(--gold);">${starsStr}</div>
                    <p class="review-quote">"${r.quote}"</p>
                    <div class="reviewer">
                        <div class="reviewer-initials">${r.initials}</div>
                        <div class="reviewer-name">${r.name}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    await fetchReviews();

    btn.onclick = function () { modal.style.display = "flex"; }
    span.onclick = function () { modal.style.display = "none"; }
    window.onclick = function (event) { if (event.target == modal) modal.style.display = "none"; }

    document.getElementById("reviewForm").onsubmit = async function (e) {
        e.preventDefault();

        const ratingInputs = document.getElementsByName("rating");
        let rating = 5;
        for (let input of ratingInputs) { if (input.checked) { rating = parseInt(input.value); break; } }

        const formInputs = e.target.querySelectorAll("input[type='text'], textarea");
        const nameInput = formInputs[0].value.trim();
        const quoteInput = formInputs[1].value.trim();
        if (!nameInput || !quoteInput) return;

        const words = nameInput.split(" ").filter(w => w.length > 0);
        let initials = "";
        if (words.length === 1) initials = words[0].substring(0, 2).toUpperCase();
        else if (words.length > 1) initials = (words[0][0] + words[words.length - 1][0]).toUpperCase();

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stars: rating, quote: quoteInput, name: nameInput, initials })
            });
            if (!res.ok) { showToast('Failed to submit review.', 'error'); return; }
            showToast('Thank you for your review! 🌟', 'success');
            modal.style.display = "none";
            e.target.reset();
            await fetchReviews();
        } catch (err) { showToast('Server error. Please try again.', 'error'); }
    }
});
