/**
 * ==========================================================================
 * LIGHTBOX / FULL-SCREEN IMAGE VIEWER
 * Pure vanilla JavaScript lightbox supporting full resolution viewing,
 * smooth animations, keyboard controls (ESC, Arrow keys), zoom toggle,
 * and backdrop click dismiss.
 * ==========================================================================
 */

class FullscreenLightbox {
  constructor() {
    this.modal = document.getElementById('lightboxModal');
    this.stage = document.getElementById('lightboxStage');
    this.imageWrapper = document.getElementById('lightboxWrapper');
    this.imgElement = document.getElementById('lightboxImg');
    this.counterElement = document.getElementById('lightboxCounter');
    this.captionTitle = document.getElementById('lightboxCaptionTitle');
    this.captionDesc = document.getElementById('lightboxCaptionDesc');
    this.closeBtn = document.getElementById('lightboxClose');
    this.prevBtn = document.getElementById('lightboxPrev');
    this.nextBtn = document.getElementById('lightboxNext');
    this.zoomBtn = document.getElementById('lightboxZoom');
    this.fullscreenBtn = document.getElementById('lightboxFullscreen');

    this.items = [];
    this.currentIndex = 0;
    this.isOpen = false;
    this.isZoomed = false;
    this.touchStartX = 0;
    this.touchEndX = 0;

    this.init();
  }

  init() {
    if (!this.modal || !this.imgElement) return;

    // Collect all gallery items and preview elements
    this.scanGalleryItems();

    // Event Listeners for UI buttons
    this.closeBtn?.addEventListener('click', () => this.close());
    this.prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.prev();
    });
    this.nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.next();
    });
    this.zoomBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleZoom();
    });
    this.fullscreenBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleBrowserFullscreen();
    });

    // Close when clicking outside the image (on stage or backdrop)
    this.modal.addEventListener('click', (e) => {
      if (
        e.target === this.modal ||
        e.target === this.stage ||
        e.target.classList.contains('lightbox-stage')
      ) {
        this.close();
      }
    });

    // Keyboard navigation (ESC, Arrows, F)
    document.addEventListener('keydown', (e) => this.handleKeydown(e));

    // Touch swipe gestures for mobile
    this.stage.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.stage.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });
  }

  scanGalleryItems() {
    const triggerElements = document.querySelectorAll('[data-lightbox="gallery"]');
    this.items = [];

    triggerElements.forEach((el, idx) => {
      const src = el.getAttribute('data-full-src') || el.querySelector('img')?.src;
      const title = el.getAttribute('data-title') || 'Project Preview';
      const desc = el.getAttribute('data-desc') || '';
      const category = el.getAttribute('data-category') || '';

      if (src) {
        this.items.push({ src, title, desc, category });
        el.addEventListener('click', (e) => {
          e.preventDefault();
          this.open(idx);
        });
      }
    });
  }

  open(index) {
    if (!this.items.length) return;
    this.currentIndex = (index + this.items.length) % this.items.length;
    this.updateImage();

    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent page scrolling behind modal
    this.isOpen = true;
    this.isZoomed = false;
    this.imageWrapper.classList.remove('zoomed');

    // Accessibility focus on close button
    this.closeBtn?.focus();
  }

  close() {
    if (!this.isOpen) return;
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.isOpen = false;
    this.isZoomed = false;
    this.imageWrapper.classList.remove('zoomed');

    // Exit browser fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  next() {
    if (!this.isOpen || this.items.length <= 1) return;
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.transitionImage();
  }

  prev() {
    if (!this.isOpen || this.items.length <= 1) return;
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.transitionImage();
  }

  transitionImage() {
    this.imgElement.style.opacity = '0';
    this.imgElement.style.transform = 'scale(0.95)';

    setTimeout(() => {
      this.updateImage();
      this.imgElement.style.opacity = '1';
      this.imgElement.style.transform = 'scale(1)';
    }, 180);
  }

  updateImage() {
    const item = this.items[this.currentIndex];
    if (!item) return;

    // Reset zoom state on new image
    this.isZoomed = false;
    this.imageWrapper.classList.remove('zoomed');

    this.imgElement.src = item.src;
    this.imgElement.alt = item.title;

    if (this.counterElement) {
      this.counterElement.textContent = `${this.currentIndex + 1} / ${this.items.length}`;
    }

    if (this.captionTitle) {
      this.captionTitle.textContent = item.title;
    }

    if (this.captionDesc) {
      this.captionDesc.textContent = item.desc;
    }
  }

  toggleZoom() {
    this.isZoomed = !this.isZoomed;
    this.imageWrapper.classList.toggle('zoomed', this.isZoomed);
  }

  toggleBrowserFullscreen() {
    if (!document.fullscreenElement) {
      this.modal.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  handleKeydown(e) {
    if (!this.isOpen) return;

    switch (e.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowRight':
        this.next();
        break;
      case 'ArrowLeft':
        this.prev();
        break;
      case 'f':
      case 'F':
        this.toggleBrowserFullscreen();
        break;
      case '+':
      case '=':
        this.toggleZoom();
        break;
      case '-':
        if (this.isZoomed) this.toggleZoom();
        break;
    }
  }

  handleSwipe() {
    const threshold = 50;
    const diff = this.touchEndX - this.touchStartX;
    if (Math.abs(diff) > threshold) {
      if (diff < 0) {
        this.next(); // Swiped left -> next
      } else {
        this.prev(); // Swiped right -> prev
      }
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.portfolioLightbox = new FullscreenLightbox();
});
