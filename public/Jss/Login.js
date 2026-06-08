const emailInp = document.getElementById('email');
const passInp = document.getElementById('password');
const btn = document.getElementById('submitBtn');
const status = document.getElementById('status');
const toggleBtn = document.getElementById('togglePass');

const emailError = document.getElementById('emailError');
const passStrengthBar = document.getElementById('passStrengthBar');
const passStrengthText = document.getElementById('passStrengthText');
const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|flourandflame\.com)$/i;

emailInp.addEventListener('input', () => {
    const email = emailInp.value.trim();
    if (!email) { emailError.textContent = ""; return; }
    if (!emailRegex.test(email)) {
        emailError.style.color = "#ff4d4d";
        emailError.textContent = "invalid email form";
    } else {
        emailError.style.color = "#4CAF50";
        emailError.textContent = "Valid email";
    }
});

passInp.addEventListener('input', () => {
    const pass = passInp.value;
    if (!pass) { passStrengthBar.style.width = "0%"; passStrengthText.textContent = ""; return; }
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    if (strength <= 2) {
        passStrengthBar.style.width = "33%"; passStrengthBar.style.backgroundColor = "#ff4d4d";
        passStrengthText.style.color = "#ff4d4d"; passStrengthText.textContent = "Weak";
    } else if (strength <= 4) {
        passStrengthBar.style.width = "66%"; passStrengthBar.style.backgroundColor = "#ffa500";
        passStrengthText.style.color = "#ffa500"; passStrengthText.textContent = "Medium";
    } else {
        passStrengthBar.style.width = "100%"; passStrengthBar.style.backgroundColor = "#4CAF50";
        passStrengthText.style.color = "#4CAF50"; passStrengthText.textContent = "Strong";
    }
});

toggleBtn.addEventListener('click', () => {
    const isPass = passInp.type === 'password';
    passInp.type = isPass ? 'text' : 'password';
    toggleBtn.textContent = isPass ? 'HIDE' : 'SHOW';
});

const confirmPassword = document.getElementById('confirmPassword');
const confirmPassError = document.getElementById('confirmPassError');

confirmPassword.addEventListener('input', () => {
    if (confirmPassword.value !== passInp.value) {
        confirmPassError.textContent = "Passwords do not match";
        confirmPassError.style.color = "#ff4d4d";
    } else if (confirmPassword.value === "") {
        confirmPassError.textContent = "";
    } else {
        confirmPassError.textContent = "Passwords match";
        confirmPassError.style.color = "#4CAF50";
    }
});

let isSignUpMode = false;
const toggleAuthMode = document.getElementById('toggleAuthMode');
const confirmPassGroup = document.getElementById('confirmPassGroup');

toggleAuthMode.addEventListener('click', (e) => {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    if (isSignUpMode) {
        confirmPassGroup.style.display = 'block';
        document.getElementById('strengthContainer').style.display = 'block';
        passStrengthText.style.display = 'block';
        btn.textContent = 'Sign Up';
        toggleAuthMode.textContent = 'Already have an account? Sign In';
    } else {
        confirmPassGroup.style.display = 'none';
        document.getElementById('strengthContainer').style.display = 'none';
        passStrengthText.style.display = 'none';
        btn.textContent = 'Sign In';
        toggleAuthMode.textContent = "Don't have an account? Sign Up";
    }
    status.textContent = '';
});

