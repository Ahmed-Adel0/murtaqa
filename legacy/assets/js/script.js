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
  const item = el.closest('.faq-item');
  if (!item) return;

  const allItems = document.querySelectorAll('.faq-item');
  const isOpen = item.classList.contains('open');

  // Close others
  allItems.forEach(i => i.classList.remove('open'));

  // Toggle current if it wasn't already open
  if (!isOpen) {
    item.classList.add('open');
  }
}

// ---- Contact Form ----
function submitForm(e) {
  e.preventDefault();
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  // Collect data using IDs
  const name = document.getElementById('user_name').value;
  const phone = document.getElementById('user_phone').value;
  const teacher = document.getElementById('selected_teacher').value || 'غير محدد';
  const subject = document.getElementById('user_subject').value || 'غير محدد';
  const level = document.getElementById('user_level').value || 'غير محدد';
  const classes = document.getElementById('user_sessions').value || 'غير محدد';
  const message = document.getElementById('user_msg').value || 'لا توجد';

  // Toggle button state
  const btn = form.querySelector('.submit-btn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> جاري الإرسال...';
  btn.disabled = true;

  // Format WhatsApp message
  const whatsappNumber = "966505855924"; 
  let msg = `*طلب حجز جديد من BeboCademy*\n\n`;
  msg += `*الاسم:* ${name}\n`;
  msg += `*الهاتف:* ${phone}\n`;
  msg += `*المعلم:* ${teacher}\n`;
  msg += `*المادة:* ${subject}\n`;
  msg += `*المستوى:* ${level}\n`;
  msg += `*الحصص:* ${classes}\n`;
  msg += `*الرسالة:* ${message}`;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;

  // 1. Open WhatsApp immediately (Synchronously to avoid popup blockers)
  const windowOpened = window.open(whatsappUrl, '_blank');
  
  // 2. Fallback if window.open was blocked
  if (!windowOpened) {
     // If blocked, we could potentially try location.href, but usually _blank is better.
     // However, to ensure the user actually "sends", we can use location.href as a last resort.
     // window.location.href = whatsappUrl;
  }

  // 3. UI Feedback after a short delay (for visual polish)
  setTimeout(() => {
    form.style.display = 'none';
    success.style.display = 'flex';
    
    // Restore button for next time (even if hidden)
    btn.innerHTML = originalText;
    btn.disabled = false;
    
    // Smooth scroll to success message
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 600);
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
