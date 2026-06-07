document.addEventListener("DOMContentLoaded", () => {
    const resForm = document.getElementById("reservationForm");
    if (!resForm) return;

    // Set minimum date to today so past dates cannot be selected
    const dateInput = document.getElementById("resDate");
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.min = `${yyyy}-${mm}-${dd}`;
    }

    // Initialize phone input within DOMContentLoaded closure to avoid global variables
    const phoneInputField = document.getElementById("phone");
    let phoneInputInstance = null;
    if (phoneInputField && window.intlTelInput) {
        phoneInputInstance = window.intlTelInput(phoneInputField, {
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
            initialCountry: "auto",
            geoIpLookup: function (callback) {
                fetch("https://ipapi.co/json")
                    .then(res => res.json())
                    .then(data => callback(data.country_code))
                    .catch(() => callback("us"));
            }
        });
    }

    resForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (phoneInputInstance && !phoneInputInstance.isValidNumber()) {
            showToast('Please enter a valid phone number for the selected country.', 'error');
            return;
        }

        const name = document.getElementById("resName").value.trim();
        const phone = phoneInputInstance ? phoneInputInstance.getNumber() : document.getElementById("phone").value;
        const date = document.getElementById("resDate").value;

        // Validate date is not in the past
        if (!date) {
            showToast('Please select a reservation date.', 'error');
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(date);
        if (selectedDate < today) {
            showToast('Please select a future date. Past dates are not allowed.', 'error');
            const dateEl = document.getElementById("resDate");
            if (dateEl) { dateEl.style.border = '1px solid #ff4d4d'; dateEl.focus(); }
            return;
        }
        if (document.getElementById("resDate")) document.getElementById("resDate").style.border = '';
        const guests = document.getElementById("resGuests").value;
        const requests = document.getElementById("resRequests").value;

        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, date, guests, requests })
            });
            if (!res.ok) {
                const data = await res.json();
                showToast(data.message || 'Failed to submit reservation.', 'error');
                return;
            }
            showToast('Reservation submitted! We will confirm shortly.', 'success');
            resForm.reset();
        } catch (err) {
            showToast('Server error. Please try again.', 'error');
        }
    });
});
