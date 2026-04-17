 document.addEventListener("DOMContentLoaded",() => {
    const form = document.getElementById("reservationForm");

    form.addEventListener("submit", function (e) {
        e.preventDefault(); // stop page refresh

        // Get values
        const name = form.querySelector('input[type="text"]').value;
        const date = form.querySelector('input[type="date"]').value;
        const guests = form.querySelector('select').value;
        const requests = form.querySelector('textarea').value;

        // Simple validation
        if (name === "" || date === "") {
            alert("Please fill all required fields!");
            return;
        }

        // Reset form after submission
        form.reset();
    });
});