// Get DOM elements
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        userEmail.textContent = user.email;
        loadAllPlayersStats();
        
        // Set up real-time updates
        db.collection('bets').onSnapshot(() => {
            loadAllPlayersStats();
        });
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

// Load and display all players statistics
async function loadAllPlayersStats() {
    try {
        const allBets = await db.collection('bets').get();
        const playerStats = {};

        // Process each bet to calculate player statistics
        for (const betDoc of allBets.docs) {
            const bet = betDoc.data();
            const playerEmail = bet.userEmail;

            if (!playerStats[playerEmail]) {
                playerStats[playerEmail] = {
                    totalBets: 0,
                    wins: 0,
                    losses: 0
                };
            }

            playerStats[playerEmail].totalBets++;

            if (bet.status === 'won') {
                playerStats[playerEmail].wins++;
            } else if (bet.status === 'lost') {
                playerStats[playerEmail].losses++;
            }
        }

        // Sort players by wins in descending order
        const sortedPlayers = Object.entries(playerStats)
            .sort(([, a], [, b]) => b.wins - a.wins);

        // Update the table
        const allPlayersStatsBody = document.getElementById('allPlayersStatsBody');
        allPlayersStatsBody.innerHTML = '';

        sortedPlayers.forEach(([email, stats]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${email}</td>
                <td>${stats.totalBets}</td>
                <td>${stats.wins}</td>
                <td>${stats.losses}</td>
            `;
            allPlayersStatsBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading all players stats:', error);
    }
}

// Initialize
loadAllPlayersStats();

// Set up real-time updates
auth.onAuthStateChanged((user) => {
    if (user) {
        db.collection('bets').onSnapshot(() => {
            loadAllPlayersStats();
        });
    }
});
