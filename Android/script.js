// Elementos
const elements = {
  menuBtn: document.getElementById('menu-btn'),
  closeMenuBtn: document.getElementById('close-menu-btn'),
  sidebar: document.getElementById('sidebar'),
  searchBtn: document.getElementById('search-btn'),
  searchOverlay: document.getElementById('searchOverlay'),
  searchInput: document.getElementById('searchInput'),
  doSearchBtn: document.getElementById('doSearchBtn'),
  closeSearchBtn: document.getElementById('closeSearchBtn'),
  results: document.getElementById('results')
};

// Variável global para armazenar todos os jogos
let allGamesData = [];

// URL do formulário de sugestões
const SUGGESTION_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfW3g2MFubYEA1dq7OZ4_oFnKZmuJj0pingDljsqRmqT22XmA/viewform';

// Sistema de carregamento de imagens
function initializeImageLoading() {
    console.log('Initializing image loading system...');
    preloadImages();
    setupImageErrorHandling();
}

// Sistema do menu sidebar
function initializeMenu() {
  if (elements.menuBtn && elements.sidebar && elements.closeMenuBtn) {
    elements.menuBtn.addEventListener('click', () => {
      elements.sidebar.classList.add('active');
    });

    elements.closeMenuBtn.addEventListener('click', () => {
      elements.sidebar.classList.remove('active');
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', (event) => {
      if (elements.sidebar.classList.contains('active') && 
          !elements.sidebar.contains(event.target) && 
          event.target !== elements.menuBtn) {
        elements.sidebar.classList.remove('active');
      }
    });
  }
}

// Sistema de pré-carregamento de imagens
function preloadImages() {
    const images = document.querySelectorAll('img');
    console.log(`Preloading ${images.length} images...`);
    
    images.forEach(img => {
        // Adicionar classe de carregamento
        img.classList.add('img-loading');
        
        // Verificar se a imagem já está carregada
        if (img.complete) {
            handleImageLoad(img);
        } else {
            img.addEventListener('load', () => handleImageLoad(img));
            img.addEventListener('error', () => handleImageError(img));
        }
        
        // Forçar recarregamento se a imagem não carregou
        if (!img.complete && img.src) {
            const src = img.src;
            img.src = '';
            setTimeout(() => {
                img.src = src;
            }, 100);
        }
    });
}

function handleImageLoad(img) {
    img.classList.remove('img-loading');
    img.classList.remove('img-error');
    console.log(`Image loaded: ${img.src}`);
}

function handleImageError(img) {
    img.classList.remove('img-loading');
    img.classList.add('img-error');
    console.warn(`Image failed to load: ${img.src}`);
    
    // Tentar recarregar a imagem após um tempo
    setTimeout(() => {
        if (img.src && !img.complete) {
            const src = img.src;
            img.src = '';
            setTimeout(() => {
                img.src = src;
            }, 500);
        }
    }, 2000);
}

