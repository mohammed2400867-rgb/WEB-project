document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;

    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("contactName").value;
        const email = document.getElementById("contactEmail").value;
        const subject = document.getElementById("contactSubject").value;
        const message = document.getElementById("contactMessage").value;

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message })
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.message || 'Failed to send message.');
                return;
            }
            alert("Message was successful and we will respond soon");
            contactForm.reset();
        } catch (err) {
            alert("Server error. Please try again.");
        }
    });
});
