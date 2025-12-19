// auth.js - Authentication for Money Tracker

function signIn() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            console.log('Signed in successfully');
        })
        .catch((error) => {
            console.error('Error signing in:', error);
            alert('Error signing in: ' + error.message);
        });
}

function signUp() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            console.log('Account created successfully');
        })
        .catch((error) => {
            console.error('Error creating account:', error);
            alert('Error creating account: ' + error.message);
        });
}

function signOut() {
    auth.signOut()
        .then(() => {
            console.log('Signed out');
        })
        .catch((error) => {
            console.error('Error signing out:', error);
        });
}
