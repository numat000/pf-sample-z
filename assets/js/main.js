/* ============================================
   main.js — Butterfly Animation System
   ============================================ */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, MorphSVGPlugin);

  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  /* 1. Lenis Smooth Scroll */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth: true,
  });

  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) lenis.scrollTo(target, { offset: -80 });
    });
  });

  /* 2. Header Scroll State */
  const header = document.querySelector('.site-header');
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      if (self.direction === 1 && window.scrollY > 80) header.classList.add('is-scrolled');
      if (window.scrollY <= 80) header.classList.remove('is-scrolled');
    },
  });

  /* 3. FV - Background Blur Breathing */
  const fvBgBlur = document.querySelector('.fv-bg-blur');
  if (fvBgBlur) {
    gsap.to(fvBgBlur, {
      filter: 'blur(10px) brightness(0.5)',
      duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1,
    });
  }

  /* 4. FV - Swiper Slide Controller */
  class FVSlideController {
    constructor() {
      this.swiper = new Swiper('.fv-slides', {
        effect: 'fade', fadeEffect: { crossFade: true },
        speed: 300, loop: true, allowTouchMove: false, autoplay: false,
      });
      this.totalSlides = 6;
      this.fastDuration = 0.5;
      this.pauseDuration = 1.8;
      this.cycleLength = 5;
      this.currentStep = 0;
      this.cycleCount = 0;
      this.isRunning = true;
      this.timeoutId = null;
      this.start();
    }
    start() { this.runStep(); }
    runStep() {
      if (!this.isRunning) return;
      const isLast = this.currentStep === this.cycleLength - 1;
      const hold = isLast ? this.pauseDuration : this.fastDuration;
      this.swiper.slideNext();
      this.timeoutId = setTimeout(() => {
        if (isLast) { this.currentStep = 0; this.cycleCount++; }
        else { this.currentStep++; }
        this.runStep();
      }, hold * 1000);
    }
    pause() { this.isRunning = false; if (this.timeoutId) clearTimeout(this.timeoutId); }
    resume() { if (!this.isRunning) { this.isRunning = true; this.runStep(); } }
  }

  const fvSlideController = new FVSlideController();
  ScrollTrigger.create({
    trigger: '.section-fv', start: 'top top', end: 'bottom top',
    onLeave: () => fvSlideController.pause(),
    onEnterBack: () => fvSlideController.resume(),
  });

  /* 5. FV - Text Entrance */
  const fvTL = gsap.timeline({ delay: 0.3 });
  fvTL
    .from('.fv-title-main', { opacity: 0, y: 50, duration: 1.4, ease: 'power3.out' })
    .from('.fv-subtitle', { opacity: 0, y: 25, duration: 1.0, ease: 'power3.out' }, '-=0.8')
    .from('.fv-scroll-indicator', { opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.4');

  /* 6. FV - Scroll Fade Out */
  gsap.to('.fv-content', {
    opacity: 0, y: -60,
    scrollTrigger: { trigger: '.section-fv', start: 'top top', end: 'bottom top', scrub: 1.5 },
  });


  /* ══════════════════════════════════════════
     BUTTERFLY ANIMATION SYSTEM
     ══════════════════════════════════════════ */

  /* B1. セクション止まり蝶 */
  const sectionButterflyMap = [
    { butterfly: '.sb-concept',  trigger: '.section-concept' },
    { butterfly: '.sb-service',  trigger: '.section-service' },
    { butterfly: '.sb-works',    trigger: '.section-works' },
    { butterfly: '.sb-voice',    trigger: '.section-voice' },
    { butterfly: '.sb-flow',     trigger: '.section-flow' },
    { butterfly: '.sb-faq',      trigger: '.section-faq' },
  ];

  sectionButterflyMap.forEach(({ butterfly, trigger }) => {
    const el = document.querySelector(butterfly);
    if (!el) return;

    /* フェードイン */
    gsap.to(el, {
      opacity: 0.7, duration: 1.2, ease: 'power2.out',
      scrollTrigger: { trigger: trigger, start: 'top 70%', end: 'top 30%', scrub: 1 },
    });

    /* フェードアウト */
    gsap.to(el, {
      opacity: 0, duration: 1.2, ease: 'power2.in',
      scrollTrigger: { trigger: trigger, start: 'bottom 70%', end: 'bottom 30%', scrub: 1 },
    });

    /* ゆらゆら浮遊 */
    gsap.to(el, {
      y: '+=12', x: '+=5', rotation: 3,
      duration: 3 + Math.random() * 2,
      ease: 'sine.inOut', yoyo: true, repeat: -1,
    });
  });

  /* B2. スクロール連動の飛ぶ蝶（Service→Works間） */
  const flyingBf1 = document.querySelector('.fb-service-works');
  if (flyingBf1) {
    gsap.timeline({
      scrollTrigger: {
        trigger: '.section-service', start: 'bottom 80%',
        endTrigger: '.section-works', end: 'top 20%',
        scrub: 2,
        onEnter: () => { flyingBf1.style.opacity = 1; },
        onLeaveBack: () => { flyingBf1.style.opacity = 0; },
        onLeave: () => { flyingBf1.style.opacity = 0; },
        onEnterBack: () => { flyingBf1.style.opacity = 1; },
      },
    })
    .to(flyingBf1, {
      motionPath: {
        path: [
          { x: 0, y: 0 },
          { x: window.innerWidth * 0.2, y: -80 },
          { x: window.innerWidth * 0.5, y: -30 },
          { x: window.innerWidth * 0.7, y: -120 },
          { x: window.innerWidth * 0.6, y: -200 },
        ],
        curviness: 1.5, autoRotate: false,
      },
      duration: 1, ease: 'none',
    });
  }

  /* B3. モーフィング演出（FAQ→Contact間） */
  const morphWrapper = document.querySelector('.morph-stage-wrapper');
  const morphPath = document.querySelector('#morph-path');
  const morphTarget = document.querySelector('#morph-target-butterfly');
  const morphBlackout = document.querySelector('.morph-blackout');

  if (morphWrapper && morphPath && morphTarget && morphBlackout) {
    const morphTL = gsap.timeline({
      scrollTrigger: {
        trigger: '.section-faq', start: 'bottom 90%',
        endTrigger: '.section-contact', end: 'top 10%',
        scrub: 2,
      },
    });

    morphTL
      .to(morphWrapper, { opacity: 1, duration: 0.15, ease: 'power2.out' })
      .to(morphPath, {
        morphSVG: { shape: morphTarget, type: 'rotational', origin: '50% 50%' },
        fill: 'rgba(100,50,160,0.7)', stroke: 'rgba(100,50,160,0.7)',
        duration: 0.4, ease: 'power2.inOut',
      })
      .to('.morph-svg', { y: -50, scale: 1.2, duration: 0.15, ease: 'power2.out' })
      .to(morphBlackout, { opacity: 1, duration: 0.3, ease: 'power2.in' })
      .to(morphWrapper, { opacity: 0, duration: 0.05 });
  }


  /* ══════════════════════════════════════════
     SECTION ANIMATIONS
     ══════════════════════════════════════════ */

  /* 9. Section Labels */
  gsap.utils.toArray('.section-number').forEach((el) => {
    gsap.from(el, { opacity: 0, x: -20, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  gsap.utils.toArray('.section-name').forEach((el) => {
    gsap.from(el, { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  /* 10. Concept Text */
  const conceptLead = document.querySelector('.concept-text--lead');
  if (conceptLead) {
    const splitLead = new SplitType(conceptLead, { types: 'lines, words, chars' });
    gsap.from(splitLead.chars, {
      opacity: 0, y: 20, duration: 0.5, stagger: 0.02, ease: 'power2.out',
      scrollTrigger: { trigger: conceptLead, start: 'top 75%', end: 'bottom 60%', scrub: 1 },
    });
  }
  gsap.utils.toArray('.concept-text--body p').forEach((p) => {
    gsap.from(p, { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: p, start: 'top 80%' } });
  });

  /* 11. Service Cards */
  gsap.from('.service-card', {
    opacity: 0, y: 60, duration: 0.8, stagger: 0.2, ease: 'power3.out',
    scrollTrigger: { trigger: '.service-grid', start: 'top 70%' },
  });

  /* 12. Works Horizontal Scroll */
  const worksTrack = document.querySelector('.works-track');
  const worksSection = document.querySelector('.section-works');
  if (worksTrack && worksSection) {
    gsap.to(worksTrack, {
      x: () => -(worksTrack.scrollWidth - window.innerWidth + 100),
      ease: 'none',
      scrollTrigger: {
        trigger: worksSection, start: 'top top',
        end: () => `+=${worksTrack.scrollWidth - window.innerWidth}`,
        scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      },
    });
  }

  /* 13. Voice Swiper */
  new Swiper('.voice-slider', {
    effect: 'fade', fadeEffect: { crossFade: true }, speed: 800,
    autoplay: { delay: 6000, disableOnInteraction: true },
    loop: true, pagination: { el: '.voice-pagination', clickable: true },
  });
  gsap.from('.voice-slider', { opacity: 0, y: 50, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.section-voice', start: 'top 65%' } });

  /* 14. Flow Timeline */
  gsap.from('.flow-step', {
    opacity: 0, x: -40, duration: 0.7, stagger: 0.25, ease: 'power3.out',
    scrollTrigger: { trigger: '.flow-timeline', start: 'top 65%' },
  });

  const flowTimeline = document.querySelector('.flow-timeline');
  if (flowTimeline) {
    const s = document.createElement('style');
    s.textContent = '.flow-timeline::after { transition: transform 1.8s cubic-bezier(0.16, 1, 0.3, 1); }';
    document.head.appendChild(s);
    ScrollTrigger.create({
      trigger: '.flow-timeline', start: 'top 55%', once: true,
      onEnter: () => { flowTimeline.classList.add('line-drawn'); },
    });
  }

  /* 15. FAQ Accordion */
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('is-open');

      document.querySelectorAll('.faq-item.is-open').forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove('is-open');
          gsap.to(openItem.querySelector('.faq-answer'), { height: 0, opacity: 0, duration: 0.4, ease: 'power2.inOut' });
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        gsap.to(answer, { height: 0, opacity: 0, duration: 0.4, ease: 'power2.inOut' });
      } else {
        item.classList.add('is-open');
        gsap.set(answer, { height: 'auto', opacity: 1 });
        gsap.from(answer, { height: 0, opacity: 0, duration: 0.4, ease: 'power2.out' });
      }
    });
  });

  /* 16. Contact CTA */
  gsap.from('.contact-content', {
    opacity: 0, y: 40, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.section-contact', start: 'top 65%' },
  });

  /* 17. Mobile Nav Toggle */
  const navToggle = document.querySelector('.nav-toggle');
  const mobileOverlay = document.querySelector('.mobile-nav-overlay');
  if (navToggle && mobileOverlay) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileOverlay.classList.contains('is-open');
      if (isOpen) {
        mobileOverlay.classList.remove('is-open');
        mobileOverlay.setAttribute('aria-hidden', 'true');
        lenis.start();
      } else {
        mobileOverlay.classList.add('is-open');
        mobileOverlay.setAttribute('aria-hidden', 'false');
        lenis.stop();
      }
    });

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileOverlay.classList.remove('is-open');
        mobileOverlay.setAttribute('aria-hidden', 'true');
        lenis.start();
      });
    });
  }

  /* 18. Page Load */
  window.addEventListener('load', () => {
    document.body.classList.add('is-loaded');
    ScrollTrigger.refresh();
  });

})();
