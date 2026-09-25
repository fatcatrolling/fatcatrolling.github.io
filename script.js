/* ============================================================
   Fat Cat Rolling — script.js  (Revision 4)
   Palette switcher · Lightbox · Hero motion · Scroll reveal ·
   Mascot easter egg · Lazy reel embed · Email copy · Data guard
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Instant navigation: prerender internal pages ----------
     Closes the full-document navigation gap so the tab favicon never
     blanks between pages. Progressive enhancement — ignored where
     unsupported (Firefox/Safari navigate exactly as before). */
  function initSpeculationRules() {
    if (!HTMLScriptElement.supports || !HTMLScriptElement.supports('speculationrules')) return;
    if (document.querySelector('script[type="speculationrules"]')) return;
    const s = document.createElement('script');
    s.type = 'speculationrules';
    s.textContent = JSON.stringify({
      prerender: [{
        where: {
          and: [
            { href_matches: '/*' },
            { not: { selector_matches: '[rel~="external"], [target="_blank"]' } },
            { not: { selector_matches: '.corner-mascot' } }
          ]
        },
        eagerness: 'moderate'
      }]
    });
    document.body.appendChild(s);
  }
  initSpeculationRules();

  /* ---------- 0. Data error guard ---------- */
  if (window.SITE_DATA_ERROR || !window.SITE_DATA) {
    const banner = document.createElement('div');
    banner.className = 'data-error';
    banner.textContent =
      'data.js has a syntax error: ' +
      (window.SITE_DATA_ERROR ? window.SITE_DATA_ERROR.message : 'data not loaded') +
      ' — open validate.html to see details.';
    document.addEventListener('DOMContentLoaded', () => document.body.prepend(banner));
  }

  // `let` (not const) so the editor's live-preview hook can swap in a draft
  // dataset and re-render without a page reload. Normal visitors never change it.
  let DATA = window.SITE_DATA || {
    profile: { name: 'Kim Nguyen', brand: 'Fat Cat Rolling', roles: [], socials: {}, credits: [], heroImages: [] },
    reels: {},
    gallery: { home: [], animation: [], vfx: [] },
    about: { shortBio: '', longBio: '', experience: [], clients: [] },
    pages: {}
  };

  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches
              || window.matchMedia('(pointer: coarse)').matches
              || 'ontouchstart' in window;

  /* ---------- 1. Palette switcher — themes come from data ---------- */
  let PALETTES = ['warm', 'blue', 'purple'];

  /* Inject themes + fonts from data.js. styles.css still holds the 3 default
     palettes (so first paint never flashes); this overrides/extends them from
     data so the editor can recolor them, add new ones, and change fonts. */
  function applyThemesAndFonts() {
    const d = window.SITE_DATA || {};
    const themes = Array.isArray(d.themes) ? d.themes : [];
    if (themes.length) {
      PALETTES = themes.map((t) => t.id);
      let css = '';
      themes.forEach((t) => {
        const toks = t.tokens || {};
        const decls = Object.keys(toks).map((k) => '--' + k + ':' + toks[k] + ';').join('');
        css += ':root[data-palette="' + t.id + '"]{' + decls + '}\n';
      });
      let styleEl = document.getElementById('fcr-themes');
      if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'fcr-themes'; document.head.appendChild(styleEl); }
      styleEl.textContent = css;
      // Make sure every theme has a clickable swatch, and the swatch colour comes
      // from data (so the editor can recolour it and new themes get a button).
      const palette = document.querySelector('.palette');
      if (palette) {
        themes.forEach((t) => {
          let b = palette.querySelector('.palette__swatch[data-palette="' + t.id + '"]');
          if (!b) {
            b = document.createElement('button');
            b.className = 'palette__swatch';
            b.dataset.palette = t.id;
            b.setAttribute('aria-label', (t.name || t.id) + ' palette');
            b.setAttribute('aria-pressed', 'false');
            b.addEventListener('click', () => setPalette(t.id, true));
            palette.appendChild(b);
          }
          if (t.swatch) b.style.background = t.swatch; // data is the source of truth
        });
      }
    }
    const ty = d.typography || {};
    const root = document.documentElement.style;
    if (ty.headingFont) root.setProperty('--font-display', "'" + ty.headingFont + "', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
    if (ty.bodyFont) root.setProperty('--font-body', "'" + ty.bodyFont + "', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
    // Global weight / style / size for hero name, headings, and body
    root.setProperty('--hero-weight', ty.heroBold === false ? '700' : '900');
    root.setProperty('--hero-style', ty.heroItalic ? 'italic' : 'normal');
    root.setProperty('--hero-scale', String(ty.heroScale || 1));
    root.setProperty('--heading-weight', ty.headingBold ? '800' : '600');
    root.setProperty('--heading-style', ty.headingItalic === false ? 'normal' : 'italic');
    root.setProperty('--heading-scale', String(ty.headingScale || 1));
    root.setProperty('--body-weight', ty.bodyBold ? '700' : '400');
    root.setProperty('--body-style', ty.bodyItalic ? 'italic' : 'normal');
    root.setProperty('--body-scale', String(ty.bodyScale || 1));
    const fams = [];
    if (ty.headingFont) fams.push(ty.headingFont);
    if (ty.bodyFont && ty.bodyFont !== ty.headingFont) fams.push(ty.bodyFont);
    if (fams.length) {
      const href = 'https://fonts.googleapis.com/css2?' +
        fams.map((f) => 'family=' + encodeURIComponent(f).replace(/%20/g, '+') + ':wght@400;500;600;700;800;900').join('&') +
        '&display=swap';
      let link = document.getElementById('fcr-fonts');
      if (!link) { link = document.createElement('link'); link.id = 'fcr-fonts'; link.rel = 'stylesheet'; document.head.appendChild(link); }
      if (link.getAttribute('href') !== href) link.setAttribute('href', href);
    }
  }

  function setPalette(name, animate) {
    if (!PALETTES.includes(name)) name = 'warm';
    document.documentElement.setAttribute('data-palette', name);
    try { localStorage.setItem('palette', name); } catch (e) {}
    document.querySelectorAll('.palette__swatch').forEach((s) => {
      const isActive = s.dataset.palette === name;
      s.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      if (animate && isActive) {
        s.classList.remove('click');
        void s.offsetWidth;
        s.classList.add('click');
      }
    });
    const live = document.getElementById('palette-live');
    if (live) live.textContent = name.charAt(0).toUpperCase() + name.slice(1) + ' palette';
  }

  function initPaletteSwitcher() {
    let saved = 'warm';
    try { saved = localStorage.getItem('palette') || 'warm'; } catch (e) {}
    setPalette(saved, false);
    document.querySelectorAll('.palette__swatch').forEach((s) => {
      s.addEventListener('click', () => setPalette(s.dataset.palette, true));
    });
  }

  /* ---------- 2. Hero name cascade (every load, all pages) ---------- */
  function initHeroName() {
    const el = document.querySelector('.hero__name');
    if (!el || prefersReduce) return;

    const text = el.textContent;
    el.textContent = '';
    [...text].forEach((c, i) => {
      const span = document.createElement('span');
      span.className = 'ch';
      span.textContent = c === ' ' ? ' ' : c;
      span.style.animationDelay = (i * 30) + 'ms';
      el.appendChild(span);
    });
    el.classList.add('played');
  }

  /* ---------- 3. Scroll reveal — gallery bounce-in + section rules ---------- */
  function initScrollReveal() {
    if (prefersReduce) {
      document.querySelectorAll('.project').forEach((t) => t.classList.add('inview'));
      document.querySelectorAll('.section__rule').forEach((r) => r.classList.add('in-view'));
      return;
    }

    const tileObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('inview');
          tileObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.querySelectorAll('.project').forEach((t) => tileObserver.observe(t));

    const ruleObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          ruleObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.section__rule').forEach((r) => ruleObserver.observe(r));
  }

  /* ---------- 4. Video tiles — hover preview ---------- */
  function initVideoHoverPreview() {
    if (prefersReduce || isTouch) return;
    document.querySelectorAll('.project[data-type="video"]').forEach((tile) => {
      const v = tile.querySelector('video');
      if (!v) return;
      tile.addEventListener('mouseenter', () => v.play().catch(() => {}));
      tile.addEventListener('mouseleave', () => { v.pause(); v.load(); });
    });
  }

  /* ---------- 5. Lightbox ---------- */
  let lastFocus = null;
  let lightboxEl = null;

  function buildLightbox() {
    if (lightboxEl) return lightboxEl;
    lightboxEl = document.createElement('div');
    lightboxEl.className = 'lightbox';
    lightboxEl.setAttribute('role', 'dialog');
    lightboxEl.setAttribute('aria-modal', 'true');
    lightboxEl.setAttribute('aria-label', 'Media viewer');
    lightboxEl.innerHTML = `
      <div class="lightbox__inner" tabindex="-1">
        <button class="lightbox__close" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M6 6L18 18M18 6L6 18" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="lightbox__body"></div>
        <div class="lightbox__caption" hidden></div>
      </div>`;
    document.body.appendChild(lightboxEl);
    lightboxEl.addEventListener('click', (e) => { if (e.target === lightboxEl) closeLightbox(); });
    lightboxEl.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    return lightboxEl;
  }

  function openLightbox(content, trigger, caption) {
    buildLightbox();
    lastFocus = trigger || document.activeElement;
    const body = lightboxEl.querySelector('.lightbox__body');
    body.innerHTML = '';
    body.appendChild(content);
    const cap = lightboxEl.querySelector('.lightbox__caption');
    if (cap) { cap.textContent = caption || ''; cap.hidden = !caption; }
    lightboxEl.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => lightboxEl.querySelector('.lightbox__close').focus(), 50);
    document.addEventListener('keydown', escListener);
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove('open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', escListener);
    setTimeout(() => {
      lightboxEl.querySelector('.lightbox__body').innerHTML = '';
      const cap = lightboxEl.querySelector('.lightbox__caption');
      if (cap) { cap.textContent = ''; cap.hidden = true; }
    }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function escListener(e) {
    if (e.key === 'Escape') { closeLightbox(); return; }
    if (e.key !== 'Tab') return;
    // Cycle focus within the lightbox — the close button plus any video
    // controls — instead of pinning every Tab to the close button.
    const focusable = lightboxEl.querySelectorAll(
      'button, [href], video[controls], iframe, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ---------- 6. Reel embed (Vimeo / YouTube / placeholder) ---------- */
  function openReel(reel, trigger) {
    let content;
    if (reel.provider === 'vimeo' && reel.id) {
      content = document.createElement('iframe');
      content.src = `https://player.vimeo.com/video/${encodeURIComponent(reel.id)}?autoplay=1&title=0&byline=0&portrait=0`;
      content.allow = 'autoplay; fullscreen; picture-in-picture';
      content.setAttribute('allowfullscreen', '');
    } else if (reel.provider === 'youtube' && reel.id) {
      content = document.createElement('iframe');
      content.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(reel.id)}?autoplay=1&rel=0&modestbranding=1`;
      content.allow = 'autoplay; encrypted-media; picture-in-picture';
      content.setAttribute('allowfullscreen', '');
    } else {
      content = document.createElement('div');
      content.className = 'lightbox__placeholder';
      content.innerHTML = `
        <div>
          <div style="font-size:32px;font-weight:800;margin-bottom:8px;">${escapeHtml(reel.title)}</div>
          <div style="opacity:0.85;margin-bottom:24px;">Reel placeholder — drop a Vimeo or YouTube ID into <code>data.js</code> to enable playback.</div>
          <div style="font-size:12px;opacity:0.7;text-transform:uppercase;letter-spacing:0.1em;">
            ${escapeHtml(reel.duration || '')} · ${escapeHtml(String(reel.year || ''))}
          </div>
        </div>`;
    }
    trigger.replaceWith(content);
  }

  function openImage(item, trigger) {
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt || item.title || '';
    openLightbox(img, trigger, item.title);
  }

  function openVideo(item, trigger) {
    const v = document.createElement('video');
    v.controls = true;
    v.controlsList = 'nodownload';
    v.disablePictureInPicture = true;
    v.loop = true;
    v.muted = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.preload = 'metadata';
    if (item.poster) v.poster = item.poster;
    // WebM first (Chrome/Firefox/Android — smaller file); MP4 fallback for iOS Safari
    const mp4Src = item.src.replace(/^videos\/webm\//, 'videos/mp4/').replace(/\.webm$/i, '.mp4');
    const s1 = document.createElement('source');
    s1.src = item.src; s1.type = item.src.endsWith('.webm') ? 'video/webm' : 'video/mp4';
    v.appendChild(s1);
    if (mp4Src !== item.src) {
      const s2 = document.createElement('source');
      s2.src = mp4Src; s2.type = 'video/mp4';
      v.appendChild(s2);
    }
    v.autoplay = true;
    openLightbox(v, trigger, item.title);
    v.play().catch(() => {});
  }

  /* ---------- 7. Wire reel + tile clicks ---------- */
  function initReelButtons() {
    document.querySelectorAll('[data-reel]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const reel = (DATA.reels && DATA.reels[btn.dataset.reel]) || null;
        if (reel) openReel(reel, btn);
      });
    });
  }

  function initTileButtons() {
    document.querySelectorAll('.project').forEach((tile) => {
      tile.addEventListener('click', () => {
        const item = {
          src: tile.dataset.src,
          poster: tile.dataset.poster || '',
          alt: tile.dataset.alt || tile.dataset.title || '',
          title: tile.dataset.title
        };
        if (tile.dataset.type === 'video') openVideo(item, tile);
        else openImage(item, tile);
      });
    });
  }

  /* ---------- 8. Cursor dot follower (hero) ---------- */
  function initCursorDot() {
    const dot = document.querySelector('.hero__cursor-dot');
    const hero = document.querySelector('.hero');
    if (!dot || !hero || prefersReduce || isTouch) return;
    window.addEventListener('touchstart', () => {
      dot.classList.remove('active');
      dot.style.display = 'none';
    }, { once: true, passive: true });
    hero.addEventListener('mouseenter', () => dot.classList.add('active'));
    hero.addEventListener('mouseleave', () => dot.classList.remove('active'));
    hero.addEventListener('mousemove', (e) => {
      dot.style.setProperty('--cursor-x', e.clientX + 'px');
      dot.style.setProperty('--cursor-y', e.clientY + 'px');
    });
  }

  /* ---------- 9. Corner mascot reveal — all pages ---------- */
  function initCornerMascotVisibility() {
    const heroMascot = document.querySelector('.hero__mascot');
    const cornerMascot = document.querySelector('.corner-mascot');
    if (!heroMascot || !cornerMascot) return;
    cornerMascot.classList.add('hero-visible');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        cornerMascot.classList.toggle('hero-visible', entry.isIntersecting);
      });
    }, { threshold: 0.1 });
    io.observe(heroMascot);
    cornerMascot.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 10. Credits spotlight — cycles one name at a time with a stop-motion jitter ---------- */
  let creditsTimer = null;
  function initCreditsSpotlight() {
    const list = document.querySelector('.credits__list');
    if (!list || prefersReduce) return;
    // Safe to re-run (e.g. after a live re-render): clear any prior timer.
    if (creditsTimer) { clearInterval(creditsTimer); creditsTimer = null; }

    let idx = -1;
    let hovering = false;
    // Re-query each tick so the cycle keeps working even if the <li>s get
    // re-rendered underneath us (the editor's live preview replaces them).
    const items = () => Array.from(list.querySelectorAll('li'));

    function setSpotlight(newIdx) {
      const its = items();
      if (its.length < 2) return;
      its.forEach((li) => li.classList.remove('is-spotlight'));
      idx = ((newIdx % its.length) + its.length) % its.length;
      const next = its[idx];
      if (!next) return;
      void next.offsetWidth;
      next.classList.add('is-spotlight');
    }
    function tick() {
      if (hovering) return;
      if (items().length < 2) return;
      setSpotlight(idx + 1);
    }

    // Delegated hover on the persistent list element (survives re-renders).
    if (!list.dataset.spotlightWired) {
      list.addEventListener('mouseover', (e) => {
        const li = e.target.closest('li');
        if (li && list.contains(li)) {
          hovering = true;
          const i = items().indexOf(li);
          if (i >= 0) setSpotlight(i);
        }
      });
      list.addEventListener('mouseout', (e) => {
        if (!list.contains(e.relatedTarget)) hovering = false;
      });
      list.dataset.spotlightWired = '1';
    }

    creditsTimer = setInterval(tick, 2000);
    tick();
  }

  /* ---------- 11. Mascot easter egg — both variants, 3 clicks, wobble ---------- */
  function initMascot() {
    if (prefersReduce) return;
    document.querySelectorAll('.corner-mascot').forEach((m) => {
      let clicks = [];
      m.addEventListener('click', (e) => {
        const now = Date.now();
        clicks.push(now);
        clicks = clicks.filter((t) => now - t < 1500);
        if (clicks.length >= 3) {
          e.preventDefault();
          clicks = [];
          m.classList.add('wobble');
          setTimeout(() => m.classList.remove('wobble'), 700);
        }
      });
    });
  }

  /* ---------- 12. Hero mascot — cursor follow, blink, mouth-on-hover ---------- */
  function initHeroMascotTracking() {
    if (prefersReduce) return;
    const mascot = document.querySelector('.hero__mascot');
    if (!mascot) return;

    // Grab corner early so observer + mousemove can both reference it
    const corner = document.querySelector('.corner-mascot');

    // Only compute hero vars while the mascot is on-screen
    let isVisible = false;
    const visObs = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (!isVisible) {
        mascot.style.setProperty('--cx', '0');
        mascot.style.setProperty('--cy', '0');
        if (corner) { corner.style.setProperty('--cx', '0'); corner.style.setProperty('--cy', '0'); }
      }
    }, { threshold: 0.1 });
    visObs.observe(mascot);

    // Hero is pointer-events:none (so nav clicks pass through), so its hover
    // "hi" and 3-click wobble are detected geometrically from the window
    // listeners instead of mouseenter/click on the element itself.
    let heroOver = false;
    let talkTimer = 0;
    function heroHi() {
      clearTimeout(talkTimer);
      mascot.classList.remove('cat--hover');
      // force reflow so re-adding cat--hover restarts the one-shot bounce
      void mascot.offsetWidth;
      mascot.classList.add('cat--talk');
      mascot.classList.add('cat--blink');
      mascot.classList.add('cat--hover');
      talkTimer = setTimeout(() => mascot.classList.remove('cat--talk'), 500);
      setTimeout(() => mascot.classList.remove('cat--blink'), 220);
      setTimeout(() => mascot.classList.remove('cat--hover'), 480);
    }
    function heroBye() {
      clearTimeout(talkTimer);
      mascot.classList.remove('cat--talk');
    }

    // rAF-throttled mousemove — always runs so the corner head-follow works
    // even when the hero mascot has scrolled off-screen
    let raf = 0;
    window.addEventListener('mousemove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (isVisible) {
          const r   = mascot.getBoundingClientRect();
          const hcx = (r.left + r.right)  / 2;
          const hcy = (r.top  + r.bottom) / 2;
          const nx  = Math.max(-1, Math.min(1, (e.clientX - hcx) / (window.innerWidth  / 2)));
          const ny  = Math.max(-1, Math.min(1, (e.clientY - hcy) / (window.innerHeight / 2)));
          mascot.style.setProperty('--cx', nx.toFixed(3));
          mascot.style.setProperty('--cy', ny.toFixed(3));
          const over = e.clientX >= r.left && e.clientX <= r.right &&
                       e.clientY >= r.top  && e.clientY <= r.bottom;
          if (over && !heroOver)      { heroOver = true;  heroHi();  }
          else if (!over && heroOver) { heroOver = false; heroBye(); }
        } else if (heroOver) {
          heroOver = false;
          heroBye();
        }
        if (corner) {
          const rc  = corner.getBoundingClientRect();
          const ccx = (rc.left + rc.right)  / 2;
          const ccy = (rc.top  + rc.bottom) / 2;
          // Negate X because .cat--corner is scaleX(-1); negating makes the head
          // turn toward the cursor rather than away
          const ncx = Math.max(-1, Math.min(1, (e.clientX - ccx) / (window.innerWidth  / 2)));
          const ncy = Math.max(-1, Math.min(1, (e.clientY - ccy) / (window.innerHeight / 2)));
          corner.style.setProperty('--cx', (-ncx).toFixed(3));
          corner.style.setProperty('--cy', ncy.toFixed(3));
        }
      });
    });

    window.addEventListener('mouseleave', () => {
      mascot.style.setProperty('--cx', '0');
      mascot.style.setProperty('--cy', '0');
      if (corner) { corner.style.setProperty('--cx', '0'); corner.style.setProperty('--cy', '0'); }
      if (heroOver) { heroOver = false; heroBye(); }
    });

    // Tap/click easter egg — geometric since the hero is pointer-events:none.
    // Uses both 'touchend' (iOS always fires it) and 'click' (desktop + Android).
    // 350ms debounce prevents Android double-counting (fires both events per tap).
    let heroClicks = [];
    let lastTapAt = 0;
    function mascotTapAt(clientX, clientY) {
      const now = Date.now();
      if (now - lastTapAt < 350) return;   // drop the 'click' if 'touchend' just ran
      lastTapAt = now;
      if (!isVisible) return;
      const r = mascot.getBoundingClientRect();
      if (clientX < r.left || clientX > r.right ||
          clientY < r.top  || clientY > r.bottom) return;
      heroHi();
      heroClicks.push(now);
      heroClicks = heroClicks.filter((t) => now - t < 1500);
      if (heroClicks.length >= 3) {
        heroClicks = [];
        mascot.classList.add('wobble');
        setTimeout(() => mascot.classList.remove('wobble'), 700);
      }
    }
    window.addEventListener('click', (e) => mascotTapAt(e.clientX, e.clientY));
    window.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        mascotTapAt(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    }, { passive: true });

    // Auto-blink every 4–8 s — hero and corner blink in sync
    function scheduleBlink() {
      setTimeout(() => {
        mascot.classList.add('cat--blink');
        if (corner) corner.classList.add('cat--blink');
        setTimeout(() => {
          mascot.classList.remove('cat--blink');
          if (corner) corner.classList.remove('cat--blink');
          scheduleBlink();
        }, 220);
      }, 4000 + Math.random() * 4000);
    }
    scheduleBlink();

    // Corner: blink on hover + hold mouth open until click
    if (corner) {
      corner.addEventListener('mouseenter', () => {
        corner.classList.add('cat--blink');
        setTimeout(() => corner.classList.remove('cat--blink'), 220);
        corner.classList.add('cat--talk');
      });
      corner.addEventListener('mouseleave', () => {
        corner.classList.remove('cat--talk');
      });
      corner.addEventListener('click', () => {
        if (isTouch) {
          corner.classList.add('cat--blink');
          setTimeout(() => corner.classList.remove('cat--blink'), 220);
          corner.classList.add('cat--talk');
          setTimeout(() => corner.classList.remove('cat--talk'), 500);
        } else {
          corner.classList.remove('cat--talk');
        }
      });
    }
  }

  /* ---------- 13. Email — copy-to-clipboard site-wide ---------- */
  function announce(msg) {
    const live = document.getElementById('palette-live');
    if (!live) return;
    live.textContent = '';
    setTimeout(() => { live.textContent = msg; }, 30);
  }

  function showCopiedToast(target) {
    const t = document.createElement('span');
    t.textContent = 'Copied!';
    t.setAttribute('aria-hidden', 'true');
    Object.assign(t.style, {
      position: 'fixed', zIndex: 9500, background: 'var(--fg)', color: 'var(--bg)',
      padding: '6px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: '600',
      pointerEvents: 'none', opacity: '0', transition: 'opacity 180ms ease, transform 180ms ease',
      transform: 'translateY(4px)'
    });
    const r = target.getBoundingClientRect();
    t.style.left = (r.left) + 'px';
    t.style.top = (r.top - 34) + 'px';
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
    setTimeout(() => {
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 220);
    }, 1400);
  }

  function initEmailCopy() {
    const email = (DATA.profile && DATA.profile.email) || '';
    if (!email) return;
    document.querySelectorAll('[data-bind="email"]').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (!navigator.clipboard) return; // let the mailto: href proceed
        e.preventDefault();
        navigator.clipboard.writeText(email).then(() => {
          announce('Copied ' + email + ' to clipboard');
          showCopiedToast(el);
        }).catch(() => {
          window.location.href = 'mailto:' + email;
        });
      });
    });
  }

  /* ---------- 13. Cursor-reactive floating image cluster (home only) ---------- */
  function initHeroImages(pageKey) {
    if (pageKey !== 'home') return;
    const list = (DATA.profile && DATA.profile.heroImages) || [];
    const host = document.querySelector('.hero__images');
    if (!host || !list.length) return;
    const hero = document.querySelector('.hero');

    const items = list.slice(0, 6).map((src, i) => {
      const el = document.createElement('div');
      el.className = 'hero__image';
      el.style.setProperty('--baseX', (14 + ((i * 61) % 70)) + '%');
      el.style.setProperty('--baseY', (12 + ((i * 37) % 56)) + '%');
      el.dataset.depth = String(8 + (i % 3) * 7);
      el.innerHTML = '<div class="shadow"></div><img src="' + escapeAttr(src) + '" alt="" draggable="false" />';
      host.appendChild(el);
      return el;
    });

    if (prefersReduce || isTouch) return; // static cluster, no cursor reaction

    let raf = 0;
    hero.addEventListener('mousemove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = hero.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
        items.forEach((el) => {
          const d = parseFloat(el.dataset.depth) || 10;
          el.style.setProperty('--tx', (nx * d).toFixed(1) + 'px');
          el.style.setProperty('--ty', (ny * d).toFixed(1) + 'px');
        });
      });
    });
    hero.addEventListener('mouseleave', () => {
      items.forEach((el) => {
        el.style.setProperty('--tx', '0px');
        el.style.setProperty('--ty', '0px');
      });
    });
  }

  /* ---------- 14. Render dynamic content ---------- */
  function renderProfile() {
    const p = DATA.profile || {};
    setText('[data-bind="location"]', p.location);

    // Socials — set href + (optional) label text
    document.querySelectorAll('[data-social]').forEach((el) => {
      const s = p.socials && p.socials[el.dataset.social];
      if (s) {
        if (s.url) el.href = s.url;
        if (s.label) el.textContent = s.label;
      }
    });

    // Email — text + href (mailto fallback) on every instance
    if (p.email) {
      document.querySelectorAll('[data-bind="email"]').forEach((el) => {
        el.textContent = p.email;
        el.setAttribute('href', 'mailto:' + p.email);
      });
    }

    // Credits — links (drives marquee strip + About credits list)
    document.querySelectorAll('[data-bind="credits"]').forEach((host) => {
      if (!p.credits) return;
      host.innerHTML = p.credits.map((c) => {
        if (typeof c === 'object' && c.url) {
          return `<li><a href="${escapeAttr(c.url)}" target="_blank" rel="noopener">${escapeHtml(c.name)}</a></li>`;
        }
        return `<li>${escapeHtml(typeof c === 'object' ? c.name : c)}</li>`;
      }).join('');
    });

    // Roles (hero meta)
    const rolesEl = document.querySelector('[data-bind="roles"]');
    if (rolesEl && p.roles) {
      rolesEl.innerHTML = p.roles.map((r) => `<span>${escapeHtml(r)}</span>`).join('');
    }

    // Copyright identity — "Kim Nguyen · Fat Cat Rolling" (editable via profile.name / profile.brand)
    const copyrightText = [p.name, p.brand].filter(Boolean).join(' · ');
    if (copyrightText) {
      document.querySelectorAll('[data-bind="copyright"]').forEach((el) => {
        el.textContent = copyrightText;
      });
    }
  }

  function renderReel(key, selector) {
    const reel = DATA.reels && DATA.reels[key];
    const host = document.querySelector(selector);
    if (!reel || !host) return;
    // Reel titles are intentionally not shown on the poster — derive an
    // accessible label from the page's reel heading so the button still
    // announces meaningfully to screen readers.
    const pageKey = document.body.dataset.page;
    const label = reel.title ||
      (DATA.pages && DATA.pages[pageKey] && DATA.pages[pageKey].reelHeading) || 'reel';
    host.innerHTML = `
      <button class="reel" data-reel="${escapeAttr(key)}" aria-label="Play ${escapeAttr(label)}">
        <img class="reel__poster" src="${escapeAttr(reel.poster)}" alt="${escapeAttr(label)} poster" />
        <div class="reel__play" aria-hidden="true">
          <svg class="reel__play-svg" viewBox="0 0 80 80">
            <circle class="reel__play-ring" cx="40" cy="40" r="38" />
            <polygon class="reel__play-arrow" points="32,24 32,56 58,40" />
          </svg>
        </div>
        <div class="reel__overlay">
          <div class="reel__meta">
            <span class="reel__title">${escapeHtml(reel.title)}</span>
            <span class="reel__chip">${escapeHtml(reel.duration || '')}</span>
            <span class="reel__chip">${escapeHtml(String(reel.year || ''))}</span>
          </div>
        </div>
      </button>`;

    if (reel.shotlist && reel.shotlist.length) {
      const slHost = document.querySelector(selector + '-shotlist');
      if (slHost) {
        slHost.innerHTML = reel.shotlist.map((s) => `
          <div class="shotlist__row">
            <span class="shotlist__time">${escapeHtml(s.time)}</span>
            <span class="shotlist__project">${escapeHtml(s.project)}</span>
            <span class="shotlist__role">${escapeHtml(s.role)}</span>
          </div>`).join('');
      }
    }
  }

  function renderGallery(pageKey, selector) {
    const items = DATA.gallery && DATA.gallery[pageKey];
    const host = document.querySelector(selector);
    if (!host || !items) return;
    host.innerHTML = items.map((it, i) => {
      const isVideo = it.type === 'video';
      const mp4Src = isVideo
        ? it.src.replace(/^videos\/webm\//, 'videos/mp4/').replace(/\.webm$/i, '.mp4')
        : '';
      const media = isVideo
        ? `<video ${it.poster ? `poster="${escapeAttr(it.poster)}"` : ''} muted loop playsinline preload="none" controlsList="nodownload" disablepictureinpicture><source src="${escapeAttr(it.src)}" type="${it.src.endsWith('.webm') ? 'video/webm' : 'video/mp4'}">${
            mp4Src !== it.src ? `<source src="${escapeAttr(mp4Src)}" type="video/mp4">` : ''
          }</video>`
        : `<img src="${escapeAttr(it.src)}" alt="${escapeAttr(it.alt || it.title || '')}" loading="lazy" decoding="async" />`;
      return `
      <button class="project"
              style="--delay:${i % 3}"
              data-type="${escapeAttr(it.type || 'image')}"
              data-src="${escapeAttr(it.src)}"
              data-poster="${escapeAttr(it.poster || '')}"
              data-title="${escapeAttr(it.title || '')}"
              data-alt="${escapeAttr(it.alt || it.title || '')}"
              aria-label="Open ${escapeAttr(it.title || 'work')}">
        <div class="project__image">
          <div class="shadow"></div>
          <div class="media">${media}</div>
        </div>
      </button>`;
    }).join('');
  }

  function renderAbout() {
    const a = DATA.about || {};
    setText('[data-bind="about-short"]', a.shortBio);
    setText('[data-bind="about-long"]', a.longBio);
    document.querySelectorAll('[data-bind="about-short"]').forEach((el) => applyTextStyle(el, a.shortBioStyle));
    document.querySelectorAll('[data-bind="about-long"]').forEach((el) => applyTextStyle(el, a.longBioStyle));
    const expHost = document.querySelector('[data-bind="experience"]');
    if (expHost && a.experience) {
      expHost.innerHTML = a.experience.map((e) => `
        <div class="experience__row">
          <div class="experience__head">
            <div>
              <div class="experience__role">${escapeHtml(e.role)}</div>
              <div class="experience__studio">${escapeHtml(e.studio)}${e.location ? ' · ' + escapeHtml(e.location) : ''}</div>
            </div>
            <div class="experience__years">${escapeHtml(e.years)}</div>
          </div>
          ${Array.isArray(e.highlights) && e.highlights.length ? `<ul class="experience__highlights">${e.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul>` : ''}
          ${e.skills ? `<div class="experience__skills"><span class="experience__skills-label">Tools &amp; Skills:</span> ${escapeHtml(e.skills)}</div>` : ''}
        </div>`).join('');
    }
  }

  // Per-text override (bold/italic/size) layered on top of the global typography.
  // Only overrides what's set; otherwise the element keeps its CSS (which uses the
  // global --*-weight/-style/-scale vars).
  function applyTextStyle(el, st) {
    if (!el) return;
    el.style.fontWeight = (st && st.bold) ? '700' : '';
    el.style.fontStyle = (st && st.italic) ? 'italic' : '';
    el.style.fontSize = '';
    if (st && st.scale && Number(st.scale) !== 1) {
      const base = parseFloat(getComputedStyle(el).fontSize);
      if (base) el.style.fontSize = (base * Number(st.scale)) + 'px';
    }
  }

  function renderPageCopy(pageKey) {
    if (!DATA.pages) return;
    const pg = DATA.pages[pageKey] || {};
    const ft = DATA.pages.footer || {};
    document.querySelectorAll('[data-bind^="pages."]').forEach(function (el) {
      const key = el.dataset.bind.slice(6);
      const fromPg = pg[key] !== undefined;
      const val = fromPg ? pg[key] : ft[key];
      if (val != null) el.textContent = val;
      applyTextStyle(el, fromPg ? pg[key + 'Style'] : ft[key + 'Style']);
    });
  }

  /* ---------- Helpers ---------- */
  function setText(sel, val) {
    document.querySelectorAll(sel).forEach((el) => { if (val != null) el.textContent = val; });
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function escapeAttr(s) { return escapeHtml(s); }

  /* ---------- Navigation (data-driven so add/remove-page updates every page) ---------- */
  function renderNav(pageKey) {
    const pages = DATA.navPages;
    if (!Array.isArray(pages) || !pages.length) return; // keep static nav as fallback
    const top = document.querySelector('.topnav__links');
    if (top) {
      top.innerHTML = pages.map((p) => {
        const cur = p.page === pageKey ? ' aria-current="page"' : '';
        return '<li><a href="' + escapeAttr(p.slug) + '" data-text="' + escapeAttr(p.label) + '"' + cur + '>' + escapeHtml(p.label) + '</a></li>';
      }).join('');
    }
    // The footer page-list is the .footer__list that is NOT the socials list.
    document.querySelectorAll('.footer__list').forEach((ul) => {
      if (ul.querySelector('[data-social]')) return;
      ul.innerHTML = pages.filter((p) => p.page !== pageKey).map((p) =>
        '<li><a href="' + escapeAttr(p.slug) + '">' + escapeHtml(p.label) + '</a></li>').join('');
    });
  }

  /* ---------- Render the data-driven content (re-runnable) ---------- */
  function renderFromData() {
    renderProfile();
    const pageKey = document.body.dataset.page;
    renderNav(pageKey);
    renderPageCopy(pageKey);
    if (pageKey === 'about') {
      renderAbout();
    } else {
      // Reel/gallery pages render by convention: reels[pageKey] (Home uses
      // 'tech') + gallery[pageKey]. A page can hide either built-in section via
      // pages[pageKey].showReel / showWork (default = shown).
      const pg = (DATA.pages && DATA.pages[pageKey]) || {};
      const reelKey = (pageKey === 'home') ? 'tech' : pageKey;
      const reelEl = document.querySelector('#hero-reel');
      const reelSection = reelEl ? reelEl.closest('.section') : document.querySelector('.section--reel');
      const showReel = pg.showReel !== false;
      if (reelSection) reelSection.style.display = showReel ? '' : 'none';
      if (showReel && reelEl && DATA.reels && DATA.reels[reelKey]) renderReel(reelKey, '#hero-reel');
      const galleryEl = document.querySelector('#gallery');
      const gallerySection = galleryEl ? galleryEl.closest('.section') : null;
      const showWork = pg.showWork !== false;
      if (gallerySection) gallerySection.style.display = showWork ? '' : 'none';
      if (showWork && galleryEl && DATA.gallery && DATA.gallery[pageKey]) renderGallery(pageKey, '#gallery');
    }
    renderCanvases(pageKey);
    initReelButtons();
    initTileButtons();
    initVideoHoverPreview();
  }

  /* ---------- Free-form "canvas" sections (drag/resize layout) ----------
     Blocks are placed on a 12-col grid (desktop). On mobile they stack in
     order automatically (CSS media query), so a layout can never become
     unreadable on a phone. */
  function renderCanvasSectionHtml(cv) {
    const cols = (cv.grid && cv.grid.cols) || 12;
    const rowH = (cv.grid && cv.grid.rowHeight) || 48;
    const gap = (cv.grid && cv.grid.gap) || 12;
    const title = cv.title
      ? '<h2 class="section__title">' + escapeHtml(cv.title) + '</h2><span class="section__rule in-view" aria-hidden="true"></span>'
      : '';
    const blocks = (cv.blocks || []).map((b) => {
      const d = b.desktop || { c: 1, r: 1, w: cols, h: 2 };
      const style = 'grid-column:' + d.c + '/span ' + d.w + ';grid-row:' + d.r + '/span ' + d.h + ';';
      let inner = '';
      const fs = b.fontStyle === 'bold' ? 'font-weight:700;font-style:normal;'
        : b.fontStyle === 'italic' ? 'font-style:italic;'
        : b.fontStyle === 'normal' ? 'font-weight:400;font-style:normal;' : '';
      if (b.type === 'heading') inner = '<h3 class="canvas__h" style="text-align:' + (b.align || 'left') + ';' + fs + '">' + escapeHtml(b.content || '') + '</h3>';
      else if (b.type === 'text') inner = '<div class="canvas__text" style="text-align:' + (b.align || 'left') + ';' + fs + '">' + escapeHtml(b.content || '').replace(/\n/g, '<br>') + '</div>';
      else if (b.type === 'image') inner = b.src ? '<img class="canvas__img" src="' + escapeAttr(b.src) + '" alt="' + escapeAttr(b.alt || '') + '">' : '<div class="canvas__ph">image</div>';
      else if (b.type === 'video') {
        if (b.src) {
          const mp4 = b.src.replace(/^videos\/webm\//, 'videos/mp4/').replace(/\.webm$/i, '.mp4');
          const s2 = mp4 !== b.src ? '<source src="' + escapeAttr(mp4) + '" type="video/mp4">' : '';
          inner = '<video class="canvas__video" ' + (b.poster ? 'poster="' + escapeAttr(b.poster) + '" ' : '') +
            'controls loop muted playsinline preload="none" controlsList="nodownload" disablepictureinpicture>' +
            '<source src="' + escapeAttr(b.src) + '" type="' + (b.src.endsWith('.webm') ? 'video/webm' : 'video/mp4') + '">' + s2 + '</video>';
        } else inner = '<div class="canvas__ph">video</div>';
      }
      else if (b.type === 'reel') {
        if (b.videoId && b.provider) {
          const data = escapeAttr(JSON.stringify({ provider: b.provider, id: b.videoId, title: b.title || '' }));
          inner = '<button class="reel canvas__reel" data-cv-reel="' + data + '" aria-label="Play ' + escapeAttr(b.title || 'reel') + '">' +
            (b.poster ? '<img class="reel__poster" src="' + escapeAttr(b.poster) + '" alt="">' : '') +
            '<div class="reel__play" aria-hidden="true"><svg class="reel__play-svg" viewBox="0 0 80 80"><circle class="reel__play-ring" cx="40" cy="40" r="38"/><polygon class="reel__play-arrow" points="32,24 32,56 58,40"/></svg></div></button>';
        } else inner = '<div class="canvas__ph">reel — paste a Vimeo/YouTube URL</div>';
      }
      return '<div class="canvas__block" style="' + style + '">' + inner + '</div>';
    }).join('');
    return '<section class="section canvas">' + title +
      '<div class="canvas__grid" style="grid-template-columns:repeat(' + cols + ',minmax(0,1fr));gap:' + gap + 'px;grid-auto-rows:' + rowH + 'px">' + blocks + '</div></section>';
  }

  function renderCanvases(pageKey) {
    document.querySelectorAll('.canvas-host').forEach((n) => n.remove());
    let list = DATA.canvases && DATA.canvases[pageKey];
    if (!list) return;
    if (!Array.isArray(list)) list = [list]; // back-compat with old single-canvas format
    const container = document.querySelector('.page-body .container') || document.querySelector('.page-body');
    if (!container) return;
    const reelSection = document.querySelector('.section--reel');
    const reelVideo = document.querySelector('#hero-reel');
    const galleryEl = document.querySelector('#gallery');
    const gallerySection = galleryEl ? galleryEl.closest('.section') : null;
    const anchors = { 'top': [], 'reel-mid': [], 'after-reel': [], 'work-mid': [], 'after-gallery': [] };
    list.forEach((cv) => {
      if (!cv) return;
      if ((!cv.blocks || !cv.blocks.length) && !cv.title) return;
      (anchors[cv.where] || anchors['after-gallery']).push(cv);
    });
    Object.keys(anchors).forEach((where) => {
      if (!anchors[where].length) return;
      const host = document.createElement('div');
      host.className = 'canvas-host';
      host.innerHTML = anchors[where].map(renderCanvasSectionHtml).join('');
      if (where === 'top') { if (reelSection) reelSection.before(host); else container.insertBefore(host, container.firstChild); }
      else if (where === 'reel-mid') { if (reelVideo) reelVideo.before(host); else if (reelSection) reelSection.appendChild(host); else container.appendChild(host); }
      else if (where === 'after-reel') { if (reelSection) reelSection.after(host); else container.appendChild(host); }
      else if (where === 'work-mid') { if (galleryEl) galleryEl.before(host); else if (gallerySection) gallerySection.appendChild(host); else container.appendChild(host); }
      else { if (gallerySection) gallerySection.after(host); else container.appendChild(host); }
    });
    // Wire reel blocks (Vimeo/YouTube) to play, reusing the site's reel embed.
    document.querySelectorAll('.canvas__reel[data-cv-reel]').forEach((btn) => {
      if (btn.__cvWired) return; btn.__cvWired = true;
      btn.addEventListener('click', () => {
        let r; try { r = JSON.parse(btn.getAttribute('data-cv-reel')); } catch (e) { return; }
        openReel(r, btn);
      });
    });
  }

  /* ---------- Editor live-preview hook ----------
     The editor (in _editor/) posts a draft dataset so Kim sees edits before
     saving. Guarded by the __fcrDraft flag — no normal visitor ever sends this,
     so this is a no-op on the live site. */
  window.addEventListener('message', function (e) {
    const d = e.data;
    if (!d || d.__fcrDraft !== true || !d.data) return;
    DATA = d.data;
    window.SITE_DATA = d.data;
    applyThemesAndFonts();
    if (d.palette) setPalette(d.palette, false); // editor previews the theme being edited
    renderFromData();
    // Skip the scroll-reveal/cascade animations in preview so re-rendered tiles
    // are immediately visible instead of waiting on the IntersectionObserver.
    document.querySelectorAll('.project').forEach((t) => t.classList.add('inview'));
    document.querySelectorAll('.section__rule').forEach((r) => r.classList.add('in-view'));
  });

  /* ---------- Boot ---------- */
  function boot() {
    applyThemesAndFonts();
    initPaletteSwitcher();

    const pageKey = document.body.dataset.page;
    renderFromData();

    // One-shot entrance motion must not play while hidden during prerender —
    // defer it until the page is actually shown so the cascade/bounce is seen.
    function runEntranceMotion() { initScrollReveal(); initHeroName(); }
    if (document.prerendering) {
      document.addEventListener('prerenderingchange', runEntranceMotion, { once: true });
    } else {
      runEntranceMotion();
    }

    initMascot();
    initCursorDot();
    initCornerMascotVisibility();
    initCreditsSpotlight();
    initEmailCopy();
    initHeroImages(pageKey);
    initHeroMascotTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* ============================================================
   Asset protection layer — discourages casual downloading
   ============================================================
   Blocks right-click + drag-start on images, videos, and gallery
   tiles. Determined users can still bypass via DevTools, but this
   stops casual "Save Image As" / drag-to-desktop copying. Wrapped
   in its own IIFE + try/catch so a failure here can't break the
   site. Does NOT block keyboard or assistive tech — only pointer
   events on media elements. */
(function () {
  'use strict';
  try {
    var MEDIA_SELECTOR = 'img, video, .gallery__item, .gallery__media, .lightbox__media';

    function blockIfMedia(e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest(MEDIA_SELECTOR)) {
        e.preventDefault();
      }
    }

    document.addEventListener('contextmenu', blockIfMedia, { capture: true });
    document.addEventListener('dragstart',   blockIfMedia, { capture: true });
  } catch (err) {
    /* Silent — protection layer is best-effort. Site continues. */
  }
})();
