import React, { useEffect, useRef } from 'react';

const SilkAtlasBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Simulation settings
    const cols = 28;
    const rows = 35;
    const restLength = 18; // distance between vertical nodes
    const colGap = 45; // distance between columns
    const fontSize = 13;
    const forceRadius = 130;
    const damping = 0.98;
    const gravity = 80;

    // Data pool of characters related to churn prediction
    const pool = "CHURNLOYALTYRETENTIONVALUEREVENUESCOREMULTIPLECONTRACTTENUREMONTHLYCHARGESPREDICTMODELPIPELINEMETRICSCLASSIFIERXGBOOSTACCURACYPRECISIONRECALLF1ROCAUCSHAPVALUES01010101CHURNRETENTIONDANGERWARNINGSECUREUPGRADE";
    
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Track mouse coordinates
    const mouse = {
      x: -1000,
      y: -1000,
      px: -1000,
      py: -1000,
      vx: 0,
      vy: 0,
      active: false
    };

    // Node points structure: pts[col][row] -> {x, y, px, py, char, alpha}
    let pts = [];
    let anchors = [];

    const initSimulation = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      
      canvas.width = vw * dpr;
      canvas.height = vh * dpr;
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;

      pts = [];
      anchors = [];

      // Calculate vertical starting y position (below the header, approx 160px)
      const topY = 160;
      // Center the columns horizontally
      const startX = (vw - colGap * (cols - 1)) / 2;

      for (let c = 0; c < cols; c++) {
        const ax = startX + c * colGap;
        anchors.push({ x: ax, y: topY });

        const colPts = [];
        let charIdx = Math.floor(Math.random() * pool.length);

        for (let r = 0; r < rows; r++) {
          const rx = ax;
          const ry = topY + r * restLength;
          colPts.push({
            x: rx,
            y: ry,
            px: rx,
            py: ry,
            char: pool[charIdx],
            alpha: 0.25 + Math.random() * 0.45, // subtle translucent alphas
            lenFade: r < rows - 6 ? 1 : (rows - 1 - r) / 6 // fade out the tails
          });
          charIdx = (charIdx + 1) % pool.length;
        }
        pts.push(colPts);
      }
    };

    initSimulation();

    // Event listeners for window resize
    const handleResize = () => {
      initSimulation();
    };
    window.addEventListener('resize', handleResize);

    // Global mouse/touch trackers
    const handleMouseMove = (e) => {
      const mx = e.clientX;
      const my = e.clientY;
      if (mouse.active) {
        mouse.vx = mx - mouse.x;
        mouse.vy = my - mouse.y;
      }
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      mouse.x = mx;
      mouse.y = my;
      mouse.active = true;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const mx = e.touches[0].clientX;
        const my = e.touches[0].clientY;
        if (mouse.active) {
          mouse.vx = mx - mouse.x;
          mouse.vy = my - mouse.y;
        }
        mouse.x = mx;
        mouse.y = my;
        mouse.active = true;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Main animation loop
    let lastTime = performance.now();

    const loop = (time) => {
      let dt = (time - lastTime) / 1000;
      if (dt > 0.05) dt = 0.05; // clamp delta time
      lastTime = time;

      // 1. Verlet integration & mouse force interaction
      const dt2 = dt * dt;
      const speed = Math.hypot(mouse.vx, mouse.vy);
      const isForcing = mouse.active && speed > 5;

      for (let c = 0; c < cols; c++) {
        const colPts = pts[c];
        for (let r = 1; r < rows; r++) { // row 0 is pinned
          const p = colPts[r];
          
          // Verlet integrate
          let vx = (p.x - p.px) * damping;
          let vy = (p.y - p.py) * damping;
          p.px = p.x;
          p.py = p.y;
          p.x += vx;
          p.y += vy + gravity * dt2;

          // Apply mouse force
          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < forceRadius * forceRadius) {
              const dist = Math.sqrt(distSq) || 1;
              const force = (1 - dist / forceRadius) * (1 - dist / forceRadius);
              
              // Push point away from pointer
              let pushX = (dx / dist) * force * 15;
              let pushY = (dy / dist) * force * 15;

              // Perpendicular side-push (curtain parting)
              if (isForcing) {
                const nvx = mouse.vx / speed;
                const nvy = mouse.vy / speed;
                const cross = mouse.vx * dy - mouse.vy * dx;
                const sgn = cross >= 0 ? 1 : -1;
                
                pushX += (-nvy) * sgn * force * 20;
                pushY += nvx * sgn * force * 20;
              }

              p.x += pushX;
              p.y += pushY;
              p.px -= pushX * 0.3;
              p.py -= pushY * 0.3;
            }
          }
        }
      }

      // 2. Constraints: keep string distances stable
      for (let iter = 0; iter < 4; iter++) {
        for (let c = 0; c < cols; c++) {
          const colPts = pts[c];
          const anchor = anchors[c];
          
          // Pin top node
          colPts[0].x = anchor.x;
          colPts[0].y = anchor.y;

          for (let r = 1; r < rows; r++) {
            const p0 = colPts[r - 1];
            const p1 = colPts[r];
            const dx = p1.x - p0.x;
            const dy = p1.y - p0.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1e-4;
            const diff = (dist - restLength) / dist;

            if (r === 1) {
              p1.x -= dx * diff;
              p1.y -= dy * diff;
            } else {
              p0.x += dx * diff * 0.5;
              p0.y += dy * diff * 0.5;
              p1.x -= dx * diff * 0.5;
              p1.y -= dy * diff * 0.5;
            }
          }
        }

        // Horizontal shear connection between columns
        const shearCoeff = 0.02;
        for (let r = 1; r < rows; r++) {
          for (let c = 0; c < cols - 1; c++) {
            const p0 = pts[c][r];
            const p1 = pts[c + 1][r];
            const dx = p1.x - p0.x;
            const diff = (dx - colGap) * shearCoeff * 0.5;
            p0.x += diff;
            p1.x -= diff;
          }
        }
      }

      // Decay mouse velocity
      mouse.vx *= 0.85;
      mouse.vy *= 0.85;

      // 3. Clear canvas & render
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Render the text columns
      ctx.font = `600 ${fontSize}px ui-monospace, SF Mono, Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Warm dark ink color from Silk Atlas
      ctx.fillStyle = '#3a2e24';

      for (let c = 0; c < cols; c++) {
        const colPts = pts[c];
        for (let r = 0; r < rows; r++) {
          const p = colPts[r];
          ctx.globalAlpha = p.alpha * p.lenFade;
          ctx.fillText(p.char, p.x, p.y);
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: -1,
        pointerEvents: 'none',
        display: 'block'
      }}
    />
  );
};

export default SilkAtlasBackground;
