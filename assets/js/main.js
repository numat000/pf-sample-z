/* ============================================
   main.js
   Portfolio Site - Animation Controller
   ============================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     0. GSAP Plugin Registration
     ────────────────────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  /* ──────────────────────────────────────────
     1. Lenis Smooth Scroll
     ────────────────────────────────────────── */
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth: true,
  });

  // GSAP ticker と Lenis の同期
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Lenis でアンカーリンクのスムーススクロール
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        lenis.scrollTo(target, { offset: -80 });
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
      filter: 'blur(10px) brightness(0.35)',
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

      this.totalSlides = 6;
      this.fastDuration = 0.5;   // 通常切替の表示時間（秒）
      this.pauseDuration = 1.8;  // 停止スライドの表示時間（秒）
      this.cycleLength = 5;      // 何枚進んだら停止するか
      this.currentStep = 0;      // サイクル内の現在ステップ
      this.cycleCount = 0;       // 何サイクル目か
      this.isRunning = true;
      this.timeoutId = null;

      this.start();
    }

    start() {
      this.runStep();
    }

    runStep() {
      if (!this.isRunning) return;

      const isLastInCycle = this.currentStep === this.cycleLength - 1;
      const holdDuration = isLastInCycle ? this.pauseDuration : this.fastDuration;

      // スライドを次に進める
      this.swiper.slideNext();

      // 次のステップへ
      this.timeoutId = setTimeout(() => {
        if (isLastInCycle) {
          // サイクル完了 → リセットして次のサイクル
          this.currentStep = 0;
          this.cycleCount++;
        } else {
          this.currentStep++;
        }
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

  // FV がビューポート外に出たらスライドを一時停止（パフォーマンス対策）
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
    .from('.fv-title-main', {
      opacity: 0,
      y: 50,
      duration: 1.4,
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
      '-=0.8'
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
    // Concept セクションが近づいたら動画を読み込み開始
    ScrollTrigger.create({
      trigger: '.section-concept',
      start: 'top 120%', // 少し手前で先読み
      once: true,
      onEnter: () => {
        glowVideo.load();
        glowVideo.play().catch(() => {
          // 自動再生がブロックされた場合の処理
          console.log('Glow video autoplay blocked');
        });
      },
    });
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

  // Concept: 0 → 1 (フェードイン)
  ScrollTrigger.create({
    trigger: '.section-concept',
    start: 'top 80%',
    end: 'top 20%',
    scrub: 1,
    onUpdate: (self) => {
      setGlowOpacity(self.progress);
    },
  });

  // Service: 1 維持（Concept の ScrollTrigger がend後に1.0になっている）

  // Works 手前: 1 → 0 (フェードアウト)
  ScrollTrigger.create({
    trigger: '.section-works',
    start: 'top 80%',
    end: 'top 30%',
    scrub: 1,
    onUpdate: (self) => {
      setGlowOpacity(1 - self.progress);
    },
  });

  // Voice: 0 → 1 (再フェードイン)
  ScrollTrigger.create({
    trigger: '.section-voice',
    start: 'top 80%',
    end: 'top 30%',
    scrub: 1,
    onUpdate: (self) => {
      setGlowOpacity(self.progress);
    },
  });

  // FAQ 手前: 1 → 0 (フェードアウト)
  ScrollTrigger.create({
    trigger: '.section-faq',
    start: 'top 80%',
    end: 'top 50%',
    scrub: 1,
    onUpdate: (self) => {
      setGlowOpacity(1 - self.progress);
    },
  });

  // Contact: 0 → 0.5 (薄く再出現)
  ScrollTrigger.create({
    trigger: '.section-contact',
    start: 'top 80%',
    end: 'top 40%',
    scrub: 1,
    onUpdate: (self) => {
      setGlowOpacity(self.progress * 0.5);
    },
  });

  /* ──────────────────────────────────────────
     8.5. Glow Ribbon - Scroll Position Shift
     リボンマスクがスクロールに合わせて横移動
     → 動きのある演出になる
     ────────────────────────────────────────── */
  const ribbonMask = document.querySelector('.ribbon-mask-layer');

  if (ribbonMask) {
    // リボンの mask-position をスクロールに連動して左右に動かす
    // → 「穴」の位置がゆっくり移動し、見える動画の領域が変化する
    ScrollTrigger.create({
      trigger: '.content-layer',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 3, // 重めのscrubでゆったり追従
      onUpdate: (self) => {
        // スクロール進行 0→1 に対して、mask-positionを -10% → 10% に移動
        const xPos = -10 + self.progress * 20; // -10% ~ +10%
        const yPos = self.progress * 5;        // 0% ~ 5% (微かに上下も)

        ribbonMask.style.webkitMaskPosition =
          `${xPos}% ${50 + yPos}%, center center`;
        ribbonMask.style.maskPosition =
          `${xPos}% ${50 + yPos}%, center center`;
      },
    });


    // リボンのスケールもスクロールで微変化
    // → 下に行くほどリボンが少し大きくなる
    ScrollTrigger.create({
      trigger: '.content-layer',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2,
      onUpdate: (self) => {
        const scale = 120 + self.progress * 15; // 120% → 135%

        ribbonMask.style.webkitMaskSize =
          `${scale}% 100%, 100% 100%`;
        ribbonMask.style.maskSize =
          `${scale}% 100%, 100% 100%`;
      },
    });
  }


  /* ──────────────────────────────────────────
     8.6. Glow Video - Scroll Color Shift
     動画レイヤーのhue-rotateをスクロールに合わせて変化
     → スクロール位置によって発光色が微妙に変わる
     ────────────────────────────────────────── */
  const glowVideoEl = document.querySelector('.glow-video-layer video');

  if (glowVideoEl) {
    ScrollTrigger.create({
      trigger: '.content-layer',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2,
      onUpdate: (self) => {
        const hue = self.progress * 40; // 0deg → 40deg
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
  // Lead text (1文字ずつ出現)
  const conceptLead = document.querySelector('.concept-text--lead');
  if (conceptLead) {
    const splitLead = new SplitType(conceptLead, {
      types: 'lines, words, chars',
    });

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

  // Body text (段落ごとにフェードイン)
  gsap.utils.toArray('.concept-text--body p').forEach((p, i) => {
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
     11. Service - Card Stagger Animation
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
     12. Works - Horizontal Scroll (pinning)
     ────────────────────────────────────────── */
  const worksTrack = document.querySelector('.works-track');
  const worksSection = document.querySelector('.section-works');

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
     13. Voice - Swiper Init
     ────────────────────────────────────────── */
  const voiceSwiper = new Swiper('.voice-slider', {
    effect: 'fade',
    fadeEffect: { crossFade: true },
    speed: 800,
    autoplay: {
      delay: 6000,
      disableOnInteraction: true,
    },
    loop: true,
    pagination: {
      el: '.voice-pagination',
      clickable: true,
    },
  });

  // Voice セクション出現アニメーション
  gsap.from('.voice-slider', {
    opacity: 0,
    y: 50,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.section-voice',
      start: 'top 65%',
    },
  });


  /* ──────────────────────────────────────────
     14. Flow - Step Stagger + Line Draw
     ────────────────────────────────────────── */
  // ステップの順次出現
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

  // SVGライン描画アニメーション
  const flowLinePath = document.querySelector('.flow-line path');

  if (flowLinePath) {
    const pathLength = flowLinePath.getTotalLength();

    gsap.set(flowLinePath, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
    });

    gsap.to(flowLinePath, {
      strokeDashoffset: 0,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: '.flow-timeline',
        start: 'top 55%',
        end: 'bottom 70%',
        scrub: 1,
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

      // 他のFAQを閉じる（アコーディオン：1つだけ開く）
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
        // 閉じる
        item.classList.remove('is-open');
        gsap.to(answer, {
          height: 0,
          opacity: 0,
          duration: 0.35,
          ease: 'power2.inOut',
        });
      } else {
        // 開く
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

  // FAQ セクション出現
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
     17. Floating Parts - Float + Parallax
     ────────────────────────────────────────── */

  // --- 浮遊アニメーション（常時ループ） ---
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

  // --- パララックス（スクロール連動） ---
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

    // 親セクションを特定
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
  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  if (isMobile) {
    // 発光動画: モバイルでは静止グラデーションに切替
    if (glowVideo) {
      glowVideo.pause();
      glowVideo.removeAttribute('autoplay');

      // 動画の代わりにCSSグラデーションアニメ
      const videoLayer = document.querySelector('.glow-video-layer');
      if (videoLayer) {
        videoLayer.style.background =
          'linear-gradient(135deg, #6366F1, #A855F7, #EC4899, #6366F1)';
        videoLayer.style.backgroundSize = '300% 300%';
        videoLayer.style.animation = 'mobileGradientFlow 8s ease infinite';
      }
    }

    // Works: モバイルでは横スクロール pinning を無効化 → 通常スクロール
    ScrollTrigger.getAll().forEach((st) => {
      if (st.pin === worksSection) {
        st.kill();
      }
    });

    // Works track をモバイル用にスクロール可能に
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
     モバイルではmask-compositeのサポートが不安定な場合があるため
     シンプルなグラデーションマスクに切り替え
     ────────────────────────────────────────── */
  if (isMobile) {
    if (ribbonMask) {
      // SVGマスクの代わりにグラデーションで簡略化
      ribbonMask.style.webkitMaskImage =
        'linear-gradient(135deg, transparent 30%, black 30%, black 60%, transparent 60%)';
      ribbonMask.style.maskImage =
        'linear-gradient(135deg, transparent 30%, black 30%, black 60%, transparent 60%)';
      ribbonMask.style.webkitMaskComposite = 'initial';
      ribbonMask.style.maskComposite = 'initial';
    }
  }

  /* ──────────────────────────────────────────
     20. Mobile Nav Toggle
     ────────────────────────────────────────── */
  const navToggle = document.querySelector('.nav-toggle');
  const navToggleText = document.querySelector('.nav-toggle-text');
  let isNavOpen = false;

  // モバイルナビ用オーバーレイ（動的生成）
  const mobileNav = document.createElement('div');
  mobileNav.className = 'mobile-nav-overlay';
  mobileNav.innerHTML = `
    <nav class="mobile-nav-content">
      <ul class="mobile-nav-list">
        <li><a href="#works" class="mobile-nav-link">Works</a></li>
        <li><a href="#service" class="mobile-nav-link">Service</a></li>
        <li><a href="#voice" class="mobile-nav-link">Voice</a></li>
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
        lenis.stop(); // スクロール無効化
      } else {
        mobileNav.classList.remove('is-open');
        navToggleText.textContent = 'Menu';
        lenis.start(); // スクロール再有効化
      }
    });
  }

  // モバイルナビのリンクをクリックしたら閉じる
  mobileNav.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      isNavOpen = false;
      mobileNav.classList.remove('is-open');
      navToggleText.textContent = 'Menu';
      lenis.start();

      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        setTimeout(() => {
          lenis.scrollTo(target, { offset: -80 });
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


})();
