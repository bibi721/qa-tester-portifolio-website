// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', !isExpanded);
  navLinks.style.display = isExpanded ? 'none' : 'flex';
});

// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  themeToggle.textContent = isDark ? 'Light Theme' : 'Dark Theme';
});

// Form Validation
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const fields = [
      { id: 'name', message: 'Name is required' },
      { id: 'email', message: 'Valid email is required', validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) },
      { id: 'message', message: 'Message is required' },
    ];

    fields.forEach(field => {
      const input = document.getElementById(field.id);
      const error = input.nextElementSibling;
      const value = input.value.trim();

      if (!value || (field.validate && !field.validate(value))) {
        input.parentElement.classList.add('invalid');
        error.textContent = field.message;
        isValid = false;
      } else {
        input.parentElement.classList.remove('invalid');
        error.textContent = '';
      }
    });

    if (isValid) {
      // Simulate form submission (replace with actual API call)
      alert('Form submitted successfully!');
      form.reset();
    }
  });
}

// Testimonial Carousel
const carousel = document.querySelector('.testimonials-carousel');
if (carousel) {
  const container = carousel.querySelector('.carousel-container');
  const testimonials = container.querySelectorAll('.testimonial');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  let currentIndex = 0;

  const updateCarousel = () => {
    testimonials.forEach((t, i) => {
      t.classList.toggle('active', i === currentIndex);
    });
  };

  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % testimonials.length;
    updateCarousel();
  });

  updateCarousel();
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector(anchor.getAttribute('href')).scrollIntoView({
      behavior: 'smooth',
    });
  });
});

// Lazy Loading Images (if any)
const images = document.querySelectorAll('img[data-src]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      observer.unobserve(img);
    }
  });
});
images.forEach(img => observer.observe(img));