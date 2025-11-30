document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    initializeMusicPlayer();
    preloadImages();
});

function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    for (let i = 0; i < 4; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        particle.style.cssText = `
            width: ${Math.random() * 8 + 4}px;
            height: ${Math.random() * 8 + 4}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 3}s;
            animation-duration: ${10 + Math.random() * 6}s;
        `;
        
        container.appendChild(particle);
    }
}

function preloadImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.classList.add('img-loading');
        
        if (img.complete) {
            img.classList.remove('img-loading');
        } else {
            img.addEventListener('load', () => img.classList.remove('img-loading'));
            img.addEventListener('error', () => {
                img.classList.remove('img-loading');
                img.classList.add('img-error');
            });
        }
    });
}

let audioPlayer = null;
let isPlaying = false;
let isMinimized = false;

function initializeMusicPlayer() {
    console.log('Inicializando player de música...');
    
    audioPlayer = new Audio('./MRD.mp3');
    
    audioPlayer.addEventListener('ended', function() {
        console.log('Música terminou');
        restartMusic();
    });
    
    audioPlayer.addEventListener('error', function(e) {
        console.log('Erro no áudio:', e);
    });
    
    audioPlayer.addEventListener('loadedmetadata', function() {
        console.log('Metadados da música carregados');
    });
    
    audioPlayer.addEventListener('timeupdate', updateProgressBar);
    
    // Configurar eventos dos botões
    const playPauseBtn = document.getElementById('playPauseBtn');
    const restartBtn = document.getElementById('restartBtn');
    const closePlayerBtn = document.getElementById('closePlayerBtn');
    const minimizeBtn = document.getElementById('minimizeBtn');
    const expandBtn = document.getElementById('expandBtn');
    const progressBar = document.getElementById('progressBar');
    const albumArt = document.querySelector('.album-art');
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
        console.log('Botão play/pause configurado');
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', restartMusic);
        console.log('Botão restart configurado');
    }
    
    if (closePlayerBtn) {
        closePlayerBtn.addEventListener('click', closePlayer);
        console.log('Botão close configurado');
    }
    
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', minimizePlayer);
        console.log('Botão minimize configurado');
    }
    
    if (expandBtn) {
        expandBtn.addEventListener('click', expandPlayer);
        console.log('Botão expand configurado');
    }
    
    if (progressBar) {
        progressBar.addEventListener('input', seekAudio);
        console.log('Barra de progresso configurada');
    }
    
    // Adicionar evento de clique na imagem do álbum para play/pause
    if (albumArt) {
        albumArt.addEventListener('click', togglePlayPause);
        console.log('Imagem do álbum configurada');
    }
    
    setTimeout(showPlayer, 3000);
}

function showPlayer() {
    const player = document.getElementById('musicPlayer');
    if (player) {
        player.style.display = 'block';
        console.log('Player exibido');
    }
}

function togglePlayPause() {
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    const albumArt = document.querySelector('.album-art');
    
    if (!isPlaying) {
        audioPlayer.play().then(() => {
            console.log('Música iniciada');
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'inline';
            if (albumArt) albumArt.classList.add('playing');
            isPlaying = true;
        }).catch(error => {
            console.log('Erro ao reproduzir:', error);
        });
    } else {
        audioPlayer.pause();
        if (playIcon) playIcon.style.display = 'inline';
        if (pauseIcon) pauseIcon.style.display = 'none';
        if (albumArt) albumArt.classList.remove('playing');
        isPlaying = false;
    }
}

function restartMusic() {
    if (audioPlayer) {
        audioPlayer.currentTime = 0;
        if (!isPlaying) {
            togglePlayPause();
        }
    }
}

function closePlayer() {
    if (isPlaying && audioPlayer) {
        audioPlayer.pause();
        isPlaying = false;
        
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');
        const albumArt = document.querySelector('.album-art');
        
        if (playIcon) playIcon.style.display = 'inline';
        if (pauseIcon) pauseIcon.style.display = 'none';
        if (albumArt) albumArt.classList.remove('playing');
    }
    const player = document.getElementById('musicPlayer');
    const minimizedPlayer = document.querySelector('.minimized-player');
    
    if (player) player.style.display = 'none';
    if (minimizedPlayer) minimizedPlayer.style.display = 'none';
}

function minimizePlayer() {
    const player = document.getElementById('musicPlayer');
    const minimizedPlayer = document.querySelector('.minimized-player');
    
    if (player && minimizedPlayer) {
        player.classList.add('minimized');
        minimizedPlayer.style.display = 'flex';
        isMinimized = true;
        console.log('Player minimizado');
    }
}

function expandPlayer() {
    const player = document.getElementById('musicPlayer');
    const minimizedPlayer = document.querySelector('.minimized-player');
    
    if (player && minimizedPlayer) {
        player.classList.remove('minimized');
        minimizedPlayer.style.display = 'none';
        isMinimized = false;
        console.log('Player expandido');
    }
}

function updateProgressBar() {
    if (!audioPlayer) return;
    
    const progressBar = document.getElementById('progressBar');
    if (progressBar && audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = progress;
    }
}

function seekAudio() {
    if (!audioPlayer) return;
    
    const progressBar = document.getElementById('progressBar');
    if (progressBar && audioPlayer.duration) {
        const seekTime = (progressBar.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    }
}