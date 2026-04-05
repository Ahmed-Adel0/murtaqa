// ---- Navbar scroll effect & Scroll Spy ----
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
  let scrollY = window.pageYOffset;

  sections.forEach(current => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 100; // Offset for navbar
    const sectionId = current.getAttribute('id');

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document.querySelector('.nav-links a[href*=' + sectionId + ']')?.classList.add('active');
    } else {
      document.querySelector('.nav-links a[href*=' + sectionId + ']')?.classList.remove('active');
    }
  });
}

window.addEventListener('scroll', () => {
  // Island transformation
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Activity highlighting
  updateActiveLink();

  // Scroll to top button
  const scrollBtn = document.getElementById('scrollTop');
  if (window.scrollY > 400) {
    scrollBtn.classList.add('visible');
  } else {
    scrollBtn.classList.remove('visible');
  }
});

// Run once on load
window.addEventListener('load', updateActiveLink);

// ---- Mobile Nav ----
function openMobileNav() {
  document.getElementById('mobileNav').classList.add('open');
  document.getElementById('mobileOverlay').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  document.getElementById('mobileNav').classList.remove('open');
  document.getElementById('mobileOverlay').style.display = 'none';
  document.body.style.overflow = '';
}

// ---- FAQ Accordion ----
function toggleFaq(el) {
  const item = el.parentElement;
  const allItems = document.querySelectorAll('.faq-item');

  // Close others
  allItems.forEach(i => {
    if (i !== item) i.classList.remove('open');
  });

  item.classList.toggle('open');
}

// ---- Contact Form ----
function submitForm(e) {
  e.preventDefault();
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  // Simulate submission
  const btn = form.querySelector('.submit-btn');
  btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> جاري الإرسال...';
  btn.disabled = true;

  setTimeout(() => {
    form.style.display = 'none';
    success.style.display = 'flex';
  }, 1500);
}

function resetForm() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const btn = form.querySelector('.submit-btn');

  form.reset();
  form.style.display = 'block';
  success.style.display = 'none';
  btn.innerHTML = '<i class="fa fa-paper-plane"></i> أرسل طلبك الآن';
  btn.disabled = false;
}

// ---- Smooth scroll for all anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ---- Intersection Observer for scroll animations ----
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe cards and sections
document.querySelectorAll('.service-card, .why-card, .teacher-card, .testimonial-card, .faq-item, .step-card, .offer-banner').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Teacher Selection Logic
document.addEventListener('DOMContentLoaded', () => {
  const teacherBtns = document.querySelectorAll('.book-teacher-btn');
  const teacherInput = document.getElementById('selected_teacher');

  teacherBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const teacherName = btn.getAttribute('data-teacher');
      if (teacherInput && teacherName) {
        teacherInput.value = "طلب مع: " + teacherName;
        // Optional: Smooth scroll to form if not already handled by #contact link
        // document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
