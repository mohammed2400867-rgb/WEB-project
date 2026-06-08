// ── Reservation Status Checker ──
async function checkReservationStatus() {
    const input = document.getElementById('checkResId');
    const resultBox = document.getElementById('res-status-result');
    const id = input.value.trim().toUpperCase();

    if (!id) { resultBox.innerHTML = `<p style="color:#ff4d4d;">Please enter a reservation ID.</p>`; return; }

    resultBox.innerHTML = `<p style="color:#aaa;">Looking up ${id}...</p>`;

    try {
        const res = await fetch(`/api/reservations/${id}`);
        const data = await res.json();
        if (!res.ok) { resultBox.innerHTML = `<p style="color:#ff4d4d;">${data.message}</p>`; return; }

        const statusColors = { Pending: '#d4af37', Confirmed: '#4CAF50', Declined: '#ff4d4d' };
        const statusIcons  = { Pending: '⏳', Confirmed: '✅', Declined: '❌' };
        const color = statusColors[data.status] || '#aaa';
        const icon  = statusIcons[data.status]  || '❓';
        const date  = new Date(data.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

        resultBox.innerHTML = `
            <div style="background:#111; border:1px solid ${color}; border-radius:10px; padding:20px; margin-top:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span style="font-weight:700; color:#f4f1ea; font-size:1rem;">${data.reservationId}</span>
                    <span style="background:${color}22; color:${color}; border:1px solid ${color}; border-radius:20px; padding:4px 14px; font-size:0.82rem; font-weight:700;">${icon} ${data.status}</span>
                </div>
                <p style="color:#bbb; font-size:0.85rem; margin:4px 0;">👤 ${data.name}</p>
                <p style="color:#bbb; font-size:0.85rem; margin:4px 0;">📅 ${date}</p>
                <p style="color:#bbb; font-size:0.85rem; margin:4px 0;">👥 ${data.guests} Guest(s)</p>
                ${data.requests ? `<p style="color:#888; font-size:0.82rem; margin-top:8px; font-style:italic;">"${data.requests}"</p>` : ''}
            </div>`;
    } catch (err) {
        resultBox.innerHTML = `<p style="color:#ff4d4d;">Server error. Please try again.</p>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Auto-fill last reservation ID from localStorage
    const saved = JSON.parse(localStorage.getItem('my_reservations') || '[]');
    if (saved.length) {
        const checkInput = document.getElementById('checkResId');
        if (checkInput) checkInput.value = saved[saved.length - 1];
    }
    const resForm = document.getElementById("reservationForm");
    if (!resForm) return;

    // Set minimum datetime to right now so past date/time cannot be selected
    const dateInput = document.getElementById("resDate");
    if (dateInput) {
        const now = new Date();
        // Format: YYYY-MM-DDTHH:MM  (datetime-local format)
        const yyyy = now.getFullYear();
        const mm   = String(now.getMonth() + 1).padStart(2, '0');
        const dd   = String(now.getDate()).padStart(2, '0');
        const hh   = String(now.getHours()).padStart(2, '0');
        const min  = String(now.getMinutes()).padStart(2, '0');
        dateInput.min = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
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

        // --- DATE & TIME validation ---
        if (!date) {
            showToast('Please select a reservation date and time.', 'error');
            const dateEl = document.getElementById("resDate");
            if (dateEl) { dateEl.style.border = '1px solid #ff4d4d'; dateEl.focus(); }
            return;
        }

        const selectedDate = new Date(date);
        const now = new Date();

        // Must not be in the past
        if (selectedDate <= now) {
            showToast('Please select a future date and time.', 'error');
            const dateEl = document.getElementById("resDate");
            if (dateEl) { dateEl.style.border = '1px solid #ff4d4d'; dateEl.focus(); }
            return;
        }

        // Check operating hours:
        // Mon(1)–Thu(4): 5:00 PM – 10:00 PM  →  17:00 – 22:00
        // Fri(5)–Sun(0): 4:00 PM – 11:30 PM  →  16:00 – 23:30
        const dayOfWeek = selectedDate.getDay(); // 0=Sun, 1=Mon ... 6=Sat
        const hours   = selectedDate.getHours();
        const minutes = selectedDate.getMinutes();
        const timeInMinutes = hours * 60 + minutes;

        let openTime, closeTime, hoursLabel;
        const isWeekend = (dayOfWeek === 0 || dayOfWeek >= 5); // Fri, Sat, Sun

        if (isWeekend) {
            openTime   = 16 * 60;        // 4:00 PM
            closeTime  = 23 * 60 + 30;   // 11:30 PM
            hoursLabel = '4:00 PM – 11:30 PM';
        } else {
            openTime   = 17 * 60;        // 5:00 PM
            closeTime  = 22 * 60;        // 10:00 PM
            hoursLabel = '5:00 PM – 10:00 PM';
        }

        if (timeInMinutes < openTime || timeInMinutes >= closeTime) {
            const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
            showToast(
                `We are not open at that time on ${dayNames[dayOfWeek]}. Our hours are ${hoursLabel}.`,
                'error',
                6000
            );
            const dateEl = document.getElementById("resDate");
            if (dateEl) { dateEl.style.border = '1px solid #ff4d4d'; dateEl.focus(); }
            return;
        }

        if (document.getElementById("resDate")) document.getElementById("resDate").style.border = '';
        const guests = document.getElementById("resGuests").value;
        const requests = document.getElementById("resRequests").value;

        // Show spinner
        const submitBtn = resForm.querySelector('button[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '⏳ Submitting...'; }

        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, date, guests, requests })
            });
            const resData = await res.json();
            if (!res.ok) {
                showToast(resData.message || 'Failed to submit reservation.', 'error');
                return;
            }
            const resId = resData.reservationId || '';
            // Save to localStorage so guest can check status later
            const saved = JSON.parse(localStorage.getItem('my_reservations') || '[]');
            if (resId && !saved.includes(resId)) { saved.push(resId); localStorage.setItem('my_reservations', JSON.stringify(saved)); }
            // Pre-fill the check status input
            if (resId) {
                const checkInput = document.getElementById('checkResId');
                if (checkInput) checkInput.value = resId;
            }
            showToast(`Reservation submitted! Your ID: ${resId} — We will confirm shortly.`, 'success', 6000);
            resForm.reset();
        } catch (err) {
            showToast('Server error. Please try again.', 'error');
        } finally {
            // Always reset button whether success or failure
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Book Table'; }
        }
    });
});
