// app.js - Main application logic with mode system

// App state - supports multiple modes (food, vehicle, home)
let currentMode = ‘food’; // Default mode

let data = {
food: {
title: ‘Food’,
dailyAllowance: 20,
startDate: new Date().toISOString().split(‘T’)[0],
frozenBalance: 0,
spending: [],
proposed: [],
wishlist: []
},
vehicle: {
title: ‘Vehicle’,
dailyAllowance: 10,
startDate: new Date().toISOString().split(‘T’)[0],
frozenBalance: 0,
spending: [],
proposed: [],
wishlist: []
},
home: {
title: ‘Home’,
dailyAllowance: 15,
startDate: new Date().toISOString().split(‘T’)[0],
frozenBalance: 0,
spending: [],
proposed: [],
wishlist: []
},
mode4: {
title: ‘Blank’,
dailyAllowance: 10,
startDate: new Date().toISOString().split(‘T’)[0],
frozenBalance: 0,
spending: [],
proposed: [],
wishlist: []
},
mode5: {
title: ‘Blank’,
dailyAllowance: 10,
startDate: new Date().toISOString().split(‘T’)[0],
frozenBalance: 0,
spending: [],
proposed: [],
wishlist: []
},
mode6: {
title: ‘Blank’,
dailyAllowance: 10,
startDate: new Date().toISOString().split(‘T’)[0],
frozenBalance: 0,
spending: [],
proposed: [],
wishlist: []
}
};

// Helper to get current mode data
function getModeData() {
return data[currentMode];
}

// Switch between modes
function switchMode(mode) {
currentMode = mode;

```
// Update button styles
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.classList.add('inactive');
});

const activeBtn = document.getElementById('mode' + mode.charAt(0).toUpperCase() + mode.slice(1));
if (activeBtn) {
    activeBtn.classList.remove('inactive');
    activeBtn.classList.add('active');
}

// Update mode title display
updateModeTitleDisplay();

// Refresh display for new mode
updateFormFields();
updateDisplay();
```

}

// Update mode title display
function updateModeTitleDisplay() {
const modeData = getModeData();
document.getElementById(‘modeTitleText’).textContent = modeData.title;
}

// Update all mode button labels
function updateModeButtonLabels() {
document.getElementById(‘modeFoodLabel’).textContent = data.food.title;
document.getElementById(‘modeVehicleLabel’).textContent = data.vehicle.title;
document.getElementById(‘modeHomeLabel’).textContent = data.home.title;
document.getElementById(‘modeMode4Label’).textContent = data.mode4.title;
document.getElementById(‘modeMode5Label’).textContent = data.mode5.title;
document.getElementById(‘modeMode6Label’).textContent = data.mode6.title;

```
// Also update transfer dropdown options
updateTransferDropdown();
```

}

// Update transfer dropdown with current mode titles
function updateTransferDropdown() {
const dropdown = document.getElementById(‘transferToMode’);
if (!dropdown) return;

```
dropdown.innerHTML = `
    <option value="">Select mode...</option>
    <option value="food">${data.food.title}</option>
    <option value="vehicle">${data.vehicle.title}</option>
    <option value="home">${data.home.title}</option>
    <option value="mode4">${data.mode4.title}</option>
    <option value="mode5">${data.mode5.title}</option>
    <option value="mode6">${data.mode6.title}</option>
`;
```

}

