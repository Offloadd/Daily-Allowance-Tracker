// firestore.js - Firestore operations for Money Tracker

// ============================================
// SPENDING ENTRIES
// ============================================

async function saveSpendingToFirestore(entry) {
    const user = window.currentUser;
    if (!user || !window.db) {
        console.log('No user or Firestore not initialized, skipping cloud save');
        if (window.addDebugMessage) window.addDebugMessage('ERROR: Not logged in or Firestore not ready', true);
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).collection('moneyEntries').add(entry);
        console.log('Spending entry saved to Firestore');
    } catch (error) {
        console.error('Error saving spending to Firestore:', error);
        if (window.addDebugMessage) window.addDebugMessage('ERROR saving: ' + error.message, true);
    }
}

async function deleteSpendingFromFirestore(entryId) {
    const user = window.currentUser;
    if (!user || !window.db || !entryId) {
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).collection('moneyEntries').doc(entryId).delete();
        console.log('Spending entry deleted from Firestore');
    } catch (error) {
        console.error('Error deleting spending from Firestore:', error);
    }
}

async function loadSpendingFromFirestore() {
    const user = window.currentUser;
    if (!user || !window.db) {
        console.log('No user or Firestore not initialized');
        if (window.addDebugMessage) window.addDebugMessage('ERROR: Cannot load - not logged in', true);
        return [];
    }
    
    try {
        const snapshot = await db.collection('users')
            .doc(user.uid)
            .collection('moneyEntries')
            .orderBy('date', 'desc')
            .get();
        
        const entries = [];
        snapshot.forEach(doc => {
            entries.push({ firestoreId: doc.id, ...doc.data() });
        });
        
        console.log('Loaded', entries.length, 'spending entries from Firestore');
        return entries;
    } catch (error) {
        console.error('Error loading spending from Firestore:', error);
        if (window.addDebugMessage) window.addDebugMessage('ERROR loading spending: ' + error.message, true);
        return [];
    }
}

// ============================================
// PROPOSED PURCHASES
// ============================================

async function saveProposedToFirestore(item) {
    const user = window.currentUser;
    if (!user || !window.db) {
        console.log('No user or Firestore not initialized, skipping cloud save');
        if (window.addDebugMessage) window.addDebugMessage('ERROR: Not logged in or Firestore not ready', true);
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).collection('moneyProposed').add(item);
        console.log('Proposed item saved to Firestore');
    } catch (error) {
        console.error('Error saving proposed to Firestore:', error);
        if (window.addDebugMessage) window.addDebugMessage('ERROR saving proposed: ' + error.message, true);
    }
}

async function deleteProposedFromFirestore(itemId) {
    const user = window.currentUser;
    if (!user || !window.db || !itemId) {
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).collection('moneyProposed').doc(itemId).delete();
        console.log('Proposed item deleted from Firestore');
    } catch (error) {
        console.error('Error deleting proposed from Firestore:', error);
    }
}

async function updateProposedInFirestore(itemId, item) {
    const user = window.currentUser;
    if (!user || !window.db || !itemId) {
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).collection('moneyProposed').doc(itemId).update({
            checked: item.checked,
            amount: item.amount
        });
        console.log('Proposed item updated in Firestore');
    } catch (error) {
        console.error('Error updating proposed in Firestore:', error);
    }
}

async function loadProposedFromFirestore() {
    const user = window.currentUser;
    if (!user || !window.db) {
        console.log('No user or Firestore not initialized');
        return [];
    }
    
    try {
        const snapshot = await db.collection('users')
            .doc(user.uid)
            .collection('moneyProposed')
            .get();
        
        const items = [];
        snapshot.forEach(doc => {
            items.push({ firestoreId: doc.id, ...doc.data() });
        });
        
        console.log('Loaded', items.length, 'proposed items from Firestore');
        return items;
    } catch (error) {
        console.error('Error loading proposed from Firestore:', error);
        return [];
    }
}

// ============================================
// SETTINGS
// ============================================

async function saveSettingsToFirestore(settings) {
    const user = window.currentUser;
    if (!user || !window.db) {
        console.log('No user or Firestore not initialized, skipping cloud save');
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).collection('moneySettings').doc('main').set(settings);
        console.log('Settings saved to Firestore');
    } catch (error) {
        console.error('Error saving settings to Firestore:', error);
    }
}

async function loadSettingsFromFirestore() {
    const user = window.currentUser;
    if (!user || !window.db) {
        console.log('No user or Firestore not initialized');
        return null;
    }
    
    try {
        const doc = await db.collection('users')
            .doc(user.uid)
            .collection('moneySettings')
            .doc('main')
            .get();
        
        if (doc.exists) {
            console.log('Loaded settings from Firestore');
            return doc.data();
        } else {
            console.log('No settings found in Firestore');
            return null;
        }
    } catch (error) {
        console.error('Error loading settings from Firestore:', error);
        return null;
    }
}

// ============================================
// INITIAL LOAD
// ============================================

async function loadAllDataFromFirestore() {
    const spending = await loadSpendingFromFirestore();
    const proposed = await loadProposedFromFirestore();
    const settings = await loadSettingsFromFirestore();
    
    return {
        spending: spending || [],
        proposed: proposed || [],
        settings: settings || null
    };
}
