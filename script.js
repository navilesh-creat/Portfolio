/**
 * Portfolio Interactive Features
 * - Smooth scroll navigation
 * - Mobile menu toggle
 * - Scroll-triggered animations
 * - Navbar background on scroll
 */

document.addEventListener('DOMContentLoaded', () => {
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

    // Close menu when clicking a link (mobile)
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('open');
      });
    });
  }

  // Navbar scroll effect
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Active nav link on scroll
  function updateActiveNav() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

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

  window.addEventListener('scroll', updateActiveNav);

  // Scroll-triggered fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document.querySelectorAll('.stat, .skill-category, .project-card, .about-text p').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // Also animate section titles
  document.querySelectorAll('.section-title').forEach((title, index) => {
    title.classList.add('fade-in');
    // Stagger the animation slightly
    title.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(title);
  });

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

      // Validation
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

      // Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailInput.value && !emailRegex.test(emailInput.value)) {
        isValid = false;
        emailInput.style.borderColor = '#ef4444';
      }

      if (!isValid) return;

      // Submit state
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      try {
        // Save to Firestore
        if (window.firebaseDb && window.firebaseAddDoc) {
          await window.firebaseAddDoc(window.firebaseCollection(window.firebaseDb, 'contact_messages'), {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            subject: subjectInput.value.trim() || 'No Subject',
            message: messageInput.value.trim(),
            createdAt: window.firebaseServerTimestamp()
          });
        } else {
          // Fallback if Firebase not loaded
          console.error('Firebase not initialized');
          throw new Error('Service unavailable');
        }

        // Success feedback
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

    // Remove error styling on input
    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', () => {
        field.style.borderColor = '';
      });
    });
  }

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Typing effect for hero subtitle (optional enhancement)
  const heroSubtitle = document.querySelector('.hero-subtitle');
  if (heroSubtitle) {
    const roles = [
      'Full-Stack Developer',
      'UI/UX Enthusiast',
      'Problem Solver',
      'Tech Innovator'
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    // Only run typing effect if desired - comment out to keep static text
    /*
    function typeEffect() {
      const currentRole = roles[roleIndex];
      const span = heroSubtitle.querySelector('.gradient-text');

      if (!span) return;

      if (isDeleting) {
        span.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50;
      } else {
        span.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 100;
      }

      if (!isDeleting && charIndex === currentRole.length) {
        isDeleting = true;
        typeSpeed = 2000; // Pause at end
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typeSpeed = 500;
      }

      setTimeout(typeEffect, typeSpeed);
    }

    // Start typing after initial load
    setTimeout(typeEffect, 2000);
    */
  }
});
