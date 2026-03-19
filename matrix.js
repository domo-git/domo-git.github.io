/* matrix.js — shared across all pages */
(function () {

  /* ── BINARY RAIN ─────────────────────────────────────────────────────────── */
  function initRain() {
    const canvas = document.getElementById('binary-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const chars = '01';
    const fontSize = 13;
    let cols, drops, speeds, brightnesses;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      cols         = Math.floor(canvas.width / fontSize);
      drops        = Array.from({ length: cols }, () => Math.random() * -80);
      speeds       = Array.from({ length: cols }, () => 0.3 + Math.random() * 0.5);
      brightnesses = Array.from({ length: cols }, () => Math.random());
    }

    resize();
    window.addEventListener('resize', resize);

    function draw() {
      ctx.fillStyle = 'rgba(10,12,15,0.07)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;

      for (let i = 0; i < cols; i++) {
        const char   = chars[Math.floor(Math.random() * chars.length)];
        const bright = brightnesses[i];
        // Lead character is brighter
        const isLead = Math.random() > 0.92;
        const alpha  = isLead ? 0.9 : 0.06 + bright * 0.2;
        ctx.fillStyle = isLead
          ? `rgba(180,255,180,${alpha})`
          : `rgba(57,211,83,${alpha})`;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.97) {
          drops[i] = 0;
          brightnesses[i] = Math.random();
        }
        drops[i] += speeds[i];
      }
    }

    setInterval(draw, 50);
  }

  /* ── PAGE TRANSITIONS ────────────────────────────────────────────────────── */
  function initTransitions() {
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99998;
      pointer-events: none; opacity: 0;
      background: #0a0c0f;
      font-family: 'Share Tech Mono', monospace;
      font-size: 12px;
      color: rgba(57,211,83,0.7);
      overflow: hidden;
      transition: opacity 0.18s ease;
    `;
    document.body.appendChild(overlay);

    // Glitch canvas inside overlay
    const glitchCanvas = document.createElement('canvas');
    glitchCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    overlay.appendChild(glitchCanvas);

    function runGlitch(canvas, duration, onDone) {
      const ctx    = canvas.getContext('2d');
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const chars  = '01アイウエオカキクケコ#$%@!?><';
      const cols   = Math.floor(canvas.width / 14);
      const rows   = Math.floor(canvas.height / 14);
      const start  = performance.now();
      let frame;

      function tick(now) {
        const t = (now - start) / duration;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Random character spray
        const density = Math.min(t * 2, 1);
        for (let r = 0; r < rows * density; r++) {
          for (let c = 0; c < cols; c++) {
            if (Math.random() > 0.55) continue;
            const alpha = Math.random() * 0.6 * density;
            ctx.fillStyle = `rgba(57,211,83,${alpha})`;
            ctx.font = `${10 + Math.floor(Math.random() * 5)}px 'Share Tech Mono', monospace`;
            ctx.fillText(
              chars[Math.floor(Math.random() * chars.length)],
              c * 14 + (Math.random() - 0.5) * 4,
              r * 14
            );
          }
        }

        if (t < 1) {
          frame = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(frame);
          if (onDone) onDone();
        }
      }
      frame = requestAnimationFrame(tick);
    }

    // Intercept all internal nav clicks
    document.addEventListener('click', e => {
      const link = e.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) return;
      if (link.target === '_blank') return;

      e.preventDefault();
      overlay.style.pointerEvents = 'all';
      overlay.style.opacity = '1';
      runGlitch(glitchCanvas, 340, () => {
        window.location.href = href;
      });
    });

    // Entry animation — scan in on page load
    entryAnimation();
  }

  function entryAnimation() {
    const main = document.querySelector('.container, main');
    if (!main) return;

    // Subtle scan-in: children stagger up
    const children = Array.from(main.children);
    children.forEach((el, i) => {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(14px)';
      el.style.transition = `opacity 0.45s ${i * 0.07}s ease, transform 0.45s ${i * 0.07}s ease`;
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        children.forEach(el => {
          el.style.opacity   = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    });
  }

  /* ── MATRIX TEXT EFFECTS ─────────────────────────────────────────────────── */

  // Typewriter for elements with data-typewriter attribute
  function initTypewriters() {
    document.querySelectorAll('[data-typewriter]').forEach(el => {
      const text    = el.dataset.typewriter || el.textContent;
      const delay   = parseInt(el.dataset.delay || '0');
      const speed   = parseInt(el.dataset.speed || '38');
      el.textContent = '';
      el.style.borderRight = '2px solid #39d353';
      el.style.paddingRight = '2px';

      let i = 0;
      setTimeout(() => {
        const iv = setInterval(() => {
          el.textContent = text.slice(0, ++i);
          if (i >= text.length) {
            clearInterval(iv);
            // Blinking cursor after done
            let on = true;
            setInterval(() => {
              el.style.borderRight = on ? '2px solid #39d353' : '2px solid transparent';
              on = !on;
            }, 530);
          }
        }, speed);
      }, delay);
    });
  }

  // Matrix character scramble on hover for elements with data-scramble
  function initScramble() {
    const matrixChars = 'アイウエカキクケコ01#$@!?><ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij';

    document.querySelectorAll('[data-scramble]').forEach(el => {
      const original = el.textContent;
      let animFrame, iteration = 0;

      el.addEventListener('mouseenter', () => {
        cancelAnimationFrame(animFrame);
        iteration = 0;

        function scramble() {
          el.textContent = original.split('').map((char, idx) => {
            if (char === ' ') return ' ';
            if (idx < iteration) return original[idx];
            return matrixChars[Math.floor(Math.random() * matrixChars.length)];
          }).join('');

          if (iteration < original.length) {
            iteration += 0.4;
            animFrame = requestAnimationFrame(scramble);
          } else {
            el.textContent = original;
          }
        }
        scramble();
      });

      el.addEventListener('mouseleave', () => {
        cancelAnimationFrame(animFrame);
        el.textContent = original;
      });
    });
  }

  // Glitch flicker on elements with data-glitch
  function initGlitch() {
    document.querySelectorAll('[data-glitch]').forEach(el => {
      const original = el.textContent;
      const glitchChars = '!<>-_\\/[]{}—=+*^?#';

      function glitch() {
        let iterations = 0;
        const iv = setInterval(() => {
          el.textContent = original.split('').map((char, i) => {
            if (char === ' ') return ' ';
            if (Math.random() > 0.85) return glitchChars[Math.floor(Math.random() * glitchChars.length)];
            return char;
          }).join('');
          if (++iterations > 6) {
            clearInterval(iv);
            el.textContent = original;
          }
        }, 40);
      }

      // Fire randomly every few seconds
      function scheduleGlitch() {
        setTimeout(() => {
          glitch();
          scheduleGlitch();
        }, 3000 + Math.random() * 5000);
      }
      scheduleGlitch();
    });
  }

  /* ── INIT ────────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initRain();
    initTransitions();
    initTypewriters();
    initScramble();
    initGlitch();
  });

})();
