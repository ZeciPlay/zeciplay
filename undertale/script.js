// Load games from JSON
async function loadGames() {
    try {
        const response = await fetch('games.json');
        const data = await response.json();
        return data.games || [];
    } catch (error) {
        console.error('Error loading games:', error);
        return [];
    }
}

// Render games list
function renderGames(games) {
    const gameList = document.getElementById('game-list');
    
    if (!games.length) {
        gameList.innerHTML = '<div class="loading">No games available</div>';
        return;
    }
    
    gameList.innerHTML = games.map(game => `
        <div class="game-item">
            <div class="game-icon">
                ${game.image ? `<img src="${game.image}" alt="${game.name}" class="game-image">` : '<span>?</span>'}
            </div>
            <div class="game-info">
                <div class="game-title">${game.name}</div>
                <div class="game-desc">${game.size}</div>
            </div>
            <button class="access-btn" data-game='${JSON.stringify(game)}'>Access</button>
        </div>
    `).join('');
}

// Setup popup
function setupPopup() {
    const popup = document.getElementById('popup');
    const popupClose = document.getElementById('popup-close');
    
    popupClose.addEventListener('click', () => {
        popup.style.display = 'none';
    });
    
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.style.display = 'none';
        }
    });
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('access-btn')) {
            const game = JSON.parse(e.target.getAttribute('data-game'));
            showPopup(game);
        }
    });
    
    function showPopup(game) {
        document.getElementById('popup-img').src = game.image || '';
        document.getElementById('popup-title').textContent = game.name;
        document.getElementById('popup-desc').textContent = `${game.size}`;
        
        const buttons = document.getElementById('popup-buttons');
        buttons.innerHTML = '';
        
        if (game.link_en) {
            const btn = document.createElement('a');
            btn.href = game.link_en;
            btn.target = '_blank';
            btn.className = 'popup-btn';
            btn.textContent = 'Direct Access (EN)';
            buttons.appendChild(btn);
        }
        
        if (game.link_pt) {
            const btn = document.createElement('a');
            btn.href = game.link_pt;
            btn.target = '_blank';
            btn.className = 'popup-btn';
            btn.textContent = 'Direct Access (PT-BR)';
            buttons.appendChild(btn);
        }
        
        popup.style.display = 'flex';
    }
}

// Load and render games
async function loadAndRenderGames() {
    const games = await loadGames();
    renderGames(games);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadAndRenderGames();
    setupPopup();
});