import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

document.addEventListener("nav", () => {
    const canvas = document.getElementById('balloon-playground') as HTMLCanvasElement;
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rawText = "이대로, 난 이대로 아무것도 안 바꿀래\n\n아쉬운 것들도 그대로 다 두고서\n\n우리 처음 만난 그때처럼\n\n그대로, 넌 그대로 내 옆에 남을 걸 난 알아\n\n마지막 폭죽이 터지는 그날에도\n\n별로 슬퍼할 것 같진 않아\n\nh baby 내 노래가 멈춘 뒤엔 모두 떠나가고\n\n또 너와 나 둘만 남겠지\n\nOh, look at 'em go baby, oh, look at 'em go\n\nOh, look at 'em go, baby, go\n\n항상 나는 너무 쉽게 버림받곤 해\n\n잠시 손만 놔도 금방 날아가 버리고\n\n하지만 괜찮아 새로울 것도 없잖아\n\nIt's you and me and no one else\n\nOh baby 내 노래가 멈춘 뒤엔 모두 떠나가고\n\n또 너와 나 둘만 남겠지\n\nOh, look at 'em go, baby, oh, look at 'em go\n\nOh, look at 'em go, baby, go";

    const baseFontSize = 14;
    const lineHeight = 30;
    const fontFamily = '"Pretendard", "Helvetica Neue", sans-serif';
    const fontStr = `${baseFontSize}px ${fontFamily}`;

    let W = 0, H = 0, dpr = 1;
    let time = 0, lastT = performance.now();
    let isRunning = true;
    
    // Dynamic text color to support light/dark modes
    const getTextColor = () => {
      const theme = document.documentElement.getAttribute("saved-theme");
      // 다크모드일 경우 명시적으로 흰색 리턴, 기본은 다크그레이
      return theme === "dark" ? "#ffffff" : "#333333";
    };
    
    interface CharData {
      char: string;
      baseX: number;
      baseY: number;
      width: number;
      x: number;
      y: number;
      size: number;
      color: string;
    }
    let chars: CharData[] = [];

    function setupTextLayout(width: number) {
      const prepared = prepareWithSegments(rawText, fontStr, { whiteSpace: 'pre-wrap' });
      const availableWidth = Math.max(300, width - 40);
      const { lines } = layoutWithLines(prepared, availableWidth, lineHeight);
      
      chars = [];
      let yPos = 40;
      for (let i = 0; i < lines.length; i++) {
        const lineText = lines[i].text;
        let currentX = 20;

        ctx!.font = fontStr;
        for (const char of lineText) {
          const charWidth = ctx!.measureText(char).width;
          chars.push({
            char,
            baseX: currentX,
            baseY: yPos + i * lineHeight,
            width: charWidth,
            x: currentX,
            y: yPos + i * lineHeight,
            size: baseFontSize,
            color: getTextColor()
          });
          currentX += charWidth;
        }
      }
      return lines.length * lineHeight + 80;
    }

    class Balloon {
      x: number;
      y: number;
      homeX: number;
      homeY: number;
      vx: number = 0;
      vy: number = 0;
      lag: number = 0.04;
      wobbleFreq: number = 0.8;
      wobbleAmp: number = 4;
      wobblePhase: number = 0;
      rx: number;
      ry: number;
      col: any;
      segL: number = 9;
      segs: {x: number, y: number, ox: number, oy: number}[] = [];
      isDragging: boolean = false;
      dragOffsetX: number = 0;
      dragOffsetY: number = 0;
  
      constructor(homeX: number, homeY: number, rx: number, ry: number, colorSet: any, phase: number) {
        this.homeX = homeX;
        this.homeY = homeY;
        this.x = homeX;
        this.y = homeY;
        this.rx = rx;
        this.ry = ry;
        this.col = colorSet;
        this.wobblePhase = phase;
        
        const segN = 8;
        for (let s = 0; s < segN; s++) {
          this.segs.push({ x: this.x, y: this.y + this.ry + s * this.segL, ox: 0, oy: 0 });
        }
      }
  
      update(dt: number, time: number) {
        if (!this.isDragging) {
           this.homeY -= dt * 35; // 천천히 위로 올라감
           if (this.homeY < -150) {
             this.homeY = H + 150; // 화면 위로 벗어나면 화면 아래에서 다시 시작
             this.y = this.homeY; // y 위치도 즉시 리셋
             this.x = this.homeX; // x 위치 리셋
             this.vx = 0;
             this.vy = 0;
           }
        }
        
        let tx = this.homeX;
        let ty = this.homeY;
        
        if (!this.isDragging) {
           tx += Math.sin(time * this.wobbleFreq + this.wobblePhase) * this.wobbleAmp;
           ty -= Math.cos(time * this.wobbleFreq * 0.8 + this.wobblePhase) * 2;
        }

        this.vx += (tx - this.x) * this.lag;
        this.vy += (ty - this.y) * this.lag;
        this.vx *= 0.78; 
        this.vy *= 0.78;
        this.x += this.vx; 
        this.y += this.vy;
        
        const bot = { x: this.x, y: this.y + this.ry };
        this.segs[0].x = bot.x;
        this.segs[0].y = bot.y;
        
        for (let s = 1; s < this.segs.length; s++) {
          const prev = this.segs[s - 1], cur = this.segs[s];
          cur.oy += 0.6; cur.oy *= 0.82;
          cur.ox += Math.sin(time * 1.2 + this.wobblePhase + s * 0.4) * 0.08; cur.ox *= 0.9;
          cur.x += cur.ox; cur.y += cur.oy;
          const dx = cur.x - prev.x, dy = cur.y - prev.y, d = Math.hypot(dx, dy) || 1;
          if (d > this.segL) { 
            cur.x = prev.x + dx / d * this.segL; 
            cur.y = prev.y + dy / d * this.segL; 
          }
        }
      }
  
      draw(ctx: CanvasRenderingContext2D, time: number) {
        const { x, y, rx, ry, col, segs } = this;
        ctx.save();
        ctx.strokeStyle = col.string; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.7;
        ctx.beginPath(); ctx.moveTo(segs[0].x, segs[0].y);
        for (let s = 1; s < segs.length; s++) ctx.lineTo(segs[s].x, segs[s].y);
        ctx.stroke(); ctx.restore();
  
        ctx.save(); ctx.fillStyle = col.knot;
        ctx.beginPath(); ctx.ellipse(x, y + ry + 1, 4, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  
        const grad = ctx.createRadialGradient(x - rx * 0.3, y - ry * 0.25, rx * 0.05, x, y, rx * 1.2);
        grad.addColorStop(0, col.shine); grad.addColorStop(0.45, col.body); grad.addColorStop(1, col.knot);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  
        ctx.save(); ctx.globalAlpha = 0.55;
        const sg = ctx.createRadialGradient(x - rx * 0.28, y - ry * 0.3, 1, x - rx * 0.2, y - ry * 0.2, rx * 0.42);
        sg.addColorStop(0, 'rgba(255,255,255,0.85)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(x - rx * 0.2, y - ry * 0.2, rx * 0.38, ry * 0.32, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
    }
  
    // Fireworks
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      decay: number;
      color: string;
      
      constructor(x: number, y: number) {
        this.x = x; this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.01;
        
        const colors = ['#FF1493', '#00BFFF', '#FFD700', '#32CD32', '#FF4500'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      
      update() {
        this.x += this.vx; this.y += this.vy;
        this.vy += 0.1; // gravity
        this.vx *= 0.96; // air resistance
        this.vy *= 0.96;
        this.life -= this.decay;
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.strokeStyle = this.color;
        ctx.lineCap = 'round';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 1.5, this.y - this.vy * 1.5);
        ctx.stroke();
        ctx.restore();
      }
    }

    let balloons: Balloon[] = [];
    let particles: Particle[] = [];
    let draggedBalloon: Balloon | null = null;
    
    function resetBalloons() {
      const b1 = { body: '#ffffff', shine: '#ffffff', knot: '#f0f0f0', string: '#d0d0d0' }; // 불투명 화이트
      const b2 = { body: 'rgba(255, 255, 255, 0.6)', shine: 'rgba(255, 255, 255, 0.9)', knot: 'rgba(240, 240, 240, 0.8)', string: '#cccccc' }; // 반투명 퓨어
      const b3 = { body: '#fcf8f2', shine: '#ffffff', knot: '#e8e0d5', string: '#c8c8c8' }; // 불투명 진주/오프화이트
      const b4 = { body: 'rgba(250, 250, 250, 0.4)', shine: 'rgba(255, 255, 255, 0.8)', knot: 'rgba(230, 230, 230, 0.6)', string: '#d5d5d5' }; // 투명 밀키
      const b5 = { body: '#f0f4f8', shine: '#ffffff', knot: '#dbe2ea', string: '#bebebe' }; // 불투명 실버화이트
      const b6 = { body: 'rgba(240, 248, 255, 0.5)', shine: 'rgba(255, 255, 255, 0.9)', knot: 'rgba(220, 230, 230, 0.7)', string: '#cccccc' }; // 투명 크리스탈 (쿨톤)
      const b7 = { body: '#fffff0', shine: '#ffffff', knot: '#eaeada', string: '#cccccc' }; // 불투명 아이보리

      balloons = [
        new Balloon(W * 0.15, H * 0.85, 30, 36, b1, 0),
        new Balloon(W * 0.35, H * 0.65, 42, 50, b2, 1.5),
        new Balloon(W * 0.55, H * 0.95, 35, 40, b3, 3.1),
        new Balloon(W * 0.75, H * 0.50, 28, 34, b4, 4.2),
        new Balloon(W * 0.90, H * 0.75, 45, 54, b5, 0.8),
        new Balloon(W * 0.25, H * 0.40, 38, 44, b6, 2.5),
        new Balloon(W * 0.65, H * 0.80, 32, 38, b7, 5.0)
      ];
    }

    function resize() {
      dpr = window.devicePixelRatio || 1;
      const parentWidth = Math.min(850, canvas.parentElement?.clientWidth || window.innerWidth);
      const parentHeight = window.innerHeight;
      
      canvas.style.width = `${parentWidth}px`;
      W = parentWidth;
      H = parentHeight;

      const neededHeight = setupTextLayout(W);
      H = Math.max(parentHeight * 0.8, neededHeight);

      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.height = `${H}px`;
      
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.font = fontStr;

      if (balloons.length === 0) {
        resetBalloons();
      }
    }
  
    window.addEventListener('resize', resize);
    resize();

    const onPointerDown = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        for (let i = balloons.length - 1; i >= 0; i--) {
            const b = balloons[i];
            const dx = mx - b.x;
            const dy = my - b.y;
            // Larger grab radius for ease on touch
            if (dx*dx + dy*dy <= Math.pow(b.ry * 2.0, 2)) {
                draggedBalloon = b;
                b.isDragging = true;
                b.dragOffsetX = b.homeX - mx;
                b.dragOffsetY = b.homeY - my;
                
                // Move dragged balloon to front
                balloons.splice(i, 1);
                balloons.push(b);
                return;
            }
        }
        
        // Spawn fireworks if no balloon was clicked
        for(let i=0; i<35; i++) {
          particles.push(new Particle(mx, my));
        }
    };

    const onPointerMove = (e: PointerEvent) => {
        if (!draggedBalloon) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        draggedBalloon.homeX = mx + draggedBalloon.dragOffsetX;
        draggedBalloon.homeY = my + draggedBalloon.dragOffsetY;
    };

    const onPointerUp = () => {
        if (draggedBalloon) {
            draggedBalloon.isDragging = false;
            draggedBalloon = null;
        }
    };
    
    // Add touch-action none via CSS/inline to prevent scrolling
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    
    let animationFrameId: number;
    (window as any).addCleanup(() => {
      isRunning = false;
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      cancelAnimationFrame(animationFrameId);
    });

    function loop(now: number) {
      if (!isRunning) return;
      const dt = Math.min((now - lastT) / 1000, 0.05); lastT = now; time += dt;
      ctx!.clearRect(0, 0, W, H);
  
      // Update text fluid logic
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        let maxForce = 0;
        let pushX = 0, pushY = 0;

        for (const b of balloons) {
          const dx = b.x - c.baseX;
          const dy = (b.y - 15) - c.baseY; 
          const distance = Math.sqrt(dx * dx + dy * dy);
          const radius = b.rx * 3; // Push radius proportional to balloon size

          if (distance < radius) {
            const force = (radius - distance) / radius;
            if (force > maxForce) maxForce = force;
  
            const angle = Math.atan2(dy, dx);
            const pushDistance = force * 15; 
            pushX -= Math.cos(angle) * pushDistance;
            pushY -= Math.sin(angle) * pushDistance;
          }
        }

        if (maxForce > 0) {
          const targetSize = baseFontSize + (maxForce * baseFontSize * 1.0);
          c.size += (targetSize - c.size) * 0.2;
          c.x += ((c.baseX + pushX) - c.x) * 0.2;
          c.y += ((c.baseY + pushY) - c.y) * 0.2;
          // Apply a blend color corresponding to max force
          // 다크모드일 때와 라이트모드일 때 기본 색상이 다르므로 텍스트 렌더링 직전에 결정
          c.color = `rgb(${255 - maxForce * 100}, ${100 - maxForce * 50}, ${100 - maxForce * 50})`;
        } else {
          c.size += (baseFontSize - c.size) * 0.1;
          c.x += (c.baseX - c.x) * 0.1;
          c.y += (c.baseY - c.y) * 0.1;
          c.color = getTextColor();
        }
  
        ctx!.font = `${c.size}px ${fontFamily}`;
        ctx!.fillStyle = c.color;
        ctx!.fillText(c.char, c.x, c.y);
      }
      
      for (const b of balloons) b.update(dt, time);
      for (const b of balloons) b.draw(ctx!, time);

      for(let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx!);
        if(particles[i].life <= 0) particles.splice(i, 1);
      }
  
      animationFrameId = requestAnimationFrame(loop);
    }
    
    animationFrameId = requestAnimationFrame(loop);
});