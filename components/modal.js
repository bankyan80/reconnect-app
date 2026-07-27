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
