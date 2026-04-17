    document.addEventListener("DOMContentLoaded",() => {
    
    const modal = document.getElementById("reviewModal");
        const btn = document.getElementById("openReview");
        const span = document.getElementById("closeReview");

        btn.onclick = function() { modal.style.display = "flex"; }
        span.onclick = function() { modal.style.display = "none"; }
        window.onclick = function(event) { if (event.target == modal) { modal.style.display = "none"; } }

        document.getElementById("reviewForm").onsubmit = function(e) {
            e.preventDefault();
            alert("Thank you for your review! It has been submitted for moderation.");
            modal.style.display = "none";
        }
    })