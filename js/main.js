/**
 * Main JavaScript file for QA Tester Portfolio
 * Initializes interactive features, including form validation, theme toggle,
 * mobile menu, testimonials carousel, smooth scrolling, progress bars, and image lazy loading.
 * Focuses on secure, reliable, and accessible form validation with real-time feedback.
 */
document.addEventListener('DOMContentLoaded', () => {
  // === Utility Functions ===

  /**
   * Debounces a function to limit execution frequency, improving performance for real-time validation.
   * @param {Function} func - Function to debounce.
   * @param {number} wait - Delay in milliseconds.
   * @returns {Function} Debounced function.
   */
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  };

  /**
   * Sanitizes input to prevent XSS by removing HTML, scripts, and URLs.
   * Logs warnings for suspicious inputs without exposing sensitive data.
   * @param {string} input - User input to sanitize.
   * @returns {string} Sanitized input.
   */
  const sanitizeInput = (input) => {
    if (!input) return '';
    const div = document.createElement('div');
    div.textContent = input;
    let sanitized = div.innerHTML
      .replace(/[<>&"']/g, (match) => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;'
      }[match]))
      .replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, '');
    if (/script|onerror|onload|javascript|eval|alert|prompt|confirm|document|window/i.test(sanitized)) {
      console.warn('Suspicious input detected and blocked:', { inputLength: input.length });
      return '';
    }
    return sanitized.trim();
  };

  // === Mobile Menu Toggle ===
  /**
   * Toggles mobile menu visibility and updates ARIA attributes for accessibility.
   */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !isExpanded);
      navLinks.style.display = isExpanded ? 'none' : 'flex';
      console.log('Mobile menu toggled:', { isExpanded: !isExpanded });
    });
  } else {
    console.error('Mobile menu elements missing:', { hamburger, navLinks });
  }

  // === Theme Toggle ===
  /**
   * Toggles light/dark theme and updates icon for user feedback.
   */
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      console.log('Theme toggled:', { isDark });
    });
  } else {
    console.error('Theme toggle button missing');
  }

  // === Form Validation ===
  /**
   * Initializes form validation with real-time feedback, debouncing, security, and accessibility.
   */
  const form = document.getElementById('contact-form');
  const submitButton = form?.querySelector('button[type="submit"]');
  if (!form || !submitButton) {
    console.error('Contact form or submit button not found');
    return;
  }

  // Cache DOM elements for performance
  const fields = {
    name: {
      input: document.getElementById('name'),
      error: document.getElementById('name-error')
    },
    email: {
      input: document.getElementById('email'),
      error: document.getElementById('email-error')
    },
    message: {
      input: document.getElementById('message'),
      error: document.getElementById('message-error')
    }
  };

  // Validate DOM elements exist to prevent null errors
  if (!fields.name.input || !fields.email.input || !fields.message.input ||
      !fields.name.error || !fields.email.error || !fields.message.error) {
    console.error('Form input or error elements missing:', fields);
    return;
  }

  /**
   * Validates name: 2–50 characters, letters and spaces only, supports Unicode.
   * @param {string} value - Name input value.
   * @returns {Object} Validation result with isValid and message.
   */
  const validateName = (value) => {
    const sanitized = sanitizeInput(value);
    const regex = /^[a-zA-Z\s\u00C0-\u017F]{2,50}$/;
    return {
      isValid: regex.test(sanitized) && sanitized === value.trim(),
      message: !value.trim() ? 'Name is required' :
               value.length < 2 ? 'Name must be at least 2 characters' :
               value.length > 50 ? 'Name must be 50 characters or less' :
               !regex.test(sanitized) ? 'Name can only contain letters and spaces' :
               'Invalid name'
    };
  };

  /**
   * Validates email: strict format, no disposable domains, ≤100 characters.
   * @param {string} value - Email input value.
   * @returns {Object} Validation result with isValid and message.
   */
  const validateEmail = (value) => {
    const sanitized = sanitizeInput(value);
    const regex = /^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$/;
    const disposableDomains = ['mailinator.com', 'tempmail.com', '10minutemail.com'];
    const domain = sanitized.split('@')[1]?.toLowerCase();
    return {
      isValid: regex.test(sanitized) &&
               sanitized === value.trim() &&
               !disposableDomains.some(d => domain?.endsWith(d)) &&
               sanitized.length <= 100,
      message: !value.trim() ? 'Email is required' :
               !regex.test(sanitized) ? 'Enter a valid email address' :
               disposableDomains.some(d => domain?.endsWith(d)) ? 'Disposable email addresses are not allowed' :
               sanitized.length > 100 ? 'Email must be 100 characters or less' :
               'Invalid email'
    };
  };

  /**
   * Validates message: 10–500 characters, no URLs or script-like content.
   * @param {string} value - Message input value.
   * @returns {Object} Validation result with isValid and message.
   */
  const validateMessage = (value) => {
    const sanitized = sanitizeInput(value);
    return {
      isValid: sanitized.length >= 10 &&
               sanitized.length <= 500 &&
               sanitized === value.trim() &&
               !/(https?:\/\/)|(www\.)/i.test(sanitized),
      message: !value.trim() ? 'Message is required' :
               sanitized.length < 10 ? 'Message must be at least 10 characters' :
               sanitized.length > 500 ? 'Message must be 500 characters or less' :
               /(https?:\/\/)|(www\.)/i.test(sanitized) ? 'Message cannot contain URLs' :
               'Invalid message'
    };
  };

  // Map fields to validation functions for modularity
  const validationRules = {
    name: validateName,
    email: validateEmail,
    message: validateMessage
  };

  /**
   * Validates a single field, updates error message, and applies invalid styling.
   * @param {string} fieldName - Field name (name, email, message).
   * @param {string} value - Input value.
   * @returns {boolean} Whether the field is valid.
   */
  const validateField = (fieldName, value) => {
    const result = validationRules[fieldName](value);
    const field = fields[fieldName];
    field.input.setAttribute('aria-invalid', !result.isValid);
    field.error.textContent = result.isValid ? '' : result.message;
    field.input.parentElement.classList.toggle('invalid', !result.isValid);
    console.log(`Validated ${fieldName}:`, {
      value: fieldName === 'email' ? '[redacted]' : value,
      isValid: result.isValid,
      message: result.message
    });
    return result.isValid;
  };

  /**
   * Validates all fields and updates submit button state for user feedback.
   * @returns {boolean} Whether the entire form is valid.
   */
  const validateForm = () => {
    const isValid = Object.keys(fields).every(fieldName =>
      validateField(fieldName, fields[fieldName].input.value)
    );
    submitButton.disabled = !isValid;
    submitButton.setAttribute('aria-disabled', !isValid);
    console.log('Form validation status:', { isValid });
    return isValid;
  };

  // Debounced validation for real-time input to optimize performance
  const debouncedValidate = debounce((fieldName, value) => {
    validateField(fieldName, value);
    validateForm();
  }, 300);

  /**
   * Attaches input and blur event listeners for real-time and on-blur validation.
   */
  const attachValidation = () => {
    Object.keys(fields).forEach(fieldName => {
      const input = fields[fieldName].input;
      input.addEventListener('input', () => debouncedValidate(fieldName, input.value));
      input.addEventListener('blur', () => validateField(fieldName, input.value));
    });
  };

  /**
   * Handles form submission, validates fields, and simulates submission with Formspree preparation.
   */
  const handleSubmit = () => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitButton.disabled = true;
      submitButton.setAttribute('aria-disabled', 'true');

      if (validateForm()) {
        try {
          // Sanitize form data for secure submission
          const formData = {
            name: sanitizeInput(fields.name.input.value),
            email: sanitizeInput(fields.email.input.value),
            message: sanitizeInput(fields.message.input.value)
          };

          // Simulate submission (replace with Formspree fetch for production)
          console.log('Submitting form:', {
            name: formData.name,
            email: '[redacted]',
            message: formData.message
          });
          // Example Formspree integration:
          /*
          const response = await fetch(form.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          if (!response.ok) throw new Error('Submission failed');
          */

          alert('Form submitted successfully!');
          form.reset();
          Object.keys(fields).forEach(fieldName => {
            fields[fieldName].input.setAttribute('aria-invalid', 'false');
            fields[fieldName].error.textContent = '';
            fields[fieldName].input.parentElement.classList.remove('invalid');
          });
          console.log('Form submitted successfully');
        } catch (error) {
          console.error('Form submission error:', error);
          alert('An error occurred. Please try again.');
        }
      } else {
        // Focus first invalid field for accessibility
        const firstInvalid = Object.values(fields).find(
          field => field.input.getAttribute('aria-invalid') === 'true'
        );
        if (firstInvalid) firstInvalid.input.focus();
        console.log('Form validation failed');
      }
      validateForm();
    });
  };

  // Initialize form validation
  attachValidation();
  handleSubmit();
  validateForm();

  // === Testimonial Carousel ===
  
  const track = document.querySelector('.carousel-track');
