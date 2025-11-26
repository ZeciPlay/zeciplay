let todosJogos=[],jogosFiltrados=[],jogosPorPagina=21,paginaAtual=1,termoBusca='',filtroOrdenacao='name';

document.addEventListener('DOMContentLoaded',()=>{
    if (window.imageLoader) window.imageLoader.initialize();
    carregarJogos('port.json');
    configurarEventos()
});

function configurarEventos(){
    const e=document.getElementById('search-input'),
          t=document.getElementById('clear-search'),
          o=document.getElementById('download-modal'),
          i=document.querySelector('.close-download-modal'),
          n=document.getElementById('sort-select');
    
    e.addEventListener('input',e=>{termoBusca=e.target.value.toLowerCase().trim(),filtrarJogos()});
    t.addEventListener('click',()=>{e.value='',termoBusca='',filtrarJogos()});
    i.addEventListener('click',()=>{fecharModal()});
    o.addEventListener('click',e=>{e.target===o&&fecharModal()});
    n.addEventListener('change',e=>{filtroOrdenacao=e.target.value,filtrarJogos()});
}

function carregarJogos(e){
    fetch(e).then(e=>e.json()).then(e=>{
        todosJogos=e,
        jogosFiltrados=[...todosJogos],
        ordenarJogos(),
        inicializarPaginacao()
    }).catch(e=>{
        console.error('Erro ao carregar jogos:',e),
        document.getElementById('game-list').innerHTML='<p class="no-results">Erro ao carregar jogos</p>'
    })
}

function ordenarJogos(){
    if(filtroOrdenacao==='name')jogosFiltrados.sort((e,t)=>e.nome.localeCompare(t.nome));
    else if(filtroOrdenacao==='size')jogosFiltrados.sort((e,t)=>extrairTamanhoMB(e.tamanho)-extrairTamanhoMB(t.tamanho));
}

function filtrarJogos(){
    let e=[...todosJogos];
    termoBusca!==''&&(e=e.filter(t=>t.nome.toLowerCase().includes(termoBusca)));
    jogosFiltrados=e,ordenarJogos(),paginaAtual=1,inicializarPaginacao()
}

function extrairTamanhoMB(e){
    const t=e.toLowerCase();
    if(t.includes("gb"))return parseFloat(t)*1024;
    if(t.includes("mb"))return parseFloat(t);
    return 0
}

function inicializarPaginacao(){
    const e=Math.ceil(jogosFiltrados.length/jogosPorPagina);
    if(jogosFiltrados.length===0){
        document.getElementById('no-results').classList.remove('hidden'),
        document.getElementById('game-list').innerHTML='',
        document.getElementById('pagination-top').innerHTML='';
        return
    }
    document.getElementById('no-results').classList.add('hidden'),
    criarPaginacao('pagination-top',e),
    renderizarPagina(paginaAtual)
}

function criarPaginacao(e,t){
    const o=document.getElementById(e);
    o.innerHTML='';
    if(t<=1)return;
    if(paginaAtual>1){
        const e=criarBotaoPagina('⟨',()=>{paginaAtual--,renderizarPagina(paginaAtual)});
        o.appendChild(e)
    }
    const i=Math.max(1,paginaAtual-2),n=Math.min(t,i+4);
    for(let s=i;s<=n;s++){
        const e=criarBotaoPagina(s,()=>{paginaAtual=s,renderizarPagina(paginaAtual)},s===paginaAtual);
        o.appendChild(e)
    }
    if(paginaAtual<t){
        const e=criarBotaoPagina('⟩',()=>{paginaAtual++,renderizarPagina(paginaAtual)});
        o.appendChild(e)
    }
}

function criarBotaoPagina(e,t,o=!1){
    const i=document.createElement('button');
    return i.textContent=e,i.addEventListener('click',t),o&&i.classList.add('active'),i
}

function renderizarPagina(e){
    const t=document.getElementById('game-list');
    t.innerHTML='';
    const o=(e-1)*jogosPorPagina,i=o+jogosPorPagina,n=jogosFiltrados.slice(o,i);
    n.forEach(e=>{
        const o=criarCardJogo(e);
        t.appendChild(o)
    });
    const s=Math.ceil(jogosFiltrados.length/jogosPorPagina);
    criarPaginacao('pagination-top',s)
}

function criarCardJogo(e){
    const t=document.createElement('div');
    t.className='game-card',
    t.innerHTML=`<img src="${e.imagem}" alt="${e.nome}" loading="eager"><div class="game-card-content"><h3>${e.nome}</h3><p class="size">${e.tamanho}</p>${e.extra?`<p class="version">${e.extra}</p>`:''}</div>`,
    t.addEventListener('click',()=>{abrirModalDownload(e)});
    
    setTimeout(() => {
        const img = t.querySelector('img');
        if (img && window.imageLoader) {
            window.imageLoader.setupImage(img);
        }
    }, 0);
    
    return t
}

// FUNÇÕES CORRIGIDAS PARA O MODAL
function abrirModalDownload(jogo){
    const modal = document.getElementById('download-modal');
    const modalBody = document.getElementById('download-modal-body');
    
    modalBody.innerHTML = `
        <div class="modal-body">
            <img src="${jogo.imagem}" alt="${jogo.nome}" class="modal-image" loading="eager">
            <h2 class="modal-title">${jogo.nome}</h2>
            <div class="modal-details">
                <div class="modal-detail">
                    <h4>Tamanho</h4>
                    <p>${jogo.tamanho}</p>
                </div>
                ${jogo.extra ? `
                <div class="modal-detail">
                    <h4>Versão</h4>
                    <p>${jogo.extra}</p>
                </div>
                ` : ''}
            </div>
            <div class="download-options">
                <a href="${jogo.link}" target="_blank" class="download-button direct-download">
                    <i class="fas fa-download"></i> Access
                </a>
                <a href="${jogo.link}" target="_blank" class="download-button shortened-download">
                    <i class="fas fa-link"></i> Shortened Access
                </a>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const img = modalBody.querySelector('img');
        if (img && window.imageLoader) {
            window.imageLoader.setupImage(img);
        }
    }, 0);
    
    modal.classList.remove('hidden');
    modal.classList.add('show');
}

function fecharModal(){
    const modal = document.getElementById('download-modal');
    modal.classList.remove('show');
    modal.classList.add('hidden');
}

function encurtarLink(linkOriginal) {
    return linkOriginal;
}