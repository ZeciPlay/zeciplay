const PAGE_SIZE = 24; // DOBRADO para mostrar mais jogos
let games = [], filteredGames = [], currentPage = 1, currentFilter = 'all', searchTerm = '';

const el = {
    grid: document.getElementById('grid'), pagination: document.getElementById('pagination'),
    loading: document.getElementById('loading'), noResults: document.getElementById('noResults'),
    filterBtns: document.querySelectorAll('.filter-btn'), search: document.getElementById('searchInput'),
    totalGames: document.getElementById('totalGames')
};

// Popup minimalista
function showPopup(game) {
    const popup = document.createElement('div');
    popup.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:1000;display:flex;align-items:center;justify-content:center;';
    
    const box = document.createElement('div');
    box.style.cssText = 'background:#2a2438;padding:20px;border-radius:12px;max-width:300px;width:90vw;text-align:center;';
    
    box.innerHTML = `
        <h3 style="margin:0 0 15px 0;color:#fff;"> ${game.nome}</h3>
        ${game.link_en ? `<a href="${game.link_en}" target="_blank" style="display:block;background:#ff5ea8;color:white;padding:12px;border-radius:8px;margin:8px 0;text-decoration:none;font-weight:700;">🌎 English</a>` : ''}
        ${game.link_pt ? `<a href="${game.link_pt}" target="_blank" style="display:block;background:#47d16a;color:white;padding:12px;border-radius:8px;margin:8px 0;text-decoration:none;font-weight:700;">🇧🇷 Português</a>` : ''}
        <button onclick="this.closest('div').parentElement.remove()" style="width:100%;padding:10px;margin-top:10px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;color:#cfcfe6;cursor:pointer;">Close</button>
    `;
    
    popup.appendChild(box);
    document.body.appendChild(popup);
    popup.onclick = e => e.target === popup && popup.remove();
}

// Renderização ultra compacta
function render() {
    const pages = [];
    for (let i = 0; i < filteredGames.length; i += PAGE_SIZE) {
        pages.push(filteredGames.slice(i, i + PAGE_SIZE));
    }
    const totalPages = Math.max(1, pages.length);
    if (currentPage > totalPages) currentPage = 1;
    
    // Paginação
    el.pagination.innerHTML = '';
    if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.onclick = () => { currentPage = i; render(); };
            el.pagination.appendChild(btn);
        }
    }
    
    // Grid
    el.grid.innerHTML = '';
    const pageGames = pages[currentPage - 1] || [];
    
    if (pageGames.length === 0) {
        el.noResults.classList.remove('hidden');
        return;
    }
    
    el.noResults.classList.add('hidden');
    pageGames.forEach(game => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${game.imagem}" class="thumb" alt="${game.nome}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyNDM4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZmlsbD0iI2EwYTBjMCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2VtPC90ZXh0Pjwvc3ZnPg=='">
            <div class="card-body">
                <div class="title">${game.nome}</div>
                <div class="meta">
                    <span>${game.tamanho}</span>
                    ${game.extra ? `<span>${game.extra}</span>` : ''}
                </div>
                <button class="download-btn" onclick="showPopup(${JSON.stringify(game).replace(/"/g, '&quot;')})">Direct Access</button>
            </div>
        `;
        el.grid.appendChild(card);
    });
    
    el.totalGames.textContent = games.length;
}

// Filtros
function filterGames() {
    filteredGames = games.filter(game => {
        const matchFilter = currentFilter === 'all' || game.personagem === currentFilter;
        const matchSearch = !searchTerm || game.nome.toLowerCase().includes(searchTerm.toLowerCase());
        return matchFilter && matchSearch;
    });
    currentPage = 1;
    render();
}

// Carregamento
async function loadGames() {
    try {
        el.loading.classList.remove('hidden');
        const res = await fetch('gamesddlc.json');
        const data = await res.json();
        games = (data.games || []).map(g => ({
            nome: g.nome || '', tamanho: g.tamanho || '', imagem: g.imagem || '',
            extra: g.extra || '', link_en: g.link_en || '', link_pt: g.link_pt || '',
            personagem: g.personagem || 'Todos'
        }));
        filteredGames = [...games];
        render();
    } catch (err) {
        el.grid.innerHTML = '<div style="grid-column:1/-1;padding:20px;text-align:center;color:#ff5ea8;">Error loading games</div>';
    } finally {
        el.loading.classList.add('hidden');
    }
}

// Eventos
el.search.addEventListener('input', e => {
    searchTerm = e.target.value;
    filterGames();
});

el.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        el.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        filterGames();
    });
});

// Iniciar
document.addEventListener('DOMContentLoaded', loadGames);
