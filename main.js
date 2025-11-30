document.addEventListener('DOMContentLoaded', function() {
    initializeMusicPlayer();
});

let audioPlayer = null;
let isPlaying = false;

function initializeMusicPlayer() {
    audioPlayer = new Audio('./MRD.mp3');
    
    audioPlayer.addEventListener('ended', function() {
        restartMusic();
    });
    
    audioPlayer.addEventListener('loadedmetadata', function() {
        updateDurationDisplay();
    });
    
    audioPlayer.addEventListener('timeupdate', function() {
        updateProgressBar();
        updateCurrentTimeDisplay();
    });
    
    document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
    document.getElementById('restartBtn').addEventListener('click', restartMusic);
    document.getElementById('closePlayerBtn').addEventListener('click', closePlayer);
    document.getElementById('minimizeBtn').addEventListener('click', minimizePlayer);
    document.getElementById('expandBtn').addEventListener('click', expandPlayer);
    document.getElementById('progressBar').addEventListener('input', seekAudio);
    
    setTimeout(showPlayer, 3000);
}

function showPlayer() {
    document.getElementById('musicPlayer').style.display = 'block';
}

function togglePlayPause() {
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    
    if (!isPlaying) {
        audioPlayer.play();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline';
        isPlaying = true;
    } else {
        audioPlayer.pause();
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
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
        document.querySelector('.play-icon').style.display = 'inline';
        document.querySelector('.pause-icon').style.display = 'none';
    }
    document.getElementById('musicPlayer').style.display = 'none';
    document.querySelector('.minimized-player').style.display = 'none';
}

function minimizePlayer() {
    const player = document.getElementById('musicPlayer');
    const minimizedPlayer = document.querySelector('.minimized-player');
    player.classList.add('minimized');
    minimizedPlayer.style.display = 'flex';
}

function expandPlayer() {
    const player = document.getElementById('musicPlayer');
    const minimizedPlayer = document.querySelector('.minimized-player');
    player.classList.remove('minimized');
    minimizedPlayer.style.display = 'none';
}

function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = progress;
    }
}

function updateCurrentTimeDisplay() {
    const currentTimeElement = document.getElementById('currentTime');
    currentTimeElement.textContent = formatTime(audioPlayer.currentTime);
}

function updateDurationDisplay() {
    const durationElement = document.getElementById('duration');
    if (audioPlayer.duration) {
        durationElement.textContent = formatTime(audioPlayer.duration);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function seekAudio() {
    const progressBar = document.getElementById('progressBar');
    if (audioPlayer.duration) {
        const seekTime = (progressBar.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    }
}