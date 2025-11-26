class WiiGameGallery {
    constructor() {
        this.elements = {
            gridContainer: document.getElementById('gridContainer'),
            zoomOverlay: document.getElementById('zoomOverlay'),
            zoomedImage: document.getElementById('zoomedImage'),
            gameTitle: document.getElementById('gameTitle'),
            gameSize: document.getElementById('gameSize'),
            gameGenre: document.getElementById('gameGenre'),
            viewButton: document.getElementById('viewButton'),
            instructionPopup: document.getElementById('instructionPopup')
        };

        this.currentGame = null;

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadGames();

        // Show instructions popup after loading
        setTimeout(() => {
            this.showInstructionPopup();
        }, 1000);
    }

    setupEventListeners() {
        this.elements.viewButton.addEventListener('click', () => this.viewGame());
        this.elements.zoomOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.zoomOverlay) this.closeOverlay();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.elements.zoomOverlay.classList.contains('active')) {
                    this.closeOverlay();
                }
            }
        });
    }

    showInstructionPopup() {
        const wasClosed = localStorage.getItem('instructionClosed');
        if (!wasClosed) {
            this.elements.instructionPopup.style.display = 'block';
        }
    }

    closeInstructionPopup() {
        this.elements.instructionPopup.style.display = 'none';
        localStorage.setItem('instructionClosed', 'true');
    }

    async loadGames() {
        try {
            const response = await fetch('Memorial.json');
            const games = await response.json();
            
            this.elements.gridContainer.innerHTML = '';
            
            games.forEach(game => {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.innerHTML = `<img src="${game.image}" alt="${game.name}" loading="lazy">`;
                
                cell.addEventListener('click', () => this.showGameDetails(game));
                this.elements.gridContainer.appendChild(cell);
            });

        } catch (error) {
            console.error('Error loading games:', error);
            this.elements.gridContainer.innerHTML = '<div class="loading">Error loading games</div>';
        }
    }

    showGameDetails(game) {
        this.currentGame = game;
        
        this.elements.zoomedImage.src = game.image;
        this.elements.gameTitle.textContent = game.name;
        this.elements.gameSize.textContent = `Size: ${game.size}`;
        this.elements.gameGenre.textContent = `Genre: ${game.genre}`;
        
        this.elements.zoomOverlay.classList.add('active');
    }

    closeOverlay() {
        this.elements.zoomOverlay.classList.remove('active');
        this.currentGame = null;
    }

    viewGame() {
        if (this.currentGame?.link) {
            setTimeout(() => window.open(this.currentGame.link, '_blank'), 100);
        }
    }
}

// Funções globais mantidas (apenas as necessárias)
function closeInstruction() { 
    if (gallery) gallery.closeInstructionPopup(); 
}

function goHome() { 
    window.location.href = '../Android/Dm7Android.html'; 
}

// Inicialização
let gallery;
document.addEventListener('DOMContentLoaded', () => {
    gallery = new WiiGameGallery();
});
