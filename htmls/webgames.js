let todosJogos=[],jogosFiltrados=[],jogosPorPagina=21,paginaAtual=1,termoBusca='',filtroOrdenacao='name',filtroControle='all';

document.addEventListener('DOMContentLoaded',()=>{
    if (window.imageLoader) window.imageLoader.initialize();
    carregarJogos('webgames.json');
    configurarEventos()
});

function configurarEventos(){
    const e=document.getElementById('search-input'),
          t=document.getElementById('clear-search'),
          o=document.getElementById('sort-select'),
          i=document.getElementById('control-filter');
    
    e.addEventListener('input',e=>{termoBusca=e.target.value.toLowerCase().trim(),filtrarJogos()});
    t.addEventListener('click',()=>{e.value='',termoBusca='',filtrarJogos()});
    o.addEventListener('change',e=>{filtroOrdenacao=e.target.value,filtrarJogos()});
    i.addEventListener('change',e=>{filtroControle=e.target.value,filtrarJogos()});
}

function carregarJogos(e){
    document.getElementById('loading').classList.remove('hidden'),
    fetch(e).then(e=>e.json()).then(e=>{
        todosJogos=e,
        jogosFiltrados=[...todosJogos],
        document.getElementById('loading').classList.add('hidden'),
        inicializarPaginacao()
    }).catch(e=>{
        console.error('Erro ao carregar webgames:',e),
        document.getElementById('loading').classList.add('hidden'),
        document.getElementById('game-list').innerHTML='<p class="no-results">Erro ao carregar webgames</p>'
    })
}

function filtrarJogos(){
    let e=[...todosJogos];
    termoBusca!==''&&(e=e.filter(t=>t.nome.toLowerCase().includes(termoBusca)));
    filtroControle!=='all'&&(e=e.filter(t=>{
        const o=t.extra?.toLowerCase()||'';
        return filtroControle==='touch'?o.includes('dont need control'):filtroControle==='keyboard'&&(o.includes('need controller')||o.includes('keyboard'))
    }));
    filtroOrdenacao==='name'?e.sort((e,t)=>e.nome.localeCompare(t.nome)):filtroOrdenacao==='size'&&e.sort((e,t)=>extrairTamanhoMB(e.tamanho)-extrairTamanhoMB(t.tamanho));
    jogosFiltrados=e,paginaAtual=1,inicializarPaginacao()
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
    t.addEventListener('click',()=>{window.open(e.link,'_blank')});
    
    setTimeout(() => {
        const img = t.querySelector('img');
        if (img && window.imageLoader) {
            window.imageLoader.setupImage(img);
        }
    }, 0);
    
    return t
}