// Execute balance transfer
async function executeTransfer() {
const fromMode = currentMode;
const toMode = document.getElementById(‘transferToMode’).value;
const amount = parseFloat(document.getElementById(‘transferAmount’).value);

```
if (!toMode) {
    alert('Please select a mode to transfer to');
    return;
}

if (toMode === fromMode) {
    alert('Cannot transfer to the same mode');
    return;
}

if (!amount || amount <= 0) {
    alert('Please enter a valid transfer amount');
    return;
}

// Check if current mode has enough balance
const currentBalance = calculateAccumulated() - calculateTotalSpent();
if (amount > currentBalance) {
    alert(`Insufficient balance. Available: $${currentBalance.toFixed(2)}`);
    return;
}

const today = new Date().toISOString().split('T')[0];

// Create outgoing transfer entry (negative spending in from mode)
const outgoingEntry = {
    id: Date.now(),
    name: `Transfer to ${data[toMode].title}`,
    amount: amount,
    date: today
};

// Create incoming transfer entry (negative spending in to mode - adds to balance)
const incomingEntry = {
    id: Date.now() + 1,
    name: `Transfer from ${data[fromMode].title}`,
    amount: -amount, // Negative spending = adds to balance
    date: today
};

// Save to Firestore
await saveModeSpendingToFirestore(fromMode, outgoingEntry);
await saveModeSpendingToFirestore(toMode, incomingEntry);

// Add to local state
data[fromMode].spending.push(outgoingEntry);
data[toMode].spending.push(incomingEntry);

// Clear inputs
document.getElementById('transferToMode').value = '';
document.getElementById('transferAmount').value = '';

// Update display
updateDisplay();

alert(`Successfully transferred $${amount.toFixed(2)} from ${data[fromMode].title} to ${data[toMode].title}`);
```

}

