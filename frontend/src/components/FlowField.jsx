import { useEffect, useRef } from 'react';

/**
 * Flowing 3D-style terrain drawn on a 2D canvas: far rows are wireframe ridges,
 * near rows dissolve into a drifting particle plain. Waves travel toward the viewer,
 * the camera eases toward the pointer, and the canvas fades as the page scrolls.
 */

const DEPTH = 1500; // world distance to the far edge
const NEAR = 60;
const CAM = 210; // camera height
const BASE_FOV = 520;

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const amplitude = (z) => 14 + 400 * smooth(0.12, 0.95, z / DEPTH);

function heightAt(x, z, t) {
  const p = z - t * 90; // phase moves toward the camera => "flow"
  const a = Math.sin(x * 0.0062 + p * 0.0046 + t * 0.35);
  const b = Math.sin(x * 0.0135 - p * 0.0071 - t * 0.28);
  const c = Math.sin(x * 0.026 + p * 0.013 + t * 0.7);
  const r = 1 - Math.abs(Math.sin(x * 0.0041 + p * 0.0032 + t * 0.15)); // sharp ridgelines
  return amplitude(z) * (0.34 * a + 0.22 * b + 0.08 * c + 0.5 * r * r);
}

export default function FlowField({ className = 'fixed inset-0 h-full w-full pointer-events-none' }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.42,
      r: Math.random() * 1.1 + 0.3,
      ph: Math.random() * Math.PI * 2,
    }));

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();
    let t = 4;
    let rows = 56;
    let cols = 150;
    let xs = new Float32Array(cols + 1);
    let ys = new Float32Array(cols + 1);
    let hs = new Float32Array(cols + 1);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      const hy = h * 0.3 + mouse.y * 14;
      const cx = w / 2 + mouse.x * 40;
      const fov = BASE_FOV * Math.min(1.3, Math.max(0.8, w / 1280));
      const zNear = Math.max(0, (CAM * fov) / Math.max(120, h - hy) - NEAR) * 0.85;

      // stars
      for (const s of stars) {
        const a = 0.12 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.3 + s.ph));
        ctx.fillStyle = `rgba(233,200,200,${a})`;
        ctx.fillRect(s.x * w, s.y * h, s.r, s.r);
      }

      for (let i = rows - 1; i >= 0; i--) {
        const d = i / (rows - 1); // 0 near -> 1 far
        const z = zNear + (DEPTH - zNear) * Math.pow(d, 1.7);
        const s = fov / (z + NEAR);
        const hw = (w * 0.5) / s * 1.12;
        const env = amplitude(z);

        for (let j = 0; j <= cols; j++) {
          const x = -hw + (2 * hw * j) / cols;
          const y = heightAt(x, z, t);
          xs[j] = cx + x * s;
          ys[j] = hy + (CAM - y) * s;
          hs[j] = y / env;
        }

        // ridge wireframe (mostly the far/mid rows)
        const lineA = 0.05 + 0.36 * smooth(0.28, 0.9, d);
        if (lineA > 0.06) {
          ctx.beginPath();
          ctx.moveTo(xs[0], ys[0]);
          for (let j = 1; j <= cols; j++) ctx.lineTo(xs[j], ys[j]);
          ctx.strokeStyle = `rgba(233,200,200,${lineA.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // particles
        const dotA = 0.18 + 0.62 * Math.pow(1 - d, 1.2) + 0.2 * d;
        const cAmber = `rgba(237,158,89,${Math.min(1, dotA + 0.15).toFixed(3)})`;
        const cRose = `rgba(229,138,111,${dotA.toFixed(3)})`;
        const cBlush = `rgba(233,200,200,${(dotA * 0.85).toFixed(3)})`;
        const sz = 0.9 + 1.9 * Math.pow(1 - d, 1.6);
        for (let j = 0; j <= cols; j++) {
          const px = xs[j];
          if (px < -4 || px > w + 4) continue;
          const hn = hs[j];
          ctx.fillStyle = hn > 0.55 ? cAmber : hn > 0.18 ? cRose : cBlush;
          ctx.fillRect(px - sz / 2, ys[j] - sz / 2, sz, sz);
        }
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const small = w < 700;
      rows = small ? 44 : 56;
      cols = small ? 90 : 150;
      xs = new Float32Array(cols + 1);
      ys = new Float32Array(cols + 1);
      hs = new Float32Array(cols + 1);
      draw();
    };

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt * 0.55;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      draw();
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const onScroll = () => {
      const p = Math.min(1, window.scrollY / (window.innerHeight * 0.85));
      canvas.style.opacity = String(1 - 0.78 * p);
    };

    resize();
    onScroll();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    if (!reduce) {
      window.addEventListener('mousemove', onMove, { passive: true });
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
