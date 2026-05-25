document.addEventListener("DOMContentLoaded", () => {
    const resForm = document.getElementById("reservationForm");
    if (!resForm) return;

    resForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (window.phoneInput && !window.phoneInput.isValidNumber()) {
            alert("Please enter a valid phone number for the selected country.");
            return;
        }

        const name = document.getElementById("resName").value;
        const phone = window.phoneInput ? window.phoneInput.getNumber() : document.getElementById("phone").value;
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
