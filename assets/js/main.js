/* ============================================
   main.js
   Design School Site - Animation Controller
   ============================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     0. GSAP Plugin Registration
     ────────────────────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  /* ──────────────────────────────────────────
     0.5. Mobile Detection
     ────────────────────────────────────────── */
  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  /* ──────────────────────────────────────────
     1. Lenis Smooth Scroll
     ────────────────────────────────────────── */
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smooth: true,
    });

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    console.warn('Lenis not loaded. Smooth scroll disabled.');
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        if (lenis) lenis.scrollTo(target, { offset: -80 });
        else target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });


  /* ──────────────────────────────────────────
     2. Header Scroll State
     ────────────────────────────────────────── */
  const header = document.querySelector('.site-header');

  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      if (self.direction === 1 && window.scrollY > 80) {
        header.classList.add('is-scrolled');
      }
      if (window.scrollY <= 80) {
        header.classList.remove('is-scrolled');
      }
    },
  });


  /* ──────────────────────────────────────────
     3. FV - Background Blur Breathing
     ────────────────────────────────────────── */
  const fvBgBlur = document.querySelector('.fv-bg-blur');

  if (fvBgBlur) {
    gsap.to(fvBgBlur, {
      filter: 'blur(10px) brightness(0.5)',
      duration: 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }


  /* ──────────────────────────────────────────
     4. FV - Swiper Custom Slide Controller
     ────────────────────────────────────────── */
  class FVSlideController {
    constructor() {
      this.swiper = new Swiper('.fv-slides', {
        effect: 'fade',
        fadeEffect: { crossFade: true },
        speed: 300,
        loop: true,
        allowTouchMove: false,
        autoplay: false,
      });

      this.totalSlides = 7;
      this.fastDuration = 0.6;
      this.pauseDuration = 2.0;
      this.currentStep = 0;
      this.isRunning = true;
      this.timeoutId = null;

      this.start();
    }

    start() {
      this.runStep();
    }

    runStep() {
      if (!this.isRunning) return;

      const isShowSlide = this.currentStep === this.totalSlides - 1;
      const holdDuration = isShowSlide ? this.pauseDuration : this.fastDuration;

      this.swiper.slideNext();

      this.timeoutId = setTimeout(() => {
        this.currentStep = (this.currentStep + 1) % this.totalSlides;
        this.runStep();
      }, holdDuration * 1000);
    }

    pause() {
      this.isRunning = false;
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
    }

    resume() {
      if (!this.isRunning) {
        this.isRunning = true;
        this.runStep();
      }
    }
  }

  const fvSlideController = new FVSlideController();

  ScrollTrigger.create({
    trigger: '.section-fv',
    start: 'top top',
    end: 'bottom top',
    onLeave: () => fvSlideController.pause(),
    onEnterBack: () => fvSlideController.resume(),
  });


  /* ──────────────────────────────────────────
     5. FV - Text Entrance Animation
     ────────────────────────────────────────── */
  const fvTimeline = gsap.timeline({ delay: 0.3 });

  fvTimeline
    .from('.fv-title-line', {
      opacity: 0,
      y: 40,
      duration: 1.0,
      stagger: 0.2,
      ease: 'power3.out',
    })
    .from(
      '.fv-subtitle',
      {
        opacity: 0,
        y: 25,
        duration: 1.0,
        ease: 'power3.out',
      },
      '-=0.5'
    )
    .from(
      '.fv-scroll-indicator',
      {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      },
      '-=0.4'
    );


  /* ──────────────────────────────────────────
     6. FV - Scroll Fade Out
     ────────────────────────────────────────── */
  gsap.to('.fv-content', {
    opacity: 0,
    y: -60,
    scrollTrigger: {
      trigger: '.section-fv',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    },
  });


  /* ──────────────────────────────────────────
     7. Glow Video Layer - Lazy Load
     ────────────────────────────────────────── */
  const glowVideo = document.querySelector('.glow-video-layer video');

  if (glowVideo) {
    const loadAndPlayGlow = () => {
      glowVideo.load();
      glowVideo.play().catch(() => {
        console.log('Glow video autoplay blocked');
      });
    };

    ScrollTrigger.create({
      trigger: '.section-concept',
      start: 'top 120%',
      once: true,
      onEnter: loadAndPlayGlow,
    });

    setTimeout(() => {
      if (glowVideo.readyState === 0) {
        console.log('Glow video: force loading (safety net)');
        loadAndPlayGlow();
      }
    }, 5000);
  }

  /* ──────────────────────────────────────────
     7.5. Glow Video - Fallback Detection
     ────────────────────────────────────────── */
  if (glowVideo) {
    glowVideo.addEventListener('error', () => {
      console.warn('Glow video failed to load. Using CSS gradient fallback.');
      const layer = document.querySelector('.glow-video-layer');
      if (layer) {
        layer.classList.add('glow-video-layer--fallback');
      }
    });

    const videoSource = glowVideo.querySelector('source');
    if (videoSource && !videoSource.getAttribute('src')) {
      const layer = document.querySelector('.glow-video-layer');
      if (layer) {
        layer.classList.add('glow-video-layer--fallback');
      }
    }
  }


  /* ──────────────────────────────────────────
     8. Glow Ribbon - Opacity Control per Section
     ────────────────────────────────────────── */
  const glowVideoLayer = document.querySelector('.glow-video-layer');
  const ribbonMaskLayer = document.querySelector('.ribbon-mask-layer');

  function setGlowOpacity(opacity) {
    if (glowVideoLayer) glowVideoLayer.style.opacity = opacity;
    if (ribbonMaskLayer) ribbonMaskLayer.style.opacity = opacity;
  }

  ScrollTrigger.create({
    trigger: '.section-concept',
    start: 'top 80%',
    end: 'top 20%',
    scrub: 1,
    onUpdate: (self) => { setGlowOpacity(self.progress); },
  });

  ScrollTrigger.create({
    trigger: '.section-gallery',
    start: 'top 80%',
    end: 'top 30%',
    scrub: 1,
    onUpdate: (self) => { setGlowOpacity(1 - self.progress); },
  });

  ScrollTrigger.create({
    trigger: '.section-story',
    start: 'top 80%',
    end: 'top 30%',
    scrub: 1,
    onUpdate: (self) => { setGlowOpacity(self.progress); },
  });

  ScrollTrigger.create({
    trigger: '.section-faq',
    start: 'top 80%',
    end: 'top 50%',
    scrub: 1,
    onUpdate: (self) => { setGlowOpacity(1 - self.progress); },
  });

  ScrollTrigger.create({
    trigger: '.section-contact',
    start: 'top 80%',
    end: 'top 40%',
    scrub: 1,
    onUpdate: (self) => { setGlowOpacity(self.progress * 0.5); },
  });


  /* ──────────────────────────────────────────
     8.5. Glow Ribbon - Scroll Position Shift
     ────────────────────────────────────────── */
  const ribbonMask = document.querySelector('.ribbon-mask-layer');
  const ribbonPath = document.querySelector('.ribbon-mask-layer path');

  if (ribbonMask && ribbonPath) {
    ScrollTrigger.create({
      trigger: '.content-layer',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 3,
      onUpdate: (self) => {
        const xShift = -100 + self.progress * 200;
        ribbonPath.setAttribute('transform', `translate(${xShift}, 0)`);
      },
    });
  }


  /* ──────────────────────────────────────────
     8.6. Glow Video - Scroll Color Shift
     ────────────────────────────────────────── */
  const glowVideoEl = document.querySelector('.glow-video-layer video');

  if (glowVideoEl) {
    ScrollTrigger.create({
      trigger: '.content-layer',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2,
      onUpdate: (self) => {
        const hue = self.progress * 40;
        glowVideoEl.style.filter =
          `saturate(1.4) brightness(1.1) hue-rotate(${hue}deg)`;
      },
    });
  }


  /* ──────────────────────────────────────────
     9. Section Number Animation
     ────────────────────────────────────────── */
  gsap.utils.toArray('.section-number').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      x: -20,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
      },
    });
  });

  gsap.utils.toArray('.section-name').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
      },
    });
  });


  /* ──────────────────────────────────────────
     10. Concept - Text Character Animation
     ────────────────────────────────────────── */
  const conceptLead = document.querySelector('.concept-text--lead');
  if (conceptLead && typeof SplitType !== 'undefined') {
    const splitLead = new SplitType(conceptLead, { types: 'lines, words, chars' });

    gsap.from(splitLead.chars, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.02,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: conceptLead,
        start: 'top 75%',
        end: 'bottom 60%',
        scrub: 1,
      },
    });
  }

  gsap.utils.toArray('.concept-text--body p').forEach((p) => {
    gsap.from(p, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: p,
        start: 'top 80%',
      },
    });
  });


  /* ──────────────────────────────────────────
     11. For You - Card Stagger Animation
     ────────────────────────────────────────── */
  gsap.from('.service-card', {
    opacity: 0,
    y: 60,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.service-grid',
      start: 'top 70%',
    },
  });


  /* ──────────────────────────────────────────
     11.5. Curriculum - Step Animation
     ────────────────────────────────────────── */
  gsap.from('.curriculum-step', {
    opacity: 0,
    y: 50,
    duration: 0.8,
    stagger: 0.25,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.curriculum-steps',
      start: 'top 70%',
    },
  });

  gsap.from('.curriculum-advanced', {
    opacity: 0,
    y: 30,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.curriculum-advanced',
      start: 'top 80%',
    },
  });

  gsap.from('.curriculum-style-item', {
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.curriculum-style',
      start: 'top 80%',
    },
  });


  /* ──────────────────────────────────────────
     12. Gallery - Horizontal Scroll (pinning)
     ────────────────────────────────────────── */
  const worksTrack = document.querySelector('.works-track');
  const worksSection = document.querySelector('.section-gallery');

  if (worksTrack && worksSection) {
    const getScrollDistance = () => {
      return -(worksTrack.scrollWidth - window.innerWidth + 100);
    };

    gsap.to(worksTrack, {
      x: getScrollDistance,
      ease: 'none',
      scrollTrigger: {
        trigger: worksSection,
        start: 'top top',
        end: () => `+=${worksTrack.scrollWidth - window.innerWidth}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  }


  /* ──────────────────────────────────────────
     13. Our Story - Text Animation
     ────────────────────────────────────────── */
  const storyLead = document.querySelector('.story-text--lead');
  if (storyLead) {
    gsap.from(storyLead, {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: storyLead,
        start: 'top 75%',
      },
    });
  }

  gsap.utils.toArray('.story-text--body p').forEach((p) => {
    gsap.from(p, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: p,
        start: 'top 80%',
      },
    });
  });


  /* ──────────────────────────────────────────
     13.5. Instructor - Entrance
     ────────────────────────────────────────── */
  gsap.from('.instructor-content', {
    opacity: 0,
    y: 50,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.instructor-content',
      start: 'top 70%',
    },
  });


  /* ──────────────────────────────────────────
     13.6. Support - Card Stagger
     ────────────────────────────────────────── */
  gsap.from('.support-card', {
    opacity: 0,
    y: 50,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.support-grid',
      start: 'top 70%',
    },
  });


  /* ──────────────────────────────────────────
     14. Flow - Step Stagger + Line Draw
     ────────────────────────────────────────── */
  gsap.from('.flow-step', {
    opacity: 0,
    x: -40,
    duration: 0.7,
    stagger: 0.25,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.flow-timeline',
      start: 'top 65%',
    },
  });

  const flowTimeline = document.querySelector('.flow-timeline');

  if (flowTimeline) {
    const flowStyle = document.createElement('style');
    flowStyle.textContent = `
      .flow-timeline::after {
        transition: transform 1.8s cubic-bezier(0.16, 1, 0.3, 1);
      }
    `;
    document.head.appendChild(flowStyle);

    ScrollTrigger.create({
      trigger: '.flow-timeline',
      start: 'top 55%',
      once: true,
      onEnter: () => {
        flowTimeline.classList.add('line-drawn');
      },
    });
  }


  /* ──────────────────────────────────────────
     15. FAQ - Accordion
     ────────────────────────────────────────── */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains('is-open')) {
          otherItem.classList.remove('is-open');
          gsap.to(otherItem.querySelector('.faq-answer'), {
            height: 0,
            opacity: 0,
            duration: 0.35,
            ease: 'power2.inOut',
          });
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        gsap.to(answer, {
          height: 0,
          opacity: 0,
          duration: 0.35,
          ease: 'power2.inOut',
        });
      } else {
        item.classList.add('is-open');
        gsap.to(answer, {
          height: 'auto',
          opacity: 1,
          duration: 0.4,
          ease: 'power2.inOut',
        });
      }
    });
  });

  gsap.from('.faq-item', {
    opacity: 0,
    y: 20,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.faq-list',
      start: 'top 75%',
    },
  });


  /* ──────────────────────────────────────────
     16. Contact - Entrance
     ────────────────────────────────────────── */
  gsap.from('.contact-text', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.contact-content',
      start: 'top 75%',
    },
  });

  gsap.from('.contact-btn', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.contact-btn',
      start: 'top 85%',
    },
  });


  /* ──────────────────────────────────────────
     16.5. Floating Parts - Scroll Reveal
     ────────────────────────────────────────── */
  gsap.utils.toArray('.floating-part').forEach((part) => {
    const parentSection = part.closest('section');
    if (!parentSection) return;

    gsap.set(part, { opacity: 0, scale: 0.85 });

    gsap.to(part, {
      opacity: 0.5,
      scale: 1,
      duration: 1.0,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: parentSection,
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
      onComplete: () => {
        part.classList.add('is-visible');
      },
      onReverseComplete: () => {
        part.classList.remove('is-visible');
      },
    });
  });


  /* ──────────────────────────────────────────
     16.6. Floating Parts - Mouse Parallax
     ────────────────────────────────────────── */
  if (!isMobile) {
    const parts = document.querySelectorAll('.floating-part');

    document.addEventListener('mousemove', (e) => {
      const xRatio = (e.clientX / window.innerWidth - 0.5) * 2;
      const yRatio = (e.clientY / window.innerHeight - 0.5) * 2;

      parts.forEach((part, index) => {
        const intensity = (index % 2 === 0) ? 15 : -10;
        const xMove = xRatio * intensity;
        const yMove = yRatio * intensity * 0.6;

        gsap.to(part, {
          x: xMove,
          y: yMove,
          duration: 1.2,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    });
  }


  /* ──────────────────────────────────────────
     16.7. Floating Parts - SVG Filter Fallback
     ────────────────────────────────────────── */
  (function checkSvgFilterSupport() {
    const testEl = document.createElement('div');
    testEl.style.filter = 'url(#halftone-outlined)';
    document.body.appendChild(testEl);

    const computed = getComputedStyle(testEl).filter;
    document.body.removeChild(testEl);

    if (computed === 'none' || computed === '') {
      console.warn('SVG filters not supported. Falling back to CSS filters.');
      document.querySelectorAll('.floating-part').forEach((part) => {
        part.style.filter = 'grayscale(1) contrast(1.4) brightness(1.1) drop-shadow(0 0 3px rgba(255,255,255,0.8))';
        part.style.webkitFilter = 'grayscale(1) contrast(1.4) brightness(1.1) drop-shadow(0 0 3px rgba(255,255,255,0.8))';
      });
    }
  })();


  /* ──────────────────────────────────────────
     17. Floating Parts - Float + Parallax
     ────────────────────────────────────────── */
  const floatConfig = [
    { selector: '.parts-pen-hand',    y: -20, rotation:  3, duration: 4.0 },
    { selector: '.parts-notebook',    y: -15, rotation: -2, duration: 5.0 },
    { selector: '.parts-pc-arm',      y: -25, rotation:  2, duration: 4.5 },
    { selector: '.parts-design-tool', y: -18, rotation: -3, duration: 3.5 },
    { selector: '.parts-smartphone',  y: -15, rotation:  2, duration: 4.2 },
    { selector: '.parts-chat-bubble', y: -12, rotation: -2, duration: 3.8 },
    { selector: '.parts-handshake',   y: -18, rotation:  1, duration: 4.0 },
    { selector: '.parts-keyboard',    y: -14, rotation: -1, duration: 3.6 },
  ];

  floatConfig.forEach((config) => {
    const el = document.querySelector(config.selector);
    if (!el) return;

    gsap.to(el, {
      y: config.y,
      rotation: config.rotation,
      duration: config.duration,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  });

  const parallaxConfig = [
    { selector: '.parts-pen-hand',    y: -100, scrub: 2.0 },
    { selector: '.parts-notebook',    y:  -80, scrub: 2.5 },
    { selector: '.parts-pc-arm',      y: -120, scrub: 1.8 },
    { selector: '.parts-design-tool', y:  -90, scrub: 2.2 },
    { selector: '.parts-smartphone',  y:  -80, scrub: 2.0 },
    { selector: '.parts-chat-bubble', y:  -60, scrub: 2.4 },
    { selector: '.parts-handshake',   y:  -90, scrub: 2.0 },
    { selector: '.parts-keyboard',    y:  -70, scrub: 2.2 },
  ];

  parallaxConfig.forEach((config) => {
    const el = document.querySelector(config.selector);
    if (!el) return;

    const parentSection = el.closest('section');
    if (!parentSection) return;

    gsap.to(el, {
      y: config.y,
      ease: 'none',
      scrollTrigger: {
        trigger: parentSection,
        start: 'top bottom',
        end: 'bottom top',
        scrub: config.scrub,
      },
    });
  });


  /* ──────────────────────────────────────────
     18. Section Parallax (content blocks)
     ────────────────────────────────────────── */
  gsap.utils.toArray('.parallax-section').forEach((section) => {
    const depth = parseFloat(section.dataset.depth) || 0.1;

    gsap.to(section, {
      y: () => -100 * depth,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });


  /* ──────────────────────────────────────────
     19. Mobile Optimizations
     ────────────────────────────────────────── */
  if (isMobile) {
    if (glowVideo) {
      glowVideo.pause();
      glowVideo.removeAttribute('autoplay');

      const videoLayer = document.querySelector('.glow-video-layer');
      if (videoLayer) {
        videoLayer.style.background =
          'linear-gradient(135deg, #6366F1, #A855F7, #EC4899, #6366F1)';
        videoLayer.style.backgroundSize = '300% 300%';
        videoLayer.style.animation = 'mobileGradientFlow 8s ease infinite';
      }
    }

    ScrollTrigger.getAll().forEach((st) => {
      if (st.pin === worksSection) {
        st.kill();
      }
    });

    if (worksTrack) {
      gsap.set(worksTrack, { x: 0 });

      const worksScroll = document.querySelector('.works-horizontal-scroll');
      if (worksScroll) {
        worksScroll.style.overflowX = 'auto';
        worksScroll.style.WebkitOverflowScrolling = 'touch';
      }
    }
  }


  /* ──────────────────────────────────────────
     19.5. Mobile - Ribbon Mask Fallback
     ────────────────────────────────────────── */
  if (isMobile) {
    const ribbonMaskMobile = document.querySelector('.ribbon-mask-layer');
    if (ribbonMaskMobile) {
      const pathEl = ribbonMaskMobile.querySelector('path');
      if (pathEl) {
        pathEl.setAttribute('d', 'M-200,-200 L2120,-200 L2120,1280 L-200,1280 Z');
        pathEl.setAttribute('fill-rule', 'nonzero');
      }
    }
  }


  /* ──────────────────────────────────────────
     20. Mobile Nav Toggle
     ────────────────────────────────────────── */
  const navToggle = document.querySelector('.nav-toggle');
  const navToggleText = document.querySelector('.nav-toggle-text');
  let isNavOpen = false;

  const mobileNav = document.createElement('div');
  mobileNav.className = 'mobile-nav-overlay';
  mobileNav.innerHTML = `
    <nav class="mobile-nav-content">
      <ul class="mobile-nav-list">
        <li><a href="#curriculum" class="mobile-nav-link">Curriculum</a></li>
        <li><a href="#gallery" class="mobile-nav-link">Gallery</a></li>
        <li><a href="#story" class="mobile-nav-link">Our Story</a></li>
        <li><a href="#contact" class="mobile-nav-link">Contact</a></li>
      </ul>
    </nav>
  `;
  document.body.appendChild(mobileNav);

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      isNavOpen = !isNavOpen;
      if (isNavOpen) {
        mobileNav.classList.add('is-open');
        navToggleText.textContent = 'Close';
        if (lenis) lenis.stop();
      } else {
        mobileNav.classList.remove('is-open');
        navToggleText.textContent = 'Menu';
        if (lenis) lenis.start();
      }
    });
  }

  mobileNav.querySelectorAll('.mobile-nav-link').forEach((navLink) => {
    navLink.addEventListener('click', (e) => {
      e.preventDefault();
      isNavOpen = false;
      mobileNav.classList.remove('is-open');
      navToggleText.textContent = 'Menu';
      if (lenis) lenis.start();

      const target = document.querySelector(navLink.getAttribute('href'));
      if (target) {
        setTimeout(() => {
          if (lenis) lenis.scrollTo(target, { offset: -80 });
          else target.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    });
  });


  /* ──────────────────────────────────────────
     21. Page Load - Remove Loading State
     ────────────────────────────────────────── */
  window.addEventListener('load', () => {
    document.body.classList.add('is-loaded');
    ScrollTrigger.refresh();
  });


  /* ──────────────────────────────────────────
     22. Safety Net - Force is-loaded after timeout
     ────────────────────────────────────────── */
  setTimeout(() => {
    if (!document.body.classList.contains('is-loaded')) {
      console.warn('Force applying is-loaded (safety net)');
      document.body.classList.add('is-loaded');
    }
  }, 3000);


})();
