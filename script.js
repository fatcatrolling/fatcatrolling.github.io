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

  const DATA = window.SITE_DATA || {
    profile: { name: 'Kim Nguyen', brand: 'Fat Cat Rolling', roles: [], socials: {}, credits: [], heroImages: [] },
    reels: {},
    gallery: { home: [], animation: [], vfx: [] },
    about: { shortBio: '', longBio: '', experience: [], clients: [] },
    pages: {}
  };

  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------- 1. Palette switcher — 3 bold, Warm default ---------- */
  const PALETTES = ['warm', 'blue', 'purple'];

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
    v.src = item.src;
    if (item.poster) v.poster = item.poster;
    v.controls = true;
    v.autoplay = true;
    v.loop = true;
    v.playsInline = true;
    openLightbox(v, trigger, item.title);
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
  function initCreditsSpotlight() {
    const list = document.querySelector('.credits__list');
    if (!list) return;
    const items = Array.from(list.querySelectorAll('li'));
    if (items.length < 2) return;
    if (prefersReduce) return;

    let idx = -1;
    let timerId = null;
    let hovering = false;

    function setSpotlight(newIdx) {
      const prev = items[idx];
      if (prev) prev.classList.remove('is-spotlight');
      idx = newIdx;
      const next = items[idx];
      next.classList.remove('is-spotlight');
      void next.offsetWidth;
      next.classList.add('is-spotlight');
    }

    function tick() {
      if (hovering) return;
      setSpotlight((idx + 1) % items.length);
    }

    function start() { if (timerId) return; tick(); timerId = setInterval(tick, 2000); }
    function stop()  { if (!timerId) return; clearInterval(timerId); timerId = null; }

    // Hover an individual name → spotlight it immediately, pause auto-cycle
    items.forEach((item, i) => {
      item.addEventListener('mouseenter', () => {
        hovering = true;
        stop();
        if (idx !== i) setSpotlight(i);
      });
    });

    // Leaving the whole list → resume cycle from current position
    list.addEventListener('mouseleave', () => {
      hovering = false;
      start();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (!hovering) start();
    });

    start();
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
    if (prefersReduce || isTouch) return;
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

    // 3-click wobble easter egg — geometric since the hero is pointer-events:none
    let heroClicks = [];
    window.addEventListener('click', (e) => {
      if (!isVisible) return;
      const r = mascot.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right ||
          e.clientY < r.top  || e.clientY > r.bottom) return;
      const now = Date.now();
      heroClicks.push(now);
      heroClicks = heroClicks.filter((t) => now - t < 1500);
      if (heroClicks.length >= 3) {
        heroClicks = [];
        mascot.classList.add('wobble');
        setTimeout(() => mascot.classList.remove('wobble'), 700);
      }
    });

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
        corner.classList.remove('cat--talk');
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
      const media = isVideo
        ? `<video src="${escapeAttr(it.src)}" ${it.poster ? `poster="${escapeAttr(it.poster)}"` : ''} muted loop playsinline preload="none"></video>`
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

  function renderPageCopy(pageKey) {
    if (!DATA.pages) return;
    const pg = DATA.pages[pageKey] || {};
    const ft = DATA.pages.footer || {};
    document.querySelectorAll('[data-bind^="pages."]').forEach(function (el) {
      const key = el.dataset.bind.slice(6);
      const val = pg[key] !== undefined ? pg[key] : ft[key];
      if (val != null) el.textContent = val;
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

  /* ---------- Boot ---------- */
  function boot() {
    initPaletteSwitcher();
    renderProfile();

    const pageKey = document.body.dataset.page;
    renderPageCopy(pageKey);

    if (pageKey === 'home') {
      renderReel('tech', '#hero-reel');
      renderGallery('home', '#gallery');
    } else if (pageKey === 'animation') {
      renderReel('animation', '#hero-reel');
      renderGallery('animation', '#gallery');
    } else if (pageKey === 'vfx') {
      renderReel('vfx', '#hero-reel');
      renderGallery('vfx', '#gallery');
    } else if (pageKey === 'about') {
      renderAbout();
    }

    initReelButtons();
    initTileButtons();
    initVideoHoverPreview();

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
