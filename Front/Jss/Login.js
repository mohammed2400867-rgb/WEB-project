const emailInp = document.getElementById('email');
const passInp = document.getElementById('password');
const btn = document.getElementById('submitBtn');
const status = document.getElementById('status');
const toggleBtn = document.getElementById('togglePass');

const emailError = document.getElementById('emailError');
const passStrengthBar = document.getElementById('passStrengthBar');
const passStrengthText = document.getElementById('passStrengthText');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

emailInp.addEventListener('input', () => {
    const email = emailInp.value.trim();
    if (!email) {
        emailError.textContent = "";
        return;
    }
    if (!emailRegex.test(email)) {
        emailError.style.color = "#ff4d4d";
        emailError.textContent = "Invalid email format";
    } else {
        emailError.style.color = "#4CAF50";
        emailError.textContent = "Valid email";
    }
});

passInp.addEventListener('input', () => {
    const pass = passInp.value;
    if (!pass) {
        passStrengthBar.style.width = "0%";
        passStrengthText.textContent = "";
        return;
    }
    
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;

    if (strength <= 2) {
        passStrengthBar.style.width = "33%";
        passStrengthBar.style.backgroundColor = "#ff4d4d";
        passStrengthText.style.color = "#ff4d4d";
        passStrengthText.textContent = "Weak";
    } else if (strength === 3 || strength === 4) {
        passStrengthBar.style.width = "66%";
        passStrengthBar.style.backgroundColor = "#ffa500";
        passStrengthText.style.color = "#ffa500";
        passStrengthText.textContent = "Medium";
    } else {
        passStrengthBar.style.width = "100%";
        passStrengthBar.style.backgroundColor = "#4CAF50";
        passStrengthText.style.color = "#4CAF50";
        passStrengthText.textContent = "Strong";
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

// Seed default users
const defaultUsers = [
    { email: 'admin@flourandflame.com', pass: 'Admin123!' },
    { email: 'staff@flourandflame.com', pass: 'Staff123!' },
    { email: 'kitchen@flourandflame.com', pass: 'Kitchen123!' },
];
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(defaultUsers));
}

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

    if (!email || !pass) {
        status.style.color = "#ff4d4d";
        status.textContent = "Please enter your credentials.";
        return;
    }

    if (!emailRegex.test(email)) {
        status.style.color = "#ff4d4d";
        status.textContent = "Please enter a valid email format.";
        return;
    }

    if (pass.length < 6) {
        status.style.color = "#ff4d4d";
        status.textContent = "Password must be at least 6 characters long.";
        return;
    }

    if (isSignUpMode) {
        const cPass = confirmPassword.value;
        if (pass !== cPass) {
            status.style.color = "#ff4d4d";
            status.textContent = "Passwords do not match.";
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(u => u.email === email)) {
            status.style.color = "#ff4d4d";
            status.textContent = "Email is already registered.";
            return;
        }
        
        users.push({ email, pass });
        localStorage.setItem('users', JSON.stringify(users));
        
        btn.disabled = true;
        btn.innerHTML = '<span class="loader"></span> CREATING ACCOUNT...';
        status.style.color = "#4CAF50";
        status.textContent = "Account created successfully! Logging in...";
        
        setTimeout(() => {
            window.location.href = "Menu.html";
        }, 1500);
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.pass === pass);
    
    if (!user) {
        status.style.color = "#ff4d4d";
        status.textContent = "Invalid email or password.";
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="loader"></span> AUTHENTICATING...';
    status.textContent = "";

    await new Promise(r => setTimeout(r, 1500));

    status.style.color = "#d4af37";

    let destination = "Menu.html";
    
    // Check dynamic staff list
    const staffMembers = JSON.parse(localStorage.getItem('staff')) || [];
    const staffRecord = staffMembers.find(s => s.email === email);
    
    if(staffRecord) {
        localStorage.setItem('currentUser', JSON.stringify({ email: email, role: staffRecord.role }));
        if (staffRecord.role === 'Admin') {
            destination = "AdminDashboard.html";
            status.textContent = "Welcome Admin. Accessing system...";
        } else {
            destination = "StaffDashboard.html";
            status.textContent = "Welcome Staff. Accessing orders...";
        }
    } else if(email.includes('admin')) {
        localStorage.setItem('currentUser', JSON.stringify({ email: email, role: 'Admin' }));
        destination = "AdminDashboard.html";
        status.textContent = "Welcome Admin. Accessing system...";
    } else if(email.includes('staff')) {
        localStorage.setItem('currentUser', JSON.stringify({ email: email, role: 'Staff' }));
        destination = "StaffDashboard.html";
        status.textContent = "Welcome Staff. Accessing orders...";
    } else if(email.includes('kitchen')) {
        localStorage.setItem('currentUser', JSON.stringify({ email: email, role: 'Kitchen' }));
        destination = "KitchenDashboard.html";
        status.textContent = "Welcome Chef. Accessing kitchen...";
    } else {
        localStorage.setItem('currentUser', JSON.stringify({ email: email, role: 'Customer' }));
        status.textContent = "Welcome back. Preparing your table...";
    }

    setTimeout(() => {
        window.location.href = destination;
    }, 1000);
}

btn.addEventListener('click', handleLogin);
window.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});

