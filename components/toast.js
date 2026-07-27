// Toast Notification Component
const Toast = {
    MAX_TOASTS: 5,

    show(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        const icons = {
            success: '<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
            error: '<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
            warning: '<svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>',
            info: '<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
        };

        // Enforce max toasts
        while (container.childElementCount >= this.MAX_TOASTS) {
            container.removeChild(container.firstChild);
        }

        const colors = { success: 'border-green-500', error: 'border-red-500', warning: 'border-yellow-500', info: 'border-blue-500' };
        const el = document.createElement('div');
        el.className = `toast-enter bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 ${colors[type] || colors.info} p-4 flex items-center gap-3 min-w-[300px] max-w-md`;
        el.innerHTML = `${icons[type] || icons.info}<p class="text-sm text-gray-700 dark:text-gray-200 flex-1">${message}</p>`;
        el.onclick = () => el.remove();

        container.appendChild(el);
        setTimeout(() => {
            el.className = 'toast-exit bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 ' + (colors[type] || colors.info) + ' p-4 flex items-center gap-3 min-w-[300px] max-w-md';
            setTimeout(() => el.remove(), 300);
        }, duration);
    }
};
