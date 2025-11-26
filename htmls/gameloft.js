// Variáveis globais
let todosJogos = [];
let jogosFiltrados = [];
let jogosPorPagina = 21;
let paginaAtual = 1;
let termoBusca = '';
let criterioOrdenacao = 'name';
let categoriaAtiva = 'all';

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    if (window.imageLoader) window.imageLoader.initialize();
    carregarJogos('gameloft.json');
    configurarEventListeners();
});

// Configurar eventos
function configurarEventListeners() {
    const searchInput = document.getElementById('search-input');
    const clearSearch = document.getElementById('clear-search');
    const sortSelect = document.getElementById('sort-select');
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    searchInput.addEventListener('input', function(e) {
        termoBusca = e.target.value.toLowerCase().trim();
        filtrarJogos();
    });
    
    clearSearch.addEventListener('click', function() {
        searchInput.value = '';
        termoBusca = '';
        filtrarJogos();
    });
    
    sortSelect.addEventListener('change', function(e) {
        criterioOrdenacao = e.target.value;
        ordenarJogos();
        renderizarPagina(paginaAtual);
    });
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            categoriaAtiva = this.dataset.category;
            filtrarJogos();
        });
    });
}

// Carregar jogos
function carregarJogos(arquivoJson) {
    document.getElementById('loading').classList.remove('hidden');
    
    fetch(arquivoJson)
        .then(res => res.json())
        .then(jogos => {
            todosJogos = jogos;
            jogosFiltrados = [...todosJogos];
            ordenarJogos();
            document.getElementById('loading').classList.add('hidden');
            inicializarPaginacao();
        })
        .catch(err => {
            console.error('Erro ao carregar jogos:', err);
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('game-list').innerHTML = 
                '<div class="no-results">Erro ao carregar jogos</div>';
        });
}

// Filtrar jogos
function filtrarJogos() {
    let jogosFiltradosTemp = [...todosJogos];
    
    if (categoriaAtiva !== 'all') {
        jogosFiltradosTemp = jogosFiltradosTemp.filter(jogo => 
            jogo.categoria && jogo.categoria.toLowerCase() === categoriaAtiva
        );
    }
    
    if (termoBusca !== '') {
        jogosFiltradosTemp = jogosFiltradosTemp.filter(jogo => 
            jogo.nome.toLowerCase().includes(termoBusca)
        );
    }
    
    jogosFiltrados = jogosFiltradosTemp;
    ordenarJogos();
    paginaAtual = 1;
    inicializarPaginacao();
}

// Ordenar jogos
function ordenarJogos() {
    if (criterioOrdenacao === 'name') {
        jogosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (criterioOrdenacao === 'year') {
        jogosFiltrados.sort((a, b) => {
            const yearA = extrairAnoLancamento(a.extra);
            const yearB = extrairAnoLancamento(b.extra);
            return yearB - yearA;
        });
    } else if (criterioOrdenacao === 'size') {
        jogosFiltrados.sort((a, b) => {
            const sizeA = converterParaMB(a.tamanho);
            const sizeB = converterParaMB(b.tamanho);
            return sizeA - sizeB;
        });
    }
}

function extrairAnoLancamento(extra) {
    if (!extra) return 2000;
    const match = extra.match(/(\d{4})/);
    return match ? parseInt(match[1]) : 2000;
}

function converterParaMB(tamanho) {
    if (!tamanho) return 0;
    const num = parseFloat(tamanho);
    if (tamanho.toLowerCase().includes('gb')) return num * 1024;
    if (tamanho.toLowerCase().includes('mb')) return num;
    return 0;
}

// Paginação
function inicializarPaginacao() {
    const totalPaginas = Math.ceil(jogosFiltrados.length / jogosPorPagina);
    
    document.getElementById('results-count').textContent = `${jogosFiltrados.length} games`;
    
    if (jogosFiltrados.length === 0) {
        document.getElementById('no-results').classList.remove('hidden');
        document.getElementById('game-list').innerHTML = '';
        document.getElementById('pagination-top').innerHTML = '';
        return;
    } else {
        document.getElementById('no-results').classList.add('hidden');
    }
    
    criarPaginacao('pagination-top', totalPaginas);
    renderizarPagina(paginaAtual);
}

function criarPaginacao(containerId, totalPaginas) {
    const paginationContainer = document.getElementById(containerId);
    paginationContainer.innerHTML = '';
    
    if (totalPaginas <= 1) return;
    
    if (paginaAtual > 1) {
        const prevBtn = criarBotaoPagina('⟨', () => {
            paginaAtual--;
            renderizarPagina(paginaAtual);
        });
        paginationContainer.appendChild(prevBtn);
    }
    
    const inicio = Math.max(1, paginaAtual - 2);
    const fim = Math.min(totalPaginas, inicio + 4);
    
    for (let i = inicio; i <= fim; i++) {
        const btn = criarBotaoPagina(i, () => {
            paginaAtual = i;
            renderizarPagina(paginaAtual);
        }, i === paginaAtual);
        paginationContainer.appendChild(btn);
    }
    
    if (paginaAtual < totalPaginas) {
        const nextBtn = criarBotaoPagina('⟩', () => {
            paginaAtual++;
            renderizarPagina(paginaAtual);
        });
        paginationContainer.appendChild(nextBtn);
    }
}

function criarBotaoPagina(texto, onClick, ativo = false) {
    const btn = document.createElement('button');
    btn.textContent = texto;
    btn.addEventListener('click', onClick);
    if (ativo) btn.classList.add('active');
    return btn;
}

// Renderizar página
function renderizarPagina(pagina) {
    const container = document.getElementById('game-list');
    container.innerHTML = '';
    
    const start = (pagina - 1) * jogosPorPagina;
    const end = start + jogosPorPagina;
    const jogosPagina = jogosFiltrados.slice(start, end);
    
    if (jogosPagina.length === 0) {
        container.innerHTML = '<p class="no-results">Nenhum jogo encontrado</p>';
        return;
    }
    
    jogosPagina.forEach((jogo, index) => {
        const card = criarCardJogo(jogo, index);
        container.appendChild(card);
    });
    
    const totalPaginas = Math.ceil(jogosFiltrados.length / jogosPorPagina);
    criarPaginacao('pagination-top', totalPaginas);
}

function criarCardJogo(jogo, index) {
    const link = document.createElement('a');
    link.href = jogo.link;
    link.target = '_blank';
    link.className = 'game-card';
    link.style.animationDelay = `${index * 0.02}s`;
    
    link.innerHTML = `
        <div class="game-card-content">
            <div class="game-image-container">
                <img src="${jogo.imagem}" alt="${jogo.nome}" loading="eager">
            </div>
            <div class="game-info">
                <h3>${jogo.nome}</h3>
                <p class="size">${jogo.tamanho}</p>
                ${jogo.extra ? `<p class="version">${jogo.extra}</p>` : ''}
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const img = link.querySelector('img');
        if (img && window.imageLoader) {
            window.imageLoader.setupImage(img);
        }
    }, 0);
    
    return link;
}