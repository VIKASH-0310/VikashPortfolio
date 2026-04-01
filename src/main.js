import './style.css'

// ------------------------------
// Smooth Scroll & Active Nav Update
// ------------------------------
const navLinks = document.querySelectorAll('.nav-link')

window.addEventListener('scroll', () => {
  let current = 'home';
  const sections = document.querySelectorAll('section, header');
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (pageYOffset >= sectionTop - 100) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').includes(current)) {
      link.classList.add('active');
    }
  });

}, { passive: true });


// ------------------------------
// Custom Mouse Cursor Animation
// ------------------------------
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

if (cursorDot && cursorOutline && window.innerWidth > 900) {
  window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // Dot simply follows mouse instantly
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Outline follows with a slight smooth delay
    cursorOutline.animate({
      left: `${posX}px`,
      top: `${posY}px`
    }, { duration: 400, fill: "forwards" });
  });

  // Track hoverable elements mapped to make cursor transform
  const interactables = document.querySelectorAll('a, button, input, textarea, .project-card, .abs-box, .skill-icon');
  
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorOutline.style.width = '60px';
      cursorOutline.style.height = '60px';
      cursorOutline.style.backgroundColor = 'rgba(178, 213, 59, 0.1)';
      cursorOutline.style.borderColor = 'rgba(178, 213, 59, 1)';
    });
    
    el.addEventListener('mouseleave', () => {
      cursorOutline.style.width = '40px';
      cursorOutline.style.height = '40px';
      cursorOutline.style.backgroundColor = 'transparent';
      cursorOutline.style.borderColor = 'rgba(178, 213, 59, 0.5)';
    });
  });
}

// ------------------------------
// Web3Forms Contact Form Handler
// ------------------------------
const web3Key = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
const contactForm = document.getElementById('contact-form')
const formStatus = document.getElementById('contact-form-status')

if (contactForm && formStatus) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    formStatus.hidden = false
    formStatus.className = ''
    
    if (!web3Key) {
      formStatus.textContent = 'Missing Web3Forms key. Check your .env file.'
      formStatus.classList.add('status-error')
      return
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]')
    const name = contactForm.querySelector('#contact-name')?.value?.trim() ?? ''
    const email = contactForm.querySelector('#contact-email')?.value?.trim() ?? ''
    const message = contactForm.querySelector('#contact-message')?.value?.trim() ?? ''

    formStatus.textContent = 'Sending message…'
    submitBtn.textContent = 'Sending...'
    submitBtn.disabled = true

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: web3Key,
          subject: 'Portfolio: new message',
          from_name: name,
          name,
          email,
          message,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (data.success) {
        formStatus.textContent = "Thanks — your message was sent! I'll reply soon."
        formStatus.classList.add('status-success')
        contactForm.reset()
      } else {
        formStatus.textContent = typeof data.message === 'string' ? data.message : 'Could not send. Check key/format.'
        formStatus.classList.add('status-error')
      }
    } catch {
      formStatus.textContent = 'Network error. Try again later.'
      formStatus.classList.add('status-error')
    } finally {
      submitBtn.textContent = 'Book Me Now'
      submitBtn.disabled = false
    }
  })
}

// ------------------------------
// Space Asteroids / Stars Background
// ------------------------------
const canvas = document.getElementById('space-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.5 + 0.5;
      // Stars falling slowly
      this.speedX = (Math.random() - 0.5) * 1; 
      this.speedY = Math.random() * 1.5 + 0.5; 
      this.opacity = Math.random() * 0.8 + 0.2;
      this.isAsteroid = Math.random() > 0.98; // 2% chance to be a shiny fast asteroid
      if (this.isAsteroid) {
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = Math.random() * 12 + 8; // Very fast
        this.opacity = 1;
      }
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.y > height + 50 || this.x < -50 || this.x > width + 50) {
        this.reset();
        this.y = -10; // start slightly above screen to fall smoothly
        this.x = Math.random() * width; // reset X position as well
      }
    }
    draw() {
      ctx.beginPath();
      if (this.isAsteroid) {
        // Draw asteroid line trail
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.speedX * 3, this.y - this.speedY * 3); // longer tail for speed
        // Use our beautiful accent green
        ctx.strokeStyle = `rgba(178, 213, 59, ${this.opacity})`;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        ctx.stroke();
      } else {
        // Point star
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }
  }

  // Generate dense star field
  for (let i = 0; i < 200; i++) {
    particles.push(new Particle());
  }

  const animate = () => {
    // Clear canvas with a very slight fade for trailing effect on the stars
    ctx.clearRect(0, 0, width, height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  };
  animate();
}
