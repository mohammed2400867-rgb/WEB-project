/* ── Flour & Flame Global Toast Notification System ── */
(function () {
    // Inject styles once
    const style = document.createElement('style');
    style.textContent = `
        #ff-toast-container {
            position: fixed;
            top: 24px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 999999;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            pointer-events: none;
            width: 100%;
            max-width: 420px;
            padding: 0 16px;
            box-sizing: border-box;
        }
        .ff-toast {
            width: 100%;
            background: #111;
            border-radius: 12px;
            padding: 14px 18px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.7);
            pointer-events: all;
            position: relative;
            overflow: hidden;
            animation: ffToastIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275);
        }
        .ff-toast.ff-hiding {
            animation: ffToastOut 0.3s ease forwards;
        }
        @keyframes ffToastIn {
            from { opacity:0; transform:translateY(-20px) scale(0.95); }
            to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes ffToastOut {
            from { opacity:1; transform:translateY(0)    scale(1);    }
            to   { opacity:0; transform:translateY(-16px) scale(0.95); }
        }
        .ff-toast-bar {
            position: absolute;
            bottom: 0; left: 0; height: 3px;
            width: 100%;
            transform-origin: left;
            border-radius: 0 0 12px 12px;
        }
        .ff-toast.success { border: 1px solid rgba(76,175,80,0.4); }
        .ff-toast.success .ff-toast-bar { background: #4CAF50; animation: ffBar var(--dur) linear forwards; }
        .ff-toast.error   { border: 1px solid rgba(255,77,77,0.4); }
        .ff-toast.error   .ff-toast-bar { background: #ff4d4d; animation: ffBar var(--dur) linear forwards; }
        .ff-toast.info    { border: 1px solid rgba(212,175,55,0.4); }
        .ff-toast.info    .ff-toast-bar { background: #d4af37; animation: ffBar var(--dur) linear forwards; }
        .ff-toast.warning { border: 1px solid rgba(255,165,0,0.4); }
        .ff-toast.warning .ff-toast-bar { background: #ffa500; animation: ffBar var(--dur) linear forwards; }
        @keyframes ffBar { from { transform:scaleX(1); } to { transform:scaleX(0); } }

        .ff-toast::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 1px;
        }
        .ff-toast.success::before { background: linear-gradient(90deg,transparent,#4CAF50,transparent); }
        .ff-toast.error::before   { background: linear-gradient(90deg,transparent,#ff4d4d,transparent); }
        .ff-toast.info::before    { background: linear-gradient(90deg,transparent,#d4af37,transparent); }
        .ff-toast.warning::before { background: linear-gradient(90deg,transparent,#ffa500,transparent); }

        .ff-toast-icon { font-size: 1.2rem; flex-shrink: 0; margin-top: 1px; }
        .ff-toast-body { flex: 1; }
        .ff-toast-title {
            font-family: 'Poppins', sans-serif;
            font-size: 0.82rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 3px;
        }
        .ff-toast.success .ff-toast-title { color: #4CAF50; }
        .ff-toast.error   .ff-toast-title { color: #ff4d4d; }
        .ff-toast.info    .ff-toast-title { color: #d4af37; }
        .ff-toast.warning .ff-toast-title { color: #ffa500; }

        .ff-toast-msg {
            font-family: 'Poppins', sans-serif;
            font-size: 0.88rem;
            color: #ccc;
            line-height: 1.4;
        }
        .ff-toast-close {
            background: none; border: none; color: #555;
            font-size: 1rem; cursor: pointer; padding: 0;
            line-height: 1; flex-shrink: 0; margin-top: 1px;
            transition: color 0.2s;
        }
        .ff-toast-close:hover { color: #aaa; }
    `;
    document.head.appendChild(style);

    // Create container
    const container = document.createElement('div');
    container.id = 'ff-toast-container';
    document.body.appendChild(container);

    const ICONS  = { success: '✅', error: '❌', info: '🔔', warning: '⚠️' };
    const TITLES = { success: 'Success', error: 'Error', info: 'Notice', warning: 'Warning' };
    const DURATION = 4000;

    window.showToast = function (message, type = 'info', duration = DURATION) {
        const toast = document.createElement('div');
        toast.className = `ff-toast ${type}`;
        toast.style.setProperty('--dur', duration + 'ms');
        toast.innerHTML = `
            <span class="ff-toast-icon">${ICONS[type] || '🔔'}</span>
            <div class="ff-toast-body">
                <div class="ff-toast-title">${TITLES[type] || 'Notice'}</div>
                <div class="ff-toast-msg">${message}</div>
            </div>
            <button class="ff-toast-close" onclick="this.closest('.ff-toast').remove()">✕</button>
            <div class="ff-toast-bar"></div>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('ff-hiding');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        }, duration);
    };
})();
