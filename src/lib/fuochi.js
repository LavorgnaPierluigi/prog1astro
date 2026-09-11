const COLORI = ['#f7d9a8', '#ffd6e4', '#b8e8d8', '#b8e0f0', '#ffe4c4', '#e0c8f4', '#ffffff'];

/**
 * Fuochi d’artificio a tutto schermo, sul nero.
 * @param {HTMLCanvasElement} canvas
 */
export function mountFuochi(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { start() {}, stop() {} };
  }

  /** @type {{ x: number, y: number, vx: number, vy: number, life: number, decay: number, color: string, size: number }[]} */
  let scintille = [];
  let running = false;
  let raf = 0;
  let ultimo = 0;
  let prossimo = 0;

  function misura() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function scoppio(x, y) {
    const n = 90 + Math.floor(Math.random() * 40);
    const color = COLORI[Math.floor(Math.random() * COLORI.length)];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 1.4 + Math.random() * 5.8;
      scintille.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 0.4,
        life: 1,
        decay: 0.007 + Math.random() * 0.012,
        color,
        size: 2.2 + Math.random() * 3.4,
      });
    }
  }

  function centro() {
    return {
      x: innerWidth * (0.38 + Math.random() * 0.24),
      y: innerHeight * (0.28 + Math.random() * 0.28),
    };
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(32, now - ultimo) / 16.67;
    ultimo = now;
    if (now >= prossimo) {
      const p = centro();
      scoppio(p.x, p.y);
      prossimo = now + 280 + Math.random() * 420;
    }
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = scintille.length - 1; i >= 0; i--) {
      const s = scintille[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 0.045 * dt;
      s.vx *= 0.992;
      s.life -= s.decay * dt;
      if (s.life <= 0) {
        scintille.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * (0.45 + s.life * 0.55), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(frame);
  }

  function onResize() {
    if (!running) return;
    misura();
  }

  function start() {
    stop();
    misura();
    scintille = [];
    running = true;
    canvas.hidden = false;
    ultimo = performance.now();
    prossimo = ultimo;
    const c = { x: innerWidth / 2, y: innerHeight / 2 };
    scoppio(c.x, c.y);
    scoppio(c.x + 90, c.y - 40);
    scoppio(c.x - 80, c.y + 30);
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    scintille = [];
    window.removeEventListener('resize', onResize);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.hidden = true;
  }

  return { start, stop };
}
