// Get DOM elements
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const totalBets = document.getElementById('totalBets');
const matchesWon = document.getElementById('matchesWon');
const matchesLost = document.getElementById('matchesLost');
const netProfit = document.getElementById('netProfit');
const bettingHistoryBody = document.getElementById('bettingHistoryBody');

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        userEmail.textContent = user.email;
        loadUserProfile(user.uid);
        loadAllPlayersStats();
        
        // Set up real-time updates
        db.collection('bets').onSnapshot(() => {
            loadUserProfile(user.uid);
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

// Load user profile and betting history
async function loadUserProfile(userId) {
    try {
        // Get all bets for the current user
        const userBets = await db.collection('bets')
            .where('userId', '==', userId)
            .orderBy('date', 'desc')
            .get();

        let totalBetsCount = 0;
        let wonBets = 0;
        let lostBets = 0;
        let totalProfit = 0;

        // Clear the betting history table
        bettingHistoryBody.innerHTML = '';

        // Process each bet
        for (const betDoc of userBets.docs) {
            const bet = betDoc.data();
            totalBetsCount++;

            // Get all bets for the same match
            const matchBets = await db.collection('bets')
                .where('matchId', '==', bet.matchId)
                .get();

            let profitLoss = 0;
            if (bet.status === 'won') {
                wonBets++;
                // Calculate winnings from losing bets
                const losingBets = matchBets.docs
                    .filter(doc => doc.data().status === 'lost')
                    .map(doc => doc.data().amount);
                
                const totalLosers = losingBets.length;
                if (totalLosers > 0) {
                    const totalLostAmount = losingBets.reduce((sum, amount) => sum + amount, 0);
                    const winnersForMatch = matchBets.docs.filter(doc => doc.data().status === 'won').length;
                    profitLoss = Math.floor(totalLostAmount / winnersForMatch);
                }
            } else if (bet.status === 'lost') {
                lostBets++;
                profitLoss = -bet.amount;
            }

            totalProfit += profitLoss;

            // Add to betting history table
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bet.match}</td>
                <td>${bet.team}</td>
                <td>₹${bet.amount}</td>
                <td>${new Date(bet.date).toLocaleString()}</td>
                <td>${bet.status || 'pending'}</td>
                <td class="${profitLoss >= 0 ? 'profit' : 'loss'}">₹${profitLoss >= 0 ? '+' : ''}${profitLoss}</td>
            `;
            bettingHistoryBody.appendChild(row);
        }

        // Update summary cards
        totalBets.textContent = totalBetsCount;
        matchesWon.textContent = wonBets;
        matchesLost.textContent = lostBets;
        netProfit.textContent = `₹${totalProfit >= 0 ? '+' : ''}${totalProfit}`;
        netProfit.className = totalProfit >= 0 ? 'profit' : 'loss';

    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

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

            // Get all bets for the same match
            const matchBets = await db.collection('bets')
                .where('matchId', '==', bet.matchId)
                .get();

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
loadUserProfile(auth.currentUser?.uid);
loadAllPlayersStats();

// Set up real-time updates
auth.onAuthStateChanged((user) => {
    if (user) {
        db.collection('bets').onSnapshot(() => {
            loadUserProfile(user.uid);
            loadAllPlayersStats();
        });
    }
});