async function handleLogin() {
    const email = emailInp.value.trim();
    const pass = passInp.value;

    if (!email || !pass) { status.style.color = "#ff4d4d"; status.textContent = "Please enter your credentials."; return; }
    if (!emailRegex.test(email)) { status.style.color = "#ff4d4d"; status.textContent = "invalid email form"; return; }
    if (pass.length < 6) { status.style.color = "#ff4d4d"; status.textContent = "Password must be at least 6 characters long."; return; }

    if (isSignUpMode) {
        const cPass = confirmPassword.value;
        if (pass !== cPass) { status.style.color = "#ff4d4d"; status.textContent = "Passwords do not match."; return; }

        btn.disabled = true;
        btn.innerHTML = '<span class="loader"></span> CREATING ACCOUNT...';

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass })
            });
            const data = await res.json();
            if (!res.ok) {
                status.style.color = "#ff4d4d";
                status.textContent = data.message || "Registration failed.";
                btn.disabled = false;
                btn.textContent = 'Sign Up';
                return;
            }
            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUser', JSON.stringify({ email: data.email, role: data.role, _id: data._id }));
            status.style.color = "#4CAF50";
            status.textContent = "Account created successfully! Logging in...";
            setTimeout(() => { window.location.href = "Menu.html"; }, 1500);
        } catch (err) {
            status.style.color = "#ff4d4d";
            status.textContent = "Server error. Please try again.";
            btn.disabled = false;
            btn.textContent = 'Sign Up';
        }
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="loader"></span> AUTHENTICATING...';
    status.textContent = "";

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass })
        });
        const data = await res.json();
        if (!res.ok) {
            status.style.color = "#ff4d4d";
            status.textContent = data.message || "Invalid email or password.";
            btn.disabled = false;
            btn.textContent = 'Sign In';
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify({ email: data.email, role: data.role, _id: data._id }));
        status.style.color = "#d4af37";

        let destination = "Menu.html";
        if (data.role === 'Admin') { destination = "AdminDashboard.html"; status.textContent = "Welcome Admin. Accessing system..."; }
        else if (data.role === 'Staff') { destination = "StaffDashboard.html"; status.textContent = "Welcome Staff. Accessing orders..."; }
        else if (data.role === 'Kitchen') { destination = "KitchenDashboard.html"; status.textContent = "Welcome Chef. Accessing kitchen..."; }
        else { status.textContent = "Welcome back. Preparing your table..."; }

        setTimeout(() => { window.location.href = destination; }, 1000);
    } catch (err) {
        status.style.color = "#ff4d4d";
        status.textContent = "Server error. Please try again.";
        btn.disabled = false;
        btn.textContent = 'Sign In';
    }
}

btn.addEventListener('click', handleLogin);
window.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });

// ── PIN Overlay ──
let pinValue = '';

const secretPinLogin = document.getElementById('secret-pin-login');
if (secretPinLogin) {
    secretPinLogin.addEventListener('click', () => {
        pinValue = '';
        updatePinDots();
        document.getElementById('pin-error').textContent = '';
        document.getElementById('pin-subtitle').textContent = 'Enter your 4-digit PIN';
        document.getElementById('admin-pin-overlay').style.display = 'flex';
    });
}

function closeAdminPin() {
    pinValue = '';
    updatePinDots();
    document.getElementById('pin-error').textContent = '';
    document.getElementById('admin-pin-overlay').style.display = 'none';
}

function pinPress(digit) {
    if (pinValue.length >= 4) return;
    pinValue += digit;
    updatePinDots();
    if (pinValue.length === 4) setTimeout(checkPin, 120);
}

function pinDelete() {
    pinValue = pinValue.slice(0, -1);
    updatePinDots();
    document.getElementById('pin-error').textContent = '';
}

function updatePinDots() {
    for (let i = 0; i < 4; i++) {
        const dot = document.getElementById('pin-dot-' + i);
        dot.classList.remove('filled', 'error');
        if (i < pinValue.length) dot.classList.add('filled');
    }
}

function checkPin() {
    const PINS = { '1111': { email: 'admin@flourandflame.com', password: 'Admin123!' },
                   '2222': { email: 'staff@flourandflame.com', password: 'Staff123!' },
                   '3333': { email: 'kitchen@flourandflame.com', password: 'Kitchen123!' } };

    if (!PINS[pinValue]) {
        // Wrong PIN
        for (let i = 0; i < 4; i++) {
            const dot = document.getElementById('pin-dot-' + i);
            dot.classList.remove('filled');
            dot.classList.add('error');
        }
        document.getElementById('pin-error').textContent = 'Incorrect PIN. Try again.';
        const modal = document.getElementById('pin-modal');
        modal.classList.add('shake');
        modal.addEventListener('animationend', () => modal.classList.remove('shake'), { once: true });
        setTimeout(() => { pinValue = ''; updatePinDots(); }, 700);
        return;
    }

    // Correct — fill credentials and auto-submit
    const creds = PINS[pinValue];
    document.getElementById('admin-pin-overlay').style.display = 'none';
    document.getElementById('email').value = creds.email;
    document.getElementById('password').value = creds.password;
    document.getElementById('passStrengthBar').style.width = '100%';
    document.getElementById('passStrengthBar').style.backgroundColor = '#4CAF50';
    pinValue = '';
    handleLogin();
}

// Keyboard support while PIN overlay is open
document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('admin-pin-overlay');
    if (!overlay || overlay.style.display === 'none') return;
    if (e.key >= '0' && e.key <= '9') pinPress(e.key);
    else if (e.key === 'Backspace') pinDelete();
    else if (e.key === 'Escape') closeAdminPin();
});
