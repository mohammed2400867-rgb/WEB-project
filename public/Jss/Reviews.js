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

        const nameInput = document.getElementById('review-name-input');
        const quoteInput = document.getElementById('review-quote-input');
        const nameError = document.getElementById('name-error');
        const quoteError = document.getElementById('quote-error');

        const ratingError = document.getElementById('rating-error');

        // Clear previous errors
        nameError.textContent = '';
        quoteError.textContent = '';
        ratingError.textContent = '';
        nameInput.classList.remove('input-error');
        quoteInput.classList.remove('input-error');

        const name = nameInput.value.trim();
        const quote = quoteInput.value.trim();
        const words = name.split(/\s+/).filter(w => w.length > 0);

        let hasError = false;

        if (!name) {
            nameError.textContent = 'Please enter your full name.';
            nameInput.classList.add('input-error');
            hasError = true;
        } else if (words.length < 2) {
            nameError.textContent = 'Please enter both your first and last name.';
            nameInput.classList.add('input-error');
            hasError = true;
        }

        if (!quote) {
            quoteError.textContent = 'Please write your review before submitting.';
            quoteInput.classList.add('input-error');
            hasError = true;
        }

        const ratingInputs = document.getElementsByName("rating");
        let rating = 0;
        for (let input of ratingInputs) { if (input.checked) { rating = parseInt(input.value); break; } }

        if (!rating) {
            ratingError.textContent = 'Please select a star rating before submitting.';
            hasError = true;
        }

        if (hasError) return;

        const initials = (words[0][0] + words[words.length - 1][0]).toUpperCase();

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stars: rating, quote, name, initials })
            });
            if (!res.ok) { showToast('Failed to submit review.', 'error'); return; }
            showToast('Thank you for your review! 🌟', 'success');
            modal.style.display = "none";
            e.target.reset();
            nameError.textContent = '';
            quoteError.textContent = '';
            ratingError.textContent = '';
            await fetchReviews();
        } catch (err) { showToast('Server error. Please try again.', 'error'); }
    }
    
});
