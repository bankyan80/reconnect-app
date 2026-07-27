// Modal Component
const Modal = {
    _onClose: null,
    _lastFocus: null,

    show(content, onClose) {
        const container = document.getElementById('modal-container');
        if (!container) return;

        this._lastFocus = document.activeElement;
        this._onClose = onClose;
        container.innerHTML = `<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative" id="modal-content">${content}</div>`;
        container.classList.remove('hidden');

        // Focus trap
        const modalContent = document.getElementById('modal-content');
        if (modalContent) modalContent.focus();

        // Close on overlay click
        container.onclick = (e) => {
            if (e.target === container) this.close();
        };
    },

    confirm(message, onConfirm) {
        this.show(`
            <div class="text-center">
                <svg class="w-16 h-16 mx-auto text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                <p class="text-gray-700 dark:text-gray-300 mb-4">${escapeHtml(message)}</p>
                <div class="flex gap-3 justify-center">
                    <button onclick="Modal.close()" class="btn-outline">Batal</button>
                    <button onclick="Modal.close(); Modal._confirmCb()" class="btn-danger">Hapus</button>
                </div>
            </div>`);
        this._confirmCb = onConfirm;
    },

    close() {
        const container = document.getElementById('modal-container');
        if (!container) return;
        container.classList.add('hidden');
        container.onclick = null;

        if (typeof this._onClose === 'function') {
            this._onClose();
        }
        this._onClose = null;

        // Return focus
        if (this._lastFocus && typeof this._lastFocus.focus === 'function') {
            this._lastFocus.focus();
        }
        this._lastFocus = null;
    }
};
