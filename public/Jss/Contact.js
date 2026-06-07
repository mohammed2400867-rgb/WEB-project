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
                showToast(data.message || 'Failed to send message.', 'error');
                return;
            }
            showToast('Message sent! We will respond soon.', 'success');
            contactForm.reset();
        } catch (err) {
            showToast('Server error. Please try again.', 'error');
        }
    });
});
