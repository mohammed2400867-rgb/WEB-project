const defaultReviews = [
    {
        stars: 5,
        quote: "The Margherita DOC is easily the best in the city. You can really taste the quality of the wood-fired oven. An absolute must-visit.",
        initials: "MA",
        name: "Marco A."
    },
    {
        stars: 5,
        quote: "I love that they focus on quality ingredients. The lasagna was rich and authentic. Plus, the alcohol-free mocktails are actually creative and delicious!",
        initials: "SL",
        name: "Sarah L."
    },
    {
        stars: 5,
        quote: "The atmosphere is perfect for a business dinner. Professional service and the truffle tagliatelle was unforgettable.",
        initials: "JD",
        name: "Julian D."
    },
    {
        stars: 5,
        quote: "Finally, a high-end Italian restaurant that understands artisanal drinks! The Sicilian Sunset is refreshing and looks beautiful.",
        initials: "RK",
        name: "Robert K."
    },
    {
        stars: 5,
        quote: "As a student of business, I appreciate the branding here. But as a foodie, I appreciate that crust! Thin, crispy, and perfectly charred.",
        initials: "AH",
        name: "Ahmed H."
    },
    {
        stars: 5,
        quote: "The Tiramisu is life-changing. It's light, creamy, and has just the right amount of espresso kick. Great spot for dessert enthusiasts.",
        initials: "EM",
        name: "Elena M."
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("reviewModal");
    const btn = document.getElementById("openReview");
    const span = document.getElementById("closeReview");
    const reviewsContainer = document.getElementById("reviewsContainer");

    // Load or initialize reviews
    let reviews = JSON.parse(localStorage.getItem("reviews"));
    if (!reviews || reviews.length === 0) {
        reviews = [...defaultReviews];
        localStorage.setItem("reviews", JSON.stringify(reviews));
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

    renderReviews();

    btn.onclick = function() { modal.style.display = "flex"; }
    span.onclick = function() { modal.style.display = "none"; }
    window.onclick = function(event) { if (event.target == modal) { modal.style.display = "none"; } }

    document.getElementById("reviewForm").onsubmit = function(e) {
        e.preventDefault();
        
        // Get rating
        const ratingInputs = document.getElementsByName("rating");
        let rating = 5;
        for (let input of ratingInputs) {
            if (input.checked) {
                rating = parseInt(input.value);
                break;
            }
        }

        // Get Name and Quote
        const formInputs = e.target.querySelectorAll("input[type='text'], textarea");
        const nameInput = formInputs[0].value.trim();
        const quoteInput = formInputs[1].value.trim();

        if (!nameInput || !quoteInput) return;

        // Generate Initials
        const words = nameInput.split(" ").filter(w => w.length > 0);
        let initials = "";
        if (words.length === 1) {
            initials = words[0].substring(0, 2).toUpperCase();
        } else if (words.length > 1) {
            initials = (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }

        // Add Review
        reviews.unshift({
            stars: rating,
            quote: quoteInput,
            initials: initials,
            name: nameInput
        });

        localStorage.setItem("reviews", JSON.stringify(reviews));
        renderReviews();

        alert("Thank you for your review!");
        modal.style.display = "none";
        e.target.reset();
    }
});