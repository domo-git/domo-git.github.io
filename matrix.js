/* ============================================================
   matrix.js — Domenico Offensive Security Portfolio
   Shared engine loaded by every page.

   Features:
   - Adaptive binary rain (dark & light mode aware)
   - Dark / light theme toggle with localStorage persistence
   - Page transition: matrix dissolve on nav clicks, stagger fade-in on load
   - data-glitch  → periodic chromatic aberration glitch
   - data-typewriter → types text on load with blinking cursor
   - data-scramble → binary/katakana scramble on hover
   - Live intel ticker on index page
   ============================================================ */

(function () {
  'use strict';

  /* ── THEME ───────────────────────────────────────────────── */
  const THEME_KEY = 'opsec-theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    // Update any toggle buttons that exist on the page
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.textContent = theme === 'light' ? '☽ DARK' : '☀ LIGHT';
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    });
    // Notify rain canvas of theme change
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const theme = saved || 'light';
    applyTheme(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  /* ── BINARY RAIN CANVAS ──────────────────────────────────── */
  function initRain() {
    const canvas = document.getElementById('matrix-rain');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const CHAR_SIZE = 14;
    const CHARS = '01';
    let cols, drops, animId;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
      cols  = Math.floor(canvas.width / CHAR_SIZE);
      drops = Array.from({ length: cols }, () => Math.random() * -50);
    }

    function getColors() {
      const theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'light') {
        return {
          fade:   'rgba(242, 246, 242, 0.15)',
          bright: 'rgba(20, 100, 40, 0.80)',
          dim:    'rgba(20, 100, 40, 0.28)',
        };
      }
      return {
        fade:   'rgba(10, 12, 15, 0.10)',
        bright: 'rgba(57, 211, 83, 0.90)',
        dim:    'rgba(57, 211, 83, 0.28)',
      };
    }

    function draw() {
      const { fade, bright, dim } = getColors();
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${CHAR_SIZE}px 'Share Tech Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const y = drops[i] * CHAR_SIZE;
        // Head of the column is brighter
        ctx.fillStyle = Math.random() > 0.92 ? bright : dim;
        ctx.fillText(char, i * CHAR_SIZE, y);
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.6 + Math.random() * 0.4;
      }
      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('themechange', () => {
      // Clear canvas on theme switch so old colour doesn't bleed through
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    if (animId) cancelAnimationFrame(animId);
    draw();
  }

  /* ── PAGE TRANSITIONS ────────────────────────────────────── */
  const DISSOLVE_CHARS = '01アイウエオカキクケコサシスセソタチツテト';

  function dissolveOut(cb) {
    const overlay = document.getElementById('transition-overlay');
    if (!overlay) { cb(); return; }
    overlay.classList.add('active');
    // Scramble visible text nodes briefly
    setTimeout(cb, 320);
  }

  function fadeIn() {
    document.querySelectorAll('[data-fadein]').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px)';
      el.style.transition = `opacity 0.45s ease ${i * 0.07}s, transform 0.45s ease ${i * 0.07}s`;
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  }

  function initTransitions() {
    // Intercept nav link clicks
    document.querySelectorAll('a[data-nav]').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http')) return;
        e.preventDefault();
        dissolveOut(() => { window.location.href = href; });
      });
    });
    // Fade in on page load
    window.addEventListener('load', fadeIn);
  }

  /* ── GLITCH EFFECT ───────────────────────────────────────── */
  function initGlitch() {
    document.querySelectorAll('[data-glitch]').forEach(el => {
      const original = el.textContent;
      function glitch() {
        let iterations = 0;
        const interval = setInterval(() => {
          el.style.textShadow = iterations % 2 === 0
            ? '2px 0 #ff0040, -2px 0 #00d4ff'
            : '0 0 0 transparent';
          iterations++;
          if (iterations > 6) {
            clearInterval(interval);
            el.style.textShadow = '';
          }
        }, 50);
      }
      // Random periodic glitch
      function scheduleGlitch() {
        const delay = 3000 + Math.random() * 6000;
        setTimeout(() => { glitch(); scheduleGlitch(); }, delay);
      }
      scheduleGlitch();
    });
  }

  /* ── TYPEWRITER EFFECT ───────────────────────────────────── */
  function initTypewriter() {
    document.querySelectorAll('[data-typewriter]').forEach(el => {
      const text    = el.getAttribute('data-typewriter') || el.textContent;
      const speed   = parseInt(el.getAttribute('data-tw-speed') || '45', 10);
      const delay   = parseInt(el.getAttribute('data-tw-delay') || '0', 10);
      el.textContent = '';
      el.style.borderRight = '2px solid var(--green)';
      el.style.display = 'inline-block';
      el.style.whiteSpace = 'pre-wrap';

      let i = 0;
      setTimeout(() => {
        const interval = setInterval(() => {
          el.textContent = text.slice(0, i + 1);
          i++;
          if (i >= text.length) {
            clearInterval(interval);
            // Blink cursor after done
            let visible = true;
            setInterval(() => {
              el.style.borderRightColor = visible ? 'var(--green)' : 'transparent';
              visible = !visible;
            }, 530);
          }
        }, speed);
      }, delay);
    });
  }

  /* ── SCRAMBLE EFFECT ─────────────────────────────────────── */
  const SCRAMBLE_CHARS = '01アイウエカキクケコサシスセソタチツテトナニヌネ';

  function scrambleText(el) {
    const target = el.getAttribute('data-scramble') || el.textContent;
    let iteration = 0;
    const total   = target.length * 3;
    const interval = setInterval(() => {
      el.textContent = target.split('').map((char, idx) => {
        if (char === ' ') return ' ';
        if (idx < Math.floor(iteration / 3)) return target[idx];
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }).join('');
      iteration++;
      if (iteration > total) {
        clearInterval(interval);
        el.textContent = target;
      }
    }, 30);
  }

  function initScramble() {
    document.querySelectorAll('[data-scramble]').forEach(el => {
      const original = el.getAttribute('data-scramble') || el.textContent;
      if (!el.getAttribute('data-scramble')) el.setAttribute('data-scramble', original);
      el.addEventListener('mouseenter', () => scrambleText(el));
    });
  }

  /* ── INTEL TICKER (index page only) ─────────────────────── */
  /*
   * The ticker on index.html shows live headlines pulled from
   * the Anthropic API (same model used in threat-profiles.html).
   * Falls back to a rotating static pool if the API call fails.
   *
   * Called from index.html after DOMContentLoaded.
   * Exported as window.MatrixOS.refreshTicker()
   */
  const TICKER_FALLBACK = [
    'LockBit 3.0 affiliates exploiting ESXi via CVE-2024-37085 authentication bypass',
    'Scattered Spider shifting to vishing + MFA fatigue attacks against help-desk staff',
    'Volt Typhoon pre-positioning observed across US critical infrastructure sectors',
    'BlackCat/ALPHV affiliates leveraging kernel driver abuse for EDR evasion',
    'Lazarus Group deploying trojanized npm packages in developer supply-chain campaign',
    'Royal ransomware rebranded as BlackSuit — same core TTPs, new infrastructure',
    'Cl0p leveraging MOVEit-style mass exploitation against managed file transfer vendors',
    'Sandworm targeting Ukrainian energy grid OT systems via living-off-the-land binaries',
    'RansomHub affiliates observed using stolen credentials from infostealer logs',
    'ALPHV/BlackCat affiliate indicted — highlights affiliate model resilience post-disruption',
  ];

  async function fetchTickerHeadlines() {
    try {
      const seed = Math.floor(Math.random() * 999999);
      const ts   = new Date().toISOString().slice(0, 16); // minute-level freshness
      const prompt = `You are a cyber threat intelligence analyst. Today is ${ts} (seed:${seed}).
List exactly 8 of the MOST RECENT, real, newsworthy cybersecurity threat intelligence headlines from the past 7 days.
Each headline must be a single sentence under 120 characters.
Focus on: active ransomware campaigns, nation-state TTPs, new CVE exploitation, threat actor infrastructure changes.
Return ONLY a JSON array of 8 strings. No markdown, no explanation, no preamble.
Example format: ["Headline one here","Headline two here"]`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': window.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 600,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) throw new Error('API error');
      const data = await response.json();

      // Extract text from response blocks
      const textBlock = data.content.find(b => b.type === 'text');
      if (!textBlock) throw new Error('No text block');

      const raw   = textBlock.text.trim();
      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('No JSON array found');

      const headlines = JSON.parse(match[0]);
      if (!Array.isArray(headlines) || headlines.length < 3) throw new Error('Bad array');

      // Sanitise — strip any fabricated URLs, keep text only
      return headlines.map(h => String(h).replace(/https?:\/\/\S+/g, '').trim()).filter(Boolean);
    } catch (err) {
      console.warn('[MatrixOS] Ticker fetch failed, using fallback pool.', err.message);
      // Shuffle fallback
      return [...TICKER_FALLBACK].sort(() => Math.random() - 0.5).slice(0, 8);
    }
  }

  function renderTicker(headlines) {
    const track = document.getElementById('ticker-track');
    if (!track) return;
    // Duplicate for seamless loop
    const items = [...headlines, ...headlines];
    track.innerHTML = items
      .map(h => `<span class="ticker-item">${h}</span>`)
      .join('<span class="ticker-sep">·</span>');
    // Reset animation
    track.style.animation = 'none';
    track.offsetHeight; // reflow
    track.style.animation = '';
  }

  async function initTicker() {
    const track = document.getElementById('ticker-track');
    if (!track) return;
    // Show placeholders immediately
    renderTicker(['Loading latest threat intelligence...']);
    const headlines = await fetchTickerHeadlines();
    renderTicker(headlines);
  }

  /* ── LIVE FEED PREVIEW (index page) ─────────────────────── */
  /*
   * Fetches 3 brief feed items for the homepage preview panel.
   * Full feed lives on threat-profiles.html.
   */
  const FEED_FALLBACK = [
    { text: 'LockBit 3.0 affiliates exploiting VMware ESXi via authentication bypass (CVE-2024-37085)', source: 'Mandiant', tag: 'Ransomware', severity: 'high' },
    { text: 'Scattered Spider conducting MGM-style vishing attacks targeting help-desk authentication', source: 'CrowdStrike', tag: 'Social Engineering', severity: 'high' },
    { text: 'Volt Typhoon living-off-the-land activity detected across US energy sector networks', source: 'CISA', tag: 'Nation-State', severity: 'medium' },
  ];

  async function fetchFeedPreview() {
    try {
      const seed = Math.floor(Math.random() * 999999);
      const ts   = new Date().toISOString().slice(0, 16);
      const prompt = `You are a cyber threat intelligence analyst. Today is ${ts} (seed:${seed}).
Return exactly 3 of the most recent, high-impact cybersecurity threat intelligence items from the past 7 days.
Each item must be real and verifiable.
Return ONLY a JSON array of exactly 3 objects with this exact shape:
[{"text":"one sentence summary under 150 chars","source":"Publication or vendor name","tag":"Threat category","severity":"high|medium|low"}]
No markdown, no explanation. Raw JSON array only.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': window.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      const textBlock = data.content.find(b => b.type === 'text');
      if (!textBlock) throw new Error('No text');

      const match = textBlock.text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('No JSON');

      const items = JSON.parse(match[0]);
      if (!Array.isArray(items) || items.length < 1) throw new Error('Bad data');
      return items.slice(0, 3);
    } catch (err) {
      console.warn('[MatrixOS] Feed preview fetch failed, using fallback.', err.message);
      return FEED_FALLBACK;
    }
  }

  function renderFeedPreview(items) {
    const container = document.getElementById('feed-preview');
    if (!container) return;

    const severityColor = { high: 'var(--red)', medium: 'var(--amber)', low: 'var(--green)' };

    container.innerHTML = items.map(item => `
      <div class="feed-item" data-fadein>
        <div class="feed-dot" style="background:${severityColor[item.severity] || 'var(--green)'}"></div>
        <div class="feed-body">
          <p class="feed-text">${item.text}</p>
          <div class="feed-meta">
            <span class="feed-source">${item.source}</span>
            <span class="feed-tag">${item.tag}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  async function initFeedPreview() {
    const container = document.getElementById('feed-preview');
    if (!container) return;
    // Skeleton loading state
    container.innerHTML = `<div class="feed-loading">Fetching latest intelligence<span class="blink">_</span></div>`;
    const items = await fetchFeedPreview();
    renderFeedPreview(items);
  }

  /* ── BOOT / INIT ─────────────────────────────────────────── */
  function boot() {
    initTheme();
    initRain();
    initGlitch();
    initTypewriter();
    initScramble();
    initTransitions();

    // Bind theme toggle buttons
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });

    // Index-page-only features
    if (document.getElementById('ticker-track'))  initTicker();
    if (document.getElementById('feed-preview'))  initFeedPreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* ── PUBLIC API ──────────────────────────────────────────── */
  window.MatrixOS = {
    toggleTheme,
    applyTheme,
    scrambleText,
    refreshTicker: initTicker,
    refreshFeed:   initFeedPreview,
  };

})();
