// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA89BZxelKRoK64JnYtSdWUho2WUfWymII",
    authDomain: "capacity-monitor.firebaseapp.com",
    projectId: "capacity-monitor",
    storageBucket: "capacity-monitor.firebasestorage.app",
    messagingSenderId: "455641716280",
    appId: "1:455641716280:web:5848888e290e47114c78cd",
    measurementId: "G-CGR5R0D1SP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let unsubscribeSettings = null;
let unsubscribeSpending = null;
let unsubscribeProposed = null;

// Auth state observer
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        showApp();
        loadUserData();
    } else {
        currentUser = null;
        showAuth();
    }
});

// Auth functions
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    clearAuthError();
}

function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    clearAuthError();
}

function showAuth() {
    document.getElementById('authSection').style.display = 'flex';
    document.getElementById('appSection').style.display = 'none';
    
    // Unsubscribe from any active listeners
    if (unsubscribeSettings) unsubscribeSettings();
    if (unsubscribeSpending) unsubscribeSpending();
    if (unsubscribeProposed) unsubscribeProposed();
}

function showApp() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('appSection').style.display = 'block';
    document.getElementById('userEmail').textContent = currentUser.email;
}

function showAuthError(message) {
    const errorDiv = document.getElementById('authError');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function clearAuthError() {
    const errorDiv = document.getElementById('authError');
    errorDiv.textContent = '';
    errorDiv.classList.remove('show');
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

async function signUp() {
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    
    if (!email || !password) {
        showAuthError('Please fill in all fields');
        return;
    }
    
    if (password.length < 6) {
        showAuthError('Password must be at least 6 characters');
        return;
    }
    
    try {
        showLoading();
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Initialize default settings for new user
        await db.collection('users').doc(userCredential.user.uid).collection('settings').doc('main').set({
            dailyAllowance: 20,
            startDate: new Date().toISOString().split('T')[0],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoading();
    } catch (error) {
        hideLoading();
        showAuthError(error.message);
    }
}

async function signIn() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showAuthError('Please fill in all fields');
        return;
    }
    
    try {
        showLoading();
        await auth.signInWithEmailAndPassword(email, password);
        hideLoading();
    } catch (error) {
        hideLoading();
        showAuthError(error.message);
    }
}

async function signOut() {
    try {
        await auth.signOut();
    } catch (error) {
        console.error('Sign out error:', error);
    }
}

// Load user data from Firestore
function loadUserData() {
    const userId = currentUser.uid;
    
    // Load settings
    unsubscribeSettings = db.collection('users').doc(userId).collection('settings').doc('main')
        .onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('dailyAllowance').value = data.dailyAllowance || 20;
                document.getElementById('startDate').value = data.startDate || new Date().toISOString().split('T')[0];
            } else {
                // Create default settings if they don't exist
                db.collection('users').doc(userId).collection('settings').doc('main').set({
                    dailyAllowance: 20,
                    startDate: new Date().toISOString().split('T')[0],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            updateDisplay();
        });
    
    // Load spending
    unsubscribeSpending = db.collection('users').doc(userId).collection('spending')
        .orderBy('date', 'desc')
        .onSnapshot(snapshot => {
            const spending = [];
            snapshot.forEach(doc => {
                spending.push({ id: doc.id, ...doc.data() });
            });
            renderSpending(spending);
            updateDisplay();
        });
    
    // Load proposed purchases
    unsubscribeProposed = db.collection('users').doc(userId).collection('proposed')
        .orderBy('createdAt', 'asc')
        .onSnapshot(snapshot => {
            const proposed = [];
            snapshot.forEach(doc => {
                proposed.push({ id: doc.id, ...doc.data() });
            });
            renderProposed(proposed);
        });
    
    // Set today's date as default for spending
    document.getElementById('spendingDate').value = new Date().toISOString().split('T')[0];
}

// Update settings
async function updateSettings() {
    const dailyAllowance = parseFloat(document.getElementById('dailyAllowance').value) || 0;
    const startDate = document.getElementById('startDate').value;
    
    if (!startDate) {
        alert('Please select a start date');
        return;
    }
    
    try {
        await db.collection('users').doc(currentUser.uid).collection('settings').doc('main').set({
            dailyAllowance: dailyAllowance,
            startDate: startDate,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        updateSyncStatus('Saved!');
    } catch (error) {
        console.error('Error updating settings:', error);
        alert('Error saving settings');
    }
}

// Add spending
async function addSpending() {
    const name = document.getElementById('spendingName').value.trim();
    const amount = parseFloat(document.getElementById('spendingAmount').value);
    const date = document.getElementById('spendingDate').value;
    
    if (!name || !amount || amount <= 0 || !date) {
        alert('Please fill in all spending fields');
        return;
    }
    
    try {
        await db.collection('users').doc(currentUser.uid).collection('spending').add({
            name: name,
            amount: amount,
            date: date,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Clear inputs
        document.getElementById('spendingName').value = '';
        document.getElementById('spendingAmount').value = '';
        
        updateSyncStatus('Added!');
    } catch (error) {
        console.error('Error adding spending:', error);
        alert('Error adding spending');
    }
}

// Delete spending
async function deleteSpending(id) {
    if (!confirm('Delete this spending record?')) return;
    
    try {
        await db.collection('users').doc(currentUser.uid).collection('spending').doc(id).delete();
        updateSyncStatus('Deleted!');
    } catch (error) {
        console.error('Error deleting spending:', error);
        alert('Error deleting spending');
    }
}

// Add proposed purchase
async function addProposed() {
    const name = document.getElementById('proposedName').value.trim();
    const amount = parseFloat(document.getElementById('proposedAmount').value);
    
    if (!name || !amount || amount <= 0) {
        alert('Please fill in all proposed purchase fields');
        return;
    }
    
    try {
        await db.collection('users').doc(currentUser.uid).collection('proposed').add({
            name: name,
            amount: amount,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Clear inputs
        document.getElementById('proposedName').value = '';
        document.getElementById('proposedAmount').value = '';
        
        updateSyncStatus('Added!');
    } catch (error) {
        console.error('Error adding proposed purchase:', error);
        alert('Error adding proposed purchase');
    }
}

// Delete proposed purchase
async function deleteProposed(id) {
    if (!confirm('Delete this proposed purchase?')) return;
    
    try {
        await db.collection('users').doc(currentUser.uid).collection('proposed').doc(id).delete();
        updateSyncStatus('Deleted!');
    } catch (error) {
        console.error('Error deleting proposed purchase:', error);
        alert('Error deleting proposed purchase');
    }
}

// Calculate accumulated amount
function calculateAccumulated() {
    const dailyAllowance = parseFloat(document.getElementById('dailyAllowance').value) || 0;
    const startDate = document.getElementById('startDate').value;
    
    if (!startDate) return 0;
    
    const start = new Date(startDate);
    const today = new Date();
    const daysDiff = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
    return daysDiff > 0 ? daysDiff * dailyAllowance : 0;
}

// Render spending list
function renderSpending(spending) {
    const list = document.getElementById('spendingList');
    
    if (spending.length === 0) {
        list.innerHTML = '<li class="item" style="justify-content: center; color: #6b7280;">No spending recorded yet</li>';
        return;
    }
    
    list.innerHTML = spending.map(item => `
        <li class="item">
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-date">${new Date(item.date).toLocaleDateString()}</div>
            </div>
            <span class="item-amount">$${item.amount.toFixed(2)}</span>
            <button class="delete-btn" onclick="deleteSpending('${item.id}')">Delete</button>
        </li>
    `).join('');
}

// Render proposed purchases
function renderProposed(proposed) {
    const list = document.getElementById('proposedList');
    
    if (proposed.length === 0) {
        list.innerHTML = '<li class="item proposed-item" style="justify-content: center; color: #6b7280;">No proposed purchases yet</li>';
        return;
    }
    
    const accumulated = calculateAccumulated();
    const totalSpent = getTotalSpent();
    let runningBalance = accumulated - totalSpent;
    
    list.innerHTML = proposed.map(item => {
        const canAfford = runningBalance >= item.amount;
        if (canAfford) runningBalance -= item.amount;
        
        return `
            <li class="item proposed-item ${canAfford ? 'can-afford' : 'cannot-afford'}">
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <span class="afford-status ${canAfford ? 'afford-yes' : 'afford-no'}">
                        ${canAfford ? '✓ Can Afford' : '✗ Cannot Afford'}
                    </span>
                </div>
                <span class="item-amount">$${item.amount.toFixed(2)}</span>
                <button class="delete-btn" onclick="deleteProposed('${item.id}')">Delete</button>
            </li>
        `;
    }).join('');
}

// Get total spent from current spending list
function getTotalSpent() {
    const spendingList = document.getElementById('spendingList');
    let total = 0;
    
    const amounts = spendingList.querySelectorAll('.item-amount');
    amounts.forEach(el => {
        const amount = parseFloat(el.textContent.replace('$', ''));
        if (!isNaN(amount)) total += amount;
    });
    
    return total;
}

// Update display
function updateDisplay() {
    const accumulated = calculateAccumulated();
    const spent = getTotalSpent();
    const available = accumulated - spent;
    
    // Update balance display
    document.getElementById('totalAccumulated').textContent = `$${accumulated.toFixed(2)}`;
    document.getElementById('totalSpent').textContent = `$${spent.toFixed(2)}`;
    document.getElementById('availableBalance').textContent = `$${available.toFixed(2)}`;
    document.getElementById('availableBalance').className = available >= 0 ? 'balance-amount positive' : 'balance-amount negative';
}

// Sync status feedback
function updateSyncStatus(message) {
    const syncStatus = document.getElementById('syncStatus');
    const originalHTML = syncStatus.innerHTML;
    
    syncStatus.innerHTML = `<span class="sync-indicator">●</span> ${message}`;
    
    setTimeout(() => {
        syncStatus.innerHTML = originalHTML;
    }, 2000);
}
