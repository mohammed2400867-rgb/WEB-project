document.addEventListener("DOMContentLoaded", () => {
    const navLists = document.querySelectorAll("nav ul");
    const currentUserStr = localStorage.getItem("currentUser");
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    navLists.forEach(ul => {
        // Remove existing Login and Admin links to prevent duplicates
        const links = ul.querySelectorAll("a");
        links.forEach(a => {
            const text = a.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
            if (text === "login" || text === "admin panel" || text === "admin dashboard" || text === "logout") {
                if (a.parentElement.tagName.toLowerCase() === 'li') {
                    a.parentElement.remove();
                } else {
                    a.remove();
                }
            }
        });

        const isWhiteText = ul.closest('header') && !ul.closest('.menu-section') && !window.location.href.includes('Reviews.html') && !window.location.href.includes('Reservation.html');
        // Let's use the standard style from the existing pages
        const baseStyle = "color: #fff; text-decoration: none; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px;";
        const darkStyle = "color: #000; text-decoration: none; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px;";
        
        // We inject as standard <li>
        if (currentUser) {
            // Role based links
            if (currentUser.role === 'Admin') {
                ul.innerHTML += `<li style="margin-left: 35px;"><a href="AdminDashboard.html" style="color: var(--gold); border: 1px solid var(--gold); padding: 5px 10px; border-radius: 4px; text-decoration: none; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px;">Admin Panel</a></li>`;
                ul.innerHTML += `<li style="margin-left: 35px;"><a href="KitchenDashboard.html" style="color: #ff9800; border: 1px solid #ff9800; padding: 5px 10px; border-radius: 4px; text-decoration: none; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px;">Kitchen</a></li>`;
            } else if (currentUser.role === 'Staff') {
                ul.innerHTML += `<li style="margin-left: 35px;"><a href="StaffDashboard.html" style="color: var(--gold); text-decoration: underline; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px;">Staff Panel</a></li>`;
                ul.innerHTML += `<li style="margin-left: 35px;"><a href="KitchenDashboard.html" style="color: #ff9800; text-decoration: none; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px;">Kitchen</a></li>`;
            } else if (currentUser.role === 'Kitchen') {
                ul.innerHTML += `<li style="margin-left: 35px;"><a href="KitchenDashboard.html" style="color: #ff9800; border: 1px solid #ff9800; padding: 5px 10px; border-radius: 4px; text-decoration: none; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px;">Kitchen Panel</a></li>`;
            }
            
            // Logout
            ul.innerHTML += `<li style="margin-left: 35px;"><a href="#" onclick="logoutUser()" style="color: #ff4d4d; border: 1px solid #ff4d4d; padding: 5px 10px; border-radius: 4px; text-decoration: none; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px;">Logout</a></li>`;
        } else {
            // Not logged in
            ul.innerHTML += `<li style="margin-left: 35px;"><a href="Login.html" style="color: var(--gold); text-decoration: none; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px;">Login</a></li>`;
        }
    });
});

window.logoutUser = function() {
    localStorage.removeItem("currentUser");
    window.location.href = "Login.html";
};
