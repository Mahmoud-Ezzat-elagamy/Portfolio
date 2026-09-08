/**
 * ==========================================================================
 * MAHMOUD EZZAT ELAGAMY - PORTFOLIO INTERACTION ENGINE
 * Handles dynamic typing, sticky navbar, mobile drawer, scroll spy,
 * gallery filtering, clipboard copying, and contact form validation.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initTypingEffect();
  initScrollSpy();
  initGalleryFilters();
  initClipboardButtons();
  initContactForm();
});

/* --- Navbar & Mobile Menu --- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-link');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile drawer toggle
  mobileToggle?.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navLinks?.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });

  // Close mobile drawer when clicking a link
  navItems.forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle?.classList.remove('active');
      navLinks?.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  });

  // Close when clicking outside mobile drawer
  document.addEventListener('click', (e) => {
    if (
      navLinks?.classList.contains('active') &&
      !navLinks.contains(e.target) &&
      !mobileToggle.contains(e.target)
    ) {
      mobileToggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });
}

/* --- Dynamic Typing Effect --- */
function initTypingEffect() {
  const typedTarget = document.getElementById('typedText');
  if (!typedTarget) return;

  const roles = [
    'Front-End Developer',
    'React & Next.js Specialist',
    '.NET & Laravel Developer',
    'RESTful APIs & MVC Architect',
    'Computer & Control Systems Engineer'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typeSpeed = 80;
  const deleteSpeed = 40;
  const pauseEnd = 1800;

  function type() {
    const currentRole = roles[roleIndex];

    if (!isDeleting) {
      typedTarget.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentRole.length) {
        isDeleting = true;
        setTimeout(type, pauseEnd);
        return;
      }
    } else {
      typedTarget.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }

    setTimeout(type, isDeleting ? deleteSpeed : typeSpeed);
  }

  type();
}

/* --- Scroll Spy & Smooth Scroll Navigation --- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function onScroll() {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --- Gallery Filter Tabs --- */
function initGalleryFilters() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const galleryCards = document.querySelectorAll('.gallery-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      galleryCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter || category.includes(filter)) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

/* --- Click to Copy (Email & Phone) --- */
function initClipboardButtons() {
  const copyButtons = document.querySelectorAll('.copy-btn');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = btn.textContent;
        btn.textContent = 'Copied! ✓';
        btn.style.background = 'var(--success)';
        btn.style.color = '#fff';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.color = '';
        }, 2000);
      }).catch(err => {
        console.warn('Clipboard copy error:', err);
      });
    });
  });
}

/* --- Interactive Contact Form --- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const statusBox = document.getElementById('formStatus');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = form.querySelector('[name="name"]');
    const emailInput = form.querySelector('[name="email"]');
    const subjectInput = form.querySelector('[name="subject"]');
    const messageInput = form.querySelector('[name="message"]');

    if (!nameInput?.value.trim() || !emailInput?.value.trim() || !messageInput?.value.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    // Friendly success state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending Message...</span>';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;

      if (statusBox) {
        statusBox.className = 'form-status success';
        statusBox.textContent = `Thank you, ${nameInput.value}! Your message has been prepared. You can also reach me directly at mahmoudelagamy@std.mans.edu.eg.`;
      }

      form.reset();

      setTimeout(() => {
        if (statusBox) statusBox.style.display = 'none';
      }, 7000);
    }, 750);
  });
}
