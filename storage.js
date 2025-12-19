// storage.js - Local storage management for Money Tracker

function getUserStorageKey(key) {
    const user = window.currentUser;
    if (!user) return key;
    return `money_${user.uid}_${key}`;
}

function saveToUserStorage(key, value) {
    const userKey = getUserStorageKey(key);
    localStorage.setItem(userKey, typeof value === 'string' ? value : JSON.stringify(value));
}

function loadFromUserStorage(key) {
    const userKey = getUserStorageKey(key);
    return localStorage.getItem(userKey);
}

function clearUserStorage() {
    const user = window.currentUser;
    if (!user) return;
    
    const prefix = `money_${user.uid}_`;
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
}