const cards = document.querySelectorAll('.testimonial-card');
const prevBtn = document.querySelector('.nav.prev');
const nextBtn = document.querySelector('.nav.next');
let currentIndex = 0;

function updateCarousel() {
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
  cards.forEach((card, index) => {
    card.classList.toggle('active', index === currentIndex);
  });
}

nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % cards.length;
  updateCarousel();
});

prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  updateCarousel();
});

  // === Smooth Scrolling ===
  /**
   * Enables smooth scrolling for anchor links, accounting for navbar height.
   */
  document.querySelectorAll('a[href*="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const href = anchor.getAttribute('href');
      const [path, hash] = href.split('#');
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';

      if (path && path !== currentPath) {
        window.location.href = href;
      } else {
        const target = hash ? document.querySelector(`#${hash}`) : document.body;
        if (target) {
          const offset = document.querySelector('.navbar').offsetHeight;
          window.scrollTo({
            top: target.offsetTop - offset,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // === Progress Bar Animation ===
  /**
   * Animates progress bars on scroll for resume page.
   */
  const progressBars = document.querySelectorAll('.progress');
  const animateProgressBars = () => {
    progressBars.forEach(bar => {
      const rect = bar.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom >= 0) {
        const progress = bar.getAttribute('data-progress');
        bar.style.width = `${progress}%`;
      }
    });
  };

  if (progressBars.length) {
    window.addEventListener('scroll', animateProgressBars);
    animateProgressBars();
  }

  // === Lazy Loading Images ===
  /**
   * Lazy loads images and badges for improved performance.
   */
  const images = document.querySelectorAll('img[data-src], .client-logo, .trust-badge');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });
  images.forEach(img => observer.observe(img));
});