// Load all data from Firestore (all modes)
async function loadAllData() {
// Load each mode’s data
for (const mode of [‘food’, ‘vehicle’, ‘home’, ‘mode4’, ‘mode5’, ‘mode6’]) {
const cloudData = await loadModeDataFromFirestore(mode);

```
    // Load settings
    if (cloudData.settings) {
        data[mode].title = cloudData.settings.title || data[mode].title;
        data[mode].dailyAllowance = cloudData.settings.dailyAllowance || data[mode].dailyAllowance;
        data[mode].startDate = cloudData.settings.startDate || new Date().toISOString().split('T')[0];
        data[mode].frozenBalance = cloudData.settings.frozenBalance || 0;
    }
    
    // Load spending, proposed, and wishlist
    data[mode].spending = cloudData.spending || [];
    data[mode].proposed = cloudData.proposed || [];
    data[mode].wishlist = cloudData.wishlist || [];
}

// Update display for current mode
updateModeTitleDisplay();
updateModeButtonLabels();
updateFormFields();
updateDisplay();
```

}

// Update form fields with current mode data
function updateFormFields() {
const modeData = getModeData();
document.getElementById(‘dailyAllowance’).value = modeData.dailyAllowance;
document.getElementById(‘spendingDate’).value = new Date().toISOString().split(‘T’)[0];
}

// ==================================
// ALLOWANCE SETTINGS
// ==================================

function toggleAllowanceEdit() {
const input = document.getElementById(‘dailyAllowance’);
const editBtn = document.getElementById(‘editAllowanceBtn’);
const saveBtn = document.getElementById(‘saveAllowanceBtn’);
const cancelBtn = document.getElementById(‘cancelAllowanceBtn’);

```
input.disabled = false;
input.focus();
input.select();
editBtn.style.display = 'none';
saveBtn.style.display = 'block';
cancelBtn.style.display = 'block';
```

}

async function saveAllowanceEdit() {
const modeData = getModeData();
const newAllowance = parseFloat(document.getElementById(‘dailyAllowance’).value) || 0;

```
// If allowance changed, snapshot the current balance
if (newAllowance !== modeData.dailyAllowance) {
    const currentBalance = calculateAccumulated() - calculateTotalSpent();
    modeData.frozenBalance = currentBalance;
    modeData.startDate = new Date().toISOString().split('T')[0]; // Reset to today
}

modeData.dailyAllowance = newAllowance;

const settings = {
    title: modeData.title,
    dailyAllowance: modeData.dailyAllowance,
    startDate: modeData.startDate,
    frozenBalance: modeData.frozenBalance
};

await saveModeSettingsToFirestore(currentMode, settings);

cancelAllowanceEdit();
updateDisplay();
```

}

function cancelAllowanceEdit() {
const modeData = getModeData();
const input = document.getElementById(‘dailyAllowance’);
const editBtn = document.getElementById(‘editAllowanceBtn’);
const saveBtn = document.getElementById(‘saveAllowanceBtn’);
const cancelBtn = document.getElementById(‘cancelAllowanceBtn’);

```
input.disabled = true;
input.value = modeData.dailyAllowance;
editBtn.style.display = 'block';
saveBtn.style.display = 'none';
cancelBtn.style.display = 'none';
```

}

// ==================================
// MODE TITLE EDITING
// ==================================

function toggleModeTitleEdit() {
const modeData = getModeData();
const displaySection = document.getElementById(‘modeTitleDisplay’);
const editSection = document.getElementById(‘modeTitleEditSection’);
const input = document.getElementById(‘modeTitleInput’);

```
displaySection.style.display = 'none';
editSection.style.display = 'block';
input.value = modeData.title;
input.focus();
input.select();
```

}

async function saveModeTitleEdit() {
const modeData = getModeData();
const newTitle = document.getElementById(‘modeTitleInput’).value.trim();

```
if (!newTitle) {
    alert('Please enter a category name');
    return;
}

modeData.title = newTitle;

const settings = {
    title: modeData.title,
    dailyAllowance: modeData.dailyAllowance,
    startDate: modeData.startDate,
    frozenBalance: modeData.frozenBalance
};

await saveModeSettingsToFirestore(currentMode, settings);

updateModeTitleDisplay();
updateModeButtonLabels();
cancelModeTitleEdit();
```

}

function cancelModeTitleEdit() {
document.getElementById(‘modeTitleDisplay’).style.display = ‘flex’;
document.getElementById(‘modeTitleEditSection’).style.display = ‘none’;
}

// ==================================
// BALANCE EDITING
// ==================================

function toggleBalanceEdit() {
const editSection = document.getElementById(‘balanceEditSection’);
const editBtn = document.getElementById(‘editBalanceBtn’);
const currentBalance = calculateAccumulated() - calculateTotalSpent();

```
if (editSection.style.display === 'none') {
    document.getElementById('balanceEditInput').value = currentBalance.toFixed(2);
    editSection.style.display = 'block';
    editBtn.style.display = 'none';
}
```

}

async function saveBalanceEdit() {
const modeData = getModeData();
const newBalance = parseFloat(document.getElementById(‘balanceEditInput’).value) || 0;
const spent = calculateTotalSpent();

```
const start = new Date(modeData.startDate);
const today = new Date();
const daysDiff = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
const dailyTotal = daysDiff > 0 ? daysDiff * modeData.dailyAllowance : 0;

modeData.frozenBalance = newBalance + spent - dailyTotal;

const settings = {
    title: modeData.title,
    dailyAllowance: modeData.dailyAllowance,
    startDate: modeData.startDate,
    frozenBalance: modeData.frozenBalance
};

await saveModeSettingsToFirestore(currentMode, settings);

cancelBalanceEdit();
updateDisplay();
```

}

function cancelBalanceEdit() {
document.getElementById(‘balanceEditSection’).style.display = ‘none’;
document.getElementById(‘editBalanceBtn’).style.display = ‘block’;
}

// ==================================
// CALCULATIONS
// ==================================

function calculateAccumulated() {
const modeData = getModeData();
const start = new Date(modeData.startDate);
const today = new Date();
const daysDiff = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
const dailyTotal = daysDiff > 0 ? daysDiff * modeData.dailyAllowance : 0;
const frozen = modeData.frozenBalance || 0;
return frozen + dailyTotal;
}

function calculateTotalSpent() {
const modeData = getModeData();
return modeData.spending.reduce((sum, item) => sum + item.amount, 0);
}

// ==================================
// SPENDING
// ==================================

async function addSpending() {
const modeData = getModeData();
const name = document.getElementById(‘spendingName’).value.trim();
const amount = parseFloat(document.getElementById(‘spendingAmount’).value);
const date = document.getElementById(‘spendingDate’).value;

```
if (!name || !amount || amount <= 0 || !date) {
    alert('Please fill in all spending fields');
    return;
}

const entry = {
    id: Date.now(),
    name: name,
    amount: amount,
    date: date
};

// Save to Firestore
await saveModeSpendingToFirestore(currentMode, entry);

// Add to local state
modeData.spending.push(entry);

// Clear inputs
document.getElementById('spendingName').value = '';
document.getElementById('spendingAmount').value = '';

updateDisplay();
```

}

async function deleteSpending(id, firestoreId) {
const modeData = getModeData();

```
// Delete from Firestore
await deleteModeSpendingFromFirestore(currentMode, firestoreId);

// Remove from local state
modeData.spending = modeData.spending.filter(item => item.id !== id);

updateDisplay();
```

}

// ==================================
// PROPOSED PURCHASES
// ==================================

async function addProposed() {
const modeData = getModeData();
const name = document.getElementById(‘proposedName’).value.trim();
const amount = parseFloat(document.getElementById(‘proposedAmount’).value);

```
if (!name || !amount || amount <= 0) {
    alert('Please fill in all proposed purchase fields');
    return;
}

const item = {
    id: Date.now(),
    name: name,
    amount: amount,
    checked: false
};

// Save to Firestore
await saveModeProposedToFirestore(currentMode, item);

// Add to local state
modeData.proposed.push(item);

// Clear inputs
document.getElementById('proposedName').value = '';
document.getElementById('proposedAmount').value = '';

updateDisplay();
```

}

async function deleteProposed(id, firestoreId) {
const modeData = getModeData();

```
// Delete from Firestore
await deleteModeProposedFromFirestore(currentMode, firestoreId);

// Remove from local state
modeData.proposed = modeData.proposed.filter(item => item.id !== id);

updateDisplay();
```

}

async function toggleProposedCheck(id, firestoreId) {
const modeData = getModeData();
const item = modeData.proposed.find(i => i.id === id);
if (!item) return;

```
item.checked = !item.checked;
await updateModeProposedInFirestore(currentMode, firestoreId, item);

updateDisplay();
```

}

function startEditProposed(id) {
const modeData = getModeData();
const item = modeData.proposed.find(i => i.id === id);
if (!item) return;

```
if (!window.editingProposed) window.editingProposed = {};
window.editingProposed[id] = {
    originalAmount: item.amount,
    editing: true
};

updateDisplay();
```

}

function cancelEditProposed(id) {
if (window.editingProposed && window.editingProposed[id]) {
delete window.editingProposed[id];
}
updateDisplay();
}

async function saveEditProposed(id, firestoreId) {
const modeData = getModeData();
const inputElement = document.getElementById(`editAmount_${id}`);
const newAmount = parseFloat(inputElement.value);

```
if (!newAmount || newAmount <= 0) {
    alert('Please enter a valid amount');
    return;
}

const item = modeData.proposed.find(i => i.id === id);
if (!item) return;

item.amount = newAmount;
await updateModeProposedInFirestore(currentMode, firestoreId, item);

if (window.editingProposed && window.editingProposed[id]) {
    delete window.editingProposed[id];
}

updateDisplay();
```

}

async function moveToWishlist(id, firestoreId) {
const modeData = getModeData();
const item = modeData.proposed.find(i => i.id === id);
if (!item) return;

```
// Delete from proposed
await deleteModeProposedFromFirestore(currentMode, firestoreId);
modeData.proposed = modeData.proposed.filter(i => i.id !== id);

// Create new wishlist item
const wishlistItem = {
    id: Date.now(),
    name: item.name,
    amount: item.amount,
    checked: false
};

// Add to wishlist
await saveModeWishlistToFirestore(currentMode, wishlistItem);
modeData.wishlist.push(wishlistItem);

updateDisplay();
```

}

// ==================================
// WISHLIST
// ==================================

async function addWishlist() {
const modeData = getModeData();
const name = document.getElementById(‘wishlistName’).value.trim();
const amount = parseFloat(document.getElementById(‘wishlistAmount’).value);

```
if (!name || !amount || amount <= 0) {
    alert('Please fill in all wishlist fields');
    return;
}

const item = {
    id: Date.now(),
    name: name,
    amount: amount,
    checked: false
};

// Save to Firestore
await saveModeWishlistToFirestore(currentMode, item);

// Add to local state
modeData.wishlist.push(item);

// Clear inputs
document.getElementById('wishlistName').value = '';
document.getElementById('wishlistAmount').value = '';

updateDisplay();
```

}

async function deleteWishlist(id, firestoreId) {
const modeData = getModeData();

```
// Delete from Firestore
await deleteModeWishlistFromFirestore(currentMode, firestoreId);

// Remove from local state
modeData.wishlist = modeData.wishlist.filter(item => item.id !== id);

updateDisplay();
```

}

async function toggleWishlistCheck(id, firestoreId) {
const modeData = getModeData();
const item = modeData.wishlist.find(i => i.id === id);
if (!item) return;

```
item.checked = !item.checked;
await updateModeWishlistInFirestore(currentMode, firestoreId, item);

updateDisplay();
```

}

function startEditWishlist(id) {
const modeData = getModeData();
const item = modeData.wishlist.find(i => i.id === id);
if (!item) return;

```
if (!window.editingWishlist) window.editingWishlist = {};
window.editingWishlist[id] = {
    originalAmount: item.amount,
    editing: true
};

updateDisplay();
```

}

function cancelEditWishlist(id) {
if (window.editingWishlist && window.editingWishlist[id]) {
delete window.editingWishlist[id];
}
updateDisplay();
}

async function saveEditWishlist(id, firestoreId) {
const modeData = getModeData();
const inputElement = document.getElementById(`editWishlistAmount_${id}`);
const newAmount = parseFloat(inputElement.value);

```
if (!newAmount || newAmount <= 0) {
    alert('Please enter a valid amount');
    return;
}

const item = modeData.wishlist.find(i => i.id === id);
if (!item) return;

item.amount = newAmount;
await updateModeWishlistInFirestore(currentMode, firestoreId, item);

if (window.editingWishlist && window.editingWishlist[id]) {
    delete window.editingWishlist[id];
}

updateDisplay();
```

}

async function moveToProposed(id, firestoreId) {
const modeData = getModeData();
const item = modeData.wishlist.find(i => i.id === id);
if (!item) return;

```
// Delete from wishlist
await deleteModeWishlistFromFirestore(currentMode, firestoreId);
modeData.wishlist = modeData.wishlist.filter(i => i.id !== id);

// Create new proposed item
const proposedItem = {
    id: Date.now(),
    name: item.name,
    amount: item.amount,
    checked: false
};

// Add to proposed
await saveModeProposedToFirestore(currentMode, proposedItem);
modeData.proposed.push(proposedItem);

updateDisplay();
```

}

// ==================================
// DISPLAY UPDATE
// ==================================

function updateDisplay() {
const modeData = getModeData();
const accumulated = calculateAccumulated();
const spent = calculateTotalSpent();
const available = accumulated - spent;

```
// Update balance display
document.getElementById('totalAccumulated').textContent = `$${accumulated.toFixed(2)}`;
document.getElementById('totalSpent').textContent = `$${spent.toFixed(2)}`;
document.getElementById('availableBalance').textContent = `$${available.toFixed(2)}`;
document.getElementById('availableBalance').className = available >= 0 ? 'balance-amount positive' : 'balance-amount negative';

// Update spending list
const spendingList = document.getElementById('spendingList');
spendingList.innerHTML = modeData.spending
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(item => `
        <li class="item">
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-date">${new Date(item.date).toLocaleDateString()}</div>
            </div>
            <span class="item-amount">$${item.amount.toFixed(2)}</span>
            <button class="delete-btn" onclick="deleteSpending(${item.id}, '${item.firestoreId || ''}')">Delete</button>
        </li>
    `).join('');

// Update proposed list with affordability
const proposedList = document.getElementById('proposedList');
let runningBalance = available;
const totalProposed = modeData.proposed.reduce((sum, item) => sum + item.amount, 0);

proposedList.innerHTML = modeData.proposed.map(item => {
    const canAfford = runningBalance >= item.amount;
    if (canAfford) runningBalance -= item.amount;
    const checked = item.checked || false;
    const strikethrough = checked ? 'text-decoration: line-through; opacity: 0.6;' : '';
    const isEditing = window.editingProposed && window.editingProposed[item.id];
    
    return `
        <li class="item proposed-item ${canAfford ? 'can-afford' : 'cannot-afford'}" style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px;">
            <button onclick="toggleProposedCheck(${item.id}, '${item.firestoreId || ''}')" style="background: ${checked ? '#667eea' : 'white'}; border: 2px solid #667eea; color: ${checked ? 'white' : '#667eea'}; padding: 8px; margin: 0; font-size: 1.2em; cursor: pointer; border-radius: 5px; width: 36px; height: 36px; flex-shrink: 0; font-weight: bold; display: flex; align-items: center; justify-content: center;">
                ${checked ? '✕' : '○'}
            </button>
            <div class="item-details" style="${strikethrough} flex: 1; min-width: 0;">
                <div class="item-name" style="word-break: break-word;">${item.name}</div>
                <span class="afford-status ${canAfford ? 'afford-yes' : 'afford-no'}">
                    ${canAfford ? '✓ Can Afford' : '✗ Cannot Afford'}
                </span>
            </div>
            ${isEditing ? `
                <div style="display: flex; flex-wrap: wrap; gap: 5px; align-items: center; width: 100%;">
                    <input type="number" id="editAmount_${item.id}" value="${item.amount}" step="0.01" min="0" style="flex: 1; min-width: 100px; padding: 8px; border: 2px solid #667eea; border-radius: 5px; font-size: 1em;">
                    <button onclick="saveEditProposed(${item.id}, '${item.firestoreId || ''}')" style="background: #4ade80; color: white; border: none; padding: 8px 12px; border-radius: 5px; font-size: 0.9em; cursor: pointer; flex-shrink: 0;">Save</button>
                    <button onclick="cancelEditProposed(${item.id})" style="background: #6b7280; color: white; border: none; padding: 8px 12px; border-radius: 5px; font-size: 0.9em; cursor: pointer; flex-shrink: 0;">Cancel</button>
                    <button onclick="moveToWishlist(${item.id}, '${item.firestoreId || ''}')" style="background: #f59e0b; color: white; border: none; padding: 8px 12px; border-radius: 5px; font-size: 0.9em; cursor: pointer; flex-shrink: 0;">→ Wish</button>
                    <button class="delete-btn" onclick="deleteProposed(${item.id}, '${item.firestoreId || ''}')" style="flex-shrink: 0;">Delete</button>
                </div>
            ` : `
                <span class="item-amount" style="${strikethrough} flex-shrink: 0; margin: 0;">$${item.amount.toFixed(2)}</span>
                <button onclick="startEditProposed(${item.id})" style="background: #667eea; color: white; border: none; padding: 6px 10px; border-radius: 5px; font-size: 0.85em; cursor: pointer; flex-shrink: 0;">Edit</button>
                <button onclick="moveToWishlist(${item.id}, '${item.firestoreId || ''}')" style="background: #f59e0b; color: white; border: none; padding: 6px 10px; border-radius: 5px; font-size: 0.85em; cursor: pointer; flex-shrink: 0;">→ Wish</button>
                <button class="delete-btn" onclick="deleteProposed(${item.id}, '${item.firestoreId || ''}')" style="flex-shrink: 0;">Delete</button>
            `}
        </li>
    `;
}).join('');

// Update wishlist
const wishlistList = document.getElementById('wishlistList');
wishlistList.innerHTML = modeData.wishlist.map(item => {
    const checked = item.checked || false;
    const strikethrough = checked ? 'text-decoration: line-through; opacity: 0.6;' : '';
    const isEditing = window.editingWishlist && window.editingWishlist[item.id];
    
    return `
        <li class="item" style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; background: #fef3c7;">
            <button onclick="toggleWishlistCheck(${item.id}, '${item.firestoreId || ''}')" style="background: ${checked ? '#f59e0b' : 'white'}; border: 2px solid #f59e0b; color: ${checked ? 'white' : '#f59e0b'}; padding: 8px; margin: 0; font-size: 1.2em; cursor: pointer; border-radius: 5px; width: 36px; height: 36px; flex-shrink: 0; font-weight: bold; display: flex; align-items: center; justify-content: center;">
                ${checked ? '✕' : '○'}
            </button>
            <div class="item-details" style="${strikethrough} flex: 1; min-width: 0;">
                <div class="item-name" style="word-break: break-word;">${item.name}</div>
            </div>
            ${isEditing ? `
                <div style="display: flex; flex-wrap: wrap; gap: 5px; align-items: center; width: 100%;">
                    <input type="number" id="editWishlistAmount_${item.id}" value="${item.amount}" step="0.01" min="0" style="flex: 1; min-width: 100px; padding: 8px; border: 2px solid #f59e0b; border-radius: 5px; font-size: 1em;">
                    <button onclick="saveEditWishlist(${item.id}, '${item.firestoreId || ''}')" style="background: #4ade80; color: white; border: none; padding: 8px 12px; border-radius: 5px; font-size: 0.9em; cursor: pointer; flex-shrink: 0;">Save</button>
                    <button onclick="cancelEditWishlist(${item.id})" style="background: #6b7280; color: white; border: none; padding: 8px 12px; border-radius: 5px; font-size: 0.9em; cursor: pointer; flex-shrink: 0;">Cancel</button>
                    <button onclick="moveToProposed(${item.id}, '${item.firestoreId || ''}')" style="background: #667eea; color: white; border: none; padding: 8px 12px; border-radius: 5px; font-size: 0.9em; cursor: pointer; flex-shrink: 0;">→ Proposed</button>
                    <button class="delete-btn" onclick="deleteWishlist(${item.id}, '${item.firestoreId || ''}')" style="flex-shrink: 0;">Delete</button>
                </div>
            ` : `
                <span class="item-amount" style="${strikethrough} flex-shrink: 0; margin: 0;">$${item.amount.toFixed(2)}</span>
                <button onclick="startEditWishlist(${item.id})" style="background: #f59e0b; color: white; border: none; padding: 6px 10px; border-radius: 5px; font-size: 0.85em; cursor: pointer; flex-shrink: 0;">Edit</button>
                <button onclick="moveToProposed(${item.id}, '${item.firestoreId || ''}')" style="background: #667eea; color: white; border: none; padding: 6px 10px; border-radius: 5px; font-size: 0.85em; cursor: pointer; flex-shrink: 0;">→ Proposed</button>
                <button class="delete-btn" onclick="deleteWishlist(${item.id}, '${item.firestoreId || ''}')" style="flex-shrink: 0;">Delete</button>
            `}
        </li>
    `;
}).join('');

// Update proposed totals
const remainingAfter = available - totalProposed;
document.getElementById('totalProposed').textContent = `$${totalProposed.toFixed(2)}`;
document.getElementById('proposedAvailable').textContent = `$${available.toFixed(2)}`;
document.getElementById('remainingAfter').textContent = `$${remainingAfter.toFixed(2)}`;
document.getElementById('remainingAfter').className = remainingAfter >= 0 ? 'proposed-totals-amount totals-positive' : 'proposed-totals-amount totals-negative';
```

}
