// image-loader.js - Sistema centralizado de carregamento de imagens
class ImageLoader {
    constructor() {
        this.initialized = false;
        this.imageCache = new Map();
    }

    initialize() {
        if (this.initialized) return;
        
        console.log('🖼️ Initializing ImageLoader...');
        this.preloadAllImages();
        this.setupErrorHandling();
        this.initialized = true;
    }

    preloadAllImages() {
        const images = document.querySelectorAll('img');
        console.log(`📸 Preloading ${images.length} images...`);
        
        images.forEach(img => {
            this.setupImage(img);
        });
    }

    setupImage(img) {
        if (img.dataset.imageLoaderProcessed) return;
        
        img.dataset.imageLoaderProcessed = 'true';
        img.classList.add('img-loading');

        if (this.isCriticalImage(img)) {
            img.loading = 'eager';
        }

        if (img.complete) {
            this.handleImageLoad(img);
        } else {
            img.addEventListener('load', () => this.handleImageLoad(img));
            img.addEventListener('error', () => this.handleImageError(img));
        }

        if (!img.complete && img.src) {
            this.forceImageReload(img);
        }
    }

    isCriticalImage(img) {
        const criticalSelectors = [
            '.hero-banner',
            '.logo img',
            '.category-icon img',
            '.game-card img',
            '.result-image img',
            '.album-art img',
            '.thumb',
            '.game-image-container img'
        ];
        
        return criticalSelectors.some(selector => img.matches(selector));
    }

    handleImageLoad(img) {
        img.classList.remove('img-loading');
        img.classList.remove('img-error');
    }

    handleImageError(img) {
        img.classList.remove('img-loading');
        img.classList.add('img-error');
        
        setTimeout(() => {
            if (img.src && !img.complete) {
                this.forceImageReload(img);
            }
        }, 1000);
    }

    forceImageReload(img) {
        const src = img.src;
        if (!src) return;
        
        const newImg = new Image();
        newImg.onload = () => {
            img.src = src;
            this.handleImageLoad(img);
        };
        newImg.onerror = () => {
            this.handleImageError(img);
        };
        newImg.src = src + (src.includes('?') ? '&' : '?') + 't=' + Date.now();
    }

    setupErrorHandling() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        if (node.tagName === 'IMG') {
                            this.setupImage(node);
                        }
                        if (node.querySelectorAll) {
                            node.querySelectorAll('img').forEach(img => this.setupImage(img));
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => {
                    this.checkBrokenImages();
                }, 100);
            }
        });

        window.addEventListener('load', () => {
            setTimeout(() => {
                this.checkBrokenImages();
            }, 500);
        });
    }

    checkBrokenImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.complete || img.naturalHeight === 0) {
                if (img.src && !img.classList.contains('img-error')) {
                    this.forceImageReload(img);
                }
            }
        });
    }
}

window.imageLoader = new ImageLoader();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.imageLoader.initialize();
    });
} else {
    window.imageLoader.initialize();
}