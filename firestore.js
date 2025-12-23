// firestore.js - Firestore operations for Money Tracker with Mode Support

// ============================================
// MODE DATA LOADING
// ============================================

async function loadModeDataFromFirestore(mode) {
    const spending = await loadModeSpendingFromFirestore(mode);
    const proposed = await loadModeProposedFromFirestore(mode);
    const wishlist = await loadModeWishlistFromFirestore(mode);
    const settings = await loadModeSettingsFromFirestore(mode);
    
    return {
        spending: spending || [],
        proposed: proposed || [],
        wishlist: wishlist || [],
        settings: settings || null
    };
}

// ============================================
// SPENDING ENTRIES
// ============================================

async function saveModeSpendingToFirestore(mode, entry) {
    const user = window.currentUser;
    if (!user || !window.db) {
        console.log('No user or Firestore not initialized, skipping cloud save');
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).collection(`${mode}Spending`).add(entry);
        console.log(`${mode} spending entry saved to Firestore`);
    } catch (error) {
        console.error(`Error saving ${mode} spending to Firestore:`, error);
    }
}

async function deleteModeSpendingFromFirestore(mode, entryId) {
    const user = window.currentUser;
    if (!user || !window.db || !entryId) {
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).collection(`${mode}Spending`).doc(entryId).delete();
        console.log(`${mode} spending entry deleted from Firestore`);
    } catch (error) {
        console.error(`Error deleting ${mode} spending from Firestore:`, error);
    }
}

async function loadModeSpendingFromFirestore(mode) {
    const user = window.currentUser;
    if (!user || !window.db) {
        console.log('No user or Firestore not initialized');
        return [];
    }
    
    try {
        const snapshot = await db.collection('users')
            .doc(user.uid)
            .collection(`${mode}Spending`)
            .orderBy('date', 'desc')
            .get();
        
        const entries = [];
        snapshot.forEach(doc => {
            entries.push({ firestoreId: doc.id, ...doc.data() });
        });
        
        console.log(`Loaded ${entries.length} ${mode} spending entries from Firestore`);
        return entries;
    } catch (error) {
        console.error(`Error loading ${mode} spending from Firestore:`, error);
        return [];
    }
}

// ============================================
// PROPOSED PURCHASES
// ============================================

async function saveModeProposedToFirestore(mode, item) {
    const user = window.currentUser;
    if (!user || !window.db) {
        console.log('No user or Firestore not initialized, skipping cloud save');
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).collection(`${mode}Proposed`).add(item);
        console.log(`${mode} proposed item saved to Firestore`);
    } catch (error) {
        console.error(`Error saving ${mode} proposed to Firestore:`, error);
    }
}

async function deleteModeProposedFromFirestore(mode, itemId) {
    const user = window.currentUser;
    if (!user || !window.db || !itemId) {
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).collection(`${mode}Proposed`).doc(itemId).delete();
        console.log(`${mode} proposed item deleted from Firestore`);
    } catch (error) {
        console.error(`Error deleting ${mode} proposed from Firestore:`, error);
    }
}

async function loadModeProposedFromFirestore(mode) {
    const user = window.currentUser;
    if (!user || !window.db) {
        console.log('No user or Firestore not initialized');
        return [];
    }
    
    try {
        const snapshot = await db.collection('users')
            .doc(user.uid)
            .collection(`${mode}Proposed`)
            .get();
        
        const items = [];
        snapshot.forEach(doc => {
            items.push({ firestoreId: doc.id, ...doc.data() });
        });
        
        console.log(`Loaded ${items.length} ${mode} proposed items from Firestore`);
        return items;
    } catch (error) {
        console.error(`Error loading ${mode} proposed from Firestore:`, error);
        return [];
    }
}

async function updateModeProposedInFirestore(mode, itemId, item) {
    const user = window.currentUser;
    if (!user || !window.db || !itemId) {
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).collection(`${mode}Proposed`).doc(itemId).update({
            checked: item.checked,
            amount: item.amount
        });
        console.log(`${mode} proposed item updated in Firestore`);
    } catch (error) {
        console.error(`Error updating ${mode} proposed in Firestore:`, error);
    }
}

// ============================================
// WISHLIST
// ============================================

async function saveModeWishlistToFirestore(mode, item) {
    const user = window.currentUser;
    if (!user || !window.db) {
        console.log('No user or Firestore not initialized, skipping cloud save');
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).collection(`${mode}Wishlist`).add(item);
        console.log(`${mode} wishlist item saved to Firestore`);
    } catch (error) {
        console.error(`Error saving ${mode} wishlist to Firestore:`, error);
    }
}

async function deleteModeWishlistFromFirestore(mode, itemId) {
    const user = window.currentUser;
    if (!user || !window.db || !itemId) {
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).collection(`${mode}Wishlist`).doc(itemId).delete();
        console.log(`${mode} wishlist item deleted from Firestore`);
    } catch (error) {
        console.error(`Error deleting ${mode} wishlist from Firestore:`, error);
    }
}

async function loadModeWishlistFromFirestore(mode) {
    const user = window.currentUser;
    if (!user || !window.db) {
        console.log('No user or Firestore not initialized');
        return [];
    }
    
    try {
        const snapshot = await db.collection('users')
            .doc(user.uid)
            .collection(`${mode}Wishlist`)
            .get();
        
        const items = [];
        snapshot.forEach(doc => {
            items.push({ firestoreId: doc.id, ...doc.data() });
        });
        
        console.log(`Loaded ${items.length} ${mode} wishlist items from Firestore`);
        return items;
    } catch (error) {
        console.error(`Error loading ${mode} wishlist from Firestore:`, error);
        return [];
    }
}

async function updateModeWishlistInFirestore(mode, itemId, item) {
    const user = window.currentUser;
    if (!user || !window.db || !itemId) {
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).collection(`${mode}Wishlist`).doc(itemId).update({
            checked: item.checked,
            amount: item.amount
        });
        console.log(`${mode} wishlist item updated in Firestore`);
    } catch (error) {
        console.error(`Error updating ${mode} wishlist in Firestore:`, error);
    }
}

// ============================================
// SETTINGS
// ============================================

async function saveModeSettingsToFirestore(mode, settings) {
    const user = window.currentUser;
    if (!user || !window.db) {
        console.log('No user or Firestore not initialized, skipping cloud save');
        return;
    }
    
    try {
        await db.collection('users').doc(user.uid).collection(`${mode}Settings`).doc('main').set(settings);
        console.log(`${mode} settings saved to Firestore`);
    } catch (error) {
        console.error(`Error saving ${mode} settings to Firestore:`, error);
    }
}

async function loadModeSettingsFromFirestore(mode) {
    const user = window.currentUser;
    if (!user || !window.db) {
        console.log('No user or Firestore not initialized');
        return null;
    }
    
    try {
        const doc = await db.collection('users')
            .doc(user.uid)
            .collection(`${mode}Settings`)
            .doc('main')
            .get();
        
        if (doc.exists) {
            console.log(`Loaded ${mode} settings from Firestore`);
            return doc.data();
        } else {
            console.log(`No ${mode} settings found in Firestore`);
            return null;
        }
    } catch (error) {
        console.error(`Error loading ${mode} settings from Firestore:`, error);
        return null;
    }
}