function setupImageErrorHandling() {
    // Observar mudanças no DOM para novas imagens
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    if (node.tagName === 'IMG') {
                        setupImage(node);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('img').forEach(setupImage);
                    }
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function setupImage(img) {
    img.classList.add('img-loading');
    
    if (img.complete) {
        handleImageLoad(img);
    } else {
        img.addEventListener('load', () => handleImageLoad(img));
        img.addEventListener('error', () => handleImageError(img));
    }
}

// Carregar dados de todos os JSONs
async function loadAllGamesData() {
  try {
    const jsonFiles = [
      '../htmls/gameloft.json',
      '../htmls/Mobile.json', 
      '../htmls/webgames.json',
      '../htmls/port.json',
      '../M/Memorial.json',
      '../undertale/games.json',
      '../DDLC/gamesddlc.json'
    ];

    const promises = jsonFiles.map(async (filePath) => {
      try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Failed to load ${filePath}`);
        
        const data = await response.json();
        
        // Normalizar dados para formato comum
        if (Array.isArray(data)) {
          return data.map(game => ({
            ...game,
            category: getCategoryFromFilePath(filePath),
            sourceFile: filePath
          }));
        } else if (data.games && Array.isArray(data.games)) {
          return data.games.map(game => ({
            ...game,
            category: getCategoryFromFilePath(filePath),
            sourceFile: filePath
          }));
        }
        return [];
      } catch (error) {
        console.warn(`Error loading ${filePath}:`, error);
        return [];
      }
    });

    const results = await Promise.allSettled(promises);
    
    allGamesData = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);

    console.log('All games data loaded successfully:', allGamesData.length, 'games');

  } catch (error) {
    console.error('Error loading games data:', error);
    // Fallback com dados mínimos
    allGamesData = [
      {
        "nome": "Example Game",
        "category": "mobile",
        "link": "../htmls/mobile.html",
        "tamanho": "100mb"
      }
    ];
  }
}

// Determinar categoria baseada no arquivo
function getCategoryFromFilePath(filePath) {
  const categoryMap = {
    'gameloft.json': 'gameloft',
    'Mobile.json': 'mobile', 
    'webgames.json': 'webgames',
    'port.json': 'ports',
    'Memorial.json': 'memorial',
    'gamesddlc.json': 'ddlc',
    'games.json': 'undertale'
  };
  
  const fileName = filePath.split('/').pop();
  return categoryMap[fileName] || 'other';
}

// Função de busca
function performSearch(searchTerm) {
  if (!searchTerm.trim()) {
    elements.results.innerHTML = '<div class="no-results">Type something to search…</div>';
    return;
  }

  const searchLower = searchTerm.toLowerCase().trim();
  
  const filteredGames = allGamesData.filter(game => {
    const searchFields = [
      game.nome || game.name,
      game.category,
      game.extra,
      game.tamanho,
      game.genre,
      game.personagem
    ].filter(Boolean); // Remove campos vazios

    return searchFields.some(field => 
      field.toString().toLowerCase().includes(searchLower)
    );
  });

  displaySearchResults(filteredGames, searchTerm);
}

// Exibir resultados da busca
function displaySearchResults(games, searchTerm) {
  if (games.length === 0) {
    elements.results.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🎮</div>
        <h3>No games found for "<strong>${searchTerm}</strong>"</h3>
        <p>Try different keywords or suggest this game to be added!</p>
        <button class="suggestion-btn" onclick="openSuggestionForm('${searchTerm}')">
          <span class="suggestion-icon">💡</span>
          Click Here to Suggest a Game
        </button>
      </div>
    `;
    return;
  }

  const resultsHTML = games.map(game => {
    const gameName = game.nome || game.name;
    const gameSize = game.tamanho || game.size || 'Size unknown';
    const gameImage = game.imagem || game.image;
    const gameExtra = game.extra || game.genre || '';
    const gameLink = getGameLink(game);
    
    return `
      <div class="search-result-item" onclick="location.href='${gameLink}'">
        <div class="result-image">
          <img src="${gameImage}" alt="${gameName}" loading="eager" width="40" height="40" onerror="this.classList.add('img-error')">
        </div>
        <div class="result-content">
          <h3 class="result-title">${gameName}</h3>
          <div class="result-meta">
            <span class="result-category">${game.category}</span>
            <span class="result-size">${gameSize}</span>
          </div>
          ${gameExtra ? `<p class="result-description">${gameExtra}</p>` : ''}
        </div>
        <div class="result-arrow">→</div>
      </div>
    `;
  }).join('');

  elements.results.innerHTML = resultsHTML;
}

// Abrir formulário de sugestão
function openSuggestionForm(gameName = '') {
  // Fechar a pesquisa primeiro
  closeSearch();
  
  // Abrir o formulário em uma nova aba com o nome do jogo pré-preenchido se possível
  const formUrl = SUGGESTION_FORM_URL;
  window.open(formUrl, '_blank');
  
  // Opcional: Mostrar mensagem de confirmação
  showSuggestionMessage(gameName);
}

// Mostrar mensagem de confirmação
function showSuggestionMessage(gameName) {
  const message = document.createElement('div');
  message.className = 'suggestion-message';
  message.innerHTML = `
    <div class="suggestion-message-content">
      <span class="suggestion-message-icon">💡</span>
      <div>
        <strong>Thank you for your suggestion!</strong>
        <br>
        <small>We'll review "${gameName || 'your game'}" and consider adding it.</small>
      </div>
      <button class="suggestion-message-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  document.body.appendChild(message);
  
  // Remover automaticamente após 5 segundos
  setTimeout(() => {
    if (message.parentElement) {
      message.remove();
    }
  }, 5000);
}

// Determinar o link correto para o jogo
function getGameLink(game) {
  // Prioridade: link direto > link_pt > link_en > categoria padrão
  if (game.link) return game.link;
  if (game.link_pt) return game.link_pt;
  if (game.link_en) return game.link_en;
  
  // Fallback para páginas de categoria
  const categoryPages = {
    'gameloft': '../htmls/gameloft.html',
    'mobile': '../htmls/mobile.html',
    'webgames': '../htmls/webgames.html', 
    'ports': '../htmls/port.html',
    'memorial': '../M/memorial.html',
    'undertale': '../undertale/unindex.html',
    'ddlc': '../DDLC/ddlc.html'
  };
  
  return categoryPages[game.category] || '#';
}

function openSearch() {
  if (elements.searchOverlay) {
    elements.searchOverlay.classList.add('open');
    document.body.classList.add('search-open');
    
    if (elements.results) {
      if (allGamesData.length === 0) {
        elements.results.innerHTML = '<div class="no-results">Loading games database…</div>';
        // Recarregar dados se necessário
        loadAllGamesData();
      } else {
        elements.results.innerHTML = '<div class="no-results">Type something to search…</div>';
      }
    }
    
    if (elements.searchInput) {
      elements.searchInput.value = '';
      setTimeout(() => elements.searchInput.focus(), 10);
    }
  }
}

function closeSearch() {
  if (elements.searchOverlay) {
    elements.searchOverlay.classList.remove('open');
    document.body.classList.remove('search-open');
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing DM7 Web...');
  
  // Inicializar sistema de imagens
  initializeImageLoading();
  
  // Inicializar menu
  initializeMenu();
  
  // Carregar dados dos jogos
  loadAllGamesData();
  
  // Inicializar sistema de pesquisa
  if (elements.searchBtn) {
    elements.searchBtn.addEventListener('click', openSearch);
  }
  
  if (elements.closeSearchBtn) {
    elements.closeSearchBtn.addEventListener('click', closeSearch);
  }

  if (elements.doSearchBtn) {
    elements.doSearchBtn.addEventListener('click', () => {
      performSearch(elements.searchInput.value);
    });
  }

  if (elements.searchInput) {
    // Busca em tempo real
    elements.searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value;
      if (searchTerm.length >= 2) {
        performSearch(searchTerm);
      } else if (searchTerm.length === 0) {
        elements.results.innerHTML = '<div class="no-results">Type something to search…</div>';
      }
    });

    elements.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        performSearch(e.target.value);
      } else if (e.key === 'Escape') {
        closeSearch();
      }
    });
  }

  // Fechar pesquisa com ESC
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (elements.searchOverlay?.classList.contains('open')) {
        closeSearch();
      }
      if (elements.sidebar?.classList.contains('active')) {
        elements.sidebar.classList.remove('active');
      }
    }
  });

  // Fechar pesquisa ao clicar fora
  elements.searchOverlay?.addEventListener('click', (e) => {
    if (e.target === elements.searchOverlay) {
      closeSearch();
    }
  });

  console.log('DM7 Web initialized successfully');
});