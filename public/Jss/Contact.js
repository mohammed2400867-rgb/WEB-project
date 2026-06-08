document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;

    // Helper: highlight field red on error, clear on fix
    function fieldError(id, msg) {
        const el = document.getElementById(id);
        if (el) { el.style.border = '1px solid #ff4d4d'; el.focus(); }
        showToast(msg, 'error');
    }
    function fieldClear(id) {
        const el = document.getElementById(id);
        if (el) el.style.border = '';
    }

    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name    = document.getElementById("contactName").value.trim();
        const email   = document.getElementById("contactEmail").value.trim();
        const subject = document.getElementById("contactSubject").value.trim();
        const message = document.getElementById("contactMessage").value.trim();

        // --- NAME validation: must have at least first + last name ---
        const nameParts = name.split(/\s+/).filter(p => p.length > 0);
        if (!name) {
            fieldError('contactName', 'Please enter your full name.'); return;
        }
        if (nameParts.length < 2) {
            fieldError('contactName', 'Please enter both your first and last name.'); return;
        }
        if (!/^[a-zA-Z\s'-]+$/.test(name)) {
            fieldError('contactName', 'Name can only contain letters, spaces, hyphens or apostrophes.'); return;
        }
        fieldClear('contactName');

        // --- EMAIL validation ---
        if (!email) {
            fieldError('contactEmail', 'Please enter your email address.'); return;
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
        if (!emailRegex.test(email)) {
            fieldError('contactEmail', 'invalid email form'); return;
        }
        fieldClear('contactEmail');

        // Show spinner
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '⏳ Sending...'; }

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
        } finally {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
        }
    });
});
