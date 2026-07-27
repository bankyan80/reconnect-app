// Firebase Config (Auth Only)
const firebaseConfig = {
    apiKey: "AIzaSyD3tB4hQKIoUp8K__mv_EkR1TXBpcIgW_Q",
    authDomain: "connect-6f4d1.firebaseapp.com",
    projectId: "connect-6f4d1",
    storageBucket: "connect-6f4d1.firebasestorage.app",
    messagingSenderId: "627412802954",
    appId: "1:627412802954:web:6e2e553fcc086250ddfc73",
    measurementId: "G-Y12Z5PXZP3"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const ROLES = { GUEST: 'guest', MEMBER: 'member', MODERATOR: 'moderator', ADMIN: 'admin' };

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
