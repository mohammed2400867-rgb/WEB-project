document.addEventListener("DOMContentLoaded", () => {
    const resForm = document.getElementById("reservationForm");
    if (!resForm) return;

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
            alert("Please enter a valid phone number for the selected country.");
            return;
        }

        const name = document.getElementById("resName").value;
        const phone = phoneInputInstance ? phoneInputInstance.getNumber() : document.getElementById("phone").value;
        const date = document.getElementById("resDate").value;
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
                alert(data.message || 'Failed to submit reservation.');
                return;
            }
            alert("Reservation was successful, waiting for response");
            resForm.reset();
        } catch (err) {
            alert("Server error. Please try again.");
        }
    });
});
