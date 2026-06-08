(function () {
    // Apply saved theme immediately to avoid flash
    const saved = localStorage.getItem('ff-theme');
    if (saved === 'light') document.body.classList.add('light-mode');

    function injectToggle() {
        if (document.getElementById('theme-toggle-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'theme-toggle-btn';
        btn.title = 'Toggle dark / light mode';
        btn.textContent = document.body.classList.contains('light-mode') ? '🌙' : '☀️';

        btn.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-mode');
            localStorage.setItem('ff-theme', isLight ? 'light' : 'dark');
            btn.textContent = isLight ? '🌙' : '☀️';
        });

        const ul = document.querySelector('header nav ul') || document.querySelector('#nav-links');
        if (!ul) {
            const header = document.querySelector('header');
            if (header) header.appendChild(btn);
            return;
        }

        const li = document.createElement('li');
        li.id = 'theme-toggle-li';
        li.style.marginLeft = 'auto'; // push toggle + MY PROFILE + LOGOUT to the right
        li.appendChild(btn);

        // Find the "My Profile" li and insert the toggle before it
        const allLis = ul.querySelectorAll('li');
        let inserted = false;
        allLis.forEach(item => {
            const text = item.textContent.trim().toLowerCase();
            if ((text === 'my profile' || text === 'login') && !inserted) {
                ul.insertBefore(li, item);
                inserted = true;
            }
        });

        // Fallback: if MY PROFILE not found yet, append to end
        if (!inserted) ul.appendChild(li);
    }

    // Inject after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectToggle);
    } else {
        injectToggle();
    }
})();
