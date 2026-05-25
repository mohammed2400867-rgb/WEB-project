document.addEventListener("DOMContentLoaded", () => {
    const navLists = document.querySelectorAll("nav ul");
    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    const link = (href, label, color) =>
        `<li class="auth-nav-item"><a href="${href}" class="auth-nav-link" style="color:${color};">${label}</a></li>`;

    navLists.forEach(ul => {
        const links = ul.querySelectorAll("a");
        links.forEach(a => {
            const text = a.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
            if (["login","admin panel","admin dashboard","logout","staff panel","kitchen panel","kitchen","my profile"].includes(text)) {
                if (a.parentElement.tagName.toLowerCase() === 'li') a.parentElement.remove();
                else a.remove();
            }
        });

        if (currentUser) {
            if (currentUser.role === 'Admin') {
                ul.innerHTML += link('AdminDashboard.html', 'Admin Panel', 'var(--gold)');
                ul.innerHTML += link('KitchenDashboard.html', 'Kitchen', '#ff9800');
            } else if (currentUser.role === 'Staff') {
                ul.innerHTML += link('StaffDashboard.html', 'Staff Panel', 'var(--gold)');
                ul.innerHTML += link('KitchenDashboard.html', 'Kitchen', '#ff9800');
            } else if (currentUser.role === 'Kitchen') {
                ul.innerHTML += link('KitchenDashboard.html', 'Kitchen Panel', '#ff9800');
            }
            ul.innerHTML += link('Profile.html', 'My Profile', 'var(--gold)');
            ul.innerHTML += `<li class="auth-nav-item"><a href="#" class="auth-nav-link" style="color:#ff4d4d;" onclick="logoutUser()">Logout</a></li>`;
        } else {
            ul.innerHTML += link('Login.html', 'Login', 'var(--gold)');
        }
    });
});

window.logoutUser = function () {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("my_active_orders");
    localStorage.removeItem("cart");
    window.location.href = "Login.html";
};
