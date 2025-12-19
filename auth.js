// auth.js - Authentication for Money Tracker

function signInAnonymously() {
    auth.signInAnonymously()
        .then(() => {
            console.log('Signed in anonymously');
        })
        .catch((error) => {
            console.error('Error signing in:', error);
            alert('Error signing in: ' + error.message);
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
