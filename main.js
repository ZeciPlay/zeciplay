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

function initializeMusicPlayer() {
    console.log('Inicializando player de música...');
    
    audioPlayer = new Audio('./MRD.mp3');
    
    audioPlayer.addEventListener('ended', function() {
        console.log('Música terminou');
        showEndControls();
    });
    
    audioPlayer.addEventListener('error', function(e) {
        console.log('Erro no áudio:', e);
    });
    
    document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
    document.getElementById('restartBtn').addEventListener('click', restartMusic);
    document.getElementById('closePlayerBtn').addEventListener('click', closePlayer);
    document.getElementById('playbackBtn').addEventListener('click', playbackMusic);
    
    document.getElementById('downloadBtn').addEventListener('click', function() {
        const link = document.createElement('a');
        link.href = './MRD.mp3';
        link.download = 'MRD_Musica_Recomendada.mp3';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
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
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'inline';
            albumArt.classList.add('playing');
            isPlaying = true;
        }).catch(error => {
            console.log('Erro ao reproduzir:', error);
        });
    } else {
        audioPlayer.pause();
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
        albumArt.classList.remove('playing');
        isPlaying = false;
    }
}

function restartMusic() {
    audioPlayer.currentTime = 0;
    if (!isPlaying) {
        togglePlayPause();
    }
}

function closePlayer() {
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
    }
    const player = document.getElementById('musicPlayer');
    player.style.display = 'none';
}

function showEndControls() {
    const endControls = document.querySelector('.end-controls');
    const mainControls = document.querySelector('.main-controls');
    
    endControls.style.display = 'flex';
    mainControls.style.display = 'none';
    
    isPlaying = false;
    const albumArt = document.querySelector('.album-art');
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    
    albumArt.classList.remove('playing');
    playIcon.style.display = 'inline';
    pauseIcon.style.display = 'none';
}

function playbackMusic() {
    const endControls = document.querySelector('.end-controls');
    const mainControls = document.querySelector('.main-controls');
    
    endControls.style.display = 'none';
    mainControls.style.display = 'flex';
    
    audioPlayer.currentTime = 0;
    togglePlayPause();
}