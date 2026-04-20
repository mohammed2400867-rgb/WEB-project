document.addEventListener("DOMContentLoaded", () => {
    const resForm = document.getElementById("reservationForm");
    if (!resForm) return;

    resForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // intl-tel-input validation is handled in Reservation.html's existing script but we can check it
        if (window.phoneInput && !window.phoneInput.isValidNumber()) {
            alert("Please enter a valid phone number for the selected country.");
            return;
        }

        const name = document.getElementById("resName").value;
        const phone = window.phoneInput ? window.phoneInput.getNumber() : document.getElementById("phone").value;
        const date = document.getElementById("resDate").value;
        const guests = document.getElementById("resGuests").value;
        const requests = document.getElementById("resRequests").value;

        const newReservation = {
            id: "RES-" + Math.floor(Math.random() * 10000),
            name,
            phone,
            date,
            guests,
            requests,
            status: "Pending",
            timestamp: new Date().toLocaleTimeString()
        };

        const reservations = JSON.parse(localStorage.getItem("reservations")) || [];
        reservations.push(newReservation);
        localStorage.setItem("reservations", JSON.stringify(reservations));

        alert("Reservation was successful, waiting for response");
        resForm.reset();
    });
});
