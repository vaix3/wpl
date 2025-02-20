// Get DOM elements
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const matchesGrid = document.getElementById('matchesGrid');
const matchSelect = document.getElementById('matchSelect');
const teamSelect = document.getElementById('teamSelect');
const betAmount = document.getElementById('betAmount');
const placeBetBtn = document.getElementById('placeBetBtn');
const betsTableBody = document.getElementById('betsTableBody');

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        userEmail.textContent = user.email;
    } else {
        window.location.href = 'login.html';
    }
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            window.location.href = 'login.html';
        })
        .catch((error) => {
            console.error('Logout error:', error);
        });
});

// Sample matches data (you can replace this with actual API data)
const matches = [
    { id: 1, team1: 'Gujarat Giants', team2: 'Mumbai Indians', date: '2025-02-18' },
    { id: 2, team1: 'UP Warriorz', team2: 'Delhi Capitals', date: '2025-02-19' },
    { id: 3, team1: 'Royal Challengers Bengaluru', team2: 'Mumbai Indians', date: '2025-02-21' },
    { id: 4, team1: 'Delhi Capitals', team2: 'UP Warriorz', date: '2025-02-22' },
    { id: 5, team1: 'Royal Challengers Bengaluru', team2: 'UP Warriorz', date: '2025-02-24' },
    { id: 6, team1: 'Delhi Capitals', team2: 'Gujarat Giants', date: '2025-02-25' },
    { id: 7, team1: 'Mumbai Indians', team2: 'UP Warriorz', date: '2025-02-26' },
    { id: 8, team1: 'Royal Challengers Bengaluru', team2: 'Gujarat Giants', date: '2025-02-27' },
    { id: 9, team1: 'Delhi Capitals', team2: 'Mumbai Indians', date: '2025-02-28' },
    { id: 10, team1: 'Royal Challengers Bengaluru', team2: 'Delhi Capitals', date: '2025-03-01' },
    { id: 11, team1: 'UP Warriorz', team2: 'Gujarat Giants', date: '2025-03-03' },
    { id: 12, team1: 'UP Warriorz', team2: 'Mumbai Indians', date: '2025-03-06' },
    { id: 13, team1: 'Gujarat Giants', team2: 'Delhi Capitals', date: '2025-03-07' },
    { id: 14, team1: 'UP Warriorz', team2: 'Royal Challengers Bengaluru', date: '2025-03-08' },
    { id: 15, team1: 'Mumbai Indians', team2: 'Gujarat Giants', date: '2025-03-10' },
    { id: 16, team1: 'Mumbai Indians', team2: 'Royal Challengers Bengaluru', date: '2025-03-11' }
];

// Display matches in grid
function displayMatches() {
    matchesGrid.innerHTML = '';
    matches.forEach(match => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.innerHTML = `
            <h3>${match.team1} vs ${match.team2}</h3>
            <p>Date: ${match.date}</p>
        `;
        matchesGrid.appendChild(card);

        // Add match to select dropdown
        const option = document.createElement('option');
        option.value = match.id;
        option.textContent = `${match.team1} vs ${match.team2}`;
        matchSelect.appendChild(option);
    });
}

// Update team select based on match selection
matchSelect.addEventListener('change', () => {
    const selectedMatch = matches.find(m => m.id === parseInt(matchSelect.value));
    if (selectedMatch) {
        teamSelect.innerHTML = `
            <option value="">Select a team</option>
            <option value="${selectedMatch.team1}">${selectedMatch.team1}</option>
            <option value="${selectedMatch.team2}">${selectedMatch.team2}</option>
        `;
    }
});

// Place bet functionality
placeBetBtn.addEventListener('click', async () => {
    try {
        // Input validation
        if (!matchSelect.value || !teamSelect.value || !betAmount.value) {
            alert('Please fill in all fields');
            return;
        }

        if (!auth.currentUser) {
            alert('Please login to place a bet');
            return;
        }

        const amount = parseInt(betAmount.value);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid bet amount');
            return;
        }

        const selectedMatch = matches.find(m => m.id === parseInt(matchSelect.value));
        if (!selectedMatch) {
            alert('Invalid match selection');
            return;
        }

        // Create bet object
        const bet = {
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email,
            matchId: matchSelect.value,
            match: `${selectedMatch.team1} vs ${selectedMatch.team2}`,
            team: teamSelect.value,
            amount: amount,
            date: new Date().toISOString(),
        };

        // Save to Firestore
        try {
            await db.collection('bets').add(bet);
        } catch (error) {
            console.error('Firestore error:', error);
            throw new Error('Failed to place bet. Please try again.');
        }

        // Reset form and show success message
        matchSelect.value = '';
        teamSelect.innerHTML = '<option value="">Select a team</option>';
        betAmount.value = '';
        alert('Bet placed successfully!');

        // Refresh bets display
        await loadBets();
    } catch (error) {
        console.error('Error placing bet:', error);
        // Create and show error dialog
const dialogOverlay = document.createElement('div');
dialogOverlay.className = 'dialog-overlay';

const dialog = document.createElement('div');
dialog.className = 'dialog';
dialog.innerHTML = `
    <h2>Error placing bet</h2>
    <p>${error.message || 'Please try again'}</p>
    <div class="dialog-buttons">
        <button class="btn btn-primary">OK</button>
    </div>
`;

dialogOverlay.appendChild(dialog);
document.body.appendChild(dialogOverlay);

// Handle dialog close
const okButton = dialog.querySelector('.btn');
okButton.addEventListener('click', () => {
    document.body.removeChild(dialogOverlay);
});
    }
});

// Load and display all bets
async function loadBets() {
    try {
        const snapshot = await db.collection('bets').orderBy('date', 'desc').get();
        betsTableBody.innerHTML = '';

        snapshot.forEach(doc => {
            const bet = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bet.userEmail}</td>
                <td>${bet.match}</td>
                <td>${bet.team}</td>
                <td>${bet.amount}</td>
                <td>${new Date(bet.date).toLocaleString()}</td>
                <td class="bet-status">
                    <input type="checkbox" class="status-checkbox" data-bet-id="${doc.id}" data-status="won" ${bet.status === 'won' ? 'checked' : ''}><label>Won</label>
                    <input type="checkbox" class="status-checkbox" data-bet-id="${doc.id}" data-status="lost" ${bet.status === 'lost' ? 'checked' : ''}><label>Lost</label>
                </td>
            `;

            // Add event listeners to checkboxes
            const checkboxes = row.querySelectorAll('.status-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', async (e) => {
                    const betId = e.target.dataset.betId;
                    const status = e.target.dataset.status;
                    const otherCheckbox = [...checkboxes].find(cb => cb !== e.target);

                    if (e.target.checked) {
                        otherCheckbox.checked = false;
                        try {
                            await db.collection('bets').doc(betId).update({
                                status: status
                            });
                        } catch (error) {
                            console.error('Error updating bet status:', error);
                            e.target.checked = false;
                        }
                    } else {
                        try {
                            await db.collection('bets').doc(betId).update({
                                status: 'pending'
                            });
                        } catch (error) {
                            console.error('Error updating bet status:', error);
                            e.target.checked = true;
                        }
                    }
                });
            });

            betsTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading bets:', error);
    }
}

// Initialize
displayMatches();
loadBets();

// Set up real-time updates for bets
db.collection('bets').onSnapshot(snapshot => {
    loadBets();
});
