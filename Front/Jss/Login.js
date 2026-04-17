const emailInp = document.getElementById('email');
        const passInp = document.getElementById('password');
        const btn = document.getElementById('submitBtn');
        const status = document.getElementById('status');
        const toggleBtn = document.getElementById('togglePass');

        toggleBtn.addEventListener('click', () => {
            const isPass = passInp.type === 'password';
            passInp.type = isPass ? 'text' : 'password';
            toggleBtn.textContent = isPass ? 'HIDE' : 'SHOW';
        });

        async function handleLogin() {
            const email = emailInp.value.trim();
            const pass = passInp.value;

            if (!email || !pass) {
                status.style.color = "#ff4d4d";
                status.textContent = "Please enter your credentials.";
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<span class="loader"></span> AUTHENTICATING...';
            status.textContent = "";

            // Wait 1.5 seconds to feel "secure"
            await new Promise(r => setTimeout(r, 1500));

            status.style.color = "#d4af37";
            status.textContent = "Welcome back. Preparing your table...";

            setTimeout(() => {
                window.location.href = DESTINATION_PAGE;
            }, 1000);
        }

        btn.addEventListener('click', handleLogin);
        window.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });