/**
 * Portfolio Interactive Features
 * - Smooth scroll navigation
 * - Mobile menu toggle
 * - Scroll-triggered animations
 * - Navbar background on scroll
 * - Live particle background + cursor glow
 * - Magnetic buttons + tilt cards
 * - Typed hero role text
 * - Animated stat counters
 * - Scroll progress bar + back-to-top
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Elements
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');
  const form = document.getElementById('contactForm');

  // Mobile menu toggle
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('open');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
      });
    });
  }

  // Navbar scroll effect + scroll progress + back-to-top
  const nav = document.querySelector('.nav');
  const progressBar = document.getElementById('scrollProgressBar');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (nav) nav.classList.toggle('scrolled', scrollTop > 50);
    if (progressBar) progressBar.style.width = pct + '%';
    if (backToTop) backToTop.classList.toggle('visible', scrollTop > 400);

    updateActiveNav();
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Active nav link on scroll
  function updateActiveNav() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      if (!sectionId) return;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Scroll-triggered fade-in animations
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('about-stats')) {
          animateCounters(entry.target);
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.stat, .skill-category, .project-card, .about-text p').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  document.querySelectorAll('.section-title').forEach((title, index) => {
    title.classList.add('fade-in');
    title.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(title);
  });

  const statsBlock = document.querySelector('.about-stats');
  if (statsBlock) observer.observe(statsBlock);

  // Animated stat counters
  function animateCounters(container) {
    const numbers = container.querySelectorAll('.stat-number[data-count]');
    numbers.forEach(num => {
      const target = parseInt(num.getAttribute('data-count'), 10) || 0;
      if (prefersReducedMotion) {
        num.textContent = target;
        return;
      }
      let current = 0;
      const duration = 1200;
      const startTime = performance.now();

      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        current = Math.floor(progress * target);
        num.textContent = current;
        if (progress < 1) requestAnimationFrame(tick);
        else num.textContent = target;
      }
      requestAnimationFrame(tick);
    });
  }

  // Contact form handling
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      const nameInput = form.querySelector('#name');
      const emailInput = form.querySelector('#email');
      const subjectInput = form.querySelector('#subject');
      const messageInput = form.querySelector('#message');

      let isValid = true;
      const requiredFields = [nameInput, emailInput, messageInput];

      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.style.borderColor = '#ef4444';
        } else {
          field.style.borderColor = '';
        }
      });

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailInput.value && !emailRegex.test(emailInput.value)) {
        isValid = false;
        emailInput.style.borderColor = '#ef4444';
      }

      if (!isValid) return;

      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      try {
        if (window.firebaseDb && window.firebaseAddDoc) {
          await window.firebaseAddDoc(window.firebaseCollection(window.firebaseDb, 'contact_messages'), {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            subject: subjectInput.value.trim() || 'No Subject',
            message: messageInput.value.trim(),
            createdAt: window.firebaseServerTimestamp()
          });
        } else {
          console.error('Firebase not initialized');
          throw new Error('Service unavailable');
        }

        submitBtn.textContent = 'Message Sent!';
        submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        form.reset();

        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 3000);

      } catch (error) {
        console.error('Form submission error:', error);
        submitBtn.textContent = 'Error - Try Again';
        submitBtn.style.background = '#ef4444';

        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 3000);
      }
    });

    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', () => {
        field.style.borderColor = '';
      });
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Typed hero role text
  const typedEl = document.getElementById('typedRole');
  if (typedEl) {
    const roles = ['web apps', 'React interfaces', 'Firebase backends', 'full-stack products'];
    let roleIndex = 0, charIndex = 0, isDeleting = false;

    function typeLoop() {
      const current = roles[roleIndex];
      if (isDeleting) {
        charIndex--;
        typedEl.textContent = current.substring(0, charIndex);
        if (charIndex === 0) {
          isDeleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(typeLoop, 400);
          return;
        }
        setTimeout(typeLoop, 40);
      } else {
        charIndex++;
        typedEl.textContent = current.substring(0, charIndex);
        if (charIndex === current.length) {
          isDeleting = true;
          setTimeout(typeLoop, 1800);
          return;
        }
        setTimeout(typeLoop, 80);
      }
    }

    if (prefersReducedMotion) {
      typedEl.textContent = roles[0];
    } else {
      setTimeout(typeLoop, 600);
    }
  }

  // Magnetic buttons
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
      });
    });

    // Tilt cards
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${y * -8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
      });
    });

    // Cursor glow
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow) {
      window.addEventListener('mousemove', (e) => {
        cursorGlow.style.opacity = '1';
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
      });
      window.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
      });
    }
  }

  // Live moving particle network background
  const canvas = document.getElementById('bg-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createParticles() {
      const count = Math.min(70, Math.floor((width * height) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.6
      }));
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });

      ctx.strokeStyle = 'rgba(129, 140, 248, 0.12)';
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = 'rgba(165, 180, 252, 0.6)';
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(step);
    }

    resize();
    createParticles();
    step();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });
  }
});
