/* DEVIVAN — interactions & motion */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || location.search.includes('snap');
  if (location.search.includes('snap')) document.documentElement.classList.add('no-anim');
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------- preloader ---------- */
  const preloader = document.getElementById('preloader');
  const bar = document.getElementById('preloaderBar');
  let progress = 0;
  const tick = setInterval(() => {
    progress = Math.min(progress + Math.random() * 22, 92);
    bar.style.width = progress + '%';
  }, 120);

  let loaded = false;
  const finishLoading = () => {
    if (loaded) return;
    loaded = true;
    clearInterval(tick);
    bar.style.width = '100%';
    setTimeout(() => {
      preloader.classList.add('done');
      startHeroIntro();
    }, reduceMotion ? 0 : 350);
  };
  window.addEventListener('load', finishLoading);
  // страховка, если load задерживается (медленная сеть)
  setTimeout(finishLoading, 4000);

  /* ---------- smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    document.documentElement.classList.add('lenis');
  }

  // якорные ссылки через Lenis
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: -70 });
      else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- nav ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenu = () => {
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
  };
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    mobileMenu.classList.toggle('open', !open);
    mobileMenu.setAttribute('aria-hidden', String(open));
  });

  /* ---------- hero intro ---------- */
  function startHeroIntro() {
    if (reduceMotion || !window.gsap) {
      document.querySelectorAll('.hero .reveal, .hero__title-line > span').forEach(el => {
        el.classList.add('visible'); el.style.transform = 'none'; el.style.opacity = '1';
      });
      return;
    }
    gsap.fromTo('.hero__title-line > span',
      { yPercent: 110 },
      { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.12 });
    gsap.fromTo('.hero .reveal',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.35,
        onComplete: () => document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('visible')) });
    gsap.fromTo('#heroFigure',
      { opacity: 0, y: 60, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'power3.out', delay: 0.2 });
  }

  /* ---------- scroll reveals ---------- */
  const revealEls = document.querySelectorAll('.reveal:not(.hero .reveal), .reveal-lines');
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => { el.classList.add('reveal'); io.observe(el); });
  }

  /* ---------- GSAP scroll effects ---------- */
  if (!reduceMotion && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) lenis.on('scroll', ScrollTrigger.update);

    // параллакс персонажа и ghost-текста
    gsap.to('#heroChar', {
      yPercent: 10, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero__ghost', {
      yPercent: 46, opacity: 0.2, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    // лёгкий параллакс карточек работ
    document.querySelectorAll('.work__frame img').forEach(img => {
      gsap.fromTo(img, { yPercent: -4 }, {
        yPercent: 4, ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------- mouse parallax on hero ---------- */
  if (!isTouch && !reduceMotion) {
    const figure = document.getElementById('heroFigure');
    const chr = document.getElementById('heroChar');
    const cards = document.querySelectorAll('.hero__card');
    let rx = 0, ry = 0, tx = 0, ty = 0;
    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      const { innerWidth: w, innerHeight: h } = window;
      tx = (e.clientX / w - 0.5);
      ty = (e.clientY / h - 0.5);
    });
    const loop = () => {
      rx += (tx - rx) * 0.06;
      ry += (ty - ry) * 0.06;
      chr.style.transform = `translate3d(${rx * 18}px, ${ry * 10}px, 0) rotateY(${rx * 4}deg)`;
      cards.forEach((c, i) => {
        const k = (i + 1) * 10;
        c.style.translate = `${-rx * k}px ${-ry * k * 0.6}px`;
      });
      requestAnimationFrame(loop);
    };
    figure.style.perspective = '900px';
    loop();
  }

  /* ---------- cursor glow ---------- */
  const glow = document.getElementById('cursorGlow');
  if (!isTouch && !reduceMotion && glow) {
    let gx = innerWidth / 2, gy = innerHeight / 2, mx = gx, my = gy;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    const gloop = () => {
      gx += (mx - gx) * 0.08; gy += (my - gy) * 0.08;
      glow.style.left = gx + 'px'; glow.style.top = gy + 'px';
      requestAnimationFrame(gloop);
    };
    gloop();
  }

  /* ---------- particles ---------- */
  const canvas = document.getElementById('particles');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let W, H, parts = [];
    const N = isTouch ? 30 : 60;
    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    for (let i = 0; i < N; i++) {
      parts.push({
        x: Math.random(), y: Math.random(),
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - .5) * 0.0004,
        vy: -(Math.random() * 0.0006 + 0.0002),
        a: Math.random() * 0.5 + 0.15,
        hue: Math.random() > 0.5 ? '108,99,255' : '138,43,226'
      });
    }
    let visible = true;
    new IntersectionObserver(([en]) => visible = en.isIntersecting).observe(canvas);
    const draw = () => {
      if (visible) {
        ctx.clearRect(0, 0, W, H);
        for (const p of parts) {
          p.x += p.vx; p.y += p.vy;
          if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
          if (p.x < -0.02) p.x = 1.02;
          if (p.x > 1.02) p.x = -0.02;
          ctx.beginPath();
          ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.hue},${p.a})`;
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* ---------- 3D tilt on why-cards ---------- */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll('.why__card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  let lastFocus = null;

  const openLightbox = (src, alt) => {
    lastFocus = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || 'Скриншот кейса в полном размере';
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('open'));
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
    lightboxClose.focus();
  };
  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    setTimeout(() => { lightbox.hidden = true; lightboxImg.src = ''; }, 350);
    if (lastFocus) lastFocus.focus();
  };

  document.querySelectorAll('.work').forEach(w => {
    const btn = w.querySelector('.work__frame');
    const img = w.querySelector('img');
    btn.addEventListener('click', () => openLightbox(w.dataset.full, img.alt));
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox || e.target.classList.contains('lightbox__scroll')) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lightbox.hidden) closeLightbox(); });

  /* ---------- tech stack icons ---------- */
  const ICONS = {
    html: ['html5', 'E34F26'], css: ['css', '663399'], js: ['javascript', 'F7DF1E'],
    ts: ['typescript', '3178C6'], react: ['react', '61DAFB'], next: ['nextdotjs', 'FFFFFF'],
    tailwind: ['tailwindcss', '06B6D4'], framer: ['framer', 'BB86FF'], gsap: ['greensock', '88CE02'],
    three: ['threedotjs', 'FFFFFF'], claude: ['claude', 'D97757'], vercel: ['vercel', 'FFFFFF'],
    git: ['git', 'F05032'], github: ['github', 'FFFFFF'],
    ai: null // кастомная иконка
  };
  const AI_SVG = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" fill="url(#aig)"/><path d="M19 15l.9 2.6L22.5 18.5l-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9L19 15Z" fill="url(#aig)"/><defs><linearGradient id="aig" x1="0" y1="0" x2="24" y2="24"><stop stop-color="#6C63FF"/><stop offset="1" stop-color="#8A2BE2"/></linearGradient></defs></svg>';

  document.querySelectorAll('#stackGrid li').forEach(li => {
    const key = li.dataset.tech;
    const slot = li.querySelector('.stack__icon');
    const label = li.textContent.trim();
    const fallback = () => {
      slot.innerHTML = `<span class="stack__fallback" aria-hidden="true">${label.slice(0, 2).toUpperCase()}</span>`;
    };
    if (key === 'ai') { slot.innerHTML = AI_SVG; return; }
    const def = ICONS[key];
    if (!def) { fallback(); return; }
    const img = new Image();
    img.src = `https://cdn.simpleicons.org/${def[0]}/${def[1]}`;
    img.alt = '';
    img.width = 22; img.height = 22;
    img.loading = 'lazy';
    img.onerror = fallback;
    slot.appendChild(img);
  });

  /* ---------- misc ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
