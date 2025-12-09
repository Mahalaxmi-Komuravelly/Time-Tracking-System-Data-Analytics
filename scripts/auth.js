import { 
    auth, 
    googleProvider,
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    onAuthStateChanged,
    updateProfile
} from './firebase.js';
import { showToast } from './utils.js';

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const googleSigninBtn = document.getElementById('google-signin');
const tabBtns = document.querySelectorAll('.tab-btn');
const authMessage = document.getElementById('auth-message');

// -------------------------
// Helper Functions
// -------------------------
function showMessage(message, type) {
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`;
}

function showLoginForm() {
    loginForm.style.display = 'block';
    loginForm.classList.add('active');
    signupForm.style.display = 'none';
    signupForm.classList.remove('active');

    tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === 'login'));
}

function showSignupForm() {
    signupForm.style.display = 'block';
    signupForm.classList.add('active');
    loginForm.style.display = 'none';
    loginForm.classList.remove('active');

    tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === 'signup'));
}

// -------------------------
// Initial Setup
// -------------------------
// Hide both forms initially
loginForm.style.display = 'none';
signupForm.style.display = 'none';

// Check if user is already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Already logged in → redirect to home page
        window.location.replace('home.html');
    } else {
        // Not logged in → show login form by default
        showLoginForm();
        showMessage('', '');
    }
});

// -------------------------
// Tab Switching
// -------------------------
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab === 'login') showLoginForm();
        else showSignupForm();
        showMessage('', ''); // clear any messages
    });
});

// -------------------------
// Login Form Submission
// -------------------------
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        showMessage('Signing in...', 'info');
        await signInWithEmailAndPassword(auth, email, password);
        showMessage('Success! Redirecting...', 'success');
        // Redirect handled by onAuthStateChanged
    } catch (error) {
        let message = 'Failed to sign in';
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            case 'auth/too-many-requests':
                message = 'Too many attempts. Try again later';
                break;
        }
        showMessage(message, 'error');
    }
});

// -------------------------
// Signup Form Submission
// -------------------------
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        showMessage('Creating account...', 'info');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update profile with display name
        await updateProfile(userCredential.user, { displayName: name });

        showMessage('Account created! Redirecting...', 'success');
        // Redirect handled by onAuthStateChanged
    } catch (error) {
        let message = 'Failed to create account';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'An account with this email already exists';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak';
                break;
        }
        showMessage(message, 'error');
    }
});

// -------------------------
// Google Sign-In
// -------------------------
googleSigninBtn.addEventListener('click', async () => {
    try {
        showMessage('Signing in with Google...', 'info');
        await signInWithPopup(auth, googleProvider);
        showMessage('Success! Redirecting...', 'success');
        // Redirect handled by onAuthStateChanged
    } catch (error) {
        let message = 'Google sign-in failed';
        switch (error.code) {
            case 'auth/popup-closed-by-user':
                message = 'Sign-in popup was closed';
                break;
            case 'auth/popup-blocked':
                message = 'Popup was blocked. Please allow popups';
                break;
        }
        showMessage(message, 'error');
    }
});
